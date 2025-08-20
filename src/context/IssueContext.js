import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const IssueContext = createContext();

export const useIssues = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
};

export const IssueProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    'in-progress': 0,
    resolved: 0,
    cancelled: 0
  });

  // ✅ Memoized loadIssues
  const loadIssues = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.issues.getAll(params);

      setIssues(response.data.issues);
      setStats(response.data.stats);

      return response.data;
    } catch (error) {
      console.error('Failed to load issues:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []); // no deps, stable reference

  // Load issues when user changes or component mounts
  useEffect(() => {
    if (isAuthenticated()) {
      loadIssues();
    } else {
      setIssues([]);
      setStats({
        pending: 0,
        'in-progress': 0,
        resolved: 0,
        cancelled: 0
      });
    }
  }, [user, isAuthenticated, loadIssues]); // ✅ now safe

  // ... (rest of your functions remain same)
  
  const value = {
    issues,
    stats,
    loading,
    error,
    loadIssues,
    // keep other methods as they are...
  };

  return (
    <IssueContext.Provider value={value}>
      {children}
    </IssueContext.Provider>
  );
};
