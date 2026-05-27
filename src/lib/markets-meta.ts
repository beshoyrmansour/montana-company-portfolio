/**
 * Markets visual + logistics metadata.
 *
 * Joined with `content/markets.json` at render time:
 *   - markets.json provides trilingual country/region names (source of truth)
 *   - this file adds: per-region color · lede · lead time · photo URL
 *                     per-country: port · hub-flag · map coordinates
 *
 * Coordinates are equirectangular projection on the world.svg viewBox
 * (1009.6727 × 665.96301). x = (lon + 180) / 360 * w; y = (90 - lat) / 180 * h.
 * Re-derived from the design package for compatibility with `world.svg` paths.
 */

export interface RegionMeta {
  color: string;
  leadTime: string;
  lede: { en: string; ar: string; fr: string };
  photo: string;
}

export interface CountryMeta {
  flag: string; // emoji flag
  port: string; // primary port of entry
  hub?: boolean; // is this the HQ?
  coords?: [number, number];
}

/* ─── Per-region metadata ─── */

export const REGION_META: Record<string, RegionMeta> = {
  mena: {
    color: '#147239',
    leadTime: '4–10 days',
    lede: {
      en: 'Our home region. Same-week container despatch by road and Red Sea ferry; the molokhia from Kalioub on a Riyadh table by Friday.',
      ar: 'منطقتنا الأم. شحن أسبوعي عبر البر وعبارات البحر الأحمر؛ ملوخية القليوب على مائدة الرياض بحلول يوم الجمعة.',
      fr: "Notre région d'origine. Expédition hebdomadaire par route et ferry de la mer Rouge ; la molokhia de Kalioub sur une table à Riyad avant vendredi.",
    },
    photo: '/images/markets/mena.jpg',
  },
  europe: {
    color: '#B86A3E',
    leadTime: '10–18 days',
    lede: {
      en: 'Mediterranean shipping out of Alexandria, refrigerated container to Rotterdam or Genoa, last mile by road. EU customs cleared pre-arrival.',
      ar: 'شحن متوسطي من الإسكندرية، حاوية مبردة إلى روتردام أو جنوة، والمرحلة الأخيرة برًا. تخليص جمركي أوروبي قبل الوصول.',
      fr: "Expédition méditerranéenne d'Alexandrie, conteneur réfrigéré vers Rotterdam ou Gênes, dernier kilomètre par route. Douane UE pré-dédouanée.",
    },
    photo: '/images/markets/europe.jpg',
  },
  'asia-pacific': {
    color: '#D4A84A',
    leadTime: '18–28 days',
    lede: {
      en: 'Suez transit east-bound to Singapore, Tokyo, Sydney. Strawberries land before season opens in your local market.',
      ar: 'عبور قناة السويس شرقًا إلى سنغافورة وطوكيو وسيدني. الفراولة تصل قبل افتتاح الموسم في سوقكم المحلي.',
      fr: "Transit du Suez vers Singapour, Tokyo, Sydney. Les fraises arrivent avant l'ouverture de la saison sur votre marché local.",
    },
    photo: '/images/markets/asia-pacific.jpg',
  },
  americas: {
    color: '#C8202E',
    leadTime: '20–28 days',
    lede: {
      en: 'Trans-Atlantic via Algeciras to East Coast US, Caribbean, and South America. Cold chain unbroken from Kalioub to your dock.',
      ar: 'عبور المحيط الأطلسي عبر الجزيرة الخضراء إلى الساحل الشرقي الأمريكي والكاريبي وأمريكا الجنوبية. سلسلة تبريد دون انقطاع.',
      fr: "Transatlantique via Algésiras vers la côte Est des États-Unis, les Caraïbes et l'Amérique du Sud. Chaîne du froid ininterrompue.",
    },
    photo: '/images/markets/americas.jpg',
  },
  africa: {
    color: '#6FA84D',
    leadTime: '8–18 days',
    lede: {
      en: 'Red Sea down to Mombasa and Durban; West African route via Algeciras. Growing demand — six new markets opened in 2025.',
      ar: 'البحر الأحمر نزولًا إلى مومباسا وديربان؛ المسار الغربي الأفريقي عبر الجزيرة الخضراء. طلب متزايد — ست أسواق جديدة في 2025.',
      fr: "Mer Rouge jusqu'à Mombasa et Durban ; route ouest-africaine via Algésiras. Demande croissante — six nouveaux marchés en 2025.",
    },
    photo: '/images/markets/africa.jpg',
  },
};

/* ─── Per-country metadata (indexed by ISO-2) ─── */

export const COUNTRY_META: Record<string, CountryMeta> = {
  // MENA — hub. Coordinates are centroids computed directly from world.svg
  // path geometry (parsed at /scripts via path tokenization), so markers
  // sit exactly on the rendered country shape.
  EG: { flag: '🇪🇬', port: 'Kalioub HQ', hub: true, coords: [561.3, 382.4] },
  SA: { flag: '🇸🇦', port: 'Jeddah', coords: [600.8, 396.2] },
  AE: { flag: '🇦🇪', port: 'Jebel Ali', coords: [627.5, 393.1] },
  KW: { flag: '🇰🇼', port: 'Shuwaikh', coords: [609.1, 376.8] },
  QA: { flag: '🇶🇦', port: 'Hamad', coords: [618.6, 390.2] },
  BH: { flag: '🇧🇭', port: 'Khalifa Bin Salman', coords: [616.7, 387.6] },
  OM: { flag: '🇴🇲', port: 'Salalah', coords: [632.1, 400.8] },
  JO: { flag: '🇯🇴', port: 'Aqaba', coords: [578.0, 370.8] },
  LB: { flag: '🇱🇧', port: 'Beirut', coords: [575.8, 362.5] },
  SY: { flag: '🇸🇾', port: 'Latakia', coords: [581.7, 358.1] },
  IQ: { flag: '🇮🇶', port: 'Umm Qasr', coords: [600.0, 362.6] },
  PS: { flag: '🇵🇸', port: 'Gaza / via Israel', coords: [573.2, 369.2] },
  LY: { flag: '🇱🇾', port: 'Tripoli', coords: [524.5, 380.7] },
  TN: { flag: '🇹🇳', port: 'Radès', coords: [502.7, 361.1] },
  SD: { flag: '🇸🇩', port: 'Port Sudan', coords: [559.4, 423.5] },

  // Europe
  GB: { flag: '🇬🇧', port: 'Felixstowe', coords: [463.3, 274.9] },
  FR: { flag: '🇫🇷', port: 'Marseille / Le Havre', coords: [484.0, 317.0] },
  DE: { flag: '🇩🇪', port: 'Hamburg', coords: [504.2, 295.7] },
  BE: { flag: '🇧🇪', port: 'Antwerp', coords: [488.2, 298.6] },
  CH: { flag: '🇨🇭', port: 'via Genoa', coords: [498.2, 315.0] },
  SE: { flag: '🇸🇪', port: 'Gothenburg', coords: [524.2, 240.3] },
  PL: { flag: '🇵🇱', port: 'Gdańsk', coords: [528.5, 294.9] },
  CY: { flag: '🇨🇾', port: 'Limassol', coords: [568.3, 358.4] },
  TR: { flag: '🇹🇷', port: 'Mersin', coords: [571.1, 344.2] },

  // Americas
  US: { flag: '🇺🇸', port: 'New York / Long Beach', coords: [142.4, 303.7] },
  CA: { flag: '🇨🇦', port: 'Montreal', coords: [224.2, 210.5] },

  // Asia-Pacific
  AU: { flag: '🇦🇺', port: 'Melbourne / Sydney', coords: [859.4, 537.3] },
  NZ: { flag: '🇳🇿', port: 'Auckland', coords: [960.0, 591.4] },
  AF: { flag: '🇦🇫', port: 'via Karachi', coords: [664.5, 358.7] },
  MU: { flag: '🇲🇺', port: 'Port Louis', coords: [636.4, 520.7] },
};

/** Egypt's coordinate on the world.svg viewBox (Kalioub origin).
 *  Lifted slightly north of the country centroid so the label and the
 *  pulsing halo sit over the Nile Delta where Kalioub actually is. */
export const EGYPT_COORDS: [number, number] = COUNTRY_META.EG?.coords ?? [561, 382];

/** Get region color falling back to brand primary. */
export function regionColor(regionId: string): string {
  return REGION_META[regionId]?.color ?? '#147239';
}
