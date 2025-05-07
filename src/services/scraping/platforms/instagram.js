/**
 * Instagram Scraper
 *
 * Dit bestand bevat de scraper voor Instagram content.
 * Het gebruikt de Decodo API wrapper om Instagram pagina's te scrapen en
 * posts, comments en andere gegevens te extraheren.
 */

const { getDecodoApiClient } = require('../decodo-api');
const { getJobQueueService } = require('../job-queue');

/**
 * Instagram Scraper klasse
 */
class InstagramScraper {
  constructor() {
    this.decodoClient = getDecodoApiClient();
    this.jobQueueService = getJobQueueService();
    this.platform = 'instagram';
  }

  /**
   * Maak een nieuwe scrape job aan voor Instagram hashtags
   * @param {String} projectId - ID van het project
   * @param {Array<String>} hashtagUrls - Array van hashtag URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createHashtagScrapeJob(projectId, hashtagUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateInstagramUrls(hashtagUrls, 'hashtag');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Instagram hashtag URLs gevonden');
      }

      // Standaard opties voor Instagram hashtag scraping
      const defaultOptions = {
        wait_for: 'article', // Wacht op posts element
        device_type: options.device_type || 'mobile', // Instagram werkt beter met mobile user-agent
        javascript: true,
        timeout: 60000, // Instagram kan langzaam laden
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor hashtag posts
        selectors: {
          posts: 'article',
          postImage: 'img',
          postVideo: 'video',
          postCaption: 'div[role="button"] + div',
          postLikes: 'section:first-of-type span',
          postComments: 'section:nth-of-type(2) span',
          postDate: 'time',
          postOwner: 'header a',
          pagination: 'a[href*="max_id"]',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'hashtag',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Instagram hashtag scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Instagram profielen
   * @param {String} projectId - ID van het project
   * @param {Array<String>} profileUrls - Array van profiel URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createProfileScrapeJob(projectId, profileUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateInstagramUrls(profileUrls, 'profile');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Instagram profiel URLs gevonden');
      }

      // Standaard opties voor Instagram profiel scraping
      const defaultOptions = {
        wait_for: 'header', // Wacht op profiel header element
        device_type: options.device_type || 'mobile', // Instagram werkt beter met mobile user-agent
        javascript: true,
        timeout: 60000, // Instagram kan langzaam laden
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor profiel gegevens
        selectors: {
          profileName: 'header h1, header h2',
          profileBio: 'header > div:nth-of-type(3) > div',
          profileStats: 'header ul li',
          profileFollowers: 'header ul li:nth-of-type(2)',
          profileFollowing: 'header ul li:nth-of-type(3)',
          profilePosts: 'header ul li:first-of-type',
          profileImage: 'header img',
          posts: 'article',
          postImage: 'img',
          postVideo: 'video',
          pagination: 'a[href*="max_id"]',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'profile',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van Instagram profiel scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor Instagram posts
   * @param {String} projectId - ID van het project
   * @param {Array<String>} postUrls - Array van post URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createPostScrapeJob(projectId, postUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateInstagramUrls(postUrls, 'post');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige Instagram post URLs gevonden');
      }

      // Standaard opties voor Instagram post scraping
      const defaultOptions = {
        wait_for: 'article', // Wacht op post element
        device_type: options.device_type || 'mobile', // Instagram werkt beter met mobile user-agent
        javascript: true,
        timeout: 60000, // Instagram kan langzaam laden
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor post gegevens
        selectors: {
          postImage: 'article img',
          postVideo: 'article video',
          postCaption: 'article div[role="button"] + div',
          postLikes: 'article section:first-of-type span',
          postComments: 'article section:nth-of-type(2) span',
          postDate: 'article time',
          postOwner: 'article header a',
          comments: 'ul > li',
          commentText: 'span',
          commentOwner: 'a',
          commentDate: 'time',
          commentLikes: 'button span',
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
      console.error('❌ Fout bij aanmaken van Instagram post scrape job:', error);
      throw error;
    }
  }

  /**
   * Valideer Instagram URLs
   * @param {Array<String>} urls - Array van URLs om te valideren
   * @param {String} type - Type URL (hashtag, profile, post)
   * @returns {Array<String>} - Array van geldige URLs
   */
  validateInstagramUrls(urls, type = 'hashtag') {
    if (!Array.isArray(urls)) {
      return [];
    }

    return urls.filter((url) => {
      try {
        // Controleer of het een geldige URL is
        const urlObj = new URL(url);

        // Controleer of het een Instagram domein is
        const isInstagramDomain = urlObj.hostname === 'www.instagram.com'
                                 || urlObj.hostname === 'instagram.com';

        if (!isInstagramDomain) {
          return false;
        }

        // Controleer het type URL
        const { pathname } = urlObj;

        switch (type) {
          case 'hashtag':
            return pathname.startsWith('/explore/tags/');
          case 'profile':
            // Profielen hebben geen /p/ of /explore/ in het pad
            return !pathname.includes('/p/')
                   && !pathname.includes('/explore/')
                   && pathname.length > 1;
          case 'post':
            return pathname.includes('/p/');
          default:
            return false;
        }
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Verwerk de resultaten van een Instagram hashtag scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte hashtag gegevens
   */
  processHashtagResult(scrapeResult) {
    try {
      const { url, html } = scrapeResult;

      if (!html) {
        throw new Error('Geen HTML gevonden in scrape resultaat');
      }

      // Extraheer hashtag uit URL
      const hashtag = this.extractHashtagFromUrl(url);

      // Extraheer posts uit HTML
      const posts = this.extractPosts(html);

      // Extraheer paginering
      const pagination = this.extractPagination(html);

      return {
        hashtag,
        url,
        posts,
        pagination,
        post_count: posts.length,
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van Instagram hashtag resultaat:', error);
      return {
        url: scrapeResult.url,
        error: error.message,
        scraped_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Verwerk de resultaten van een Instagram profiel scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte profiel gegevens
   */
  processProfileResult(scrapeResult) {
    try {
      const { url, html } = scrapeResult;

      if (!html) {
        throw new Error('Geen HTML gevonden in scrape resultaat');
      }

      // Extraheer username uit URL
      const username = this.extractUsernameFromUrl(url);

      // Extraheer profiel gegevens uit HTML
      const profileData = this.extractProfileData(html);

      // Extraheer posts uit HTML
      const posts = this.extractPosts(html);

      // Extraheer paginering
      const pagination = this.extractPagination(html);

      return {
        username,
        url,
        profile: profileData,
        posts,
        pagination,
        post_count: posts.length,
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van Instagram profiel resultaat:', error);
      return {
        url: scrapeResult.url,
        error: error.message,
        scraped_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Verwerk de resultaten van een Instagram post scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte post gegevens
   */
  processPostResult(scrapeResult) {
    try {
      const { url, html } = scrapeResult;

      if (!html) {
        throw new Error('Geen HTML gevonden in scrape resultaat');
      }

      // Extraheer post ID uit URL
      const postId = this.extractPostIdFromUrl(url);

      // Extraheer post gegevens uit HTML
      const postData = this.extractPostData(html);

      // Extraheer comments uit HTML
      const comments = this.extractComments(html);

      return {
        post_id: postId,
        url,
        post: postData,
        comments,
        comment_count: comments.length,
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van Instagram post resultaat:', error);
      return {
        url: scrapeResult.url,
        error: error.message,
        scraped_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Extraheer hashtag uit URL
   * @param {String} url - Hashtag URL
   * @returns {String} - Geëxtraheerde hashtag
   */
  extractHashtagFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;

      // Extraheer hashtag uit /explore/tags/[hashtag]
      const match = pathname.match(/\/explore\/tags\/([^/]+)/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer username uit URL
   * @param {String} url - Profiel URL
   * @returns {String} - Geëxtraheerde username
   */
  extractUsernameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;

      // Extraheer username uit /[username]
      // Verwijder de eerste slash en eventuele query parameters
      const username = pathname.substring(1).split('/')[0];

      if (username && username !== 'explore' && username !== 'p') {
        return username;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer post ID uit URL
   * @param {String} url - Post URL
   * @returns {String} - Geëxtraheerde post ID
   */
  extractPostIdFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;

      // Extraheer post ID uit /p/[postId]
      const match = pathname.match(/\/p\/([^/]+)/);

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
    // In een echte implementatie zou je hier de posts uit de HTML extraheren
    // met behulp van een HTML parser zoals cheerio of JSDOM

    // Voor nu gebruiken we een mock implementatie
    return [
      {
        id: 'CpQnX8XMZ1Y',
        type: 'image',
        url: 'https://www.instagram.com/p/CpQnX8XMZ1Y/',
        image_url: 'https://scontent.cdninstagram.com/v/t51.2885-15/image1.jpg',
        caption: 'Beautiful sunset at the beach #sunset #beach #nature',
        likes_count: 1234,
        comments_count: 56,
        owner: {
          username: 'nature_lover',
          profile_url: 'https://www.instagram.com/nature_lover/',
        },
        posted_at: '2023-03-01T18:45:30Z',
        hashtags: ['sunset', 'beach', 'nature'],
        mentions: [],
      },
      {
        id: 'CpRt7JnMq2Z',
        type: 'video',
        url: 'https://www.instagram.com/p/CpRt7JnMq2Z/',
        video_url: 'https://scontent.cdninstagram.com/v/t51.2885-15/video1.mp4',
        thumbnail_url: 'https://scontent.cdninstagram.com/v/t51.2885-15/thumbnail1.jpg',
        caption: 'Check out this amazing drone footage! #drone #travel #adventure',
        likes_count: 2345,
        comments_count: 78,
        owner: {
          username: 'travel_adventures',
          profile_url: 'https://www.instagram.com/travel_adventures/',
        },
        posted_at: '2023-03-02T12:30:15Z',
        hashtags: ['drone', 'travel', 'adventure'],
        mentions: ['@dronepilot'],
      },
      {
        id: 'CpTw9KlMo3X',
        type: 'carousel',
        url: 'https://www.instagram.com/p/CpTw9KlMo3X/',
        images: [
          'https://scontent.cdninstagram.com/v/t51.2885-15/carousel1.jpg',
          'https://scontent.cdninstagram.com/v/t51.2885-15/carousel2.jpg',
          'https://scontent.cdninstagram.com/v/t51.2885-15/carousel3.jpg',
        ],
        caption: 'Highlights from our trip to Italy 🇮🇹 #italy #travel #food #architecture',
        likes_count: 3456,
        comments_count: 123,
        owner: {
          username: 'wanderlust_couple',
          profile_url: 'https://www.instagram.com/wanderlust_couple/',
        },
        posted_at: '2023-03-03T09:15:45Z',
        hashtags: ['italy', 'travel', 'food', 'architecture'],
        mentions: ['@italytourism'],
      },
    ];
  }

  /**
   * Extraheer profiel gegevens uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde profiel gegevens
   */
  extractProfileData(html) {
    // In een echte implementatie zou je hier de profiel gegevens uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return {
      username: 'nature_lover',
      full_name: 'Nature Photography',
      bio: 'Capturing the beauty of nature 📸 | Professional photographer | Available for bookings',
      website: 'https://naturephotography.com',
      followers_count: 12345,
      following_count: 567,
      posts_count: 234,
      is_private: false,
      is_verified: true,
      profile_image_url: 'https://scontent.cdninstagram.com/v/t51.2885-19/profile.jpg',
    };
  }

  /**
   * Extraheer post gegevens uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde post gegevens
   */
  extractPostData(html) {
    // In een echte implementatie zou je hier de post gegevens uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return {
      id: 'CpQnX8XMZ1Y',
      type: 'image',
      url: 'https://www.instagram.com/p/CpQnX8XMZ1Y/',
      image_url: 'https://scontent.cdninstagram.com/v/t51.2885-15/image1.jpg',
      caption: 'Beautiful sunset at the beach #sunset #beach #nature',
      likes_count: 1234,
      comments_count: 56,
      owner: {
        username: 'nature_lover',
        profile_url: 'https://www.instagram.com/nature_lover/',
      },
      posted_at: '2023-03-01T18:45:30Z',
      hashtags: ['sunset', 'beach', 'nature'],
      mentions: [],
      location: {
        name: 'Malibu Beach',
        id: '12345678',
      },
    };
  }

  /**
   * Extraheer comments uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Geëxtraheerde comments
   */
  extractComments(html) {
    // In een echte implementatie zou je hier de comments uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return [
      {
        id: 'comment1',
        text: 'Wow, this is beautiful! 😍',
        owner: {
          username: 'beach_lover',
          profile_url: 'https://www.instagram.com/beach_lover/',
        },
        posted_at: '2023-03-01T19:00:15Z',
        likes_count: 12,
        mentions: [],
        hashtags: [],
      },
      {
        id: 'comment2',
        text: 'I was there last week! @travel_buddy check this out #travelgoals',
        owner: {
          username: 'adventure_seeker',
          profile_url: 'https://www.instagram.com/adventure_seeker/',
        },
        posted_at: '2023-03-01T19:15:30Z',
        likes_count: 5,
        mentions: ['travel_buddy'],
        hashtags: ['travelgoals'],
      },
      {
        id: 'comment3',
        text: 'The colors are amazing!',
        owner: {
          username: 'photography_enthusiast',
          profile_url: 'https://www.instagram.com/photography_enthusiast/',
        },
        posted_at: '2023-03-01T20:30:45Z',
        likes_count: 3,
        mentions: [],
        hashtags: [],
      },
    ];
  }

  /**
   * Extraheer paginering uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde paginering
   */
  extractPagination(html) {
    // In een echte implementatie zou je hier de paginering uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return {
      has_next_page: true,
      end_cursor: 'QVFCX3VyZW1fNjM5MDIyNzE2MjgxNjk4NzlfMTIzNDU2Nzg5MA==',
      next_url: 'https://www.instagram.com/explore/tags/nature/?max_id=QVFCX3VyZW1fNjM5MDIyNzE2MjgxNjk4NzlfMTIzNDU2Nzg5MA==',
    };
  }

  /**
   * Genereer hashtag URLs met paginering
   * @param {String} hashtag - Hashtag om te zoeken (zonder #)
   * @param {Number} pages - Aantal pagina's om te genereren
   * @returns {Array<String>} - Array van hashtag URLs
   */
  generateHashtagUrls(hashtag, pages = 1) {
    const urls = [];

    // Verwijder # als die aanwezig is
    const cleanHashtag = hashtag.replace(/^#/, '');

    // Basis URL voor hashtag
    const baseUrl = `https://www.instagram.com/explore/tags/${cleanHashtag}/`;
    urls.push(baseUrl);

    // Voor Instagram is het moeilijk om paginering URLs vooraf te genereren
    // omdat ze dynamisch worden gegenereerd op basis van de response
    // In een echte implementatie zou je de paginering moeten volgen uit de response

    // Voor nu simuleren we dit met dummy cursors
    for (let i = 1; i < pages; i++) {
      const dummyCursor = Buffer.from(`pagination_cursor_${i}`).toString('base64');
      urls.push(`${baseUrl}?max_id=${dummyCursor}`);
    }

    return urls;
  }

  /**
   * Genereer URLs voor meerdere hashtags
   * @param {Array<String>} hashtags - Array van hashtags om te zoeken (zonder #)
   * @param {Number} pagesPerHashtag - Aantal pagina's per hashtag
   * @returns {Array<String>} - Array van hashtag URLs
   */
  generateMultiHashtagUrls(hashtags, pagesPerHashtag = 1) {
    let urls = [];

    for (const hashtag of hashtags) {
      const hashtagUrls = this.generateHashtagUrls(hashtag, pagesPerHashtag);
      urls = [...urls, ...hashtagUrls];
    }

    return urls;
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de InstagramScraper
 * @returns {InstagramScraper} - InstagramScraper instance
 */
const getInstagramScraper = () => {
  if (!instance) {
    instance = new InstagramScraper();
  }
  return instance;
};

module.exports = {
  getInstagramScraper,
};
