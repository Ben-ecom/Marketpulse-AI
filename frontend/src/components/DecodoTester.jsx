import React, { useState, useEffect } from 'react';
import { decodoService } from '../services/DecodoService';
import { edgeFunctionsService } from '../services/EdgeFunctionsService';
import '../styles/decodoTester.css';

/**
 * DecodoTester component voor het testen van de Decodo API integratie
 */
const DecodoTester = () => {
  // State voor de test parameters
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('reddit');
  const [requestType, setRequestType] = useState('sync');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [taskId, setTaskId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [batchUrls, setBatchUrls] = useState('');
  const [customParams, setCustomParams] = useState({});
  const [advancedMode, setAdvancedMode] = useState(false);
  const [useEdgeFunction, setUseEdgeFunction] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [contentType, setContentType] = useState('page');

  // Platform opties
  const platformOptions = [
    { value: 'reddit', label: 'Reddit' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'trustpilot', label: 'Trustpilot' }
  ];

  // Request type opties
  const requestTypeOptions = [
    { value: 'sync', label: 'Synchroon (direct resultaat)' },
    { value: 'async', label: 'Asynchroon (task ID)' },
    { value: 'batch', label: 'Batch (meerdere URLs)' }
  ];

  // Voorbeelden per platform
  const examples = {
    reddit: 'https://www.reddit.com/r/DutchFIRE/',
    amazon: 'https://www.amazon.nl/dp/B08H93ZRK9',
    instagram: 'https://www.instagram.com/explore/tags/dutchfood/',
    tiktok: 'https://www.tiktok.com/tag/netherlands',
    trustpilot: 'https://nl.trustpilot.com/review/coolblue.nl'
  };

  // Update URL voorbeeld wanneer platform verandert
  useEffect(() => {
    setUrl(examples[platform] || '');
  }, [platform]);

  // Voer de test uit
  const runTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let response;

      // Gebruik Edge Function of directe API op basis van de instelling
      const service = useEdgeFunction ? edgeFunctionsService : decodoService;

      if (requestType === 'sync') {
        // Synchrone request
        if (useEdgeFunction) {
          response = await edgeFunctionsService.scrapeSynchronous(
            url, 
            platform, 
            projectId || null, 
            contentType, 
            customParams
          );
        } else {
          response = await decodoService.scrapeSync(url, platform, customParams);
        }
        setResult(response);
      } else if (requestType === 'async') {
        // Asynchrone request
        if (useEdgeFunction) {
          response = await edgeFunctionsService.scrapeAsynchronous(url, platform, customParams);
        } else {
          response = await decodoService.scrapeAsync(url, platform, customParams);
        }
        setTaskId(response.task_id || '');
        setResult(response);
      } else if (requestType === 'batch') {
        // Batch request
        const urls = batchUrls.split('\n').filter(url => url.trim());
        const tasks = urls.map(url => ({ url, platform }));
        
        if (useEdgeFunction) {
          response = await edgeFunctionsService.scrapeBatch(tasks);
        } else {
          response = await decodoService.scrapeBatch(tasks);
        }
        setBatchId(response.batch_id || '');
        setResult(response);
      }
    } catch (err) {
      console.error('Test fout:', err);
      setError(err.message || 'Er is een fout opgetreden bij het uitvoeren van de test');
    } finally {
      setLoading(false);
    }
  };

  // Haal resultaten op van een asynchrone taak
  const getTaskResult = async () => {
    if (!taskId) {
      setError('Geen task ID beschikbaar');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let response;
      if (useEdgeFunction) {
        response = await edgeFunctionsService.getTaskResult(
          taskId, 
          projectId || null, 
          platform, 
          contentType
        );
      } else {
        response = await decodoService.getTaskResult(taskId);
      }
      setResult(response);
    } catch (err) {
      console.error('Fout bij ophalen taakresultaat:', err);
      setError(err.message || 'Er is een fout opgetreden bij het ophalen van het taakresultaat');
    } finally {
      setLoading(false);
    }
  };

  // Haal resultaten op van een batch taak
  const getBatchResult = async () => {
    if (!batchId) {
      setError('Geen batch ID beschikbaar');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let response;
      if (useEdgeFunction) {
        response = await edgeFunctionsService.getBatchResult(batchId);
      } else {
        response = await decodoService.getBatchResult(batchId);
      }
      setResult(response);
    } catch (err) {
      console.error('Fout bij ophalen batch resultaat:', err);
      setError(err.message || 'Er is een fout opgetreden bij het ophalen van het batch resultaat');
    } finally {
      setLoading(false);
    }
  };

  // Update custom parameters
  const handleCustomParamChange = (key, value) => {
    setCustomParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="decodo-tester">
      <h2>Decodo API Tester</h2>
      <p>Test de integratie met de Decodo Scraping API voor MarketPulse AI</p>

      <div className="form-group">
        <label>Platform:</label>
        <select 
          value={platform} 
          onChange={(e) => setPlatform(e.target.value)}
          className="select-input"
        >
          {platformOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Request Type:</label>
        <select 
          value={requestType} 
          onChange={(e) => setRequestType(e.target.value)}
          className="select-input"
        >
          {requestTypeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {requestType === 'batch' ? (
        <div className="form-group">
          <label>URLs (één per regel):</label>
          <textarea
            value={batchUrls}
            onChange={(e) => setBatchUrls(e.target.value)}
            placeholder="Voer meerdere URLs in, één per regel"
            rows={5}
            className="textarea-input"
          />
        </div>
      ) : (
        <div className="form-group">
          <label>URL:</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Voer een URL in om te scrapen"
            className="text-input"
          />
        </div>
      )}

      <div className="form-group">
        <label>API Methode:</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              checked={!useEdgeFunction}
              onChange={() => setUseEdgeFunction(false)}
            />
            Directe API
          </label>
          <label className="radio-label">
            <input
              type="radio"
              checked={useEdgeFunction}
              onChange={() => setUseEdgeFunction(true)}
            />
            Edge Function
          </label>
        </div>
      </div>

      {useEdgeFunction && (
        <div className="form-group">
          <label>Project ID (optioneel):</label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Project ID om resultaten op te slaan"
            className="text-input"
          />
        </div>
      )}

      {useEdgeFunction && (
        <div className="form-group">
          <label>Content Type:</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="select-input"
          >
            <option value="page">Pagina</option>
            <option value="post">Post</option>
            <option value="review">Review</option>
            <option value="comment">Comment</option>
            <option value="profile">Profiel</option>
          </select>
        </div>
      )}

      <div className="advanced-toggle">
        <button 
          onClick={() => setAdvancedMode(!advancedMode)}
          className="toggle-button"
        >
          {advancedMode ? 'Verberg geavanceerde opties' : 'Toon geavanceerde opties'}
        </button>
      </div>

      {advancedMode && (
        <div className="advanced-options">
          <h3>Geavanceerde opties</h3>
          
          <div className="form-group">
            <label>Headless mode:</label>
            <select 
              value={customParams.headless || ''}
              onChange={(e) => handleCustomParamChange('headless', e.target.value)}
              className="select-input"
            >
              <option value="">Platform standaard</option>
              <option value="html">HTML (met JavaScript rendering)</option>
              <option value="raw">Raw HTML (zonder JavaScript)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Geo-targeting:</label>
            <select 
              value={customParams.geo || ''}
              onChange={(e) => handleCustomParamChange('geo', e.target.value)}
              className="select-input"
            >
              <option value="">Platform standaard</option>
              <option value="nl">Nederland</option>
              <option value="us">Verenigde Staten</option>
              <option value="de">Duitsland</option>
              <option value="fr">Frankrijk</option>
              <option value="uk">Verenigd Koninkrijk</option>
            </select>
          </div>

          <div className="form-group">
            <label>Device type:</label>
            <select 
              value={customParams.device_type || ''}
              onChange={(e) => handleCustomParamChange('device_type', e.target.value)}
              className="select-input"
            >
              <option value="">Platform standaard</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobiel</option>
              <option value="tablet">Tablet</option>
            </select>
          </div>

          <div className="form-group">
            <label>Session ID:</label>
            <input
              type="text"
              value={customParams.session_id || ''}
              onChange={(e) => handleCustomParamChange('session_id', e.target.value)}
              placeholder="Optionele session ID"
              className="text-input"
            />
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button 
          onClick={runTest} 
          disabled={loading || (requestType === 'batch' ? !batchUrls : !url)}
          className="primary-button"
        >
          {loading ? 'Bezig...' : 'Test uitvoeren'}
        </button>

        {requestType === 'async' && taskId && (
          <button 
            onClick={getTaskResult} 
            disabled={loading || !taskId}
            className="secondary-button"
          >
            Taakresultaat ophalen
          </button>
        )}

        {requestType === 'batch' && batchId && (
          <button 
            onClick={getBatchResult} 
            disabled={loading || !batchId}
            className="secondary-button"
          >
            Batch resultaat ophalen
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <h3>Fout</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result-container">
          <h3>Resultaat</h3>
          
          {requestType === 'async' && !result.html && (
            <div className="task-info">
              <p><strong>Task ID:</strong> {result.task_id}</p>
              <p><strong>Status:</strong> {result.status}</p>
              <p>Gebruik de "Taakresultaat ophalen" knop om de resultaten op te halen wanneer de taak is voltooid.</p>
            </div>
          )}

          {requestType === 'batch' && !result.results && (
            <div className="task-info">
              <p><strong>Batch ID:</strong> {result.batch_id}</p>
              <p><strong>Status:</strong> {result.status}</p>
              <p>Gebruik de "Batch resultaat ophalen" knop om de resultaten op te halen wanneer alle taken zijn voltooid.</p>
            </div>
          )}

          <pre className="json-result">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DecodoTester;
