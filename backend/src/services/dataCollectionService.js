import { logger } from '../utils/logger.js';
import DataCollectionJob from '../models/dataCollectionJob.js';
import RedditData from '../models/redditData.js';
import AmazonData from '../models/amazonData.js';
import { redditService } from './redditService.js';
import { amazonService } from './amazonService.js';
import mongoose from 'mongoose';

/**
 * Service voor het beheren van dataverzamelingsjobs
 */
export const dataCollectionService = {
  /**
   * Maak een nieuwe dataverzamelingsjob aan
   * @param {Object} jobData - Data voor de nieuwe job
   * @returns {Promise<Object>} - De aangemaakte job
   */
  async createJob(jobData) {
    try {
      logger.info(`Nieuwe dataverzamelingsjob aanmaken voor project ${jobData.projectId}`);
      
      // Valideer de job data
      if (!jobData.projectId) {
        throw new Error('Project ID is verplicht');
      }
      
      if (!jobData.userId) {
        throw new Error('User ID is verplicht');
      }
      
      if (!jobData.platforms || jobData.platforms.length === 0) {
        throw new Error('Ten minste één platform moet worden geselecteerd');
      }
      
      // Maak een nieuwe job aan
      const newJob = new DataCollectionJob({
        projectId: jobData.projectId,
        userId: jobData.userId,
        platforms: jobData.platforms,
        settings: {
          reddit: jobData.settings?.reddit || {},
          amazon: jobData.settings?.amazon || {}
        }
      });
      
      // Sla de job op
      const savedJob = await newJob.save();
      logger.info(`Dataverzamelingsjob aangemaakt met ID ${savedJob._id}`);
      
      // Start de job asynchroon
      this.processJob(savedJob._id).catch(error => {
        logger.error(`Fout bij verwerken van job ${savedJob._id}: ${error.message}`);
      });
      
      return savedJob;
    } catch (error) {
      logger.error(`Fout bij aanmaken dataverzamelingsjob: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verwerk een dataverzamelingsjob
   * @param {string} jobId - ID van de job
   * @returns {Promise<void>}
   */
  async processJob(jobId) {
    try {
      logger.info(`Verwerken van dataverzamelingsjob ${jobId} gestart`);
      
      // Haal de job op
      const job = await DataCollectionJob.findById(jobId);
      if (!job) {
        throw new Error(`Job met ID ${jobId} niet gevonden`);
      }
      
      // Update job status naar in_progress
      job.status = 'in_progress';
      job.startedAt = new Date();
      job.progress = 0;
      await job.save();
      
      // Verwerk elk geselecteerd platform
      for (const platform of job.platforms) {
        try {
          if (platform === 'reddit') {
            await this.collectRedditData(job);
          } else if (platform === 'amazon') {
            await this.collectAmazonData(job);
          }
        } catch (platformError) {
          logger.error(`Fout bij verzamelen ${platform} data voor job ${jobId}: ${platformError.message}`);
          
          // Update job met platform-specifieke fout
          if (platform === 'reddit') {
            job.results.reddit.error = platformError.message;
          } else if (platform === 'amazon') {
            job.results.amazon.error = platformError.message;
          }
          
          // Sla de job op met de fout, maar ga door met andere platforms
          await job.save();
        }
      }
      
      // Update job status naar completed
      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;
      await job.save();
      
      logger.info(`Verwerken van dataverzamelingsjob ${jobId} voltooid`);
    } catch (error) {
      logger.error(`Fout bij verwerken van job ${jobId}: ${error.message}`);
      
      // Update job status naar failed
      try {
        const job = await DataCollectionJob.findById(jobId);
        if (job) {
          job.status = 'failed';
          job.error = error.message;
          await job.save();
        }
      } catch (updateError) {
        logger.error(`Fout bij updaten job status: ${updateError.message}`);
      }
    }
  },
  
  /**
   * Verzamel Reddit data voor een job
   * @param {Object} job - De dataverzamelingsjob
   * @returns {Promise<void>}
   */
  async collectRedditData(job) {
    try {
      logger.info(`Reddit data verzamelen voor job ${job._id}`);
      
      // Update job progress
      job.progress = 25;
      await job.save();
      
      // Haal instellingen op uit de job
      const settings = job.settings.reddit;
      
      // Verzamel Reddit data
      const redditData = await redditService.collectData(job.projectId.toString(), settings);
      
      // Maak een nieuw RedditData document aan
      const newRedditData = new RedditData({
        projectId: job.projectId,
        userId: job.userId,
        searchTerms: settings.searchTerms || [],
        subreddits: settings.subreddits || [],
        timeframe: settings.timeframe || 'month',
        posts: redditData.map(post => ({
          postId: post.id,
          title: post.title,
          content: post.content,
          subreddit: post.subreddit,
          author: post.author,
          score: post.upvotes,
          commentCount: post.commentCount,
          createdAt: new Date(post.created_at || Date.now()),
          sentiment: post.sentiment || 'neutral',
          keywords: post.keywords || []
        })),
        status: 'completed'
      });
      
      // Sla de Reddit data op
      const savedData = await newRedditData.save();
      
      // Update job met resultaten
      job.results.reddit = {
        dataId: savedData._id,
        postCount: savedData.posts.length,
        commentCount: 0 // TODO: Implementeer comments
      };
      
      // Update job progress
      job.progress = Math.min(job.progress + 25, job.platforms.length === 1 ? 100 : 50);
      await job.save();
      
      logger.info(`Reddit data verzamelen voltooid voor job ${job._id}, ${savedData.posts.length} posts verzameld`);
    } catch (error) {
      logger.error(`Fout bij verzamelen Reddit data voor job ${job._id}: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Verzamel Amazon data voor een job
   * @param {Object} job - De dataverzamelingsjob
   * @returns {Promise<void>}
   */
  async collectAmazonData(job) {
    try {
      logger.info(`Amazon data verzamelen voor job ${job._id}`);
      
      // Update job progress
      job.progress = job.platforms.length === 1 ? 25 : 50;
      await job.save();
      
      // Haal instellingen op uit de job
      const settings = job.settings.amazon;
      
      // Verzamel Amazon data
      const amazonData = await amazonService.collectData(job.projectId.toString(), settings);
      
      // Maak een nieuw AmazonData document aan
      const newAmazonData = new AmazonData({
        projectId: job.projectId,
        userId: job.userId,
        searchTerms: settings.searchTerms || [],
        categories: settings.categories || [],
        minRating: settings.minRating || 1,
        maxRating: settings.maxRating || 5,
        verifiedOnly: settings.verifiedOnly || false,
        timeframe: settings.timeframe || 'last_year',
        reviews: amazonData.map(review => ({
          reviewId: review.id,
          productId: review.productId,
          productTitle: review.productTitle || 'Onbekend product',
          title: review.title,
          content: review.content,
          rating: review.rating,
          author: review.author,
          verifiedPurchase: review.verifiedPurchase,
          helpfulVotes: review.helpfulVotes,
          createdAt: new Date(review.created_at || Date.now()),
          sentiment: review.sentiment || 'neutral',
          keywords: review.keywords || []
        })),
        status: 'completed'
      });
      
      // Sla de Amazon data op
      const savedData = await newAmazonData.save();
      
      // Update job met resultaten
      job.results.amazon = {
        dataId: savedData._id,
        reviewCount: savedData.reviews.length,
        productCount: new Set(savedData.reviews.map(review => review.productId)).size
      };
      
      // Update job progress
      job.progress = 100;
      await job.save();
      
      logger.info(`Amazon data verzamelen voltooid voor job ${job._id}, ${savedData.reviews.length} reviews verzameld`);
    } catch (error) {
      logger.error(`Fout bij verzamelen Amazon data voor job ${job._id}: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal alle dataverzamelingsjobs op voor een project
   * @param {string} projectId - ID van het project
   * @returns {Promise<Array>} - Array met jobs
   */
  async getJobsByProject(projectId) {
    try {
      logger.info(`Dataverzamelingsjobs ophalen voor project ${projectId}`);
      
      const jobs = await DataCollectionJob.find({ projectId })
        .sort({ createdAt: -1 });
      
      return jobs;
    } catch (error) {
      logger.error(`Fout bij ophalen dataverzamelingsjobs: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal een specifieke dataverzamelingsjob op
   * @param {string} jobId - ID van de job
   * @returns {Promise<Object>} - De job
   */
  async getJobById(jobId) {
    try {
      logger.info(`Dataverzamelingsjob ophalen met ID ${jobId}`);
      
      const job = await DataCollectionJob.findById(jobId);
      if (!job) {
        throw new Error(`Job met ID ${jobId} niet gevonden`);
      }
      
      return job;
    } catch (error) {
      logger.error(`Fout bij ophalen dataverzamelingsjob: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Annuleer een dataverzamelingsjob
   * @param {string} jobId - ID van de job
   * @returns {Promise<Object>} - De geannuleerde job
   */
  async cancelJob(jobId) {
    try {
      logger.info(`Dataverzamelingsjob annuleren met ID ${jobId}`);
      
      const job = await DataCollectionJob.findById(jobId);
      if (!job) {
        throw new Error(`Job met ID ${jobId} niet gevonden`);
      }
      
      // Alleen jobs met status 'queued' of 'in_progress' kunnen worden geannuleerd
      if (job.status !== 'queued' && job.status !== 'in_progress') {
        throw new Error(`Job met status ${job.status} kan niet worden geannuleerd`);
      }
      
      // Update job status naar cancelled
      job.status = 'cancelled';
      await job.save();
      
      logger.info(`Dataverzamelingsjob ${jobId} geannuleerd`);
      return job;
    } catch (error) {
      logger.error(`Fout bij annuleren dataverzamelingsjob: ${error.message}`);
      throw error;
    }
  }
};

export default dataCollectionService;
