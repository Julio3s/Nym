import { useState, useEffect, useCallback } from 'react';
import { dashboardService, type Summary, type CategoryData, type TimelineEntry } from '../services/dashboardService';

export function useDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, categoryData, timelineData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getByCategory(),
        dashboardService.getTimeline(),
      ]);
      setSummary(summaryData);
      setCategories(categoryData.categories);
      setTimeline(timelineData);
    } catch (err) {
      setError('Erreur lors du chargement du tableau de bord');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { summary, categories, timeline, loading, error, refresh: fetchData };
}