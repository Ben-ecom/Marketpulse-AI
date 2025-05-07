/**
 * NLP Processing Service
 *
 * Dit bestand bevat de hoofdservice voor NLP processing.
 * Het coördineert de verschillende NLP componenten en biedt een uniforme interface
 * voor tekstanalyse en verwerking.
 */

const { createClient } = require('@supabase/supabase-js');
const { getTextCleaningService } = require('./text-cleaning');
const { getLanguageService } = require('./language-service');
const { getEntityRecognitionService } = require('./entity-recognition');
const { getSentimentAnalysisService } = require('./sentiment-analysis');
const { getTopicModelingService } = require('./topic-modeling');
const { getBatchProcessingService } = require('./batch-processing');

/**
 * NLP Processing Service klasse
 */
class NlpProcessingService {
  constructor() {
    // Initialiseer services
    this.textCleaningService = getTextCleaningService();
    this.languageService = getLanguageService();
    this.entityRecognitionService = getEntityRecognitionService();
    this.sentimentAnalysisService = getSentimentAnalysisService();
    this.topicModelingService = getTopicModelingService();
    this.batchProcessingService = getBatchProcessingService();

    // Initialiseer Supabase client alleen als de omgevingsvariabelen zijn ingesteld
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_KEY,
      );
    } else {
      console.warn('⚠️ SUPABASE_URL of SUPABASE_SERVICE_KEY is niet ingesteld. Database functionaliteit is uitgeschakeld.');
      this.supabase = null;
    }

    // Tabel voor NLP resultaten
    this.nlpResultsTable = 'nlp_results';
  }

  /**
   * Verwerk tekst met de volledige NLP pipeline
   * @param {String} text - Tekst om te verwerken
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Resultaat van de NLP verwerking
   */
  async processText(text, options = {}) {
    try {
      console.log(`🔍 Verwerken van tekst (${text.length} karakters) met NLP pipeline...`);

      // Stap 1: Tekst normalisatie en schoonmaak
      const cleanedText = await this.textCleaningService.cleanText(text, options);

      // Stap 2: Taaldetectie en vertaling indien nodig
      const languageResult = await this.languageService.detectAndTranslate(cleanedText, options);

      // Stap 3: Entity recognition
      const entitiesResult = await this.entityRecognitionService.extractEntities(
        languageResult.processedText || cleanedText,
        options,
      );

      // Stap 4: Sentiment analyse
      const sentimentResult = await this.sentimentAnalysisService.analyzeSentiment(
        languageResult.processedText || cleanedText,
        options,
      );

      // Stap 5: Topic modeling (optioneel)
      let topicsResult = null;
      if (options.performTopicModeling) {
        topicsResult = await this.topicModelingService.extractTopics(
          languageResult.processedText || cleanedText,
          options,
        );
      }

      // Combineer resultaten
      const result = {
        original_text: text,
        cleaned_text: cleanedText,
        language: languageResult.language,
        translated_text: languageResult.translatedText,
        entities: entitiesResult.entities,
        sentiment: sentimentResult,
        topics: topicsResult?.topics || [],
        metadata: {
          processing_time: new Date().toISOString(),
          options: options,
        },
      };

      // Sla resultaat op als dat is aangegeven
      if (options.saveResults) {
        await this.saveProcessingResult(result, options.projectId);
      }

      return result;
    } catch (error) {
      console.error('❌ Fout bij NLP verwerking:', error);
      throw error;
    }
  }

  /**
   * Verwerk een batch teksten met de NLP pipeline
   * @param {Array<String|Object>} texts - Array van teksten of objecten met tekst
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Array<Object>>} - Resultaten van de NLP verwerking
   */
  async processBatch(texts, options = {}) {
    try {
      console.log(`🔍 Verwerken van batch met ${texts.length} teksten...`);

      // Gebruik de batch processing service
      return await this.batchProcessingService.processBatch(
        texts,
        async (text) => await this.processText(
          typeof text === 'string' ? text : text.text,
          { ...options, textMetadata: typeof text === 'object' ? text : null },
        ),
        options,
      );
    } catch (error) {
      console.error('❌ Fout bij batch verwerking:', error);
      throw error;
    }
  }

  /**
   * Verwerk scrape resultaten met de NLP pipeline
   * @param {String} projectId - Project ID
   * @param {String} scrapeJobId - Scrape job ID
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Resultaat van de verwerking
   */
  async processScrapeResults(projectId, scrapeJobId, options = {}) {
    try {
      console.log(`🔍 Verwerken van scrape resultaten voor job ${scrapeJobId}...`);

      // Controleer of Supabase client is geïnitialiseerd
      if (!this.supabase) {
        console.warn('⚠️ Database functionaliteit is uitgeschakeld. Gebruik mock scrape resultaten.');

        // Gebruik mock scrape resultaten voor testen
        const mockScrapeResults = [
          {
            id: 'mock-id-1',
            job_id: scrapeJobId,
            platform: 'trustpilot',
            result_data: {
              business_domain: 'example.com',
              reviews: [
                {
                  id: 'review1',
                  title: 'Uitstekende service',
                  content: 'Ik ben zeer tevreden met de service van dit bedrijf. De levering was snel en het product is van hoge kwaliteit.',
                  rating: 5,
                  date: '2023-03-01T18:45:30Z',
                  author: { name: 'Jan Jansen', location: 'Amsterdam, Nederland' },
                  verified: true,
                },
                {
                  id: 'review2',
                  title: 'Goede producten, maar trage levering',
                  content: 'De producten zijn van goede kwaliteit, maar de levering duurde langer dan verwacht. Verder ben ik tevreden.',
                  rating: 4,
                  date: '2023-02-15T12:30:15Z',
                  author: { name: 'Piet Pietersen', location: 'Rotterdam, Nederland' },
                  verified: true,
                },
              ],
            },
          },
        ];

        // Extraheer teksten uit mock scrape resultaten
        const texts = this.extractTextsFromScrapeResults(mockScrapeResults);

        // Verwerk teksten in batch
        const nlpResults = await this.processBatch(texts, {
          ...options,
          projectId,
          saveResults: false,
        });

        return {
          project_id: projectId,
          scrape_job_id: scrapeJobId,
          processed_count: nlpResults.length,
          results: nlpResults,
        };
      }

      // Haal scrape resultaten op uit de database
      const { data: scrapeResults, error } = await this.supabase
        .from('scrape_results')
        .select('*')
        .eq('job_id', scrapeJobId);

      if (error) throw error;

      if (!scrapeResults || scrapeResults.length === 0) {
        throw new Error(`Geen scrape resultaten gevonden voor job ${scrapeJobId}`);
      }

      console.log(`📊 Gevonden: ${scrapeResults.length} scrape resultaten`);

      // Extraheer teksten uit scrape resultaten op basis van platform
      const texts = this.extractTextsFromScrapeResults(scrapeResults);

      // Verwerk teksten in batch
      const nlpResults = await this.processBatch(texts, {
        ...options,
        projectId,
        saveResults: true,
        scrapeJobId,
      });

      // Koppel NLP resultaten aan scrape resultaten
      await this.linkNlpResultsToScrapeResults(nlpResults, scrapeResults, projectId);

      return {
        project_id: projectId,
        scrape_job_id: scrapeJobId,
        processed_count: nlpResults.length,
        results: nlpResults,
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van scrape resultaten:', error);
      throw error;
    }
  }

  /**
   * Extraheer teksten uit scrape resultaten
   * @param {Array<Object>} scrapeResults - Scrape resultaten
   * @returns {Array<Object>} - Geëxtraheerde teksten met metadata
   */
  extractTextsFromScrapeResults(scrapeResults) {
    const texts = [];

    for (const result of scrapeResults) {
      const { platform } = result;
      const resultData = result.result_data;

      switch (platform) {
        case 'reddit':
          // Extraheer teksten uit Reddit posts en comments
          if (resultData.posts) {
            resultData.posts.forEach((post) => {
              texts.push({
                text: `${post.title} ${post.selftext || ''}`,
                source_type: 'reddit_post',
                source_id: post.id,
                scrape_result_id: result.id,
                metadata: {
                  subreddit: post.subreddit,
                  author: post.author,
                  created_utc: post.created_utc,
                  score: post.score,
                },
              });
            });
          }

          if (resultData.comments) {
            resultData.comments.forEach((comment) => {
              texts.push({
                text: comment.body,
                source_type: 'reddit_comment',
                source_id: comment.id,
                scrape_result_id: result.id,
                metadata: {
                  subreddit: comment.subreddit,
                  author: comment.author,
                  created_utc: comment.created_utc,
                  score: comment.score,
                },
              });
            });
          }
          break;

        case 'amazon':
          // Extraheer teksten uit Amazon reviews
          if (resultData.reviews) {
            resultData.reviews.forEach((review) => {
              texts.push({
                text: `${review.title} ${review.content}`,
                source_type: 'amazon_review',
                source_id: review.id,
                scrape_result_id: result.id,
                metadata: {
                  product_id: resultData.product_id || resultData.asin,
                  rating: review.rating,
                  verified_purchase: review.verified_purchase,
                  date: review.date,
                },
              });
            });
          }
          break;

        case 'instagram':
          // Extraheer teksten uit Instagram posts en comments
          if (resultData.posts) {
            resultData.posts.forEach((post) => {
              if (post.caption) {
                texts.push({
                  text: post.caption,
                  source_type: 'instagram_post',
                  source_id: post.id,
                  scrape_result_id: result.id,
                  metadata: {
                    username: post.username,
                    likes: post.likes_count,
                    comments: post.comments_count,
                    date: post.date,
                  },
                });
              }

              if (post.comments) {
                post.comments.forEach((comment) => {
                  texts.push({
                    text: comment.text,
                    source_type: 'instagram_comment',
                    source_id: comment.id,
                    scrape_result_id: result.id,
                    metadata: {
                      username: comment.username,
                      post_id: post.id,
                      likes: comment.likes_count,
                      date: comment.date,
                    },
                  });
                });
              }
            });
          }
          break;

        case 'tiktok':
          // Extraheer teksten uit TikTok videos en comments
          if (resultData.videos) {
            resultData.videos.forEach((video) => {
              if (video.description) {
                texts.push({
                  text: video.description,
                  source_type: 'tiktok_video',
                  source_id: video.id,
                  scrape_result_id: result.id,
                  metadata: {
                    username: video.username,
                    likes: video.likes_count,
                    comments: video.comments_count,
                    shares: video.shares_count,
                    date: video.date,
                  },
                });
              }

              if (video.comments) {
                video.comments.forEach((comment) => {
                  texts.push({
                    text: comment.text,
                    source_type: 'tiktok_comment',
                    source_id: comment.id,
                    scrape_result_id: result.id,
                    metadata: {
                      username: comment.username,
                      video_id: video.id,
                      likes: comment.likes_count,
                      date: comment.date,
                    },
                  });
                });
              }
            });
          }
          break;

        case 'trustpilot':
          // Extraheer teksten uit Trustpilot reviews
          if (resultData.reviews) {
            resultData.reviews.forEach((review) => {
              texts.push({
                text: `${review.title} ${review.content}`,
                source_type: 'trustpilot_review',
                source_id: review.id,
                scrape_result_id: result.id,
                metadata: {
                  business_domain: resultData.business_domain,
                  rating: review.rating,
                  date: review.date,
                  author: review.author?.name,
                  location: review.author?.location,
                  verified: review.verified,
                },
              });

              // Voeg bedrijfsreactie toe als die er is
              if (review.business_reply && review.business_reply.content) {
                texts.push({
                  text: review.business_reply.content,
                  source_type: 'trustpilot_business_reply',
                  source_id: `${review.id}_reply`,
                  scrape_result_id: result.id,
                  metadata: {
                    business_domain: resultData.business_domain,
                    review_id: review.id,
                    date: review.business_reply.date,
                  },
                });
              }
            });
          }
          break;

        default:
          console.warn(`⚠️ Onbekend platform: ${platform}, kan geen teksten extraheren`);
      }
    }

    return texts;
  }

  /**
   * Sla NLP verwerkingsresultaat op in de database
   * @param {Object} result - NLP verwerkingsresultaat
   * @param {String} projectId - Project ID
   * @returns {Promise<Object>} - Opgeslagen resultaat
   */
  async saveProcessingResult(result, projectId) {
    try {
      // Controleer of Supabase client is geïnitialiseerd
      if (!this.supabase) {
        console.warn('⚠️ Database functionaliteit is uitgeschakeld. NLP resultaat wordt niet opgeslagen.');
        return {
          id: `mock-id-${Date.now()}`,
          project_id: projectId,
          created_at: new Date().toISOString(),
          ...result,
        };
      }

      const { data, error } = await this.supabase
        .from(this.nlpResultsTable)
        .insert({
          project_id: projectId,
          scrape_result_id: result.textMetadata?.scrape_result_id,
          source_type: result.textMetadata?.source_type,
          source_id: result.textMetadata?.source_id,
          original_text: result.original_text,
          cleaned_text: result.cleaned_text,
          language: result.language,
          translated_text: result.translated_text,
          entities: result.entities,
          sentiment: result.sentiment,
          topics: result.topics,
          metadata: {
            ...result.metadata,
            source_metadata: result.textMetadata?.metadata,
          },
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Fout bij opslaan van NLP resultaat:', error);
      throw error;
    }
  }

  /**
   * Koppel NLP resultaten aan scrape resultaten
   * @param {Array<Object>} nlpResults - NLP resultaten
   * @param {Array<Object>} scrapeResults - Scrape resultaten
   * @param {String} projectId - Project ID
   * @returns {Promise<void>}
   */
  async linkNlpResultsToScrapeResults(nlpResults, scrapeResults, projectId) {
    try {
      // Controleer of Supabase client is geïnitialiseerd
      if (!this.supabase) {
        console.warn('⚠️ Database functionaliteit is uitgeschakeld. NLP resultaten worden niet gekoppeld aan scrape resultaten.');
        return;
      }

      // Groepeer NLP resultaten per scrape_result_id
      const nlpResultsByResultId = {};

      for (const result of nlpResults) {
        const scrapeResultId = result.textMetadata?.scrape_result_id;

        if (scrapeResultId) {
          if (!nlpResultsByResultId[scrapeResultId]) {
            nlpResultsByResultId[scrapeResultId] = [];
          }

          nlpResultsByResultId[scrapeResultId].push(result);
        }
      }

      // Update scrape resultaten met NLP resultaat IDs
      for (const scrapeResult of scrapeResults) {
        const nlpResultsForScrape = nlpResultsByResultId[scrapeResult.id] || [];

        if (nlpResultsForScrape.length > 0) {
          const { error } = await this.supabase
            .from('scrape_results')
            .update({
              nlp_processed: true,
              nlp_results: nlpResultsForScrape.map((r) => r.id),
            })
            .eq('id', scrapeResult.id);

          if (error) throw error;
        }
      }
    } catch (error) {
      console.error('❌ Fout bij koppelen van NLP resultaten aan scrape resultaten:', error);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de NlpProcessingService
 * @returns {NlpProcessingService} - NlpProcessingService instance
 */
const getNlpProcessingService = () => {
  if (!instance) {
    instance = new NlpProcessingService();
  }
  return instance;
};

module.exports = {
  getNlpProcessingService,
};
