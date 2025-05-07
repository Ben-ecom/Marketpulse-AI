import React from 'react';
import { useParams } from 'react-router-dom';
import TopicAwarenessController from '../components/controllers/TopicAwarenessController';

/**
 * TopicAwarenessControllerPage
 * 
 * Route component voor de geïntegreerde Topic Awareness Controller.
 * Haalt parameters uit de URL en geeft deze door aan de controller component.
 * 
 * @component
 */
const TopicAwarenessControllerPage = () => {
  const { projectId, tab } = useParams();
  
  return (
    <TopicAwarenessController 
      projectId={projectId}
      projectName={projectId ? `Project ${projectId}` : 'MarketPulse AI'}
    />
  );
};

export default TopicAwarenessControllerPage;
