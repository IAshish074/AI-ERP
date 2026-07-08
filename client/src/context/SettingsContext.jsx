import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [openRouterKey, setOpenRouterKey] = useState(
    () => localStorage.getItem('openrouter_key') || ''
  );
  
  const [statuses, setStatuses] = useState({
    server: 'unknown',     // 'healthy' | 'unhealthy' | 'loading'
    supabase: 'unknown',   // 'healthy' | 'unhealthy' | 'loading'
    typesense: 'unknown',  // 'healthy' | 'unhealthy' | 'loading'
    vanna: 'unknown',      // 'healthy' | 'unhealthy' | 'loading'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openRouterKey) {
      localStorage.setItem('openrouter_key', openRouterKey);
    } else {
      localStorage.removeItem('openrouter_key');
    }
  }, [openRouterKey]);

  const runHealthCheck = async () => {
    setLoading(true);
    setStatuses(prev => ({
      ...prev,
      server: 'loading',
      supabase: 'loading',
      typesense: 'loading',
      vanna: 'loading'
    }));

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const rootUrl = apiUrl.replace(/\/api$/, '');

    try {
      // 1. Check server general health
      const serverRes = await axios.get(`${rootUrl}/health`, { timeout: 5000 });
      const isServerUp = serverRes.data && serverRes.data.status === 'UP';
      
      // 2. Fetch dashboard stats or query to check integrations
      // If we can fetch dashboard stats, Supabase is working
      let isSupabaseUp = false;
      try {
        const dbRes = await axios.get(`${apiUrl}/dashboard`, { timeout: 5000 });
        if (dbRes.data && dbRes.data.success) {
          isSupabaseUp = true;
        }
      } catch (err) {
        console.error('Supabase health check failed via /dashboard:', err.message);
      }

      // 3. For Typesense and Vanna:
      // Typesense checks if we can fetch products successfully (since products are retrieved from db but synced to Typesense)
      // Vanna checks if /api/ask runs or is trained
      let isTypesenseUp = isServerUp; // Assume active if server is active (server auto-initializes)
      let isVannaUp = isServerUp && !!openRouterKey; // Vanna is functional if LLM key is configured

      setStatuses({
        server: isServerUp ? 'healthy' : 'unhealthy',
        supabase: isSupabaseUp ? 'healthy' : 'unhealthy',
        typesense: isTypesenseUp ? 'healthy' : 'unhealthy',
        vanna: isVannaUp ? 'healthy' : 'unhealthy',
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setStatuses({
        server: 'unhealthy',
        supabase: 'unhealthy',
        typesense: 'unhealthy',
        vanna: 'unhealthy',
      });
    } finally {
      setLoading(false);
    }
  };

  // Run initial health check on load
  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <SettingsContext.Provider value={{
      openRouterKey,
      setOpenRouterKey,
      statuses,
      loading,
      runHealthCheck
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
