import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Reservation, Loan, Incident, Tool, LoanHistory } from '../data/mockData';
import { mockTools } from '../data/mockData';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'profesor';

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userName: string;
}

interface AppState {
  reservations: Reservation[];
  loans: Loan[];
  incidents: Incident[];
  tools: Tool[];
  history: LoanHistory[];
}

interface AppActions {
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  removeLoan: (id: string) => void;
  addIncident: (incident: Incident) => void;
  addTool: (tool: Tool) => void;
  updateTool: (id: string, updates: Partial<Tool>) => void;
  batchUpdateTools: (updates: { id: string; updates: Partial<Tool> }[]) => void;
  addToHistory: (record: LoanHistory) => void;
  login: (role: UserRole, name: string) => void;
  logout: () => void;
}

type AppContextType = AppState & AuthState & AppActions;

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'sgh_app_state';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old reservations: if tools have old shape (type/quantity), discard them
      const rawReservations: any[] = parsed.reservations || [];
      const reservations = rawReservations.filter(r =>
        !r.tools?.length || typeof r.tools[0]?.toolId === 'string'
      );
      return {
        reservations,
        loans: parsed.loans || [],
        incidents: parsed.incidents || [],
        // Seed catalog if inventory is empty
        tools: parsed.tools && parsed.tools.length > 0 ? parsed.tools : mockTools,
        history: parsed.history || [],
      };
    }
  } catch {}
  return {
    reservations: [],
    loans: [],
    incidents: [],
    tools: mockTools,
    history: [],
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const DEFAULT_AUTH: AuthState = {
  isAuthenticated: false,
  userRole: null,
  userName: '',
};

function loadAuth(): AuthState {
  try {
    const raw = sessionStorage.getItem('sgh_auth');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_AUTH;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [auth, setAuth] = useState<AuthState>(loadAuth);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    try { sessionStorage.setItem('sgh_auth', JSON.stringify(auth)); } catch {}
  }, [auth]);

  const addReservation = (reservation: Reservation) =>
    setState(s => ({ ...s, reservations: [...s.reservations, reservation] }));

  const updateReservation = (id: string, updates: Partial<Reservation>) =>
    setState(s => ({
      ...s,
      reservations: s.reservations.map(r => (r.id === id ? { ...r, ...updates } : r)),
    }));

  const removeReservation = (id: string) =>
    setState(s => ({ ...s, reservations: s.reservations.filter(r => r.id !== id) }));

  const addLoan = (loan: Loan) =>
    setState(s => ({ ...s, loans: [...s.loans, loan] }));

  const updateLoan = (id: string, updates: Partial<Loan>) =>
    setState(s => ({
      ...s,
      loans: s.loans.map(l => (l.id === id ? { ...l, ...updates } : l)),
    }));

  const removeLoan = (id: string) =>
    setState(s => ({ ...s, loans: s.loans.filter(l => l.id !== id) }));

  const addIncident = (incident: Incident) =>
    setState(s => ({ ...s, incidents: [...s.incidents, incident] }));

  const addTool = (tool: Tool) =>
    setState(s => ({ ...s, tools: [...s.tools, tool] }));

  const updateTool = (id: string, updates: Partial<Tool>) =>
    setState(s => ({
      ...s,
      tools: s.tools.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));

  const batchUpdateTools = (updates: { id: string; updates: Partial<Tool> }[]) =>
    setState(s => {
      const updateMap = new Map(updates.map(u => [u.id, u.updates]));
      return {
        ...s,
        tools: s.tools.map(t => {
          const upd = updateMap.get(t.id);
          return upd ? { ...t, ...upd } : t;
        }),
      };
    });

  const addToHistory = (record: LoanHistory) =>
    setState(s => {
      // Guard: prevent duplicate entries for the same loan
      if (s.history.some(h => h.loanId === record.loanId)) return s;
      return { ...s, history: [record, ...s.history] };
    });

  const login = (role: UserRole, name: string) =>
    setAuth({ isAuthenticated: true, userRole: role, userName: name });

  const logout = () => setAuth(DEFAULT_AUTH);

  return (
    <AppContext.Provider
      value={{
        ...state,
        ...auth,
        addReservation,
        updateReservation,
        removeReservation,
        addLoan,
        updateLoan,
        removeLoan,
        addIncident,
        addTool,
        updateTool,
        batchUpdateTools,
        addToHistory,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppProvider');
  return ctx;
}