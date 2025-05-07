/**
 * TikTok Scraper
 *
 * Dit bestand bevat de scraper voor TikTok content.
 * Het gebruikt de Decodo API wrapper om TikTok pagina's te scrapen en
 * videos, comments en andere gegevens te extraheren.
 */

const { getDecodoApiClient } = require('../decodo-api');
const { getJobQueueService } = require('../job-queue');

/**
 * TikTok Scraper klasse
 */
class TikTokScraper {
  constructor() {
    this.decodoClient = getDecodoApiClient();
    this.jobQueueService = getJobQueueService();
    this.platform = 'tiktok';
  }

  /**
   * Maak een nieuwe scrape job aan voor TikTok hashtags
   * @param {String} projectId - ID van het project
   * @param {Array<String>} hashtagUrls - Array van hashtag URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createHashtagScrapeJob(projectId, hashtagUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateTikTokUrls(hashtagUrls, 'hashtag');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige TikTok hashtag URLs gevonden');
      }

      // Standaard opties voor TikTok hashtag scraping
      const defaultOptions = {
        wait_for: '.video-feed-item', // Wacht op videos element
        device_type: options.device_type || 'mobile', // TikTok werkt beter met mobile user-agent
        javascript: true,
        timeout: 60000, // TikTok kan langzaam laden
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor hashtag videos
        selectors: {
          videos: '.video-feed-item',
          videoThumb: '.video-feed-item img',
          videoStats: '.video-feed-item .item-stats',
          videoLikes: '.video-feed-item .like-count',
          videoComments: '.video-feed-item .comment-count',
          videoShares: '.video-feed-item .share-count',
          videoCaption: '.video-feed-item .video-caption',
          videoOwner: '.video-feed-item .author-uniqueId',
          pagination: '.pagination-button',
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
      console.error('❌ Fout bij aanmaken van TikTok hashtag scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor TikTok profielen
   * @param {String} projectId - ID van het project
   * @param {Array<String>} profileUrls - Array van profiel URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createProfileScrapeJob(projectId, profileUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateTikTokUrls(profileUrls, 'profile');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige TikTok profiel URLs gevonden');
      }

      // Standaard opties voor TikTok profiel scraping
      const defaultOptions = {
        wait_for: '.user-profile-header', // Wacht op profiel header element
        device_type: options.device_type || 'mobile', // TikTok werkt beter met mobile user-agent
        javascript: true,
        timeout: 60000, // TikTok kan langzaam laden
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor profiel gegevens
        selectors: {
          profileName: '.user-profile-header .user-title',
          profileBio: '.user-profile-header .user-bio',
          profileStats: '.user-profile-header .count-infos',
          profileFollowers: '.user-profile-header .followers .count-info',
          profileFollowing: '.user-profile-header .following .count-info',
          profileLikes: '.user-profile-header .likes .count-info',
          profileImage: '.user-profile-header .avatar',
          videos: '.video-feed-item',
          videoThumb: '.video-feed-item img',
          videoStats: '.video-feed-item .item-stats',
          pagination: '.pagination-button',
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
      console.error('❌ Fout bij aanmaken van TikTok profiel scrape job:', error);
      throw error;
    }
  }

  /**
   * Maak een nieuwe scrape job aan voor TikTok videos
   * @param {String} projectId - ID van het project
   * @param {Array<String>} videoUrls - Array van video URLs
   * @param {Object} options - Scrape opties
   * @returns {Promise<Object>} - Nieuwe job
   */
  async createVideoScrapeJob(projectId, videoUrls, options = {}) {
    try {
      // Valideer URLs
      const validUrls = this.validateTikTokUrls(videoUrls, 'video');

      if (validUrls.length === 0) {
        throw new Error('Geen geldige TikTok video URLs gevonden');
      }

      // Standaard opties voor TikTok video scraping
      const defaultOptions = {
        wait_for: '.video-player', // Wacht op video element
        device_type: options.device_type || 'mobile', // TikTok werkt beter met mobile user-agent
        javascript: true,
        timeout: 60000, // TikTok kan langzaam laden
        screenshot: false,
        html: true,
        // Voeg custom selectors toe voor video gegevens
        selectors: {
          videoPlayer: '.video-player',
          videoSource: '.video-player video',
          videoCaption: '.video-caption',
          videoLikes: '.like-count',
          videoComments: '.comment-count',
          videoShares: '.share-count',
          videoOwner: '.author-uniqueId',
          comments: '.comment-item',
          commentText: '.comment-text',
          commentOwner: '.comment-username',
          commentDate: '.comment-time',
          commentLikes: '.comment-like-count',
        },
      };

      // Combineer standaard opties met aangepaste opties
      const scrapeOptions = { ...defaultOptions, ...options };

      // Maak job aan
      const jobData = {
        project_id: projectId,
        platform: this.platform,
        job_type: 'video',
        config: {
          urls: validUrls,
          options: scrapeOptions,
        },
        priority: options.priority || 'medium',
      };

      return await this.jobQueueService.createJob(jobData);
    } catch (error) {
      console.error('❌ Fout bij aanmaken van TikTok video scrape job:', error);
      throw error;
    }
  }

  /**
   * Valideer TikTok URLs
   * @param {Array<String>} urls - Array van URLs om te valideren
   * @param {String} type - Type URL (hashtag, profile, video)
   * @returns {Array<String>} - Array van geldige URLs
   */
  validateTikTokUrls(urls, type = 'hashtag') {
    if (!Array.isArray(urls)) {
      return [];
    }

    return urls.filter((url) => {
      try {
        // Controleer of het een geldige URL is
        const urlObj = new URL(url);

        // Controleer of het een TikTok domein is
        const isTikTokDomain = urlObj.hostname === 'www.tiktok.com'
                              || urlObj.hostname === 'tiktok.com'
                              || urlObj.hostname === 'm.tiktok.com';

        if (!isTikTokDomain) {
          return false;
        }

        // Controleer het type URL
        const { pathname } = urlObj;

        switch (type) {
          case 'hashtag':
            return pathname.startsWith('/tag/') || pathname.startsWith('/discover/tag/');
          case 'profile':
            // Profielen beginnen met @ en hebben geen /video/ in het pad
            return pathname.startsWith('/@') && !pathname.includes('/video/');
          case 'video':
            return pathname.includes('/video/');
          default:
            return false;
        }
      } catch (error) {
        return false;
      }
    });
  }

  /**
   * Verwerk de resultaten van een TikTok hashtag scrape
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

      // Extraheer videos uit HTML
      const videos = this.extractVideos(html);

      // Extraheer hashtag stats
      const stats = this.extractHashtagStats(html);

      // Extraheer paginering
      const pagination = this.extractPagination(html);

      return {
        hashtag,
        url,
        stats,
        videos,
        pagination,
        video_count: videos.length,
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van TikTok hashtag resultaat:', error);
      return {
        url: scrapeResult.url,
        error: error.message,
        scraped_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Verwerk de resultaten van een TikTok profiel scrape
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

      // Extraheer videos uit HTML
      const videos = this.extractVideos(html);

      // Extraheer paginering
      const pagination = this.extractPagination(html);

      return {
        username,
        url,
        profile: profileData,
        videos,
        pagination,
        video_count: videos.length,
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van TikTok profiel resultaat:', error);
      return {
        url: scrapeResult.url,
        error: error.message,
        scraped_at: new Date().toISOString(),
      };
    }
  }

  /**
   * Verwerk de resultaten van een TikTok video scrape
   * @param {Object} scrapeResult - Resultaat van de scrape
   * @returns {Object} - Verwerkte video gegevens
   */
  processVideoResult(scrapeResult) {
    try {
      const { url, html } = scrapeResult;

      if (!html) {
        throw new Error('Geen HTML gevonden in scrape resultaat');
      }

      // Extraheer video ID uit URL
      const videoId = this.extractVideoIdFromUrl(url);

      // Extraheer video gegevens uit HTML
      const videoData = this.extractVideoData(html);

      // Extraheer comments uit HTML
      const comments = this.extractComments(html);

      return {
        video_id: videoId,
        url,
        video: videoData,
        comments,
        comment_count: comments.length,
        scraped_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Fout bij verwerken van TikTok video resultaat:', error);
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

      // Extraheer hashtag uit /tag/[hashtag] of /discover/tag/[hashtag]
      const match = pathname.match(/\/(?:discover\/)?tag\/([^/]+)/);

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

      // Extraheer username uit /@[username]
      const match = pathname.match(/\/@([^/]+)/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer video ID uit URL
   * @param {String} url - Video URL
   * @returns {String} - Geëxtraheerde video ID
   */
  extractVideoIdFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const { pathname } = urlObj;

      // Extraheer video ID uit /video/[videoId]
      const match = pathname.match(/\/video\/([^/]+)/);

      if (match && match[1]) {
        return match[1];
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extraheer videos uit HTML
   * @param {String} html - HTML string
   * @returns {Array<Object>} - Geëxtraheerde videos
   */
  extractVideos(html) {
    // In een echte implementatie zou je hier de videos uit de HTML extraheren
    // met behulp van een HTML parser zoals cheerio of JSDOM

    // Voor nu gebruiken we een mock implementatie
    return [
      {
        id: '7123456789012345678',
        url: 'https://www.tiktok.com/@username/video/7123456789012345678',
        thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/thumbnail1.jpg',
        caption: 'Check out this cool trick! #trick #tutorial #howto',
        likes_count: 12345,
        comments_count: 678,
        shares_count: 234,
        views_count: 98765,
        owner: {
          username: 'username',
          profile_url: 'https://www.tiktok.com/@username',
        },
        posted_at: '2023-03-01T18:45:30Z',
        hashtags: ['trick', 'tutorial', 'howto'],
        mentions: [],
        duration: 30,
      },
      {
        id: '7123456789012345679',
        url: 'https://www.tiktok.com/@another_user/video/7123456789012345679',
        thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/thumbnail2.jpg',
        caption: 'Dancing to the latest trend 💃 #dance #trending #viral',
        likes_count: 23456,
        comments_count: 789,
        shares_count: 345,
        views_count: 123456,
        owner: {
          username: 'another_user',
          profile_url: 'https://www.tiktok.com/@another_user',
        },
        posted_at: '2023-03-02T12:30:15Z',
        hashtags: ['dance', 'trending', 'viral'],
        mentions: ['@friend'],
        duration: 15,
      },
      {
        id: '7123456789012345680',
        url: 'https://www.tiktok.com/@third_user/video/7123456789012345680',
        thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/thumbnail3.jpg',
        caption: 'My cat doing funny things 😂 #cat #funny #pets',
        likes_count: 34567,
        comments_count: 890,
        shares_count: 456,
        views_count: 234567,
        owner: {
          username: 'third_user',
          profile_url: 'https://www.tiktok.com/@third_user',
        },
        posted_at: '2023-03-03T09:15:45Z',
        hashtags: ['cat', 'funny', 'pets'],
        mentions: [],
        duration: 20,
      },
    ];
  }

  /**
   * Extraheer hashtag stats uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde hashtag stats
   */
  extractHashtagStats(html) {
    // In een echte implementatie zou je hier de hashtag stats uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return {
      views_count: 1234567890,
      videos_count: 98765,
      related_hashtags: ['similar', 'related', 'popular'],
    };
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
      username: 'username',
      nickname: 'User Name',
      bio: 'Creating fun content | Follow for daily videos | Business: email@example.com',
      followers_count: 123456,
      following_count: 567,
      likes_count: 2345678,
      videos_count: 234,
      is_verified: true,
      profile_image_url: 'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/profile.jpg',
    };
  }

  /**
   * Extraheer video gegevens uit HTML
   * @param {String} html - HTML string
   * @returns {Object} - Geëxtraheerde video gegevens
   */
  extractVideoData(html) {
    // In een echte implementatie zou je hier de video gegevens uit de HTML extraheren
    // met behulp van een HTML parser

    // Voor nu gebruiken we een mock implementatie
    return {
      id: '7123456789012345678',
      url: 'https://www.tiktok.com/@username/video/7123456789012345678',
      video_url: 'https://v16-webapp.tiktok.com/video.mp4',
      thumbnail_url: 'https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/thumbnail1.jpg',
      caption: 'Check out this cool trick! #trick #tutorial #howto',
      likes_count: 12345,
      comments_count: 678,
      shares_count: 234,
      views_count: 98765,
      owner: {
        username: 'username',
        nickname: 'User Name',
        profile_url: 'https://www.tiktok.com/@username',
        is_verified: true,
        profile_image_url: 'https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/profile.jpg',
      },
      posted_at: '2023-03-01T18:45:30Z',
      hashtags: ['trick', 'tutorial', 'howto'],
      mentions: [],
      music: {
        title: 'Original Sound - username',
        author: 'username',
        url: 'https://www.tiktok.com/music/Original-Sound-7123456789012345678',
      },
      duration: 30,
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
        text: 'This is amazing! 👏',
        owner: {
          username: 'commenter1',
          profile_url: 'https://www.tiktok.com/@commenter1',
        },
        posted_at: '2023-03-01T19:00:15Z',
        likes_count: 123,
        replies_count: 5,
        mentions: [],
        hashtags: [],
      },
      {
        id: 'comment2',
        text: 'How did you do that? @username #impressed',
        owner: {
          username: 'commenter2',
          profile_url: 'https://www.tiktok.com/@commenter2',
        },
        posted_at: '2023-03-01T19:15:30Z',
        likes_count: 45,
        replies_count: 2,
        mentions: ['username'],
        hashtags: ['impressed'],
      },
      {
        id: 'comment3',
        text: 'I tried this and it worked! Thanks for sharing',
        owner: {
          username: 'commenter3',
          profile_url: 'https://www.tiktok.com/@commenter3',
        },
        posted_at: '2023-03-01T20:30:45Z',
        likes_count: 67,
        replies_count: 0,
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
      has_more: true,
      cursor: '1234567890',
      next_url: 'https://www.tiktok.com/tag/hashtag?cursor=1234567890',
    };
  }

  /**
   * Genereer hashtag URLs
   * @param {String} hashtag - Hashtag om te zoeken (zonder #)
   * @returns {Array<String>} - Array van hashtag URLs
   */
  generateHashtagUrls(hashtag) {
    // Verwijder # als die aanwezig is
    const cleanHashtag = hashtag.replace(/^#/, '');

    // TikTok hashtag URL
    return [`https://www.tiktok.com/tag/${cleanHashtag}`];
  }

  /**
   * Genereer URLs voor meerdere hashtags
   * @param {Array<String>} hashtags - Array van hashtags om te zoeken (zonder #)
   * @returns {Array<String>} - Array van hashtag URLs
   */
  generateMultiHashtagUrls(hashtags) {
    let urls = [];

    for (const hashtag of hashtags) {
      const hashtagUrls = this.generateHashtagUrls(hashtag);
      urls = [...urls, ...hashtagUrls];
    }

    return urls;
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de TikTokScraper
 * @returns {TikTokScraper} - TikTokScraper instance
 */
const getTikTokScraper = () => {
  if (!instance) {
    instance = new TikTokScraper();
  }
  return instance;
};

module.exports = {
  getTikTokScraper,
};
