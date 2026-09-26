export type Mode = 'road' | 'rail' | 'sea' | 'air';

export const MODES: Mode[] = ['road', 'rail', 'sea', 'air'];

/** kg per m³ used by carriers to compute volumetric weight. */
const VOLUMETRIC_FACTOR: Record<Mode, number> = { air: 167, road: 250, rail: 250, sea: 1000 };

/** Typical transit ranges in days (international → Kazakhstan). Indicative only. */
const TRANSIT: Record<Mode, [number, number]> = {
  air: [3, 7],
  road: [10, 18],
  rail: [18, 30],
  sea: [35, 55],
};
const TRANSIT_DOMESTIC: Record<Exclude<Mode, 'sea'>, [number, number]> = { air: [1, 3], road: [2, 7], rail: [5, 12] };

/** Relative cost index per chargeable kg (1 = cheapest). Used only to rank options. */
const COST_INDEX: Record<Mode, number> = { sea: 1, rail: 1.6, road: 2.4, air: 9 };

export type CalcInput = {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  places: number;
  domestic: boolean;
};

export type ModeResult = {
  mode: Mode;
  chargeableKg: number;
  transit: [number, number];
  fastest?: boolean;
  cheapest?: boolean;
};

export function volumeM3(i: CalcInput) {
  const v = (i.lengthCm * i.widthCm * i.heightCm) / 1_000_000;
  return v * Math.max(1, i.places || 1);
}

export function totalWeight(i: CalcInput) {
  return i.weightKg * Math.max(1, i.places || 1);
}

export function calculate(i: CalcInput): ModeResult[] {
  const vol = volumeM3(i);
  const weight = totalWeight(i);
  const modes = i.domestic ? (['road', 'rail', 'air'] as const) : MODES;

  const results = modes.map<ModeResult>((mode) => ({
    mode,
    chargeableKg: Math.ceil(Math.max(weight, vol * VOLUMETRIC_FACTOR[mode])),
    transit: i.domestic && mode !== 'sea' ? TRANSIT_DOMESTIC[mode] : TRANSIT[mode],
  }));

  const fastest = results.reduce((a, b) => (b.transit[0] < a.transit[0] ? b : a));
  const cheapest = results.reduce((a, b) =>
    b.chargeableKg * COST_INDEX[b.mode] < a.chargeableKg * COST_INDEX[a.mode] ? b : a,
  );
  fastest.fastest = true;
  cheapest.cheapest = true;
  return results;
}

export const parseNum = (s: string) => {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ru-RU', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
