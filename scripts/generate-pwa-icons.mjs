/**
 * Régénère les icônes PWA / favicon à partir de `public/brand/raaga-icon-source.png`.
 *
 * Hypothèses sur la source :
 *  - PNG carré, fond orange plein (gradient), logo R/chariot centré.
 *  - Les coins (hors du carré arrondi) peuvent être blancs ; on les remplace
 *    par le orange de marque pour que l'icône remplisse vraiment l'espace
 *    sur les lanceurs Android qui n'appliquent pas de masque.
 *
 * Sorties :
 *  - public/icons/icon-{192,512}.png            (purpose: any)
 *  - public/icons/icon-maskable-{192,512}.png   (purpose: maskable, zone sûre 80%)
 *  - public/icons/apple-touch-icon.png          (180×180)
 *  - app/icon.png                               (512×512, favicon Next.js)
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const SRC = join(root, "public/brand/raaga-icon-source.png");
const BRAND = { r: 255, g: 122, b: 0 };
/** Distance normalisée à laquelle on commence à considérer "coin" (1.0 = bord). */
const CORNER_RING_START = 0.86;
/** Taille du logo dans l'icône maskable (zone sûre adaptive icon ≈ 80 %). */
const MASKABLE_INNER_RATIO = 0.8;

/**
 * Remplace les pixels quasi-blancs proches d'un coin par le orange de marque.
 * Évite d'effacer les reflets clairs du logo (qui ne sont pas au bord).
 */
async function fillCornersBrand(srcBuffer) {
  const { data, info } = await sharp(srcBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const buf = Buffer.from(data);
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const maxR = Math.hypot(cx, cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = buf[i];
      const g = buf[i + 1];
      const b = buf[i + 2];
      const a = buf[i + 3];
      const dist = Math.hypot(x - cx, y - cy) / maxR;
      const nearWhite = r > 245 && g > 245 && b > 245;
      const transparent = a < 250;
      if ((nearWhite || transparent) && dist > CORNER_RING_START) {
        buf[i] = BRAND.r;
        buf[i + 1] = BRAND.g;
        buf[i + 2] = BRAND.b;
        buf[i + 3] = 255;
      }
    }
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function toAnySize(any512, size) {
  return sharp(any512).resize(size, size, { fit: "cover" }).png().toBuffer();
}

async function toMaskable(any512, size) {
  const safe = Math.round(size * MASKABLE_INNER_RATIO);
  const logo = await sharp(any512).resize(safe, safe, { fit: "cover" }).png().toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: BRAND.r, g: BRAND.g, b: BRAND.b },
    },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toBuffer();
}

async function main() {
  if (!existsSync(SRC)) {
    throw new Error(`Source introuvable : ${SRC}`);
  }
  const srcBuf = readFileSync(SRC);
  const cleaned = await fillCornersBrand(srcBuf);
  const any512 = await sharp(cleaned)
    .resize(512, 512, { fit: "cover" })
    .flatten({ background: { r: BRAND.r, g: BRAND.g, b: BRAND.b } })
    .png()
    .toBuffer();

  const iconsDir = join(root, "public/icons");
  mkdirSync(iconsDir, { recursive: true });

  writeFileSync(join(iconsDir, "icon-512.png"), any512);
  writeFileSync(join(iconsDir, "icon-192.png"), await toAnySize(any512, 192));
  writeFileSync(join(iconsDir, "icon-maskable-512.png"), await toMaskable(any512, 512));
  writeFileSync(join(iconsDir, "icon-maskable-192.png"), await toMaskable(any512, 192));
  writeFileSync(join(iconsDir, "apple-touch-icon.png"), await toAnySize(any512, 180));
  writeFileSync(join(root, "app/icon.png"), any512);

  console.log("Icônes régénérées : public/icons/*, app/icon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
