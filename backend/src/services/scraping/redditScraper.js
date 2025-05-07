/**
 * RedditScraper service voor het verzamelen van data van Reddit
 * Gebruikt browserService met anti-detectie maatregelen en proxy rotatie
 * Implementeert geavanceerde technieken om detectie te vermijden
 */

import browserService from './browserService.js';
import proxyManager from './proxyManager.js';
import pkg from 'uuid';
const { v4: uuidv4 } = pkg;
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

class RedditScraper {
  constructor() {
    this.baseUrl = 'https://www.reddit.com';
    this.defaultSearchParams = {
      sort: 'relevance', // relevance, hot, top, new, comments
      t: 'all',          // hour, day, week, month, year, all
      limit: 25          // aantal resultaten per pagina
    };
  }

  /**
   * Zoek posts op Reddit op basis van een query
   * @param {string} query - Zoekterm
   * @param {Object} options - Zoekopties
   * @param {string} options.sort - Sortering (relevance, hot, top, new, comments)
   * @param {string} options.timeframe - Tijdsperiode (hour, day, week, month, year, all)
   * @param {number} options.limit - Maximum aantal posts om te verzamelen
   * @param {boolean} options.includeComments - Of comments moeten worden verzameld
   * @param {number} options.maxComments - Maximum aantal comments per post
   * @returns {Promise<Array>} Verzamelde posts
   */
  async searchPosts(query, options = {}) {
    const sessionId = uuidv4();
    const browser = await browserService.getBrowser(sessionId, {}, true);
    const page = await browserService.createPage(browser);
    
    const searchOptions = {
      sort: options.sort || this.defaultSearchParams.sort,
      t: options.timeframe || this.defaultSearchParams.t,
      limit: options.limit || this.defaultSearchParams.limit,
      includeComments: options.includeComments || false,
      maxComments: options.maxComments || 10
    };
    
    const posts = [];
    let currentPage = 1;
    let hasNextPage = true;
    let after = '';
    
    try {
      while (hasNextPage && posts.length < searchOptions.limit) {
        // Bouw de zoek-URL
        const searchUrl = this.buildSearchUrl(query, searchOptions.sort, searchOptions.t, after);
        console.log(`Scraping page ${currentPage}: ${searchUrl}`);
        
        // Navigeer naar de zoekpagina
        const navigationSuccess = await browserService.navigateWithRetry(page, searchUrl);
        if (!navigationSuccess) {
          console.error('Failed to navigate to search page');
          break;
        }
        
        // Wacht een willekeurige tijd om menselijk gedrag te simuleren
        await browserService.randomDelay(2000, 5000);
        
        // Los eventuele reCAPTCHA op
        await browserService.solveRecaptcha(page);
        
        // Scroll naar beneden om alle posts te laden
        await this.scrollToLoadAllPosts(page);
        
        // Verzamel posts van de huidige pagina
        const pagePosts = await this.extractPostsFromPage(page);
        
        if (pagePosts.length === 0) {
          console.log('No posts found on current page');
          break;
        }
        
        // Voeg posts toe aan de resultaten
        for (const post of pagePosts) {
          if (posts.length >= searchOptions.limit) {
            break;
          }
          
          // Verzamel comments als nodig
          if (searchOptions.includeComments) {
            post.comments = await this.getCommentsForPost(page, post.permalink, searchOptions.maxComments);
          }
          
          posts.push(post);
        }
        
        // Controleer of er een volgende pagina is
        after = await this.getNextPageToken(page);
        hasNextPage = !!after && posts.length < searchOptions.limit;
        currentPage++;
        
        // Wacht een willekeurige tijd tussen paginanavigaties
        await browserService.randomDelay(3000, 7000);
      }
    } catch (error) {
      console.error('Error scraping Reddit posts:', error);
    } finally {
      // Sluit de browser
      await browserService.closeBrowser(sessionId);
    }
    
    console.log(`Collected ${posts.length} posts from Reddit`);
    return posts;
  }

  /**
   * Verzamel posts van een specifieke subreddit
   * @param {string} subreddit - Naam van de subreddit (zonder r/)
   * @param {Object} options - Opties voor het verzamelen
   * @param {string} options.sort - Sortering (hot, new, top, rising)
   * @param {string} options.timeframe - Tijdsperiode voor 'top' sortering (hour, day, week, month, year, all)
   * @param {number} options.limit - Maximum aantal posts om te verzamelen
   * @param {boolean} options.includeComments - Of comments moeten worden verzameld
   * @param {number} options.maxComments - Maximum aantal comments per post
   * @returns {Promise<Array>} Verzamelde posts
   */
  async getSubredditPosts(subreddit, options = {}) {
    const sessionId = uuidv4();
    const browser = await browserService.getBrowser(sessionId, {}, true);
    const page = await browserService.createPage(browser);
    
    const subredditOptions = {
      sort: options.sort || 'hot',
      t: options.timeframe || 'all',
      limit: options.limit || 25,
      includeComments: options.includeComments || false,
      maxComments: options.maxComments || 10
    };
    
    const posts = [];
    let currentPage = 1;
    let hasNextPage = true;
    let after = '';
    
    try {
      while (hasNextPage && posts.length < subredditOptions.limit) {
        // Bouw de subreddit URL
        const subredditUrl = this.buildSubredditUrl(subreddit, subredditOptions.sort, subredditOptions.t, after);
        console.log(`Scraping page ${currentPage}: ${subredditUrl}`);
        
        // Navigeer naar de subreddit pagina
        const navigationSuccess = await browserService.navigateWithRetry(page, subredditUrl);
        if (!navigationSuccess) {
          console.error('Failed to navigate to subreddit page');
          break;
        }
        
        // Wacht een willekeurige tijd om menselijk gedrag te simuleren
        await browserService.randomDelay(2000, 5000);
        
        // Los eventuele reCAPTCHA op
        await browserService.solveRecaptcha(page);
        
        // Scroll naar beneden om alle posts te laden
        await this.scrollToLoadAllPosts(page);
        
        // Verzamel posts van de huidige pagina
        const pagePosts = await this.extractPostsFromPage(page);
        
        if (pagePosts.length === 0) {
          console.log('No posts found on current page');
          break;
        }
        
        // Voeg posts toe aan de resultaten
        for (const post of pagePosts) {
          if (posts.length >= subredditOptions.limit) {
            break;
          }
          
          // Verzamel comments als nodig
          if (subredditOptions.includeComments) {
            post.comments = await this.getCommentsForPost(page, post.permalink, subredditOptions.maxComments);
          }
          
          posts.push(post);
        }
        
        // Controleer of er een volgende pagina is
        after = await this.getNextPageToken(page);
        hasNextPage = !!after && posts.length < subredditOptions.limit;
        currentPage++;
        
        // Wacht een willekeurige tijd tussen paginanavigaties
        await browserService.randomDelay(3000, 7000);
      }
    } catch (error) {
      console.error('Error scraping subreddit posts:', error);
    } finally {
      // Sluit de browser
      await browserService.closeBrowser(sessionId);
    }
    
    console.log(`Collected ${posts.length} posts from r/${subreddit}`);
    return posts;
  }

  /**
   * Verzamel comments voor een specifieke post
   * @param {Page} page - Puppeteer pagina instantie
   * @param {string} permalink - Permalink van de post
   * @param {number} maxComments - Maximum aantal comments om te verzamelen
   * @returns {Promise<Array>} Verzamelde comments
   */
  async getCommentsForPost(page, permalink, maxComments = 10) {
    try {
      // Navigeer naar de post pagina
      const postUrl = `${this.baseUrl}${permalink}`;
      const navigationSuccess = await browserService.navigateWithRetry(page, postUrl);
      
      if (!navigationSuccess) {
        console.error(`Failed to navigate to post: ${postUrl}`);
        return [];
      }
      
      // Wacht een willekeurige tijd om menselijk gedrag te simuleren
      await browserService.randomDelay(2000, 4000);
      
      // Scroll naar beneden om comments te laden
      await this.scrollToLoadComments(page);
      
      // Verzamel comments
      const comments = await page.evaluate((max) => {
        const commentElements = Array.from(document.querySelectorAll('div[data-testid="comment"]'));
        return commentElements.slice(0, max).map(comment => {
          // Zoek de auteur
          const authorElement = comment.querySelector('a[data-testid="comment_author"]');
          const author = authorElement ? authorElement.textContent.trim() : 'Unknown';
          
          // Zoek de tekst
          const textElement = comment.querySelector('div[data-testid="comment-content"]');
          const text = textElement ? textElement.textContent.trim() : '';
          
          // Zoek de score
          const scoreElement = comment.querySelector('div[id^="vote-arrows-"]');
          const scoreText = scoreElement ? scoreElement.textContent.trim() : '0';
          const score = parseInt(scoreText) || 0;
          
          // Zoek de timestamp
          const timeElement = comment.querySelector('a time');
          const timestamp = timeElement ? timeElement.getAttribute('datetime') : null;
          
          return {
            author,
            text,
            score,
            timestamp,
            permalink: comment.querySelector('a[data-testid="permalink"]')?.getAttribute('href') || null
          };
        });
      }, maxComments);
      
      return comments;
    } catch (error) {
      console.error('Error collecting comments:', error);
      return [];
    }
  }

  /**
   * Scroll naar beneden om alle posts te laden
   * @param {Page} page - Puppeteer pagina instantie
   */
  async scrollToLoadAllPosts(page) {
    try {
      await page.evaluate(async () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        const scrollHeight = () => document.documentElement.scrollHeight;
        let lastScrollHeight = scrollHeight();
        
        // Scroll naar beneden met willekeurige intervallen
        for (let i = 0; i < 5; i++) {
          window.scrollTo(0, scrollHeight());
          await delay(Math.random() * 1000 + 1000); // Willekeurige vertraging tussen 1-2s
          
          // Controleer of we het einde hebben bereikt
          const currentScrollHeight = scrollHeight();
          if (currentScrollHeight === lastScrollHeight) {
            break;
          }
          
          lastScrollHeight = currentScrollHeight;
        }
        
        // Scroll een beetje terug naar boven (menselijk gedrag)
        window.scrollTo(0, scrollHeight() * 0.8);
        await delay(500);
      });
      
      // Wacht een beetje extra tijd voor het laden van content
      await page.waitForTimeout(1000);
    } catch (error) {
      console.error('Error scrolling page:', error);
    }
  }

  /**
   * Scroll naar beneden om comments te laden
   * @param {Page} page - Puppeteer pagina instantie
   */
  async scrollToLoadComments(page) {
    try {
      await page.evaluate(async () => {
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        // Scroll eerst naar de comments sectie
        const commentsSection = document.querySelector('div[data-test-id="comments-page"]');
        if (commentsSection) {
          commentsSection.scrollIntoView();
          await delay(1000);
        }
        
        const scrollHeight = () => document.documentElement.scrollHeight;
        let lastScrollHeight = scrollHeight();
        
        // Scroll naar beneden met willekeurige intervallen
        for (let i = 0; i < 3; i++) {
          window.scrollTo(0, scrollHeight() * 0.6 + (i * 300)); // Geleidelijk naar beneden
          await delay(Math.random() * 800 + 700); // Willekeurige vertraging
          
          // Klik op "load more comments" buttons als ze er zijn
          const loadMoreButtons = document.querySelectorAll('button[id^="load-more-comments"]');
          for (const button of loadMoreButtons) {
            button.click();
            await delay(500);
          }
          
          // Controleer of we het einde hebben bereikt
          const currentScrollHeight = scrollHeight();
          if (currentScrollHeight === lastScrollHeight) {
            break;
          }
          
          lastScrollHeight = currentScrollHeight;
        }
      });
      
      // Wacht een beetje extra tijd voor het laden van content
      await page.waitForTimeout(1500);
    } catch (error) {
      console.error('Error scrolling comments:', error);
    }
  }

  /**
   * Verzamel posts van de huidige pagina
   * @param {Page} page - Puppeteer pagina instantie
   * @returns {Promise<Array>} Verzamelde posts
   */
  async extractPostsFromPage(page) {
    try {
      return await page.evaluate(() => {
        const posts = [];
        const postElements = Array.from(document.querySelectorAll('div[data-testid="post-container"]'));
        
        for (const postElement of postElements) {
          try {
            // Titel
            const titleElement = postElement.querySelector('h1, h3');
            const title = titleElement ? titleElement.textContent.trim() : '';
            
            // Subreddit
            const subredditElement = postElement.querySelector('a[data-testid="subreddit-link"]');
            const subreddit = subredditElement 
              ? subredditElement.textContent.trim().replace('r/', '') 
              : '';
            
            // Auteur
            const authorElement = postElement.querySelector('a[data-testid="post_author"]');
            const author = authorElement ? authorElement.textContent.trim() : '';
            
            // Permalink
            const permalinkElement = postElement.querySelector('a[data-testid="post-title"]');
            const permalink = permalinkElement ? permalinkElement.getAttribute('href') : '';
            
            // Post ID
            const postId = permalink ? permalink.split('/').filter(Boolean).pop() : '';
            
            // Content
            const contentElement = postElement.querySelector('div[data-testid="post-content"]');
            let content = '';
            
            if (contentElement) {
              // Tekst content
              const textElement = contentElement.querySelector('div[data-click-id="text"]');
              if (textElement) {
                content = textElement.textContent.trim();
              }
              
              // Als er geen tekst is, controleer op afbeeldingen of links
              if (!content) {
                const mediaElement = contentElement.querySelector('img:not([alt=""])');
                if (mediaElement) {
                  content = `[Image: ${mediaElement.getAttribute('alt')}]`;
                } else {
                  const linkElement = contentElement.querySelector('a[data-testid="outbound-link"]');
                  if (linkElement) {
                    content = `[Link: ${linkElement.getAttribute('href')}]`;
                  }
                }
              }
            }
            
            // Score
            const scoreElement = postElement.querySelector('div[id^="vote-arrows-"]');
            const scoreText = scoreElement ? scoreElement.textContent.trim() : '0';
            // Verwijder 'k' en 'm' en converteer naar nummer
            const score = scoreText.includes('k') 
              ? parseFloat(scoreText.replace('k', '')) * 1000 
              : scoreText.includes('m') 
                ? parseFloat(scoreText.replace('m', '')) * 1000000 
                : parseInt(scoreText) || 0;
            
            // Aantal comments
            const commentsElement = postElement.querySelector('span[data-testid="comment-count"]');
            const commentsText = commentsElement ? commentsElement.textContent.trim() : '0';
            // Verwijder 'comments' en converteer naar nummer
            const numComments = parseInt(commentsText.replace(/\D/g, '')) || 0;
            
            // Timestamp
            const timeElement = postElement.querySelector('a time');
            const timestamp = timeElement ? timeElement.getAttribute('datetime') : null;
            
            // Voeg post toe aan resultaten
            posts.push({
              id: postId,
              title,
              subreddit,
              author,
              content,
              score,
              numComments,
              permalink,
              timestamp,
              url: permalink ? `https://www.reddit.com${permalink}` : null
            });
          } catch (error) {
            console.error('Error extracting post data:', error);
          }
        }
        
        return posts;
      });
    } catch (error) {
      console.error('Error extracting posts from page:', error);
      return [];
    }
  }

  /**
   * Haal het token voor de volgende pagina op
   * @param {Page} page - Puppeteer pagina instantie
   * @returns {Promise<string>} Token voor de volgende pagina
   */
  async getNextPageToken(page) {
    try {
      return await page.evaluate(() => {
        const nextButton = document.querySelector('button[aria-label="Next"]');
        if (!nextButton || nextButton.disabled) {
          return null;
        }
        
        // Zoek naar de 'after' parameter in de URL van de volgende pagina link
        const nextLink = document.querySelector('a[rel="next"]');
        if (nextLink) {
          const href = nextLink.getAttribute('href');
          const match = href.match(/after=([^&]+)/);
          return match ? match[1] : null;
        }
        
        return null;
      });
    } catch (error) {
      console.error('Error getting next page token:', error);
      return null;
    }
  }

  /**
   * Bouw een zoek-URL op basis van parameters
   * @param {string} query - Zoekterm
   * @param {string} sort - Sortering
   * @param {string} timeframe - Tijdsperiode
   * @param {string} after - Token voor paginering
   * @returns {string} Volledige zoek-URL
   */
  buildSearchUrl(query, sort, timeframe, after = '') {
    const encodedQuery = encodeURIComponent(query);
    let url = `${this.baseUrl}/search/?q=${encodedQuery}&sort=${sort}&t=${timeframe}`;
    
    if (after) {
      url += `&after=${after}`;
    }
    
    return url;
  }

  /**
   * Bouw een subreddit URL op basis van parameters
   * @param {string} subreddit - Naam van de subreddit
   * @param {string} sort - Sortering
   * @param {string} timeframe - Tijdsperiode
   * @param {string} after - Token voor paginering
   * @returns {string} Volledige subreddit URL
   */
  buildSubredditUrl(subreddit, sort, timeframe, after = '') {
    let url = `${this.baseUrl}/r/${subreddit}/${sort}/`;
    
    if (sort === 'top') {
      url += `?t=${timeframe}`;
      
      if (after) {
        url += `&after=${after}`;
      }
    } else if (after) {
      url += `?after=${after}`;
    }
    
    return url;
  }

  /**
   * Analyseer verzamelde posts om sentiment en trending topics te extraheren
   * @param {Array} posts - Verzamelde posts
   * @returns {Object} Analyse resultaten
   */
  analyzePosts(posts) {
    // Subreddit distributie
    const subredditDistribution = this.getSubredditDistribution(posts);
    
    // Sentiment analyse (eenvoudige implementatie, kan worden vervangen door NLP)
    const sentimentAnalysis = this.performSimpleSentimentAnalysis(posts);
    
    // Trending topics
    const trendingTopics = this.extractTrendingTopics(posts);
    
    return {
      totalPosts: posts.length,
      subredditDistribution,
      sentimentAnalysis,
      trendingTopics
    };
  }

  /**
   * Bereken de distributie van posts over subreddits
   * @param {Array} posts - Verzamelde posts
   * @returns {Array} Subreddit distributie
   */
  getSubredditDistribution(posts) {
    const subredditCounts = {};
    
    for (const post of posts) {
      if (post.subreddit) {
        subredditCounts[post.subreddit] = (subredditCounts[post.subreddit] || 0) + 1;
      }
    }
    
    // Converteer naar array en sorteer op aantal
    return Object.entries(subredditCounts)
      .map(([name, count]) => ({ 
        name, 
        count,
        percentage: (count / posts.length) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Voer een eenvoudige sentiment analyse uit op posts
   * @param {Array} posts - Verzamelde posts
   * @returns {Object} Sentiment analyse resultaten
   */
  performSimpleSentimentAnalysis(posts) {
    // Eenvoudige woordenlijsten voor sentiment analyse
    const positiveWords = [
      'good', 'great', 'awesome', 'excellent', 'amazing', 'love', 'best', 'perfect',
      'happy', 'glad', 'positive', 'nice', 'wonderful', 'fantastic', 'helpful',
      'recommend', 'easy', 'impressive', 'beautiful', 'enjoy', 'thanks', 'thank',
      'goed', 'geweldig', 'uitstekend', 'fantastisch', 'liefde', 'beste', 'perfect',
      'blij', 'positief', 'mooi', 'fijn', 'bedankt', 'dank', 'prima', 'top'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'poor', 'disappointing',
      'disappointed', 'negative', 'difficult', 'hard', 'problem', 'issue', 'bug',
      'expensive', 'slow', 'complicated', 'confusing', 'annoying', 'useless',
      'slecht', 'verschrikkelijk', 'vreselijk', 'haat', 'slechtste', 'teleurstellend',
      'teleurgesteld', 'negatief', 'moeilijk', 'probleem', 'duur', 'traag', 'ingewikkeld',
      'verwarrend', 'irritant', 'nutteloos'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    const postSentiments = [];
    
    for (const post of posts) {
      const text = `${post.title} ${post.content}`.toLowerCase();
      
      let positiveScore = 0;
      let negativeScore = 0;
      
      // Tel positieve en negatieve woorden
      for (const word of positiveWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          positiveScore += matches.length;
        }
      }
      
      for (const word of negativeWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          negativeScore += matches.length;
        }
      }
      
      // Bepaal overall sentiment
      let sentiment;
      let score;
      
      if (positiveScore > negativeScore) {
        sentiment = 'positive';
        score = positiveScore - negativeScore;
        positiveCount++;
      } else if (negativeScore > positiveScore) {
        sentiment = 'negative';
        score = negativeScore - positiveScore;
        negativeCount++;
      } else {
        sentiment = 'neutral';
        score = 0;
        neutralCount++;
      }
      
      postSentiments.push({
        id: post.id,
        title: post.title,
        sentiment,
        score,
        positiveScore,
        negativeScore
      });
    }
    
    // Bereken percentages
    const total = posts.length;
    const positivePercentage = (positiveCount / total) * 100;
    const negativePercentage = (negativeCount / total) * 100;
    const neutralPercentage = (neutralCount / total) * 100;
    
    return {
      overall: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
        positivePercentage,
        negativePercentage,
        neutralPercentage
      },
      postSentiments
    };
  }

  /**
   * Extraheer trending topics uit posts
   * @param {Array} posts - Verzamelde posts
   * @param {number} minFrequency - Minimum frequentie om als trending te worden beschouwd
   * @param {number} maxTopics - Maximum aantal trending topics om te retourneren
   * @returns {Array} Trending topics
   */
  extractTrendingTopics(posts, minFrequency = 2, maxTopics = 15) {
    // Woorden die moeten worden genegeerd (stopwoorden)
    const stopWords = [
      'the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'it', 'for', 'with',
      'as', 'be', 'this', 'on', 'not', 'are', 'or', 'from', 'an', 'by', 'but',
      'what', 'some', 'can', 'more', 'has', 'was', 'about', 'how', 'been',
      'de', 'het', 'een', 'en', 'van', 'in', 'is', 'dat', 'op', 'te', 'voor',
      'met', 'zijn', 'er', 'niet', 'aan', 'ook', 'bij', 'door', 'uit', 'nog',
      'naar', 'dan', 'deze', 'dit', 'wordt', 'werd', 'worden', 'zoals', 'over'
    ];
    
    // Verzamel alle woorden uit titels en content
    const allText = posts
      .map(post => `${post.title} ${post.content}`)
      .join(' ')
      .toLowerCase();
    
    // Tokenize en tel woorden
    const words = allText.match(/\b\w{3,}\b/g) || [];
    const wordCounts = {};
    
    for (const word of words) {
      if (!stopWords.includes(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    }
    
    // Converteer naar array, filter op minimum frequentie en sorteer
    return Object.entries(wordCounts)
      .filter(([_, count]) => count >= minFrequency)
      .map(([word, frequency]) => ({ word, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, maxTopics);
  }
}

// Singleton instantie
const redditScraper = new RedditScraper();

export default redditScraper;
