import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { strings, type Lang, type Strings } from '../i18n/strings';
import type { Mode } from '../lib/calc';

export type Order = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  from: string;
  to: string;
  cargo: string;
  weight: string;
  mode: Mode | 'any';
  comment: string;
  channel: 'whatsapp' | 'email';
};

type State = { lang: Lang; tracked: string[]; orders: Order[]; profile: { name: string; phone: string } };

type Ctx = State & {
  t: Strings;
  ready: boolean;
  setLang: (l: Lang) => void;
  addTracked: (n: string) => void;
  removeTracked: (n: string) => void;
  addOrder: (o: Order) => void;
  removeOrder: (id: string) => void;
  clearHistory: () => void;
};

const KEY = 'zhebe:state:v1';
const initial: State = { lang: 'ru', tracked: [], orders: [], profile: { name: '', phone: '' } };

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setState({ ...initial, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const setLang = useCallback((lang: Lang) => setState((s) => ({ ...s, lang })), []);
  const addTracked = useCallback(
    (n: string) => setState((s) => ({ ...s, tracked: [n, ...s.tracked.filter((x) => x !== n)].slice(0, 10) })),
    [],
  );
  const removeTracked = useCallback(
    (n: string) => setState((s) => ({ ...s, tracked: s.tracked.filter((x) => x !== n) })),
    [],
  );
  const addOrder = useCallback(
    (o: Order) =>
      setState((s) => ({ ...s, orders: [o, ...s.orders], profile: { name: o.name, phone: o.phone } })),
    [],
  );
  const removeOrder = useCallback(
    (id: string) => setState((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) })),
    [],
  );
  const clearHistory = useCallback(() => setState((s) => ({ ...s, tracked: [], orders: [] })), []);

  const value = useMemo<Ctx>(
    () => ({ ...state, t: strings[state.lang], ready, setLang, addTracked, removeTracked, addOrder, removeOrder, clearHistory }),
    [state, ready, setLang, addTracked, removeTracked, addOrder, removeOrder, clearHistory],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
