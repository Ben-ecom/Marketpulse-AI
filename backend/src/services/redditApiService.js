import axios from 'axios';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Laad omgevingsvariabelen
dotenv.config();

/**
 * Service voor het ophalen van data via de Reddit API
 */
export const redditApiService = {
  /**
   * Verkrijg een toegangstoken voor de Reddit API
   * @returns {Promise<string>} - Toegangstoken
   */
  async getAccessToken() {
    try {
      const authUrl = 'https://www.reddit.com/api/v1/access_token';
      const { 
        REDDIT_CLIENT_ID, 
        REDDIT_CLIENT_SECRET, 
        REDDIT_USERNAME, 
        REDDIT_PASSWORD 
      } = process.env;
      
      // Controleer of alle vereiste configuratiewaarden aanwezig zijn
      if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
        throw new Error('Ontbrekende Reddit API configuratie. Controleer je .env bestand.');
      }
      
      const response = await axios.post(
        authUrl, 
        `grant_type=password&username=${REDDIT_USERNAME}&password=${REDDIT_PASSWORD}`, 
        {
          auth: {
            username: REDDIT_CLIENT_ID,
            password: REDDIT_CLIENT_SECRET
          },
          headers: {
            'User-Agent': 'MarketPulseAI/1.0.0'
          }
        }
      );
      
      logger.info('Reddit API toegangstoken succesvol verkregen');
      return response.data.access_token;
    } catch (error) {
      logger.error(`Fout bij verkrijgen Reddit API toegangstoken: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal posts op van een specifieke subreddit
   * @param {string} subreddit - Naam van de subreddit
   * @param {object} options - Opties voor het verzoek
   * @returns {Promise<Array>} - Array met posts
   */
  async getSubredditPosts(subreddit, options = {}) {
    try {
      logger.info(`Reddit posts ophalen voor subreddit: ${subreddit}`);
      
      // Verkrijg toegangstoken
      const accessToken = await this.getAccessToken();
      
      // Bepaal sorteeroptie
      const sort = options.sort || 'hot'; // 'hot', 'new', 'top', 'rising'
      
      // Bepaal tijdsperiode voor 'top' sortering
      const t = options.timeframe || 'week'; // 'hour', 'day', 'week', 'month', 'year', 'all'
      
      // Bepaal limiet
      const limit = options.limit || 25;
      
      // Stel URL samen
      let url = `https://oauth.reddit.com/r/${subreddit}/${sort}?limit=${limit}`;
      
      // Voeg tijdsperiode toe voor 'top' sortering
      if (sort === 'top') {
        url += `&t=${t}`;
      }
      
      // Voer het verzoek uit
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MarketPulseAI/1.0.0'
        }
      });
      
      // Verwerk de response
      const posts = response.data.data.children.map(post => post.data);
      
      logger.info(`${posts.length} Reddit posts opgehaald voor subreddit: ${subreddit}`);
      return posts;
    } catch (error) {
      logger.error(`Fout bij ophalen Reddit posts: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Zoek posts op Reddit op basis van zoekwoorden
   * @param {string} query - Zoekwoord of zoekopdracht
   * @param {object} options - Opties voor het verzoek
   * @returns {Promise<Array>} - Array met zoekresultaten
   */
  async searchPosts(query, options = {}) {
    try {
      logger.info(`Reddit posts zoeken voor query: ${query}`);
      
      // Verkrijg toegangstoken
      const accessToken = await this.getAccessToken();
      
      // Bepaal sorteeroptie
      const sort = options.sort || 'relevance'; // 'relevance', 'hot', 'new', 'top', 'comments'
      
      // Bepaal tijdsperiode
      const t = options.timeframe || 'week'; // 'hour', 'day', 'week', 'month', 'year', 'all'
      
      // Bepaal limiet
      const limit = options.limit || 25;
      
      // Bepaal subreddit (optioneel)
      const subreddit = options.subreddit ? `&restrict_sr=on&sr=${options.subreddit}` : '';
      
      // Stel URL samen
      const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&sort=${sort}&t=${t}&limit=${limit}${subreddit}`;
      
      // Voer het verzoek uit
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MarketPulseAI/1.0.0'
        }
      });
      
      // Verwerk de response
      const posts = response.data.data.children.map(post => post.data);
      
      logger.info(`${posts.length} Reddit posts gevonden voor query: ${query}`);
      return posts;
    } catch (error) {
      logger.error(`Fout bij zoeken Reddit posts: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal comments op voor een specifieke post
   * @param {string} postId - ID van de post
   * @param {string} subreddit - Naam van de subreddit
   * @param {object} options - Opties voor het verzoek
   * @returns {Promise<Array>} - Array met comments
   */
  async getPostComments(postId, subreddit, options = {}) {
    try {
      logger.info(`Reddit comments ophalen voor post: ${postId} in subreddit: ${subreddit}`);
      
      // Verkrijg toegangstoken
      const accessToken = await this.getAccessToken();
      
      // Bepaal sorteeroptie
      const sort = options.sort || 'confidence'; // 'confidence', 'top', 'new', 'controversial', 'old', 'random', 'qa'
      
      // Bepaal limiet
      const limit = options.limit || 25;
      
      // Stel URL samen
      const url = `https://oauth.reddit.com/r/${subreddit}/comments/${postId}?sort=${sort}&limit=${limit}`;
      
      // Voer het verzoek uit
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MarketPulseAI/1.0.0'
        }
      });
      
      // Verwerk de response (comments bevinden zich in het tweede element van de array)
      const comments = response.data[1].data.children
        .filter(comment => comment.kind === 't1') // Filter alleen comments (type t1)
        .map(comment => comment.data);
      
      logger.info(`${comments.length} Reddit comments opgehaald voor post: ${postId}`);
      return comments;
    } catch (error) {
      logger.error(`Fout bij ophalen Reddit comments: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal trending subreddits op
   * @returns {Promise<Array>} - Array met trending subreddits
   */
  async getTrendingSubreddits() {
    try {
      logger.info('Trending subreddits ophalen');
      
      // Verkrijg toegangstoken
      const accessToken = await this.getAccessToken();
      
      // Stel URL samen
      const url = 'https://oauth.reddit.com/api/trending_subreddits';
      
      // Voer het verzoek uit
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MarketPulseAI/1.0.0'
        }
      });
      
      // Verwerk de response
      const trendingSubreddits = response.data.subreddit_names || [];
      
      logger.info(`${trendingSubreddits.length} trending subreddits opgehaald`);
      return trendingSubreddits;
    } catch (error) {
      logger.error(`Fout bij ophalen trending subreddits: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Haal informatie op over een specifieke subreddit
   * @param {string} subreddit - Naam van de subreddit
   * @returns {Promise<object>} - Subreddit informatie
   */
  async getSubredditInfo(subreddit) {
    try {
      logger.info(`Informatie ophalen voor subreddit: ${subreddit}`);
      
      // Verkrijg toegangstoken
      const accessToken = await this.getAccessToken();
      
      // Stel URL samen
      const url = `https://oauth.reddit.com/r/${subreddit}/about`;
      
      // Voer het verzoek uit
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'MarketPulseAI/1.0.0'
        }
      });
      
      // Verwerk de response
      const subredditInfo = response.data.data;
      
      logger.info(`Informatie opgehaald voor subreddit: ${subreddit}`);
      return subredditInfo;
    } catch (error) {
      logger.error(`Fout bij ophalen subreddit informatie: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Analyseer sentiment en extracteer keywords uit Reddit posts
   * @param {Array} posts - Array met Reddit posts
   * @returns {object} - Analyse resultaten
   */
  analyzePosts(posts) {
    try {
      if (!posts || posts.length === 0) {
        return {
          sentiment: 0,
          keywords: [],
          topPosts: []
        };
      }
      
      // Eenvoudige sentiment analyse (kan worden vervangen door een geavanceerdere oplossing)
      const sentimentScores = posts.map(post => {
        const title = post.title || '';
        const selftext = post.selftext || '';
        const text = title + ' ' + selftext;
        
        // Eenvoudige sentiment score op basis van positieve en negatieve woorden
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'best', 'perfect', 'awesome', 'recommend', 'positive', 'happy', 'impressed'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'poor', 'disappointing', 'negative', 'unhappy', 'disappointed', 'avoid'];
        
        let score = 0;
        
        // Tel positieve woorden
        positiveWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            score += matches.length;
          }
        });
        
        // Tel negatieve woorden
        negativeWords.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const matches = text.match(regex);
          if (matches) {
            score -= matches.length;
          }
        });
        
        return score;
      });
      
      // Bereken gemiddelde sentiment score
      const totalScore = sentimentScores.reduce((sum, score) => sum + score, 0);
      const averageSentiment = totalScore / sentimentScores.length;
      
      // Normaliseer sentiment score tussen -1 en 1
      const normalizedSentiment = Math.max(-1, Math.min(1, averageSentiment / 5));
      
      // Extracteer keywords (eenvoudige implementatie)
      const allText = posts.map(post => (post.title || '') + ' ' + (post.selftext || '')).join(' ');
      const words = allText.toLowerCase().split(/\W+/).filter(word => word.length > 3);
      
      // Tel frequentie van woorden
      const wordFrequency = {};
      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
      
      // Filter stopwoorden (eenvoudige lijst)
      const stopwords = ['this', 'that', 'these', 'those', 'with', 'from', 'have', 'what', 'when', 'where', 'which', 'their', 'they', 'them', 'then', 'than', 'your', 'about'];
      const filteredWords = Object.entries(wordFrequency)
        .filter(([word]) => !stopwords.includes(word))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([word, frequency]) => ({ word, frequency }));
      
      // Selecteer top posts op basis van score (upvotes - downvotes)
      const topPosts = [...posts]
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5)
        .map(post => ({
          id: post.id,
          title: post.title,
          url: post.url,
          score: post.score,
          num_comments: post.num_comments,
          created_utc: post.created_utc,
          subreddit: post.subreddit,
          author: post.author
        }));
      
      return {
        sentiment: normalizedSentiment,
        keywords: filteredWords,
        topPosts
      };
    } catch (error) {
      logger.error(`Fout bij analyseren Reddit posts: ${error.message}`);
      throw error;
    }
  }
};

export default redditApiService;
