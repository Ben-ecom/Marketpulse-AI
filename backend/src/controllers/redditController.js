/**
 * Reddit Controller
 * Beheert API endpoints voor Reddit data verzameling en analyse
 */

import redditScraper from '../services/scraping/redditScraper.js';
import { validationResult } from 'express-validator';

/**
 * Zoek Reddit posts op basis van een query
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const searchRedditPosts = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, sort, timeframe, limit, includeComments, maxComments } = req.query;

    // Controleer of query parameter aanwezig is
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Configureer zoekopties
    const searchOptions = {
      sort: sort || 'relevance',
      timeframe: timeframe || 'all',
      limit: limit ? parseInt(limit) : 25,
      includeComments: includeComments === 'true',
      maxComments: maxComments ? parseInt(maxComments) : 10
    };

    // Zoek posts
    const posts = await redditScraper.searchPosts(query, searchOptions);

    // Stuur resultaten
    res.json({
      success: true,
      query,
      options: searchOptions,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Error in searchRedditPosts:', error);
    res.status(500).json({ error: 'Failed to search Reddit posts', message: error.message });
  }
};

/**
 * Haal posts op van een specifieke subreddit
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getSubredditPosts = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subreddit } = req.params;
    const { sort, timeframe, limit, includeComments, maxComments } = req.query;

    // Controleer of subreddit parameter aanwezig is
    if (!subreddit) {
      return res.status(400).json({ error: 'Subreddit parameter is required' });
    }

    // Configureer opties
    const options = {
      sort: sort || 'hot',
      timeframe: timeframe || 'all',
      limit: limit ? parseInt(limit) : 25,
      includeComments: includeComments === 'true',
      maxComments: maxComments ? parseInt(maxComments) : 10
    };

    // Haal posts op
    const posts = await redditScraper.getSubredditPosts(subreddit, options);

    // Stuur resultaten
    res.json({
      success: true,
      subreddit,
      options,
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Error in getSubredditPosts:', error);
    res.status(500).json({ error: 'Failed to get subreddit posts', message: error.message });
  }
};

/**
 * Analyseer Reddit posts voor sentiment en trending topics
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const analyzeRedditPosts = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, subreddit, sort, timeframe, limit } = req.body;

    // Controleer of query of subreddit parameter aanwezig is
    if (!query && !subreddit) {
      return res.status(400).json({ error: 'Either query or subreddit parameter is required' });
    }

    // Configureer opties
    const options = {
      sort: sort || (query ? 'relevance' : 'hot'),
      timeframe: timeframe || 'all',
      limit: limit ? parseInt(limit) : 50,
      includeComments: false
    };

    // Verzamel posts op basis van query of subreddit
    let posts = [];
    if (query) {
      posts = await redditScraper.searchPosts(query, options);
    } else {
      posts = await redditScraper.getSubredditPosts(subreddit, options);
    }

    // Analyseer posts
    const analysis = redditScraper.analyzePosts(posts);

    // Stuur resultaten
    res.json({
      success: true,
      query: query || null,
      subreddit: subreddit || null,
      options,
      analysis
    });
  } catch (error) {
    console.error('Error in analyzeRedditPosts:', error);
    res.status(500).json({ error: 'Failed to analyze Reddit posts', message: error.message });
  }
};

/**
 * Haal gecombineerde Reddit insights op (posts, sentiment, trending topics)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const getRedditInsights = async (req, res) => {
  try {
    // Valideer request parameters
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, subreddit, sort, timeframe, limit } = req.query;

    // Controleer of query of subreddit parameter aanwezig is
    if (!query && !subreddit) {
      return res.status(400).json({ error: 'Either query or subreddit parameter is required' });
    }

    // Configureer opties
    const options = {
      sort: sort || (query ? 'relevance' : 'hot'),
      timeframe: timeframe || 'all',
      limit: limit ? parseInt(limit) : 50,
      includeComments: false
    };

    // Verzamel posts op basis van query of subreddit
    let posts = [];
    if (query) {
      posts = await redditScraper.searchPosts(query, options);
    } else {
      posts = await redditScraper.getSubredditPosts(subreddit, options);
    }

    // Analyseer posts
    const analysis = redditScraper.analyzePosts(posts);

    // Bereid de response voor met alle benodigde data voor PlatformInsights
    const insights = {
      platform: 'reddit',
      query: query || null,
      subreddit: subreddit || null,
      totalPosts: posts.length,
      topPosts: posts.slice(0, 10).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        subreddit: post.subreddit,
        score: post.score,
        numComments: post.numComments,
        url: post.url,
        timestamp: post.timestamp
      })),
      subredditDistribution: analysis.subredditDistribution,
      sentiment: {
        positive: analysis.sentimentAnalysis.overall.positivePercentage,
        negative: analysis.sentimentAnalysis.overall.negativePercentage,
        neutral: analysis.sentimentAnalysis.overall.neutralPercentage
      },
      trendingTopics: analysis.trendingTopics.map(topic => ({
        word: topic.word,
        frequency: topic.frequency
      }))
    };

    // Stuur resultaten
    res.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Error in getRedditInsights:', error);
    res.status(500).json({ error: 'Failed to get Reddit insights', message: error.message });
  }
};

// Exporteer controller functies
export {
  searchRedditPosts,
  getSubredditPosts,
  analyzeRedditPosts,
  getRedditInsights
};
