import React from 'react';
import { useParams } from 'react-router-dom';
import InsightsDashboard from '../components/dashboard/InsightsDashboard';

/**
 * InsightsDashboardPage
 * Wrapper component voor het InsightsDashboard component
 * Haalt de projectId uit de URL-parameters en geeft deze door aan het dashboard
 */
const InsightsDashboardPage = () => {
  // Haal de projectId uit de URL-parameters
  const { projectId } = useParams();
  
  return (
    <InsightsDashboard projectId={projectId} />
  );
};

export default InsightsDashboardPage;
