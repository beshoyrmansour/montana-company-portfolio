/**
 * Shared certification visuals — used by the home cert wall and the About
 * cert grid so they stay in sync. The lucide icons are tasteful placeholders;
 * drop real logo files in public/images/certifications/ (see the README there)
 * and map them in CERT_LOGOS — both pages pick them up automatically.
 */
import { ShieldCheck, BadgeCheck, Landmark, type LucideIcon } from 'lucide-react';

const CERT_ICONS: Record<string, LucideIcon> = {
  BRCGS: ShieldCheck,
  'ISO 22000': BadgeCheck,
  Halal: BadgeCheck,
  FDA: Landmark,
};

/**
 * Official certification logo files. Add real logos to
 * public/images/certifications/ and map them by cert name — one line each.
 */
export const CERT_LOGOS: Record<string, string> = {
  FDA: '/images/certifications/fda.png',
  'ISO 22000': '/images/certifications/iso-22000.png',
  Halal: '/images/certifications/halal.png',
  // BRCGS art is the client-supplied "Food Safety" scheme (white-on-green, solid
  // background kept); the wall copy matches (see content/pages/{home,about}.json).
  BRCGS: '/images/certifications/brcgs.png',
};

export function certIcon(name: string): LucideIcon {
  return CERT_ICONS[name] ?? BadgeCheck;
}

export function certLogo(name: string): string | undefined {
  return CERT_LOGOS[name];
}
