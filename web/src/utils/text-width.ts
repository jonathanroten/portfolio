import { readFileSync } from "node:fs";
import { join } from "node:path";
import { create, type Font } from "fontkitten";

const loadFont = (file: string) =>
  create(readFileSync(join(process.cwd(), "src/assets/fonts", file))) as Font;

/**
 * The faces `.text-style-h2.text-accent` sets text in. `scale` and `tracking`
 * mirror `.text-accent span` in patterns.css and the `h2` letter spacing in
 * base.css, so keep them in step with those.
 */
const faces = {
  text: {
    font: loadFont("hedvig-letters-serif_18pt-regular.ttf"),
    scale: 1,
    tracking: 0.02,
  },
  highlight: {
    font: loadFont("apfel-grotezk-mittel.woff2"),
    scale: 1.077,
    tracking: 0.04,
  },
};

/**
 * Width of the widest word in a `.text-accent` heading, in ems of its font
 * size, measured from the font files. Highlighted runs are uppercase in Apfel
 * Grotezk, the rest is Hedvig Letters Serif. Kerning is left out, which errs
 * slightly wide.
 */
export function widestAccentWord(
  runs: { text: string; highlight: boolean }[],
): number {
  let widest = 0;
  let word = 0;
  for (const { text, highlight } of runs) {
    const { font, scale, tracking } = highlight ? faces.highlight : faces.text;
    for (const char of highlight ? text.toUpperCase() : text) {
      if (/\s/.test(char)) {
        word = 0;
        continue;
      }
      const [glyph] = font.glyphsForString(char);
      word += (glyph.advanceWidth / font.unitsPerEm + tracking) * scale;
      widest = Math.max(widest, word);
    }
  }
  return widest;
}
