import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { analyticsAPI } from '../api/analytics';
import { useAuth } from '../hooks/useAuth';

const AnalyticsContext = createContext();

const initialState = {
  permissions: {
    canViewAllLocations: false,
    userLocation: '',
    canAccessSeats: false,
    canAccessRooms: false,
    canAccessEquipment: false,
    canAccessUsers: false
  },
  filters: {
    location: '',
    period: 'WEEK',
    startDate: null,
    endDate: null
  },
  activeTab: 'seats',
  seats: {
    summary: null,
    charts: null,
    loading: false,
    error: null
  },
  rooms: {
    summary: null,
    charts: null,
    loading: false,
    error: null
  },
  equipment: {
    summary: null,
    charts: null,
    loading: false,
    error: null
  },
  users: {
    summary: null,
    charts: null,
    loading: false,
    error: null
  },
  downloading: false
};

function analyticsReducer(state, action) {
  switch (action.type) {
    case 'SET_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload,
        filters: {
          ...state.filters,
          location: action.payload.canViewAllLocations ? 'ALL' : action.payload.userLocation
        }
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          loading: action.payload
        }
      };
    
    case 'SET_SUMMARY':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          summary: action.payload,
          loading: false,
          error: null
        }
      };
    
    case 'SET_CHARTS':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          charts: action.payload,
          loading: false,
          error: null
        }
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        [action.module]: {
          ...state[action.module],
          error: action.payload,
          loading: false
        }
      };
    
    case 'SET_DOWNLOADING':
      return {
        ...state,
        downloading: action.payload
      };
    
    default:
      return state;
  }
}

export const AnalyticsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);
  const { user } = useAuth();

  // Load user permissions on mount
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await analyticsAPI.getUserPermissions();
        dispatch({ type: 'SET_PERMISSIONS', payload: response.data });
        
        // Set initial active tab based on permissions
        const permissions = response.data;
        if (permissions.canAccessSeats) {
          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'seats' });
        } else if (permissions.canAccessRooms) {
          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'rooms' });
        } else if (permissions.canAccessEquipment) {
          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'equipment' });
        } else if (permissions.canAccessUsers) {
          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'users' });
        }
      } catch (error) {
        console.error('Failed to load permissions:', error);
      }
    };

    if (user) {
      loadPermissions();
    }
  }, [user]);

  // Load data when filters or active tab changes
  useEffect(() => {
    if (state.permissions.userLocation && state.activeTab) {
      loadModuleData(state.activeTab);
    }
  }, [state.filters, state.activeTab, state.permissions.userLocation]);

  const loadModuleData = async (module) => {
    if (!hasPermissionForModule(module)) return;

    dispatch({ type: 'SET_LOADING', module, payload: true });

    try {
      const params = {
        location: state.filters.location,
        period: state.filters.period,
        startDate: state.filters.startDate,
        endDate: state.filters.endDate
      };

      // Map tab names to API function names
      const apiModuleName = getApiModuleName(module);

      // Load summary and charts data
      const [summaryResponse, chartsResponse] = await Promise.all([
        analyticsAPI[`get${apiModuleName}Summary`](params),
        analyticsAPI[`get${apiModuleName}Charts`](params)
      ]);

      dispatch({ type: 'SET_SUMMARY', module, payload: summaryResponse.data });
      dispatch({ type: 'SET_CHARTS', module, payload: chartsResponse.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', module, payload: error.message });
    }
  };

  const hasPermissionForModule = (module) => {
    switch (module) {
      case 'seats': return state.permissions.canAccessSeats;
      case 'rooms': return state.permissions.canAccessRooms;
      case 'equipment': return state.permissions.canAccessEquipment;
      case 'users': return state.permissions.canAccessUsers;
      default: return false;
    }
  };

  const getApiModuleName = (module) => {
    switch (module) {
      case 'seats': return 'Seat';
      case 'rooms': return 'Room';
      case 'equipment': return 'Equipment';
      case 'users': return 'User';
      default: return 'Seat';
    }
  };

  const setFilters = (newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  };

  const setActiveTab = (tab) => {
    if (hasPermissionForModule(tab)) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    }
  };

  const downloadReport = async (module, type) => {
    dispatch({ type: 'SET_DOWNLOADING', payload: true });

    try {
      const filterData = {
        location: state.filters.location,
        period: state.filters.period,
        startDate: state.filters.startDate,
        endDate: state.filters.endDate
      };

      const apiModuleName = getApiModuleName(module);
      const downloadFunction = type === 'simple' 
        ? analyticsAPI[`download${apiModuleName}Simple`]
        : analyticsAPI[`download${apiModuleName}Detailed`];

      const response = await downloadFunction(filterData);

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${module}-analytics-${type}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      dispatch({ type: 'SET_DOWNLOADING', payload: false });
    }
  };

  const refreshData = () => {
    loadModuleData(state.activeTab);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const value = {
    ...state,
    setFilters,
    setActiveTab,
    downloadReport,
    refreshData,
    hasPermissionForModule
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};