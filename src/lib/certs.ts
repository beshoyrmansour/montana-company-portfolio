/**
 * Shared certification visuals — used by the home cert wall and the About
 * cert grid so they stay in sync. The lucide icons are tasteful placeholders;
 * drop real logo files in public/images/certifications/ (see the README there)
 * and map them in CERT_LOGOS — both pages pick them up automatically.
 */
import {
  ShieldCheck,
  Award,
  BadgeCheck,
  ClipboardCheck,
  Sprout,
  Factory,
  Users,
  Landmark,
  FlaskConical,
  Globe,
  type LucideIcon,
} from 'lucide-react';

const CERT_ICONS: Record<string, LucideIcon> = {
  BRCGS: ShieldCheck,
  'IFS Food': Award,
  'ISO 22000': BadgeCheck,
  HACCP: ClipboardCheck,
  'GLOBALG.A.P': Sprout,
  GMP: Factory,
  SMETA: Users,
  Halal: BadgeCheck,
  NFSA: Landmark,
  QCAP: FlaskConical,
  FDA: Landmark,
  CODEX: Globe,
};

/**
 * Official certification logo files. Add real logos to
 * public/images/certifications/ and map them by cert name — one line each.
 */
export const CERT_LOGOS: Record<string, string> = {
  FDA: '/images/certifications/fda.png',
  'GLOBALG.A.P': '/images/certifications/globalgap.png',
  'IFS Food': '/images/certifications/ifs.png',
  'ISO 22000': '/images/certifications/iso-22000.png',
  HACCP: '/images/certifications/haccp.png',
  GMP: '/images/certifications/gmp.png',
  Halal: '/images/certifications/halal.png',
  NFSA: '/images/certifications/nfsa.png',
  SMETA: '/images/certifications/smeta.png',
  // BRCGS art is the client-supplied "Food Safety" scheme (white-on-green, solid
  // background kept); the wall copy matches (see content/pages/{home,about}.json).
  BRCGS: '/images/certifications/brcgs.png',
  // Left OFF — fall back to the lucide icon + text until resolved:
  //   QCAP  — supplied art is a busy certificate scan, illegible at logo size.
  //   CODEX — only art is the wide white-on-orange FAO/WHO banner; unreadable at logo size.
  // 'QCAP': '/images/certifications/qcap.png',
  // 'CODEX': '/images/certifications/codex.png',
};

export function certIcon(name: string): LucideIcon {
  return CERT_ICONS[name] ?? BadgeCheck;
}

export function certLogo(name: string): string | undefined {
  return CERT_LOGOS[name];
}
