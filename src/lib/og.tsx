import { ImageResponse } from 'next/og';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Shared Open Graph / share-thumbnail renderer.
 *
 * One branded "logo + brand" card used by every og:image route (home, about,
 * markets, news, contact, products). Keeping a single renderer means the share
 * preview that Facebook / WhatsApp / X / LinkedIn pull stays consistent.
 *
 * Design: cream brand surface, terracotta eyebrow, the Montana logo, an
 * editorial headline + sub-line, and the domain. Text is Latin/English only —
 * next/og has no Arabic shaping, and the card is shown to a global audience.
 *
 * WhatsApp note: WhatsApp center-crops large previews toward a square. The key
 * content (logo + headline) is kept left-of-center and vertically centered so
 * it survives that crop; the domain sits bottom-right as a safe-to-lose accent.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';

// Brand tokens (mirrors tokens.css; next/og needs literal colors, not CSS vars).
const CREAM = '#FBFAF6';
const GREEN = '#147239';
const TERRACOTTA = '#C8202E';
const INK = '#1A2B1F';

let _logo: string | null = null;
/** Read the PNG logo once and return it as a data URI (next/og can't fetch /public at build). */
async function logoDataUri(): Promise<string> {
  if (_logo) return _logo;
  const file = path.join(process.cwd(), 'public/images/logo/montana-logo.png');
  const buf = await fs.readFile(file);
  _logo = `data:image/png;base64,${buf.toString('base64')}`;
  return _logo;
}

interface OgCardInput {
  /** Small uppercase eyebrow, e.g. "Since 1985 · 30 countries" or "Catalog". */
  eyebrow: string;
  /** Main headline, e.g. the page or product title. */
  title: string;
  /** Supporting line under the title (tagline / short description). */
  subtitle?: string;
  /** Accent color for the eyebrow + rule. Defaults to terracotta. */
  accent?: string;
}

/** Render the branded share card as a PNG ImageResponse. */
export async function renderOgCard({
  eyebrow,
  title,
  subtitle,
  accent = TERRACOTTA,
}: OgCardInput): Promise<ImageResponse> {
  const logo = await logoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 90px',
          background: CREAM,
          // Subtle brand corner wash so the card isn't a flat block.
          backgroundImage: `radial-gradient(circle at 100% 0%, ${GREEN}14 0%, transparent 45%)`,
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Logo — next/og renders to a static PNG, so a raw <img> is required
            here (next/image does not work inside ImageResponse). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={360} height={184} alt="" style={{ marginBottom: 40 }} />

        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accent,
            marginBottom: 18,
          }}
        >
          {eyebrow}
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 28 ? 76 : 96,
            fontWeight: 800,
            lineHeight: 1.02,
            color: INK,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              display: 'flex',
              fontSize: 34,
              lineHeight: 1.3,
              color: `${INK}B3`,
              marginTop: 24,
              maxWidth: 940,
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Domain — bottom-right accent (safe to lose under WhatsApp's square crop) */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 56,
            right: 90,
            fontSize: 26,
            fontWeight: 600,
            color: GREEN,
          }}
        >
          montanaeg.com
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

export { TERRACOTTA as OG_TERRACOTTA, GREEN as OG_GREEN };
