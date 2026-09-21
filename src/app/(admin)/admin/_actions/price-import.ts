"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db/client";
import { requireSession } from "./auth";
import { logChange } from "@/lib/audit";
import { parseGenevitySheet } from "@/lib/prices/parse-xlsx";
import { applyTaxonomy } from "@/lib/prices/taxonomy";
import { diffCatalogue, type DiffResult } from "@/lib/prices/diff";
import { applyCatalogue, loadExistingRows } from "@/lib/prices/apply";

/** Hard cap on the uploaded workbook. The real sheet is ~150KB; this leaves
 *  generous headroom while still rejecting anything absurd before it reaches
 *  the xlsx parser. */
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

/**
 * Pull the uploaded file out of the FormData and validate it before it ever
 * reaches `parseGenevitySheet`. A `.xlsx` extension check plus a size cap
 * keeps obviously-wrong uploads (a PDF, a renamed .csv, a huge file) out of
 * the parser, which otherwise throws a raw JSZip error ("Can't find end of
 * central directory") that means nothing to an admin.
 */
async function readUploadedFile(formData: FormData): Promise<Buffer> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file uploaded. Choose the price spreadsheet (.xlsx) first.");
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    throw new Error(`"${file.name}" is not an .xlsx file. Export the price sheet as an Excel workbook and try again.`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`The file is too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 20MB.`);
  }
  return Buffer.from(await file.arrayBuffer());
}

/**
 * Parse + apply taxonomy, translating failures into messages an admin can
 * act on. `parseGenevitySheet` throws whatever the underlying library throws
 * for a corrupt or non-workbook file (e.g. JSZip's "Can't find end of central
 * directory"), which is meaningless outside this codebase.
 */
async function readCatalogue(formData: FormData) {
  const buffer = await readUploadedFile(formData);
  try {
    return applyTaxonomy(await parseGenevitySheet(buffer));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (/central directory|not a zip file|invalid signature|corrupt/i.test(message)) {
      throw new Error(
        "This file doesn't look like a valid Excel workbook. Make sure you're uploading the original .xlsx file, not a renamed or corrupted copy."
      );
    }
    throw new Error(`Could not read the spreadsheet: ${message}`);
  }
}

/**
 * Read-only preview: parses the upload, diffs it against the live database,
 * and returns the result. Never writes anything — safe to call repeatedly
 * while the admin reviews the changes.
 */
export async function previewPriceImport(formData: FormData): Promise<DiffResult> {
  await requireSession();
  const cats = await readCatalogue(formData);
  const existing = await loadExistingRows(sql as never);
  return diffCatalogue(cats, existing);
}

/**
 * Re-parses the same uploaded file (never trusts the preview round trip,
 * since the browser could send anything) and writes it via `applyCatalogue`,
 * which only upserts and hides — it never deletes a row.
 */
export async function commitPriceImport(
  formData: FormData
): Promise<{ categories: number; subcategories: number; items: number; hidden: number }> {
  await requireSession();
  const cats = await readCatalogue(formData);
  const result = await applyCatalogue(sql as never, cats);

  await logChange({
    action: "update",
    entityType: "price-import",
    entityLabel: `Imported price spreadsheet (${result.items} items, ${result.hidden} hidden)`,
  });

  revalidatePath("/");
  revalidatePath("/prices");
  revalidatePath("/ru/prices");
  revalidatePath("/en/prices");
  return result;
}
