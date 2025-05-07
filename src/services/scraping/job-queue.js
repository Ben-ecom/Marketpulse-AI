/**
 * Scraping Job Queue Service
 *
 * Dit bestand bevat de job queue service voor het beheren van scraping taken.
 * Het biedt functionaliteit voor het plannen, uitvoeren en bijhouden van scraping jobs.
 */

const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../../utils/supabase');
const { getDecodoApiClient } = require('./decodo-api');
const { uploadJsonDataset } = require('../../utils/storage');

// Status constanten
const JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Prioriteit constanten
const JOB_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

/**
 * Job Queue Service
 */
class JobQueueService {
  constructor() {
    this.decodoClient = getDecodoApiClient();
    this.activeJobs = new Map(); // Map van jobId -> job object
    this.isProcessing = false;
    this.processingInterval = null;
    this.maxConcurrentJobs = 5; // Maximum aantal gelijktijdige jobs
  }

  /**
   * Start de job queue processor
   * @param {Number} interval - Interval in milliseconden tussen processing cycles
   */
  startProcessing(interval = 10000) {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processingInterval = setInterval(() => this.processQueue(), interval);
    console.log(`🚀 Job queue processor gestart (interval: ${interval}ms)`);
  }

  /**
   * Stop de job queue processor
   */
  stopProcessing() {
    if (!this.isProcessing) return;

    clearInterval(this.processingInterval);
    this.isProcessing = false;
    console.log('⏹️ Job queue processor gestopt');
  }

  /**
   * Verwerk de job queue
   */
  async processQueue() {
    try {
      // Controleer of we ruimte hebben voor meer jobs
      if (this.activeJobs.size >= this.maxConcurrentJobs) {
        return;
      }

      // Haal de volgende jobs op uit de database
      const availableSlots = this.maxConcurrentJobs - this.activeJobs.size;
      const { data: pendingJobs, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .eq('status', JOB_STATUS.PENDING)
        .order('priority', { ascending: false }) // Hogere prioriteit eerst
        .order('created_at', { ascending: true }) // Oudere jobs eerst
        .limit(availableSlots);

      if (error) {
        console.error('❌ Fout bij ophalen van pending jobs:', error);
        return;
      }

      if (!pendingJobs || pendingJobs.length === 0) {
        return; // Geen pending jobs
      }

      // Start de jobs
      for (const job of pendingJobs) {
        this.startJob(job);
      }
    } catch (error) {
      console.error('❌ Fout bij verwerken van job queue:', error);
    }
  }

  /**
   * Start een job
   * @param {Object} job - Job object uit de database
   */
  async startJob(job) {
    try {
      // Update job status naar RUNNING
      const { error: updateError } = await supabase
        .from('scrape_jobs')
        .update({
          status: JOB_STATUS.RUNNING,
          started_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      if (updateError) {
        console.error(`❌ Fout bij updaten van job status voor job ${job.id}:`, updateError);
        return;
      }

      // Voeg job toe aan activeJobs
      this.activeJobs.set(job.id, job);

      console.log(`🔄 Job ${job.id} gestart (platform: ${job.platform}, type: ${job.job_type})`);

      // Voer de job uit
      this.executeJob(job);
    } catch (error) {
      console.error(`❌ Fout bij starten van job ${job.id}:`, error);
      this.markJobAsFailed(job.id, error.message);
    }
  }

  /**
   * Voer een job uit
   * @param {Object} job - Job object uit de database
   */
  async executeJob(job) {
    try {
      // Haal job configuratie op
      const jobConfig = job.config || {};
      const { urls, options } = jobConfig;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        throw new Error('Geen URLs gevonden in job configuratie');
      }

      // Bereid batch voor
      const urlsWithOptions = urls.map((url) => ({
        url,
        options: {
          ...options,
          session_id: `${job.id}-${uuidv4().slice(0, 8)}`,
          platform: job.platform,
        },
      }));

      // Voer batch scrape uit
      const results = await this.decodoClient.batchScrape(urlsWithOptions);

      // Verwerk resultaten
      await this.processJobResults(job, results);

      // Markeer job als voltooid
      await this.markJobAsCompleted(job.id);
    } catch (error) {
      console.error(`❌ Fout bij uitvoeren van job ${job.id}:`, error);
      await this.markJobAsFailed(job.id, error.message);
    } finally {
      // Verwijder job uit activeJobs
      this.activeJobs.delete(job.id);
    }
  }

  /**
   * Verwerk de resultaten van een job
   * @param {Object} job - Job object uit de database
   * @param {Array} results - Resultaten van de scrape
   */
  async processJobResults(job, results) {
    try {
      // Sla resultaten op in de database
      const scrapeResults = results.map((result, index) => {
        const url = job.config.urls[index];
        return {
          job_id: job.id,
          project_id: job.project_id,
          platform: job.platform,
          url,
          status: result.error ? 'error' : 'success',
          data: result.error ? { error: result.error } : result,
          created_at: new Date().toISOString(),
        };
      });

      // Batch insert resultaten
      const { error } = await supabase
        .from('scrape_results')
        .insert(scrapeResults);

      if (error) {
        console.error(`❌ Fout bij opslaan van resultaten voor job ${job.id}:`, error);
        throw error;
      }

      // Sla resultaten op in storage
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `results-${timestamp}.json`;

      await uploadJsonDataset(
        job.project_id,
        job.platform,
        job.id,
        { results: scrapeResults },
        fileName,
      );

      console.log(`✅ Resultaten voor job ${job.id} verwerkt en opgeslagen (${scrapeResults.length} items)`);
    } catch (error) {
      console.error(`❌ Fout bij verwerken van resultaten voor job ${job.id}:`, error);
      throw error;
    }
  }

  /**
   * Markeer een job als voltooid
   * @param {String} jobId - ID van de job
   */
  async markJobAsCompleted(jobId) {
    try {
      const { error } = await supabase
        .from('scrape_jobs')
        .update({
          status: JOB_STATUS.COMPLETED,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) {
        console.error(`❌ Fout bij markeren van job ${jobId} als voltooid:`, error);
        return;
      }

      console.log(`✅ Job ${jobId} voltooid`);
    } catch (error) {
      console.error(`❌ Fout bij markeren van job ${jobId} als voltooid:`, error);
    }
  }

  /**
   * Markeer een job als mislukt
   * @param {String} jobId - ID van de job
   * @param {String} errorMessage - Foutmelding
   */
  async markJobAsFailed(jobId, errorMessage) {
    try {
      const { error } = await supabase
        .from('scrape_jobs')
        .update({
          status: JOB_STATUS.FAILED,
          error: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) {
        console.error(`❌ Fout bij markeren van job ${jobId} als mislukt:`, error);
        return;
      }

      console.log(`❌ Job ${jobId} mislukt: ${errorMessage}`);
    } catch (error) {
      console.error(`❌ Fout bij markeren van job ${jobId} als mislukt:`, error);
    } finally {
      // Verwijder job uit activeJobs
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Maak een nieuwe job aan
   * @param {Object} jobData - Job data
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createJob(jobData) {
    try {
      const {
        project_id, platform, job_type, config, priority = JOB_PRIORITY.MEDIUM,
      } = jobData;

      if (!project_id || !platform || !job_type || !config) {
        throw new Error('Ontbrekende vereiste velden voor job');
      }

      const newJob = {
        project_id,
        platform,
        job_type,
        config,
        priority,
        status: JOB_STATUS.PENDING,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('scrape_jobs')
        .insert(newJob)
        .select()
        .single();

      if (error) {
        console.error('❌ Fout bij aanmaken van job:', error);
        throw error;
      }

      console.log(`✅ Nieuwe job aangemaakt: ${data.id} (platform: ${platform}, type: ${job_type})`);
      return data;
    } catch (error) {
      console.error('❌ Fout bij aanmaken van job:', error);
      throw error;
    }
  }

  /**
   * Annuleer een job
   * @param {String} jobId - ID van de job
   * @returns {Promise<Object>} - Geannuleerde job
   */
  async cancelJob(jobId) {
    try {
      // Controleer of de job actief is
      if (this.activeJobs.has(jobId)) {
        // TODO: Implementeer annulering van actieve job bij Decodo API
        console.log(`⚠️ Actieve job ${jobId} annuleren...`);

        // Verwijder job uit activeJobs
        this.activeJobs.delete(jobId);
      }

      // Update job status naar CANCELLED
      const { data, error } = await supabase
        .from('scrape_jobs')
        .update({
          status: JOB_STATUS.CANCELLED,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        console.error(`❌ Fout bij annuleren van job ${jobId}:`, error);
        throw error;
      }

      console.log(`✅ Job ${jobId} geannuleerd`);
      return data;
    } catch (error) {
      console.error(`❌ Fout bij annuleren van job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Haal een job op
   * @param {String} jobId - ID van de job
   * @returns {Promise<Object>} - Job
   */
  async getJob(jobId) {
    try {
      const { data, error } = await supabase
        .from('scrape_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error(`❌ Fout bij ophalen van job ${jobId}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`❌ Fout bij ophalen van job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Haal jobs op voor een project
   * @param {String} projectId - ID van het project
   * @param {Object} filters - Filters voor de query
   * @returns {Promise<Array>} - Array van jobs
   */
  async getJobsByProject(projectId, filters = {}) {
    try {
      let query = supabase
        .from('scrape_jobs')
        .select('*')
        .eq('project_id', projectId);

      // Voeg filters toe
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.platform) {
        query = query.eq('platform', filters.platform);
      }

      if (filters.job_type) {
        query = query.eq('job_type', filters.job_type);
      }

      // Sortering
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error(`❌ Fout bij ophalen van jobs voor project ${projectId}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`❌ Fout bij ophalen van jobs voor project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Haal resultaten op voor een job
   * @param {String} jobId - ID van de job
   * @returns {Promise<Array>} - Array van resultaten
   */
  async getJobResults(jobId) {
    try {
      const { data, error } = await supabase
        .from('scrape_results')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`❌ Fout bij ophalen van resultaten voor job ${jobId}:`, error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`❌ Fout bij ophalen van resultaten voor job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Haal statistieken op voor een project
   * @param {String} projectId - ID van het project
   * @returns {Promise<Object>} - Statistieken
   */
  async getProjectStats(projectId) {
    try {
      // Haal job statistieken op
      const { data: jobStats, error: jobError } = await supabase
        .from('scrape_jobs')
        .select('status, count')
        .eq('project_id', projectId)
        .group('status');

      if (jobError) {
        console.error(`❌ Fout bij ophalen van job statistieken voor project ${projectId}:`, jobError);
        throw jobError;
      }

      // Haal resultaat statistieken op
      const { data: resultStats, error: resultError } = await supabase
        .from('scrape_results')
        .select('status, count')
        .eq('project_id', projectId)
        .group('status');

      if (resultError) {
        console.error(`❌ Fout bij ophalen van resultaat statistieken voor project ${projectId}:`, resultError);
        throw resultError;
      }

      // Verwerk statistieken
      const stats = {
        jobs: {
          total: 0,
          pending: 0,
          running: 0,
          completed: 0,
          failed: 0,
          cancelled: 0,
        },
        results: {
          total: 0,
          success: 0,
          error: 0,
        },
      };

      // Verwerk job statistieken
      jobStats.forEach((stat) => {
        stats.jobs[stat.status.toLowerCase()] = parseInt(stat.count);
        stats.jobs.total += parseInt(stat.count);
      });

      // Verwerk resultaat statistieken
      resultStats.forEach((stat) => {
        stats.results[stat.status.toLowerCase()] = parseInt(stat.count);
        stats.results.total += parseInt(stat.count);
      });

      return stats;
    } catch (error) {
      console.error(`❌ Fout bij ophalen van statistieken voor project ${projectId}:`, error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de JobQueueService
 * @returns {JobQueueService} - JobQueueService instance
 */
const getJobQueueService = () => {
  if (!instance) {
    instance = new JobQueueService();
  }
  return instance;
};

module.exports = {
  getJobQueueService,
  JOB_STATUS,
  JOB_PRIORITY,
};
