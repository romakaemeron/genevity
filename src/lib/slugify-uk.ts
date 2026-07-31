/**
 * Ukrainian → Latin slug, following the official transliteration
 * (Cabinet of Ministers of Ukraine resolution No. 55, 2010), lowercased.
 *
 * Output always matches /^[a-z0-9]+(?:-[a-z0-9]+)*$/ or is "".
 */
const MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh",
  з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "iu", я: "ia", "'": "", "’": "",
  // Russian-only letters, in case a title is pasted in RU
  ё: "e", ъ: "", ы: "y", э: "e",
};

/** Digraphs that take a different form word-initially, per the same resolution. */
const INITIAL: Record<string, string> = {
  є: "ye", ї: "yi", й: "y", ю: "yu", я: "ya",
};

export function slugifyUk(input: string): string {
  const lower = input.toLowerCase().trim();
  let out = "";
  let atWordStart = true;

  for (const ch of lower) {
    if (/[a-z0-9]/.test(ch)) {
      out += ch;
      atWordStart = false;
    } else if (MAP[ch] !== undefined) {
      out += (atWordStart && INITIAL[ch]) || MAP[ch];
      atWordStart = false;
    } else {
      out += "-";
      atWordStart = true;
    }
  }

  return out.replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120).replace(/-$/, "");
}
