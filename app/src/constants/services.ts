import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { Lang } from '../i18n/strings';

type IconName = ComponentProps<typeof Ionicons>['name'];
type L10n = Record<Lang, string>;

export type Service = {
  id: string;
  icon: IconName;
  tint: string;
  title: L10n;
  short: L10n;
  description: L10n;
  features: Record<Lang, string[]>;
  mode?: 'road' | 'rail' | 'sea' | 'air';
};

export const services: Service[] = [
  {
    id: 'road',
    icon: 'bus',
    tint: '#2563EB',
    mode: 'road',
    title: { ru: 'Грузоперевозки по Казахстану', kk: 'Қазақстан бойынша тасымал', en: 'Road freight in Kazakhstan' },
    short: { ru: 'FTL и сборные грузы', kk: 'FTL және құрама жүктер', en: 'FTL and LTL' },
    description: {
      ru: 'Доставка грузов из Алматы во все города Казахстана автотранспортом: полные машины и сборные отправки.',
      kk: 'Алматыдан Қазақстанның барлық қалаларына автокөлікпен жүк жеткізу: толық көлік және құрама жөнелтімдер.',
      en: 'Road delivery from Almaty to every city in Kazakhstan: full truckloads and consolidated shipments.',
    },
    features: {
      ru: ['Тенты, рефрижераторы, площадки', 'Сборные отправки', 'Погрузка и разгрузка', 'Страхование груза'],
      kk: ['Тент, рефрижератор, алаңдар', 'Құрама жөнелтімдер', 'Тиеу және түсіру', 'Жүкті сақтандыру'],
      en: ['Curtainsiders, reefers, flatbeds', 'Consolidated shipments', 'Loading and unloading', 'Cargo insurance'],
    },
  },
  {
    id: 'international',
    icon: 'globe',
    tint: '#0EA5E9',
    mode: 'road',
    title: { ru: 'Международные перевозки', kk: 'Халықаралық тасымал', en: 'International freight' },
    short: { ru: 'Китай, Европа, СНГ', kk: 'Қытай, Еуропа, ТМД', en: 'China, Europe, CIS' },
    description: {
      ru: 'Доставка грузов из Китая, Европы, Турции и стран СНГ в Казахстан и обратно. Подбор оптимального маршрута.',
      kk: 'Қытайдан, Еуропадан, Түркиядан және ТМД елдерінен Қазақстанға және кері жүк жеткізу.',
      en: 'Cargo from China, Europe, Turkey and the CIS to Kazakhstan and back, with optimal route planning.',
    },
    features: {
      ru: ['Мультимодальные решения', 'Консолидация на складах', 'Документы TIR/CMR', 'Контроль на каждом этапе'],
      kk: ['Мультимодальды шешімдер', 'Қоймада шоғырландыру', 'TIR/CMR құжаттары', 'Әр кезеңде бақылау'],
      en: ['Multimodal solutions', 'Warehouse consolidation', 'TIR/CMR documents', 'Control at every stage'],
    },
  },
  {
    id: 'air',
    icon: 'airplane',
    tint: '#8B5CF6',
    mode: 'air',
    title: { ru: 'Авиаперевозки', kk: 'Әуе тасымалы', en: 'Air freight' },
    short: { ru: 'Срочные и ценные грузы', kk: 'Шұғыл және құнды жүктер', en: 'Urgent & high-value cargo' },
    description: {
      ru: 'Авиадоставка грузов из Алматы по всему миру и в Казахстан. Для срочных и ценных отправок.',
      kk: 'Алматыдан бүкіл әлемге және Қазақстанға әуе жолымен жеткізу. Шұғыл және құнды жөнелтімдерге.',
      en: 'Air delivery from Almaty worldwide and into Kazakhstan — for urgent and high-value shipments.',
    },
    features: {
      ru: ['Регулярные и чартерные рейсы', 'Опасные грузы по IATA', 'Доставка до двери', 'Таможенное оформление'],
      kk: ['Тұрақты және чартерлік рейстер', 'IATA бойынша қауіпті жүктер', 'Есікке дейін жеткізу', 'Кедендік рәсімдеу'],
      en: ['Scheduled and charter flights', 'IATA dangerous goods', 'Door-to-door', 'Customs clearance'],
    },
  },
  {
    id: 'sea',
    icon: 'boat',
    tint: '#0891B2',
    mode: 'sea',
    title: { ru: 'Морские перевозки', kk: 'Теңіз тасымалы', en: 'Sea freight' },
    short: { ru: 'FCL / LCL контейнеры', kk: 'FCL / LCL контейнерлер', en: 'FCL / LCL containers' },
    description: {
      ru: 'Морская доставка контейнеров через порты Китая, Европы и Каспия с доставкой до Казахстана.',
      kk: 'Қытай, Еуропа және Каспий порттары арқылы контейнерлерді Қазақстанға дейін жеткізу.',
      en: 'Container shipping via ports in China, Europe and the Caspian with on-carriage to Kazakhstan.',
    },
    features: {
      ru: ['20’ и 40’ контейнеры', 'Сборные LCL-отправки', 'Фрахт и портовые услуги', 'Доставка из порта до двери'],
      kk: ['20’ және 40’ контейнерлер', 'Құрама LCL жөнелтімдер', 'Фрахт және порт қызметтері', 'Порттан есікке дейін'],
      en: ['20’ and 40’ containers', 'LCL consolidation', 'Freight and port services', 'Port-to-door'],
    },
  },
  {
    id: 'container',
    icon: 'cube',
    tint: '#F26B1D',
    mode: 'rail',
    title: { ru: 'Контейнерные и Ж/Д', kk: 'Контейнерлік және Т/Ж', en: 'Container & rail' },
    short: { ru: 'Мультимодальные перевозки', kk: 'Мультимодальды тасымал', en: 'Multimodal transport' },
    description: {
      ru: 'Контейнерные и мультимодальные перевозки: железная дорога, море и авто в одной логистической цепочке.',
      kk: 'Контейнерлік және мультимодальды тасымал: темір жол, теңіз және авто бір логистикалық тізбекте.',
      en: 'Container and multimodal transport: rail, sea and road combined in one supply chain.',
    },
    features: {
      ru: ['Ж/Д платформы и вагоны', 'Аренда контейнеров', 'Терминальная обработка', 'Единый договор'],
      kk: ['Т/Ж платформалар мен вагондар', 'Контейнер жалға алу', 'Терминалдық өңдеу', 'Бірыңғай шарт'],
      en: ['Rail platforms and wagons', 'Container leasing', 'Terminal handling', 'Single contract'],
    },
  },
  {
    id: 'customs',
    icon: 'document-text',
    tint: '#16A34A',
    title: { ru: 'Таможенное оформление', kk: 'Кедендік рәсімдеу', en: 'Customs clearance' },
    short: { ru: 'Брокер и сертификация', kk: 'Брокер және сертификаттау', en: 'Brokerage & certification' },
    description: {
      ru: 'Растаможка грузов в Казахстане: декларирование, расчёт платежей, сертификаты и разрешительные документы.',
      kk: 'Қазақстанда жүкті кедендік рәсімдеу: декларациялау, төлемдерді есептеу, сертификаттар.',
      en: 'Customs clearance in Kazakhstan: declarations, duty calculation, certificates and permits.',
    },
    features: {
      ru: ['Подбор кода ТН ВЭД', 'Импорт и экспорт', 'Сертификаты ЕАЭС', 'Консультации по ВЭД'],
      kk: ['СЭҚ ТН кодын анықтау', 'Импорт және экспорт', 'ЕАЭО сертификаттары', 'СЭҚ бойынша кеңес'],
      en: ['HS code classification', 'Import and export', 'EAEU certificates', 'Foreign trade consulting'],
    },
  },
  {
    id: 'dangerous',
    icon: 'warning',
    tint: '#DC2626',
    mode: 'road',
    title: { ru: 'Опасные грузы', kk: 'Қауіпті жүктер', en: 'Dangerous goods' },
    short: { ru: 'ADR, IMDG, IATA', kk: 'ADR, IMDG, IATA', en: 'ADR, IMDG, IATA' },
    description: {
      ru: 'Перевозка опасных грузов всех классов по Казахстану и миру с соблюдением международных норм.',
      kk: 'Халықаралық нормаларды сақтай отырып, барлық сыныптағы қауіпті жүктерді тасымалдау.',
      en: 'Transport of dangerous goods of all classes across Kazakhstan and worldwide, fully compliant.',
    },
    features: {
      ru: ['Сертифицированные водители', 'Спецмаркировка и упаковка', 'Паспорта безопасности', 'Сопровождение'],
      kk: ['Сертификатталған жүргізушілер', 'Арнайы таңбалау мен орау', 'Қауіпсіздік паспорттары', 'Алып жүру'],
      en: ['Certified drivers', 'Special labelling & packing', 'Safety data sheets', 'Escort'],
    },
  },
  {
    id: 'warehouse',
    icon: 'business',
    tint: '#64748B',
    title: { ru: '3PL и склад', kk: '3PL және қойма', en: '3PL & warehousing' },
    short: { ru: 'Ответственное хранение', kk: 'Жауапты сақтау', en: 'Custodial storage' },
    description: {
      ru: 'Складская логистика в Алматы: ответственное хранение, комплектация заказов и дистрибуция.',
      kk: 'Алматыдағы қойма логистикасы: жауапты сақтау, тапсырыстарды жинақтау және дистрибуция.',
      en: 'Warehouse logistics in Almaty: custodial storage, order picking and distribution.',
    },
    features: {
      ru: ['Приёмка и учёт', 'Комплектация и упаковка', 'Кросс-докинг', 'Доставка клиентам'],
      kk: ['Қабылдау және есепке алу', 'Жинақтау және орау', 'Кросс-докинг', 'Клиенттерге жеткізу'],
      en: ['Receiving and inventory', 'Picking and packing', 'Cross-docking', 'Last-mile delivery'],
    },
  },
];

export const getService = (id: string) => services.find((s) => s.id === id);
