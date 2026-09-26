import type { Mode } from './calc';

export type StatusKey = 'created' | 'pickup' | 'transit' | 'customs' | 'delivery' | 'delivered';

export const STATUS_ORDER: StatusKey[] = ['created', 'pickup', 'transit', 'customs', 'delivery', 'delivered'];

export type TrackEvent = {
  status: StatusKey;
  date: string; // ISO
  place: string;
  note?: string;
};

export type Shipment = {
  number: string;
  mode: Mode;
  from: string;
  to: string;
  cargo: string;
  weightKg: number;
  eta: string; // ISO
  status: StatusKey;
  events: TrackEvent[]; // newest first
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

/**
 * Demo shipments. Replace `fetchShipment` with a call to the company's
 * tracking API (1C / TMS) when it becomes available — the UI only depends
 * on the `Shipment` shape.
 */
const DEMO: Record<string, () => Shipment> = {
  ZL240001: () => ({
    number: 'ZL240001',
    mode: 'road',
    from: 'Гуанчжоу, CN',
    to: 'Алматы, KZ',
    cargo: 'Оборудование, 12 паллет',
    weightKg: 8400,
    eta: daysAgo(-4),
    status: 'transit',
    events: [
      { status: 'transit', date: daysAgo(0.3), place: 'Хоргос, KZ', note: 'Пересёк границу' },
      { status: 'transit', date: daysAgo(3), place: 'Урумчи, CN' },
      { status: 'pickup', date: daysAgo(7), place: 'Гуанчжоу, CN' },
      { status: 'created', date: daysAgo(8), place: 'Алматы, KZ' },
    ],
  }),
  ZL240002: () => ({
    number: 'ZL240002',
    mode: 'sea',
    from: 'Шанхай, CN',
    to: 'Астана, KZ',
    cargo: 'Контейнер 40’ HC',
    weightKg: 21500,
    eta: daysAgo(2),
    status: 'delivered',
    events: [
      { status: 'delivered', date: daysAgo(2), place: 'Астана, KZ', note: 'Получено клиентом' },
      { status: 'delivery', date: daysAgo(4), place: 'Алматы, KZ' },
      { status: 'customs', date: daysAgo(7), place: 'Алматы, KZ', note: 'Выпуск товара' },
      { status: 'transit', date: daysAgo(18), place: 'Порт Актау, KZ' },
      { status: 'transit', date: daysAgo(38), place: 'Порт Шанхай, CN' },
      { status: 'pickup', date: daysAgo(41), place: 'Шанхай, CN' },
      { status: 'created', date: daysAgo(43), place: 'Алматы, KZ' },
    ],
  }),
  ZL240003: () => ({
    number: 'ZL240003',
    mode: 'air',
    from: 'Франкфурт, DE',
    to: 'Алматы, KZ',
    cargo: 'Медицинские приборы',
    weightKg: 320,
    eta: daysAgo(-1),
    status: 'customs',
    events: [
      { status: 'customs', date: daysAgo(0.2), place: 'Аэропорт Алматы, KZ', note: 'Подача декларации' },
      { status: 'transit', date: daysAgo(1), place: 'Франкфурт (FRA), DE' },
      { status: 'pickup', date: daysAgo(2), place: 'Франкфурт, DE' },
      { status: 'created', date: daysAgo(3), place: 'Алматы, KZ' },
    ],
  }),
};

export const DEMO_NUMBERS = Object.keys(DEMO);

export const normalizeNumber = (s: string) => s.replace(/\s+/g, '').toUpperCase();

export async function fetchShipment(raw: string): Promise<Shipment | null> {
  const number = normalizeNumber(raw);
  await new Promise((r) => setTimeout(r, 450));
  return DEMO[number]?.() ?? null;
}

export function progressOf(s: Shipment) {
  return STATUS_ORDER.indexOf(s.status) / (STATUS_ORDER.length - 1);
}

export function formatDate(iso: string, lang: string, withTime = false) {
  const d = new Date(iso);
  const locale = lang === 'en' ? 'en-GB' : lang === 'kk' ? 'kk-KZ' : 'ru-RU';
  return d.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
