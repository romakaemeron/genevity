"""
ТЗ #19 — extract the client's 24 Word landing pages into a normalised outline.

The .docx files are the only source of the Russian copy. They are well formed:
Heading1 is the page title, Heading2 opens a top-level block, Heading3 a
sub-block, and bullet lists carry <w:numPr>. That is enough structure to turn
each document into a flat outline without any guessing, which is what the
page-building step consumes.

Run: python3 scripts/tz19/extract-docx.py
Out: scripts/tz19/raw/<slug>.json   — {title, nodes: [{kind, level?, text|items}]}
"""
import json, os, re, html, zipfile, unicodedata

SRC = "/Users/romakochetov/Downloads/новые посадочные"
OUT = os.path.join(os.path.dirname(__file__), "raw")

# docx filename -> url slug. Fixed here so the slug never drifts between runs.
SLUGS = {
    "Эндоскопическая пластическая хирургия в Днепре": "endoscopic-surgery",
    "Удаление шейного горба в Днепре": "buffalo-hump-removal",
    "Увеличение ягодиц в Днепре": "buttock-augmentation",
    "Пластика бедер в Днепре": "thigh-lift",
    "Пластика половых губ в Днепре": "labiaplasty",
    "Пластика лобка в Днепре": "monsplasty",
    "Липофилинг голеней в Днепре": "calf-lipofilling",
    "Пластика пупка в Днепре": "umbilicoplasty",
    "Гинекомастия в Днепре": "gynecomastia",
    "Эндоскопическая подтяжка лица в Днепре": "endoscopic-facelift",
    "Круговая блефаропластика в Днепре": "circular-blepharoplasty",
    "Блефаропластика верхних век в Днепре": "upper-blepharoplasty",
    "Блефаропластика нижних век в Днепре": "lower-blepharoplasty",
    "Трансконъюнктивальная блефаропластика в Днепре": "transconjunctival-blepharoplasty",
    "Блефаропластика азиатских глаз в Днепре": "asian-blepharoplasty",
    "Эпикантопластика в Днепре": "epicanthoplasty",
    "Периареолярная мастопексия в Днепре": "periareolar-mastopexy",
    "Вертикальная мастопексия в Днепре": "vertical-mastopexy",
    "Якорная мастопексия в Днепре": "anchor-mastopexy",
    "Подтяжка груди без имплантов в Днепре": "breast-lift-without-implants",
    "Подтяжка груди с имплантами в Днепре": "breast-lift-with-implants",
    "Подтяжка и уменьшение груди в Днепре": "breast-lift-reduction",
    "Подтяжка груди после родов и лактации в Днепре": "breast-lift-after-pregnancy",
    "Циркулярная подтяжка груди в Днепре": "circular-breast-lift",
}

PARA = re.compile(r"<w:p[ >].*?</w:p>", re.S)
STYLE = re.compile(r'<w:pStyle w:val="([^"]+)"')
TAGS = re.compile(r"<[^>]+>")


def text_of(xml: str) -> str:
    # <w:tab/> and <w:br/> are the only in-run markup that carries meaning;
    # everything else is formatting noise the outline does not need.
    s = xml.replace("<w:tab/>", " ").replace("<w:br/>", "\n")
    s = html.unescape(TAGS.sub("", s))
    s = s.replace(" ", " ").replace("‑", "-")
    return re.sub(r"[ \t]+", " ", s).strip()


def looks_like_prose(txt: str) -> bool:
    return len(txt.split()) > 12 or txt.endswith((".", ";", ",", ":"))


def relist(nodes):
    """Rebuild bullet lists among paragraphs that lost both their heading style
    and their list formatting. Only demoted paragraphs are considered, so the
    23 well-formed documents pass through untouched."""
    out = []
    i = 0
    while i < len(nodes):
        n = nodes[i]
        intro = n.get("kind") == "para" and n.get("text", "").endswith(":")
        if intro:
            j = i + 1
            run = []
            while j < len(nodes) and nodes[j].get("demoted") and nodes[j]["kind"] == "para" \
                    and len(nodes[j]["text"].split()) <= 20 \
                    and nodes[j]["text"].endswith((";", ".")):
                run.append(nodes[j]["text"])
                if nodes[j]["text"].endswith("."):
                    j += 1
                    break
                j += 1
            if len(run) >= 2:
                out.append({"kind": "para", "text": n["text"]})
                out.append({"kind": "list", "items": run})
                i = j
                continue
        out.append({k: v for k, v in n.items() if k != "demoted"})
        i += 1
    return out


def parse(path: str):
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    nodes, title = [], None
    for p in PARA.findall(xml):
        txt = text_of(p)
        if not txt:
            continue
        st = STYLE.search(p)
        style = st.group(1) if st else ""
        if style == "Heading1":
            title = title or txt
            continue
        if style.startswith("Heading"):
            lvl = int(style[-1])
            if looks_like_prose(txt):
                # One source document (Подтяжка груди с имплантами) has every
                # paragraph styled Heading2. Real headings in this corpus are
                # short and never end in sentence punctuation, so prose wearing
                # a heading style is demoted back to body copy.
                nodes.append({"kind": "para", "text": txt, "demoted": True})
            else:
                nodes.append({"kind": "heading", "level": lvl, "text": txt})
        elif "<w:numPr>" in p:
            # Consecutive list paragraphs collapse into one bullet node.
            if nodes and nodes[-1]["kind"] == "list":
                nodes[-1]["items"].append(txt)
            else:
                nodes.append({"kind": "list", "items": [txt]})
        else:
            nodes.append({"kind": "para", "text": txt})
    return title, relist(nodes)


def main():
    os.makedirs(OUT, exist_ok=True)
    seen = set()
    for fn in sorted(os.listdir(SRC)):
        if not fn.endswith(".docx") or fn.startswith("~$"):
            continue
        name = unicodedata.normalize("NFC", fn[:-5])
        slug = SLUGS.get(name)
        if not slug:
            raise SystemExit(f"no slug mapped for {name!r}")
        title, nodes = parse(os.path.join(SRC, fn))
        seen.add(slug)
        with open(os.path.join(OUT, f"{slug}.json"), "w", encoding="utf-8") as f:
            json.dump({"slug": slug, "docTitle": title, "source": name, "nodes": nodes},
                      f, ensure_ascii=False, indent=1)
        h2 = sum(1 for n in nodes if n["kind"] == "heading" and n["level"] == 2)
        words = sum(len(n.get("text", "").split()) + sum(len(i.split()) for i in n.get("items", []))
                    for n in nodes)
        print(f"{slug:34} {h2:3} H2  {len(nodes):4} nodes  {words:5} words")
    missing = set(SLUGS.values()) - seen
    if missing:
        raise SystemExit(f"missing documents for: {sorted(missing)}")
    print(f"\n{len(seen)} documents extracted into {OUT}")


main()
