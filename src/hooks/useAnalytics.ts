'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData } from '@/lib/types/lead';

export function useAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leads/analytics');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const refetch = () => {
    fetchAnalytics();
  };

  return {
    analyticsData,
    loading,
    error,
    refetch,
  };
}