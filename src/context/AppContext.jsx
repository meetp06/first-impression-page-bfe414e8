// PermitWatch AI — Global App Context
import { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  // Auth
  user: null,
  isAuthenticated: false,

  // Selections
  selectedCity: 'san-francisco',
  selectedContractorType: 'general',

  // Filters
  filters: {
    confidenceThreshold: 50,
    permitType: 'all',
    projectStage: 'all',
    searchQuery: '',
  },

  // Data
  opportunities: [],
  selectedOpportunity: null,
  watchlist: [],
  isLoading: false,

  // UI
  isSidebarOpen: true,
  isDetailOpen: false,
  toasts: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_CITY':
      return { ...state, selectedCity: action.payload, selectedOpportunity: null, isDetailOpen: false };
    case 'SET_CONTRACTOR_TYPE':
      return { ...state, selectedContractorType: action.payload };
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    case 'SET_OPPORTUNITIES':
      return { ...state, opportunities: action.payload };
    case 'SET_SELECTED_OPPORTUNITY':
      return { ...state, selectedOpportunity: action.payload, isDetailOpen: !!action.payload };
    case 'CLOSE_DETAIL':
      return { ...state, isDetailOpen: false, selectedOpportunity: null };
    case 'TOGGLE_SAVE': {
      const id = action.payload;
      const opps = state.opportunities.map((o) =>
        o.id === id ? { ...o, saved: !o.saved } : o
      );
      const sel = state.selectedOpportunity?.id === id
        ? { ...state.selectedOpportunity, saved: !state.selectedOpportunity.saved }
        : state.selectedOpportunity;
      const watchlist = opps.filter((o) => o.saved);
      return { ...state, opportunities: opps, selectedOpportunity: sel, watchlist };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: Date.now(), ...action.payload }] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), duration);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
