const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { getLogger } = require('../utils/logger');

const logger = getLogger('QueueService');

// Configureer AWS SDK
const sqs = new AWS.SQS({
  region: process.env.AWS_REGION || 'eu-west-1',
  ...(process.env.IS_OFFLINE && {
    endpoint: 'http://localhost:9324',
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  })
});

/**
 * QueueService - Verantwoordelijk voor het beheren van scraping jobs in de SQS queue
 */
class QueueService {
  constructor() {
    this.queueUrl = process.env.SQS_QUEUE_URL;
    
    if (!this.queueUrl && process.env.IS_OFFLINE) {
      this.queueUrl = 'http://localhost:9324/queue/marketpulse-ai-scraper-dev-jobs';
      logger.warn(`SQS_QUEUE_URL niet geconfigureerd, gebruik lokale queue: ${this.queueUrl}`);
    }
    
    if (!this.queueUrl) {
      logger.error('SQS_QUEUE_URL omgevingsvariabele is niet geconfigureerd');
    }
  }
  
  /**
   * Voegt een nieuwe scraping job toe aan de queue
   * @param {Object} job - Job configuratie
   * @param {String} job.source - Bron platform (reddit, amazon, instagram, tiktok, trustpilot)
   * @param {Object} job.params - Platform-specifieke parameters
   * @param {Number} [job.delaySeconds=0] - Vertraging in seconden voordat de job beschikbaar is
   * @returns {Promise<Object>} - SQS response
   */
  async addJob(job) {
    if (!job || !job.source) {
      throw new Error('Ongeldige job: source is vereist');
    }
    
    if (!this.queueUrl) {
      throw new Error('SQS_QUEUE_URL is niet geconfigureerd');
    }
    
    try {
      // Voeg een uniek ID toe aan de job
      const jobWithId = {
        ...job,
        id: job.id || uuidv4(),
        createdAt: new Date().toISOString()
      };
      
      const params = {
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(jobWithId),
        DelaySeconds: job.delaySeconds || 0,
        MessageAttributes: {
          source: {
            DataType: 'String',
            StringValue: job.source
          }
        }
      };
      
      logger.info(`Job toevoegen aan queue: ${job.source} (${jobWithId.id})`);
      const result = await sqs.sendMessage(params).promise();
      
      logger.info(`Job succesvol toegevoegd aan queue: ${result.MessageId}`);
      return {
        jobId: jobWithId.id,
        messageId: result.MessageId
      };
    } catch (error) {
      logger.error(`Fout bij het toevoegen van job aan queue: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Voegt meerdere scraping jobs toe aan de queue
   * @param {Array<Object>} jobs - Array van job configuraties
   * @returns {Promise<Array<Object>>} - Array van SQS responses
   */
  async addJobs(jobs) {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      throw new Error('Ongeldige jobs: array met minstens één job is vereist');
    }
    
    if (!this.queueUrl) {
      throw new Error('SQS_QUEUE_URL is niet geconfigureerd');
    }
    
    try {
      // Verwerk jobs in batches van 10 (SQS limiet)
      const results = [];
      const batches = [];
      
      for (let i = 0; i < jobs.length; i += 10) {
        batches.push(jobs.slice(i, i + 10));
      }
      
      logger.info(`Jobs verwerken in ${batches.length} batches`);
      
      for (const batch of batches) {
        const entries = batch.map((job, index) => {
          // Voeg een uniek ID toe aan de job
          const jobWithId = {
            ...job,
            id: job.id || uuidv4(),
            createdAt: new Date().toISOString()
          };
          
          return {
            Id: `${index}`,
            MessageBody: JSON.stringify(jobWithId),
            DelaySeconds: job.delaySeconds || 0,
            MessageAttributes: {
              source: {
                DataType: 'String',
                StringValue: job.source
              }
            }
          };
        });
        
        const params = {
          QueueUrl: this.queueUrl,
          Entries: entries
        };
        
        logger.info(`Batch van ${entries.length} jobs toevoegen aan queue`);
        const result = await sqs.sendMessageBatch(params).promise();
        
        if (result.Failed && result.Failed.length > 0) {
          logger.warn(`${result.Failed.length} jobs konden niet worden toegevoegd aan de queue`);
          logger.debug(`Mislukte jobs: ${JSON.stringify(result.Failed)}`);
        }
        
        logger.info(`${result.Successful.length} jobs succesvol toegevoegd aan queue`);
        
        // Combineer job IDs met message IDs
        const batchResults = result.Successful.map(success => {
          const jobIndex = parseInt(success.Id, 10);
          const job = batch[jobIndex];
          return {
            jobId: job.id,
            messageId: success.MessageId
          };
        });
        
        results.push(...batchResults);
      }
      
      return results;
    } catch (error) {
      logger.error(`Fout bij het toevoegen van jobs aan queue: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Haalt de attributen van de queue op (zoals aantal berichten)
   * @returns {Promise<Object>} - Queue attributen
   */
  async getQueueAttributes() {
    if (!this.queueUrl) {
      throw new Error('SQS_QUEUE_URL is niet geconfigureerd');
    }
    
    try {
      const params = {
        QueueUrl: this.queueUrl,
        AttributeNames: ['All']
      };
      
      const result = await sqs.getQueueAttributes(params).promise();
      return result.Attributes;
    } catch (error) {
      logger.error(`Fout bij het ophalen van queue attributen: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Verwijdert een bericht uit de queue
   * @param {String} receiptHandle - Receipt handle van het bericht
   * @returns {Promise<Object>} - SQS response
   */
  async deleteMessage(receiptHandle) {
    if (!this.queueUrl) {
      throw new Error('SQS_QUEUE_URL is niet geconfigureerd');
    }
    
    try {
      const params = {
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle
      };
      
      return await sqs.deleteMessage(params).promise();
    } catch (error) {
      logger.error(`Fout bij het verwijderen van bericht uit queue: ${error.message}`);
      throw error;
    }
  }
}

// Singleton instantie
const queueService = new QueueService();

module.exports = queueService;
