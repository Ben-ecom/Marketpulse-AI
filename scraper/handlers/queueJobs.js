const queueService = require('../services/queue');
const { getLogger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const logger = getLogger('QueueJobsHandler');

/**
 * Handler voor het toevoegen van scraping jobs aan de queue
 * @param {Object} event - AWS Lambda event object
 * @returns {Promise<Object>} - API response
 */
module.exports.handler = async (event) => {
  try {
    logger.info('Verwerken van verzoek om jobs toe te voegen aan de queue');
    
    // Parse de request body
    const body = JSON.parse(event.body || '{}');
    
    // Valideer de request
    if (!body.jobs || !Array.isArray(body.jobs) || body.jobs.length === 0) {
      return formatResponse(400, {
        message: 'Ongeldige request: jobs array is vereist'
      });
    }
    
    // Valideer elke job en voeg een ID toe indien nodig
    const validatedJobs = body.jobs.map(job => {
      if (!job.source) {
        throw new Error('Elke job moet een source hebben (reddit, amazon, instagram, tiktok, trustpilot)');
      }
      
      return {
        ...job,
        id: job.id || uuidv4(),
        createdAt: new Date().toISOString()
      };
    });
    
    // Voeg jobs toe aan de queue
    logger.info(`${validatedJobs.length} jobs toevoegen aan de queue`);
    const results = await queueService.addJobs(validatedJobs);
    
    // Return succesvol resultaat
    return formatResponse(200, {
      message: `${results.length} jobs succesvol toegevoegd aan de queue`,
      jobs: results
    });
  } catch (error) {
    logger.error(`Fout bij toevoegen van jobs aan de queue: ${error.message}`);
    
    return formatResponse(500, {
      message: 'Er is een fout opgetreden bij het toevoegen van jobs aan de queue',
      error: error.message
    });
  }
};

/**
 * Formatteert een API response
 * @param {Number} statusCode - HTTP status code
 * @param {Object} body - Response body
 * @returns {Object} - Geformatteerde API Gateway response
 */
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
}
