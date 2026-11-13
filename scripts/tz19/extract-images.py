"""
ТЗ #19 — pull the images embedded in the client's Word documents.

Each document carries one or two photos (a hero and, in the longer ones, an
in-body illustration). They come out at whatever size the client pasted them
in at, so this step only extracts and records them; conversion to the webp the
site serves happens in a separate step.

Run: python3 scripts/tz19/extract-images.py
Out: scripts/tz19/images/<slug>-<n>.<ext> + images.json manifest
"""
import json, os, re, zipfile, unicodedata, importlib.util

spec = importlib.util.spec_from_file_location(
    "ex", os.path.join(os.path.dirname(__file__), "extract-docx.py"))

SRC = "/Users/romakochetov/Downloads/новые посадочные"
OUT = os.path.join(os.path.dirname(__file__), "images")
SLUGS = json.load(open(os.path.join(os.path.dirname(__file__), "slugs.json"), encoding="utf-8"))

# Images are emitted in document order, which is the order <w:drawing> elements
# reference the relationship ids — not the order they happen to sit in the zip.
EMBED = re.compile(r'r:embed="([^"]+)"')


def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = {}
    for fn in sorted(os.listdir(SRC)):
        if not fn.endswith(".docx") or fn.startswith("~$"):
            continue
        slug = SLUGS[unicodedata.normalize("NFC", fn[:-5])]
        with zipfile.ZipFile(os.path.join(SRC, fn)) as z:
            doc = z.read("word/document.xml").decode("utf-8")
            rels = z.read("word/_rels/document.xml.rels").decode("utf-8")
            targets = dict(re.findall(r'Id="([^"]+)"[^>]*Target="([^"]+)"', rels))
            out = []
            for i, rid in enumerate(dict.fromkeys(EMBED.findall(doc)), start=1):
                tgt = targets.get(rid)
                if not tgt or "media/" not in tgt:
                    continue
                data = z.read("word/" + tgt.lstrip("/"))
                ext = os.path.splitext(tgt)[1].lower() or ".png"
                name = f"{slug}-{i}{ext}"
                with open(os.path.join(OUT, name), "wb") as f:
                    f.write(data)
                out.append({"file": name, "bytes": len(data)})
            manifest[slug] = out
            print(f"{slug:34} {len(out)} image(s)")
    with open(os.path.join(OUT, "images.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print(f"\n{sum(len(v) for v in manifest.values())} images -> {OUT}")


main()
