# Fonts for wallet artwork generation

Used only by `scripts/generate-loyalty-assets.ts` (resvg renders with these explicit files, never system fonts).
Both are licensed under the SIL Open Font License 1.1 (https://openfontlicense.org).

- `TenorSans-Regular.ttf` - Tenor Sans, (c) Vernon Adams / Google Fonts project authors.
  Source: https://github.com/google/fonts/tree/main/ofl/tenorsans
- `Mulish-SemiBold.ttf` - Mulish, (c) The Mulish Project Authors.
  Source: https://github.com/google/fonts/tree/main/ofl/mulish
  Static instance (wght=600) cut from the variable font `Mulish[wght].ttf` with
  `fonttools varLib.instancer "Mulish[wght].ttf" wght=600`, because resvg cannot pick a weight from a variable font reliably.
