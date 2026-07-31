/**
 * Minimal, dependency-free XLSX (Office Open XML) writer.
 *
 * We only need a handful of Excel features for admin exports — styled header
 * row, frozen panes, autofilter, column widths, real date and number cells —
 * so a full spreadsheet library (exceljs ≈ 1 MB, SheetJS unmaintained on npm)
 * would be a poor trade. An .xlsx is a ZIP of XML parts; both are produced
 * here with Node built-ins only.
 *
 * Cells are written as inline strings rather than via a shared-string table:
 * exports are one-shot downloads, so the small size win isn't worth the
 * second pass over the data.
 */
import { deflateRawSync } from "node:zlib";

/* ── Public types ── */

export type XlsxValue = string | number | boolean | Date | null | undefined;

export interface XlsxColumn {
  /** Header label rendered in the frozen first row. */
  header: string;
  /** Column width in Excel "characters". Defaults to 14. */
  width?: number;
  /** Force a cell type. Inferred from the value when omitted. */
  type?: "text" | "number" | "datetime" | "date";
}

export interface XlsxSheet {
  name: string;
  columns: XlsxColumn[];
  rows: XlsxValue[][];
}

export interface XlsxOptions {
  sheets: XlsxSheet[];
  /**
   * IANA timezone the Date values are rendered in. Excel has no concept of
   * timezones — a date cell is a bare wall-clock number — so we bake the
   * offset in at write time. Defaults to Kyiv, where the clinic operates.
   */
  timeZone?: string;
}

/* ── Style slots (indexes into cellXfs below) ── */

const S_DEFAULT = 0;
const S_HEADER = 1;
const S_DATETIME = 2;
const S_DATE = 3;
const S_NUMBER = 4;

/* ── XML helpers ── */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Control characters are illegal in XML 1.0 and make Excel reject the file
    // outright. Form input is user-supplied, so strip rather than trust.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/** 0-based column index → spreadsheet letters (0 → A, 26 → AA). */
function colName(index: number): string {
  let n = index;
  let out = "";
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

/**
 * Excel stores dates as days since 1899-12-30 (the epoch its 1900 leap-year
 * bug implies). The instant is first re-expressed as wall-clock time in
 * `timeZone` so a submission made at 14:05 in Kyiv reads 14:05 in the export.
 */
function excelSerial(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const utcMs = Date.UTC(
    get("year"), get("month") - 1, get("day"),
    get("hour"), get("minute"), get("second"),
  );
  return utcMs / 86_400_000 + 25_569;
}

function cellXml(ref: string, value: XlsxValue, column: XlsxColumn, timeZone: string): string {
  if (value === null || value === undefined || value === "") {
    return `<c r="${ref}" s="${S_DEFAULT}"/>`;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return `<c r="${ref}" s="${S_DEFAULT}"/>`;
    const style = column.type === "date" ? S_DATE : S_DATETIME;
    return `<c r="${ref}" s="${style}"><v>${excelSerial(value, timeZone)}</v></c>`;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return `<c r="${ref}" s="${S_DEFAULT}"/>`;
    return `<c r="${ref}" s="${S_NUMBER}"><v>${value}</v></c>`;
  }

  if (typeof value === "boolean") {
    return `<c r="${ref}" s="${S_DEFAULT}" t="b"><v>${value ? 1 : 0}</v></c>`;
  }

  // Phone numbers ("+380…") and long ids must stay text, otherwise Excel
  // mangles them into numbers or scientific notation.
  return `<c r="${ref}" s="${S_DEFAULT}" t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`;
}

function sheetXml(sheet: XlsxSheet, timeZone: string): string {
  const lastCol = colName(Math.max(sheet.columns.length - 1, 0));
  const lastRow = sheet.rows.length + 1;

  const cols = sheet.columns
    .map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width ?? 14}" customWidth="1"/>`)
    .join("");

  const header = sheet.columns
    .map((c, i) => `<c r="${colName(i)}1" s="${S_HEADER}" t="inlineStr"><is><t>${esc(c.header)}</t></is></c>`)
    .join("");

  const body = sheet.rows
    .map((row, r) => {
      const cells = sheet.columns
        .map((col, i) => cellXml(`${colName(i)}${r + 2}`, row[i], col, timeZone))
        .join("");
      return `<row r="${r + 2}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetPr><outlinePr summaryBelow="1" summaryRight="1"/></sheetPr>
<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${cols}</cols>
<sheetData><row r="1" ht="22" customHeight="1">${header}</row>${body}</sheetData>
${sheet.rows.length ? `<autoFilter ref="A1:${lastCol}${lastRow}"/>` : ""}
</worksheet>`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="2">
<numFmt numFmtId="164" formatCode="dd.mm.yyyy&quot; &quot;hh:mm"/>
<numFmt numFmtId="165" formatCode="dd.mm.yyyy"/>
</numFmts>
<fonts count="2">
<font><sz val="11"/><color theme="1"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
</fonts>
<fills count="3">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF8B7B6B"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFD9D2C7"/></left><right style="thin"><color rgb="FFD9D2C7"/></right><top style="thin"><color rgb="FFD9D2C7"/></top><bottom style="thin"><color rgb="FFD9D2C7"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="5">
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="left"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" horizontal="right"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

/* ── ZIP writer (store/deflate, no external deps) ── */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

interface ZipEntry {
  name: string;
  data: Buffer;
}

function zip(entries: ZipEntry[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const crc = crc32(entry.data);
    const compressed = deflateRawSync(entry.data, { level: 6 });
    // Fall back to STORE when deflate makes the part bigger (tiny XML parts).
    const useDeflate = compressed.length < entry.data.length;
    const payload = useDeflate ? compressed : entry.data;
    const method = useDeflate ? 8 : 0;

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);           // version needed
    local.writeUInt16LE(0x0800, 6);       // UTF-8 filename flag
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);           // mod time — fixed for reproducible output
    local.writeUInt16LE(0x21, 12);        // mod date → 1980-01-01
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    locals.push(local, payload);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);         // version made by
    central.writeUInt16LE(20, 6);         // version needed
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(payload.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);         // extra
    central.writeUInt16LE(0, 32);         // comment
    central.writeUInt16LE(0, 34);         // disk
    central.writeUInt16LE(0, 36);         // internal attrs
    central.writeUInt32LE(0, 38);         // external attrs
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);

    offset += local.length + payload.length;
  }

  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, centralBuf, eocd]);
}

/* ── Entry point ── */

/** Sheet names may not exceed 31 chars or contain Excel's reserved characters. */
function safeSheetName(name: string, index: number): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31);
  return cleaned || `Sheet${index + 1}`;
}

export function buildXlsx({ sheets, timeZone = "Europe/Kyiv" }: XlsxOptions): Buffer {
  if (!sheets.length) throw new Error("buildXlsx: at least one sheet is required");

  const names = sheets.map((s, i) => safeSheetName(s.name, i));

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("\n")}
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${names.map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("\n")}
<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const entries: ZipEntry[] = [
    { name: "[Content_Types].xml", data: Buffer.from(contentTypes, "utf8") },
    { name: "_rels/.rels", data: Buffer.from(rootRels, "utf8") },
    { name: "xl/workbook.xml", data: Buffer.from(workbook, "utf8") },
    { name: "xl/_rels/workbook.xml.rels", data: Buffer.from(workbookRels, "utf8") },
    { name: "xl/styles.xml", data: Buffer.from(STYLES_XML, "utf8") },
    ...sheets.map((s, i) => ({
      name: `xl/worksheets/sheet${i + 1}.xml`,
      data: Buffer.from(sheetXml(s, timeZone), "utf8"),
    })),
  ];

  return zip(entries);
}
