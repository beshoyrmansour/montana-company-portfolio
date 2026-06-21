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
  // 'BRCGS': '/images/certifications/brcgs.png',
  // 'IFS Food': '/images/certifications/ifs.png',
  // 'ISO 22000': '/images/certifications/iso-22000.png',
  // 'GLOBALG.A.P': '/images/certifications/globalgap.png',
  // 'SMETA': '/images/certifications/smeta.png',
  // 'Halal': '/images/certifications/halal.png',
  // 'NFSA': '/images/certifications/nfsa.png',
  // 'QCAP': '/images/certifications/qcap.png',
  // 'FDA': '/images/certifications/fda.png',
  // 'CODEX': '/images/certifications/codex.png',
};

export function certIcon(name: string): LucideIcon {
  return CERT_ICONS[name] ?? BadgeCheck;
}

export function certLogo(name: string): string | undefined {
  return CERT_LOGOS[name];
}
