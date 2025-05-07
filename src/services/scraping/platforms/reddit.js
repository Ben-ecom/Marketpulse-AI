/**
 * Reddit Scraper
 *
 * Dit bestand bevat de scraper voor Reddit content.
 * Het gebruikt de Decodo API wrapper om Reddit pagina's te scrapen en
 * posts, comments en andere gegevens te extraheren.
 */

const { v4: uuidv4 } = require('uuid');
const { getDecodoApiClient } = require('../decodo-api');
const { getJobQueueService } = require('../job-queue');
const { uploadJsonDataset } = require('../../../utils/storage');

/**
 * Reddit Scraper klasse
 */
class RedditScraper {
  constructor() {
    this.decodoClient = getDecodoApiClient();
    this.jobQueueService = getJobQueueService();
    this.platform = 'reddit';
  }

  /**
   * Maak een nieuwe scrape job aan voor een subreddit
   * @param {String} projectId - ID van het project
   * @param {Array<String>} subredditUrls - Array van subreddit URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createSubredditScrapeJob(projectId, subredditUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateRedditUrls(subredditUrls, 'subreddit');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Reddit subreddit URLs gevonden');
      }

      // Standaard opties voor Reddit subreddit scraping
      const defaultOptions = {
        wait_for: '.Post', // Wacht op post elementen
        device_type: 'desktop',
        javascript: true,
        timeout: 30000,
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor subreddit gegevens
        selectors: {
          posts: '.Post',
          postTitle: 'h1, h3',
          postVotes: '[id^="vote-arrows-"]',
          postComments: '.comments-page-link',
          postAuthor: '.author-link',
          postTime: 'a[data-click-id="timestamp"]',
          postContent: '.Post-body',
          postImage: '.media-element',
          postFlair: '.flair',
          pagination: '.pagination',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'subreddit',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Reddit subreddit scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Reddit posts
   * @param {String} projectId - ID van het project
   * @param {Array<String>} postUrls - Array van post URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createPostScrapeJob(projectId, postUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateRedditUrls(postUrls, 'post');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Reddit post URLs gevonden');
      }

      // Standaard opties voor Reddit post scraping
      const defaultOptions = {
        wait_for: '.Comment', // Wacht op comment elementen
        device_type: 'desktop',
        javascript: true,
        timeout: 30000,
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor post gegevens
        selectors: {
          postTitle: 'h1',
          postVotes: '[id^="vote-arrows-"]',
          postAuthor: '.author-link',
          postTime: 'a[data-click-id="timestamp"]',
          postContent: '.Post-body',
          postImage: '.media-element',
          postFlair: '.flair',
          comments: '.Comment',
          commentAuthor: '.author-link',
          commentTime: 'a[data-click-id="timestamp"]',
          commentContent: '.Comment-body',
          commentVotes: '[id^="vote-arrows-"]',
          commentReplies: '.Comment-replies',
          loadMoreComments: '.load-more-comments',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'post',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Reddit post scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Reddit gebruikers
   * @param {String} projectId - ID van het project
   * @param {Array<String>} userUrls - Array van gebruiker URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createUserScrapeJob(projectId, userUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateRedditUrls(userUrls, 'user');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Reddit gebruiker URLs gevonden');
      }

      // Standaard opties voor Reddit gebruiker scraping
      const defaultOptions = {
        wait_for: '.Post', // Wacht op post elementen
        device_type: 'desktop',
        javascript: true,
        timeout: 30000,
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor gebruiker gegevens
        selectors: {
          userInfo: '.UserProfileHeader',
          userName: '.UserProfileHeader h1',
          userKarma: '.UserProfileHeader span',
          userPosts: '.Post',
          userPostTitle: 'h3',
          userPostVotes: '[id^="vote-arrows-"]',
          userPostComments: '.comments-page-link',
          userPostTime: 'a[data-click-id="timestamp"]',
          pagination: '.pagination',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'user',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Reddit gebruiker scrape job:', error);
      throw error;
    }
  }

  /**
   * Valideer Reddit URLs
   * @param {Array<String>} urls - Array van URLs om te valideren
   * @param {String} type - Type URL (subreddit, post, user)
   * @returns {Array<String>} - Array van geldige URLs
   */
  validateRedditUrls(urls, type = 'subreddit') {
    if (!urls || !Array.isArray(urls)) {
      return [];
    }

    return urls.filter((url) => {
      // Controleer of het een geldige URL is
      try {
        const urlObj = new URL(url);

        // Controleer of het een Reddit domein is
        const isRedditDomain = urlObj.hostname === 'www.reddit.com'
                              || urlObj.hostname === 'reddit.com'
                              || urlObj.hostname === 'old.reddit.com';

        if (!isRedditDomain) {
          return false;
        }

        // Controleer het type URL
        const { pathname } = urlObj;

        if (type === 'subreddit') {
          // Subreddit URL: /r/subreddit
          return pathname.match(/^\/r\/[\w-]+\/?$/);
        } if (type === 'post') {
          // Post URL: /r/subreddit/comments/...
          return pathname.includes('/comments/');
        } if (type === 'user') {
          // User URL: /user/username
          return pathname.match(/^\/user\/[\w-]+\/?$/);
        }

        return false;
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Verwerk de resultaten van een subreddit scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte subreddit gegevens
   */
  processSubredditResult(scrapeResult) {
    try {
      if (!scrapeResult || !scrapeResult.html) {
        throw new Error('Geen geldig scrape resultaat');
      }

      // Extractie van subreddit gegevens
      const subredditData = {
        name: this.extractSubredditName(scrapeResult.url),
        url: scrapeResult.url,
        posts: this.extractPosts(scrapeResult.html),
        subscribers: this.extractSubscribers(scrapeResult.html),
        description: this.extractSubredditDescription(scrapeResult.html),
        rules: this.extractSubredditRules(scrapeResult.html),
        moderators: this.extractModerators(scrapeResult.html),
        pagination: this.extractPagination(scrapeResult.html),
        scrapedAt: new Date().toISOString(),
      };

      return subredditData;
    } catch (error) {
      console.error('❌ Fout bij verwerken van subreddit resultaat:', error);
      throw error;
    }
  }

  /**
   * Verwerk de resultaten van een post scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte post gegevens
   */
  processPostResult(scrapeResult) {
    try {
      if (!scrapeResult || !scrapeResult.html) {
        throw new Error('Geen geldig scrape resultaat');
      }

      // Extractie van post gegevens
      const postData = {
        id: this.extractPostId(scrapeResult.url),
        subreddit: this.extractSubredditFromPostUrl(scrapeResult.url),
        title: this.extractText(scrapeResult.html, 'h1'),
        author: this.extractText(scrapeResult.html, '.author-link'),
        authorId: this.extractAuthorId(scrapeResult.html),
        createdAt: this.extractPostDate(scrapeResult.html),
        content: this.extractPostContent(scrapeResult.html),
        upvotes: this.extractUpvotes(scrapeResult.html),
        upvoteRatio: this.extractUpvoteRatio(scrapeResult.html),
        commentCount: this.extractCommentCount(scrapeResult.html),
        flair: this.extractFlair(scrapeResult.html),
        awards: this.extractAwards(scrapeResult.html),
        images: this.extractImages(scrapeResult.html),
        comments: this.extractComments(scrapeResult.html),
        url: scrapeResult.url,
        scrapedAt: new Date().toISOString(),
      };

      return postData;
    } catch (error) {
      console.error('❌ Fout bij verwerken van post resultaat:', error);
      throw error;
    }
  }

  /**
   * Verwerk de resultaten van een gebruiker scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte gebruiker gegevens
   */
  processUserResult(scrapeResult) {
    try {
      if (!scrapeResult || !scrapeResult.html) {
        throw new Error('Geen geldig scrape resultaat');
      }

      // Extractie van gebruiker gegevens
      const userData = {
        username: this.extractUsername(scrapeResult.url),
        karma: this.extractKarma(scrapeResult.html),
        accountAge: this.extractAccountAge(scrapeResult.html),
        posts: this.extractUserPosts(scrapeResult.html),
        trophies: this.extractTrophies(scrapeResult.html),
        url: scrapeResult.url,
        scrapedAt: new Date().toISOString(),
      };

      return userData;
    } catch (error) {
      console.error('❌ Fout bij verwerken van gebruiker resultaat:', error);
      throw error;
    }
  }

  /**
   * Verwerk de resultaten van een scrape job
   * @param {Object} job - Job object
   * @param {Array} results - Resultaten van de scrape
   * @returns {Promise<Object>} - Verwerkte resultaten
   */
  async processJobResults(job, results) {
    try {
      const processedResults = [];

      // Verwerk resultaten op basis van job type
      for (const result of results) {
        let processedResult;

        if (job.job_type === 'subreddit') {
          processedResult = this.processSubredditResult(result);
        } else if (job.job_type === 'post') {
          processedResult = this.processPostResult(result);
        } else if (job.job_type === 'user') {
          processedResult = this.processUserResult(result);
        } else {
          throw new Error(`Onbekend job type: ${job.job_type}`);
        }

        processedResults.push({
          url: result.url,
          data: processedResult,
        });
      }

      // Sla resultaten op in storage
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${job.job_type}-results-${timestamp}.json`;

      await uploadJsonDataset(
        job.project_id,
        this.platform,
        job.id,
        { results: processedResults },
        fileName,
      );

      return processedResults;
    } catch (error) {
      console.error(`❌ Fout bij verwerken van job resultaten voor job ${job.id}:`, error);
      throw error;
    }
  }

  /**
   * Genereer URLs voor een subreddit met paginering
   * @param {String} subreddit - Naam van de subreddit
   * @param {Number} pages - Aantal pagina's om te genereren
   * @param {String} sort - Sortering (hot, new, top, rising)
   * @param {String} timeframe - Tijdsperiode voor 'top' sortering (hour, day, week, month, year, all)
   * @returns {Array<String>} - Array van URLs
   */
  generateSubredditUrls(subreddit, pages = 1, sort = 'hot', timeframe = 'all') {
    const urls = [];
    const baseUrl = `https://www.reddit.com/r/${subreddit}/${sort}`;

    // Voeg timeframe toe voor 'top' sortering
    const sortUrl = sort === 'top' ? `${baseUrl}/?t=${timeframe}` : baseUrl;

    // Eerste pagina zonder after parameter
    urls.push(sortUrl);

    // Overige pagina's met dummy after parameter
    // In werkelijkheid zou je de echte 'after' parameter moeten extraheren uit de vorige pagina
    for (let i = 1; i < pages; i++) {
      const afterParam = `dummy_after_param_${i}`;
      urls.push(`${sortUrl}/?after=${afterParam}`);
    }

    return urls;
  }

  /**
   * Genereer URLs voor een zoekquery op Reddit
   * @param {String} query - Zoekterm
   * @param {String} subreddit - Optionele subreddit om in te zoeken
   * @param {Number} pages - Aantal pagina's om te genereren
   * @param {String} sort - Sortering (relevance, hot, new, top)
   * @param {String} timeframe - Tijdsperiode voor 'top' sortering (hour, day, week, month, year, all)
   * @returns {Array<String>} - Array van URLs
   */
  generateSearchUrls(query, subreddit = null, pages = 1, sort = 'relevance', timeframe = 'all') {
    const urls = [];
    const baseUrl = subreddit
      ? `https://www.reddit.com/r/${subreddit}/search`
      : 'https://www.reddit.com/search';

    // Bouw query parameters
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('sort', sort);

    if (sort === 'top') {
      params.append('t', timeframe);
    }

    // Eerste pagina
    urls.push(`${baseUrl}?${params.toString()}`);

    // Overige pagina's met dummy after parameter
    for (let i = 1; i < pages; i++) {
      const afterParam = `dummy_after_param_${i}`;
      params.append('after', afterParam);
      urls.push(`${baseUrl}?${params.toString()}`);
    }

    return urls;
  }

  // Helper functies voor het extraheren van gegevens uit HTML

  /**
   * Extraheer tekst uit HTML met een selector
   * @param {String} html - HTML string
   * @param {String} selector - CSS selector
   * @returns {String} - Geëxtraheerde tekst
   */
  extractText(html, selector) {
    // Mock implementatie
    return `Extracted text from ${selector}`;
  }

  /**
   * Extraheer subreddit naam uit URL
   * @param {String} url - Subreddit URL
   * @returns {String} - Geëxtraheerde subreddit naam
   */
  extractSubredditName(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;
      const match = pathname.match(/\/r\/([\w-]+)/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer posts uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Geëxtraheerde posts
   */
  extractPosts(html) {
    // Mock implementatie
    return [
      {
        title: 'Post title 1',
        url: 'https://www.reddit.com/r/subreddit/comments/abc123/post_title_1/',
        author: 'user1',
        upvotes: 123,
        commentCount: 45,
        createdAt: '2023-01-15T12:30:45Z',
        flair: 'Discussion',
      },
      {
        title: 'Post title 2',
        url: 'https://www.reddit.com/r/subreddit/comments/def456/post_title_2/',
        author: 'user2',
        upvotes: 456,
        commentCount: 78,
        createdAt: '2023-01-14T10:20:30Z',
        flair: 'News',
      },
    ];
  }

  /**
   * Extraheer subscribers uit HTML
   * @param {String} html - HTML string
   * @returns {Number} - Aantal subscribers
   */
  extractSubscribers(html) {
    // Mock implementatie
    return 123456;
  }

  /**
   * Extraheer subreddit beschrijving uit HTML
   * @param {String} html - HTML string
   * @returns {String} - Subreddit beschrijving
   */
  extractSubredditDescription(html) {
    // Mock implementatie
    return 'This is a subreddit description';
  }

  /**
   * Extraheer subreddit regels uit HTML
   * @param {String} html - HTML string
   * @returns {Array<String>} - Subreddit regels
   */
  extractSubredditRules(html) {
    // Mock implementatie
    return [
      'Rule 1: Be respectful',
      'Rule 2: No spam',
      'Rule 3: Use proper formatting',
    ];
  }

  /**
   * Extraheer moderators uit HTML
   * @param {String} html - HTML string
   * @returns {Array<String>} - Moderator gebruikersnamen
   */
  extractModerators(html) {
    // Mock implementatie
    return ['mod1', 'mod2', 'mod3'];
  }

  /**
   * Extraheer paginering uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Paginering informatie
   */
  extractPagination(html) {
    // Mock implementatie
    return {
      hasNext: true,
      nextUrl: 'https://www.reddit.com/r/subreddit/?after=t3_abc123',
      count: 25,
    };
  }

  /**
   * Extraheer post ID uit URL
   * @param {String} url - Post URL
   * @returns {String} - Post ID
   */
  extractPostId(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;
      const match = pathname.match(/\/comments\/([\w-]+)/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer subreddit naam uit post URL
   * @param {String} url - Post URL
   * @returns {String} - Subreddit naam
   */
  extractSubredditFromPostUrl(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;
      const match = pathname.match(/\/r\/([\w-]+)/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer author ID uit HTML
   * @param {String} html - HTML string
   * @returns {String} - Author ID
   */
  extractAuthorId(html) {
    // Mock implementatie
    return 'u12345';
  }

  /**
   * Extraheer post datum uit HTML
   * @param {String} html - HTML string
   * @returns {String} - Post datum in ISO formaat
   */
  extractPostDate(html) {
    // Mock implementatie
    return '2023-01-15T12:30:45Z';
  }

  /**
   * Extraheer post content uit HTML
   * @param {String} html - HTML string
   * @returns {String} - Post content
   */
  extractPostContent(html) {
    // Mock implementatie
    return 'This is the content of the post';
  }

  /**
   * Extraheer upvotes uit HTML
   * @param {String} html - HTML string
   * @returns {Number} - Aantal upvotes
   */
  extractUpvotes(html) {
    // Mock implementatie
    return 789;
  }

  /**
   * Extraheer upvote ratio uit HTML
   * @param {String} html - HTML string
   * @returns {Number} - Upvote ratio (0-1)
   */
  extractUpvoteRatio(html) {
    // Mock implementatie
    return 0.92;
  }

  /**
   * Extraheer comment count uit HTML
   * @param {String} html - HTML string
   * @returns {Number} - Aantal comments
   */
  extractCommentCount(html) {
    // Mock implementatie
    return 123;
  }

  /**
   * Extraheer flair uit HTML
   * @param {String} html - HTML string
   * @returns {String} - Flair tekst
   */
  extractFlair(html) {
    // Mock implementatie
    return 'Discussion';
  }

  /**
   * Extraheer awards uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Awards
   */
  extractAwards(html) {
    // Mock implementatie
    return [
      { name: 'Silver', count: 2 },
      { name: 'Gold', count: 1 },
      { name: 'Helpful', count: 3 },
    ];
  }

  /**
   * Extraheer afbeeldingen uit HTML
   * @param {String} html - HTML string
   * @returns {Array<String>} - Afbeelding URLs
   */
  extractImages(html) {
    // Mock implementatie
    return [
      'https://i.redd.it/image1.jpg',
      'https://i.redd.it/image2.jpg',
    ];
  }

  /**
   * Extraheer comments uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Comments
   */
  extractComments(html) {
    // Mock implementatie
    return [
      {
        id: 'comment1',
        author: 'user3',
        content: 'This is a comment',
        upvotes: 45,
        createdAt: '2023-01-15T13:45:30Z',
        replies: [
          {
            id: 'comment2',
            author: 'user4',
            content: 'This is a reply',
            upvotes: 12,
            createdAt: '2023-01-15T14:00:15Z',
            replies: [],
          },
        ],
      },
      {
        id: 'comment3',
        author: 'user5',
        content: 'Another comment',
        upvotes: 23,
        createdAt: '2023-01-15T15:20:10Z',
        replies: [],
      },
    ];
  }

  /**
   * Extraheer username uit URL
   * @param {String} url - User URL
   * @returns {String} - Username
   */
  extractUsername(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;
      const match = pathname.match(/\/user\/([\w-]+)/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer karma uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Karma object met post en comment karma
   */
  extractKarma(html) {
    // Mock implementatie
    return {
      post: 12345,
      comment: 6789,
    };
  }

  /**
   * Extraheer account leeftijd uit HTML
   * @param {String} html - HTML string
   * @returns {String} - Account leeftijd
   */
  extractAccountAge(html) {
    // Mock implementatie
    return '3 years';
  }

  /**
   * Extraheer user posts uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - User posts
   */
  extractUserPosts(html) {
    // Mock implementatie
    return [
      {
        title: 'User post 1',
        url: 'https://www.reddit.com/r/subreddit/comments/ghi789/user_post_1/',
        subreddit: 'subreddit',
        upvotes: 78,
        commentCount: 23,
        createdAt: '2023-01-10T09:15:30Z',
      },
      {
        title: 'User post 2',
        url: 'https://www.reddit.com/r/anothersubreddit/comments/jkl012/user_post_2/',
        subreddit: 'anothersubreddit',
        upvotes: 45,
        commentCount: 12,
        createdAt: '2023-01-05T14:25:10Z',
      },
    ];
  }

  /**
   * Extraheer trophies uit HTML
   * @param {String} html - HTML string
   * @returns {Array<String>} - Trophies
   */
  extractTrophies(html) {
    // Mock implementatie
    return [
      'Verified Email',
      '5-Year Club',
      'Best Comment',
    ];
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de RedditScraper
 * @returns {RedditScraper} - RedditScraper instance
 */
const getRedditScraper = () => {
  if (!instance) {
    instance = new RedditScraper();
  }
  return instance;
};

module.exports = {
  getRedditScraper,
};
