# Original family-center artwork

Place the two original, unchanged image files in this directory:

- `cover.png` (or `.jpg`, `.jpeg`, `.webp`, `.avif`): the supplied cover.
- `portfolio.png` (or the same supported extensions): the supplied full portfolio image.

Do not crop, split, regenerate or resize the originals. Keep one file per role.
The full `portfolio` file activates `/redesign/family-center`. The separate cover
is used only as the project-list thumbnail. The main page is unchanged. The REDESIGN list uses a byte-identical copy of the
cover at `public/images/family-center-cover.png`, fitted inside the existing
thumbnail frame without cropping.

The renderer is `src/family-center-detail.js`. It displays only the complete
portfolio, using `width: 100%; height: auto`. The
gallery has a desktop maximum width of 1280px. Navigation leads to `/#work` and the
next project in `src/work-data.js` (currently TANGLE).

Run `npm run build:preview` after placing the images to refresh both production
assets and the offline preview. The originals were supplied in `가족센터 리디자인.zip` and copied without changing
any bytes (only the filesystem names changed):

- `가족센터 표지.png` → `cover.png`, 1920 × 950,
  SHA-256 `b4560bc403702aa9083e73a56fd84df2586cd182e33b5f6d9e7dfdfb44185848`.
- `가족센터.png` → `portfolio.png`, 1920 × 9154,
  SHA-256 `8144f28bd1d934cc8e6d6e55fc8cef2669674b097c04fe65afccb1a0d1f3de02`.

The full portfolio image includes its original opening artwork as supplied. It
is deliberately not trimmed; no separate cover is added above it.
