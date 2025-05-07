const ScraperHandler = require('./scraper');
const { getLogger } = require('../utils/logger');

const logger = getLogger('InstagramScraper');

/**
 * InstagramScraper - Implementeert scraping functionaliteit specifiek voor Instagram
 */
class InstagramScraper extends ScraperHandler {
  constructor() {
    super('instagram');
    this.isLoggedIn = false;
    this.credentials = null;
  }
  
  /**
   * Verwerkt een SQS bericht voor Instagram scraping
   * @param {Object} event - AWS Lambda event object
   */
  async handler(event) {
    return await this.handleMessage(event);
  }
  
  /**
   * Implementeert de Instagram-specifieke scraping logica
   * @param {Object} params - Scraping parameters
   * @param {String} params.type - Type content om te scrapen (hashtag, profile, location)
   * @param {String} params.query - Zoekopdracht (hashtag naam, profiel naam, etc.)
   * @param {Number} params.maxPosts - Maximum aantal posts om te scrapen
   * @param {Boolean} params.includeComments - Of comments moeten worden meegenomen
   * @param {Number} params.commentsPerPost - Maximum aantal comments per post
   * @param {Boolean} params.requireLogin - Of login vereist is (voor privé content)
   * @param {Object} params.credentials - Login credentials (indien requireLogin=true)
   * @returns {Promise<Object>} - Gescrapete data
   */
  async scrape(params = {}) {
    const {
      type = 'hashtag',
      query,
      maxPosts = 50,
      includeComments = false,
      commentsPerPost = 10,
      requireLogin = false,
      credentials = null
    } = params;
    
    if (!query) {
      throw new Error('Query parameter is vereist (hashtag, profiel naam, etc.)');
    }
    
    logger.info(`Scraping van Instagram ${type}: ${query}`);
    
    try {
      // Configureer de browser voor Instagram
      await this.configureForInstagram();
      
      // Login indien nodig
      if (requireLogin || includeComments) {
        if (!credentials && !process.env.INSTAGRAM_USERNAME) {
          throw new Error('Credentials zijn vereist voor login');
        }
        
        this.credentials = credentials || {
          username: process.env.INSTAGRAM_USERNAME,
          password: process.env.INSTAGRAM_PASSWORD
        };
        
        await this.login(this.credentials);
      }
      
      // Navigeer naar de juiste pagina op basis van type
      let targetUrl;
      
      switch (type) {
        case 'hashtag':
          targetUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(query)}/`;
          break;
        case 'profile':
          targetUrl = `https://www.instagram.com/${encodeURIComponent(query)}/`;
          break;
        case 'location':
          targetUrl = `https://www.instagram.com/explore/locations/${encodeURIComponent(query)}/`;
          break;
        default:
          throw new Error(`Ongeldig type: ${type}`);
      }
      
      // Navigeer naar de doelpagina
      await this.navigateToPage(targetUrl);
      
      // Verzamel metadata
      const metadata = await this.extractMetadata(type, query);
      
      // Verzamel posts
      const posts = await this.extractPosts(maxPosts, includeComments, commentsPerPost);
      
      // Return het resultaat
      return {
        type,
        query,
        scrapedAt: new Date().toISOString(),
        metadata,
        postsCount: posts.length,
        posts
      };
    } catch (error) {
      logger.error(`Fout bij scrapen van Instagram: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Configureert de browser specifiek voor Instagram scraping
   */
  async configureForInstagram() {
    logger.info('Browser configureren voor Instagram scraping');
    
    try {
      // Stel viewport in op mobiele afmetingen voor betere compatibiliteit
      await this.page.setViewport({
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
      });
      
      // Stel user agent in die minder verdacht is
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      
      // Stel extra headers in
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
      });
      
      // Schakel bepaalde resource types uit voor snellere laadtijden
      await this.page.setRequestInterception(true);
      this.page.on('request', (request) => {
        const resourceType = request.resourceType();
        if (['image', 'media', 'font'].includes(resourceType)) {
          request.abort();
        } else {
          request.continue();
        }
      });
      
      logger.info('Browser succesvol geconfigureerd voor Instagram scraping');
    } catch (error) {
      logger.error(`Fout bij configureren van browser: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Logt in op Instagram
   * @param {Object} credentials - Login credentials
   * @param {String} credentials.username - Instagram gebruikersnaam
   * @param {String} credentials.password - Instagram wachtwoord
   */
  async login(credentials) {
    if (this.isLoggedIn) {
      logger.info('Reeds ingelogd op Instagram');
      return;
    }
    
    logger.info(`Inloggen op Instagram als ${credentials.username}`);
    
    try {
      // Navigeer naar de Instagram login pagina
      await this.page.goto('https://www.instagram.com/accounts/login/', { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Wacht tot de login form geladen is
      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
      
      // Accepteer cookies indien nodig
      try {
        const cookieButton = await this.page.$x('//button[contains(text(), "Accept") or contains(text(), "Allow") or contains(text(), "Accepteren")]');
        if (cookieButton.length > 0) {
          await cookieButton[0].click();
          await this.page.waitForTimeout(2000);
        }
      } catch (e) {
        logger.warn('Geen cookie banner gevonden of kon niet worden geklikt');
      }
      
      // Vul gebruikersnaam in
      await this.page.type('input[name="username"]', credentials.username, { delay: 50 });
      
      // Vul wachtwoord in
      await this.page.type('input[name="password"]', credentials.password, { delay: 50 });
      
      // Klik op de login knop
      await this.page.click('button[type="submit"]');
      
      // Wacht tot de login voltooid is
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
      
      // Controleer of login succesvol was
      const url = this.page.url();
      
      if (url.includes('accounts/login') || url.includes('challenge')) {
        // Controleer op twee-factor authenticatie
        if (url.includes('challenge')) {
          throw new Error('Twee-factor authenticatie vereist, kan niet automatisch worden afgehandeld');
        }
        
        throw new Error('Login mislukt, controleer credentials');
      }
      
      // Sla "Save Login Info" dialoog over indien aanwezig
      try {
        const saveLoginButton = await this.page.$x('//button[contains(text(), "Not Now") or contains(text(), "Niet nu")]');
        if (saveLoginButton.length > 0) {
          await saveLoginButton[0].click();
          await this.page.waitForTimeout(2000);
        }
      } catch (e) {
        logger.warn('Geen "Save Login Info" dialoog gevonden of kon niet worden geklikt');
      }
      
      // Sla notificatie dialoog over indien aanwezig
      try {
        const notificationButton = await this.page.$x('//button[contains(text(), "Not Now") or contains(text(), "Niet nu")]');
        if (notificationButton.length > 0) {
          await notificationButton[0].click();
          await this.page.waitForTimeout(2000);
        }
      } catch (e) {
        logger.warn('Geen notificatie dialoog gevonden of kon niet worden geklikt');
      }
      
      this.isLoggedIn = true;
      logger.info('Succesvol ingelogd op Instagram');
    } catch (error) {
      logger.error(`Fout bij inloggen op Instagram: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Navigeert naar een specifieke Instagram pagina
   * @param {String} url - URL om naartoe te navigeren
   */
  async navigateToPage(url) {
    logger.info(`Navigeren naar pagina: ${url}`);
    
    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Controleer op fouten
      const isNotFound = await this.page.evaluate(() => {
        return document.body.innerText.includes('Sorry, this page isn\'t available') ||
               document.body.innerText.includes('Page Not Found');
      });
      
      if (isNotFound) {
        throw new Error(`Pagina niet gevonden: ${url}`);
      }
      
      // Wacht kort om content te laden
      await this.page.waitForTimeout(2000);
      
      logger.info('Succesvol genavigeerd naar pagina');
    } catch (error) {
      logger.error(`Fout bij navigeren naar pagina: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Extraheert metadata van de huidige pagina
   * @param {String} type - Type content (hashtag, profile, location)
   * @param {String} query - Zoekopdracht
   * @returns {Promise<Object>} - Metadata object
   */
  async extractMetadata(type, query) {
    logger.info(`Metadata extraheren voor ${type}: ${query}`);
    
    try {
      let metadata = {};
      
      switch (type) {
        case 'hashtag':
          metadata = await this.extractHashtagMetadata();
          break;
        case 'profile':
          metadata = await this.extractProfileMetadata();
          break;
        case 'location':
          metadata = await this.extractLocationMetadata();
          break;
      }
      
      return metadata;
    } catch (error) {
      logger.error(`Fout bij extraheren van metadata: ${error.message}`);
      return { error: error.message };
    }
  }
  
  /**
   * Extraheert metadata van een hashtag pagina
   * @returns {Promise<Object>} - Hashtag metadata
   */
  async extractHashtagMetadata() {
    try {
      return await this.page.evaluate(() => {
        // Zoek de header sectie
        const header = document.querySelector('header');
        
        if (!header) {
          return { error: 'Header sectie niet gevonden' };
        }
        
        // Zoek de hashtag naam
        const hashtagElement = header.querySelector('h1');
        const hashtag = hashtagElement ? hashtagElement.textContent.trim() : null;
        
        // Zoek het aantal posts
        const statsElement = header.querySelector('span');
        let postsCount = null;
        
        if (statsElement) {
          const statsText = statsElement.textContent.trim();
          const match = statsText.match(/(\d+(?:,\d+)*)/);
          postsCount = match ? match[1].replace(/,/g, '') : null;
        }
        
        return {
          hashtag,
          postsCount: postsCount ? parseInt(postsCount, 10) : null
        };
      });
    } catch (error) {
      logger.error(`Fout bij extraheren van hashtag metadata: ${error.message}`);
      return { error: error.message };
    }
  }
  
  /**
   * Extraheert metadata van een profiel pagina
   * @returns {Promise<Object>} - Profiel metadata
   */
  async extractProfileMetadata() {
    try {
      return await this.page.evaluate(() => {
        // Zoek de header sectie
        const header = document.querySelector('header');
        
        if (!header) {
          return { error: 'Header sectie niet gevonden' };
        }
        
        // Zoek de profielnaam
        const usernameElement = header.querySelector('h2');
        const username = usernameElement ? usernameElement.textContent.trim() : null;
        
        // Zoek de volledige naam
        const fullNameElement = header.querySelector('h1');
        const fullName = fullNameElement ? fullNameElement.textContent.trim() : null;
        
        // Zoek de bio
        const bioElement = header.querySelector('div > span');
        const bio = bioElement ? bioElement.textContent.trim() : null;
        
        // Zoek de statistieken (posts, followers, following)
        const statsElements = Array.from(header.querySelectorAll('ul li'));
        let postsCount = null;
        let followersCount = null;
        let followingCount = null;
        
        if (statsElements.length >= 3) {
          // Posts count
          const postsText = statsElements[0].textContent.trim();
          const postsMatch = postsText.match(/(\d+(?:,\d+)*)/);
          postsCount = postsMatch ? postsMatch[1].replace(/,/g, '') : null;
          
          // Followers count
          const followersText = statsElements[1].textContent.trim();
          const followersMatch = followersText.match(/(\d+(?:,\d+)*)/);
          followersCount = followersMatch ? followersMatch[1].replace(/,/g, '') : null;
          
          // Following count
          const followingText = statsElements[2].textContent.trim();
          const followingMatch = followingText.match(/(\d+(?:,\d+)*)/);
          followingCount = followingMatch ? followingMatch[1].replace(/,/g, '') : null;
        }
        
        // Zoek de profielfoto URL
        const imgElement = header.querySelector('img');
        const profilePicUrl = imgElement ? imgElement.src : null;
        
        // Zoek of het account privé is
        const isPrivate = document.body.innerText.includes('This Account is Private') || 
                          document.body.innerText.includes('This account is private');
        
        return {
          username,
          fullName,
          bio,
          postsCount: postsCount ? parseInt(postsCount, 10) : null,
          followersCount: followersCount ? parseInt(followersCount, 10) : null,
          followingCount: followingCount ? parseInt(followingCount, 10) : null,
          profilePicUrl,
          isPrivate
        };
      });
    } catch (error) {
      logger.error(`Fout bij extraheren van profiel metadata: ${error.message}`);
      return { error: error.message };
    }
  }
  
  /**
   * Extraheert metadata van een locatie pagina
   * @returns {Promise<Object>} - Locatie metadata
   */
  async extractLocationMetadata() {
    try {
      return await this.page.evaluate(() => {
        // Zoek de header sectie
        const header = document.querySelector('header');
        
        if (!header) {
          return { error: 'Header sectie niet gevonden' };
        }
        
        // Zoek de locatienaam
        const locationElement = header.querySelector('h1');
        const locationName = locationElement ? locationElement.textContent.trim() : null;
        
        // Zoek het aantal posts
        const statsElement = header.querySelector('span');
        let postsCount = null;
        
        if (statsElement) {
          const statsText = statsElement.textContent.trim();
          const match = statsText.match(/(\d+(?:,\d+)*)/);
          postsCount = match ? match[1].replace(/,/g, '') : null;
        }
        
        return {
          locationName,
          postsCount: postsCount ? parseInt(postsCount, 10) : null
        };
      });
    } catch (error) {
      logger.error(`Fout bij extraheren van locatie metadata: ${error.message}`);
      return { error: error.message };
    }
  }
  
  /**
   * Extraheert posts van de huidige pagina
   * @param {Number} maxPosts - Maximum aantal posts om te extraheren
   * @param {Boolean} includeComments - Of comments moeten worden meegenomen
   * @param {Number} commentsPerPost - Maximum aantal comments per post
   * @returns {Promise<Array>} - Array van post objecten
   */
  async extractPosts(maxPosts, includeComments, commentsPerPost) {
    logger.info(`Posts extraheren (max ${maxPosts})`);
    
    try {
      const posts = [];
      
      // Wacht tot posts geladen zijn
      await this.page.waitForSelector('article a', { timeout: 10000 })
        .catch(() => {
          logger.warn('Geen posts gevonden op de pagina');
        });
      
      // Scroll om meer posts te laden indien nodig
      await this.scrollToLoadPosts(maxPosts);
      
      // Verzamel alle post links
      const postLinks = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('article a[href*="/p/"]'));
        return links.map(link => link.href);
      });
      
      // Beperk tot het maximum aantal posts
      const limitedPostLinks = postLinks.slice(0, maxPosts);
      
      logger.info(`${limitedPostLinks.length} post links verzameld`);
      
      // Bezoek elke post en extraheer details
      for (let i = 0; i < limitedPostLinks.length; i++) {
        const postUrl = limitedPostLinks[i];
        logger.info(`Post ${i + 1}/${limitedPostLinks.length} verwerken: ${postUrl}`);
        
        try {
          // Navigeer naar de post
          await this.navigateToPage(postUrl);
          
          // Extraheer post details
          const postDetails = await this.extractPostDetails();
          
          // Extraheer comments indien nodig
          if (includeComments) {
            postDetails.comments = await this.extractComments(commentsPerPost);
          }
          
          // Voeg post URL toe
          postDetails.url = postUrl;
          
          // Voeg post toe aan resultaten
          posts.push(postDetails);
          
          // Wacht kort tussen posts om detectie te vermijden
          await this.page.waitForTimeout(1000 + Math.random() * 2000);
        } catch (error) {
          logger.error(`Fout bij verwerken van post ${postUrl}: ${error.message}`);
          // Ga door naar de volgende post
        }
      }
      
      return posts;
    } catch (error) {
      logger.error(`Fout bij extraheren van posts: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Scrollt de pagina om meer posts te laden
   * @param {Number} targetCount - Gewenst aantal posts
   */
  async scrollToLoadPosts(targetCount) {
    let previousPostCount = 0;
    let currentPostCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 20;
    
    while (currentPostCount < targetCount && scrollAttempts < maxScrollAttempts) {
      // Tel het huidige aantal posts
      currentPostCount = await this.page.evaluate(() => {
        return document.querySelectorAll('article a[href*="/p/"]').length;
      });
      
      if (currentPostCount >= targetCount) {
        break;
      }
      
      // Scroll naar beneden
      await this.page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 2);
      });
      
      // Wacht even voor het laden van content
      await this.page.waitForTimeout(2000);
      
      // Controleer of we nieuwe posts hebben geladen
      if (currentPostCount === previousPostCount) {
        scrollAttempts++;
      } else {
        scrollAttempts = 0;
        previousPostCount = currentPostCount;
      }
      
      logger.debug(`Scroll poging ${scrollAttempts + 1}: ${currentPostCount}/${targetCount} posts geladen`);
    }
    
    logger.info(`Scrollen voltooid: ${currentPostCount} posts geladen`);
  }
  
  /**
   * Extraheert details van een individuele post
   * @returns {Promise<Object>} - Post details
   */
  async extractPostDetails() {
    try {
      return await this.page.evaluate(() => {
        // Zoek de post container
        const article = document.querySelector('article');
        
        if (!article) {
          return { error: 'Post container niet gevonden' };
        }
        
        // Extraheer username
        const usernameElement = article.querySelector('header a');
        const username = usernameElement ? usernameElement.textContent.trim() : null;
        const userUrl = usernameElement ? usernameElement.href : null;
        
        // Extraheer post datum
        const timeElement = article.querySelector('time');
        const timestamp = timeElement ? timeElement.dateTime : null;
        
        // Extraheer caption
        const captionElement = article.querySelector('div[data-testid="post-comment-root"] span');
        const caption = captionElement ? captionElement.textContent.trim() : null;
        
        // Extraheer hashtags uit caption
        let hashtags = [];
        if (caption) {
          const hashtagMatches = caption.match(/#[\w\u00C0-\u00FF]+/g);
          hashtags = hashtagMatches || [];
        }
        
        // Extraheer likes
        const likeElement = article.querySelector('section span');
        let likesCount = null;
        
        if (likeElement) {
          const likeText = likeElement.textContent.trim();
          if (likeText.includes('like') || likeText.includes('vind-ik-leuks')) {
            const match = likeText.match(/(\d+(?:,\d+)*)/);
            likesCount = match ? match[1].replace(/,/g, '') : null;
          }
        }
        
        // Bepaal media type
        let mediaType = 'unknown';
        if (article.querySelector('video')) {
          mediaType = 'video';
        } else if (article.querySelector('img')) {
          mediaType = 'image';
        }
        
        // Extraheer media URL
        let mediaUrl = null;
        if (mediaType === 'video') {
          const videoElement = article.querySelector('video');
          mediaUrl = videoElement ? videoElement.src : null;
        } else if (mediaType === 'image') {
          const imgElement = article.querySelector('img[srcset]');
          mediaUrl = imgElement ? imgElement.src : null;
        }
        
        // Extraheer aantal comments
        const commentElement = article.querySelector('ul button span');
        let commentsCount = null;
        
        if (commentElement) {
          const commentText = commentElement.textContent.trim();
          if (commentText.includes('comment') || commentText.includes('reactie')) {
            const match = commentText.match(/(\d+(?:,\d+)*)/);
            commentsCount = match ? match[1].replace(/,/g, '') : null;
          }
        }
        
        return {
          username,
          userUrl,
          timestamp,
          caption,
          hashtags,
          likesCount: likesCount ? parseInt(likesCount, 10) : null,
          commentsCount: commentsCount ? parseInt(commentsCount, 10) : null,
          mediaType,
          mediaUrl
        };
      });
    } catch (error) {
      logger.error(`Fout bij extraheren van post details: ${error.message}`);
      return { error: error.message };
    }
  }
  
  /**
   * Extraheert comments van een post
   * @param {Number} maxComments - Maximum aantal comments om te extraheren
   * @returns {Promise<Array>} - Array van comment objecten
   */
  async extractComments(maxComments) {
    logger.info(`Comments extraheren (max ${maxComments})`);
    
    try {
      // Klik op "View all comments" indien aanwezig
      try {
        const viewCommentsButton = await this.page.$x('//span[contains(text(), "View all") or contains(text(), "Bekijk alle")]');
        if (viewCommentsButton.length > 0) {
          await viewCommentsButton[0].click();
          await this.page.waitForTimeout(2000);
        }
      } catch (e) {
        logger.warn('Geen "View all comments" knop gevonden of kon niet worden geklikt');
      }
      
      // Laad meer comments indien nodig
      await this.loadMoreComments(maxComments);
      
      // Extraheer comments
      return await this.page.evaluate((max) => {
        // Zoek alle comment containers
        const commentElements = Array.from(document.querySelectorAll('ul[data-testid="post-comment-root"] > ul > li'));
        
        // Beperk tot het maximum aantal
        const limitedComments = commentElements.slice(0, max);
        
        // Extraheer comment details
        return limitedComments.map(comment => {
          // Extraheer username
          const usernameElement = comment.querySelector('a');
          const username = usernameElement ? usernameElement.textContent.trim() : null;
          const userUrl = usernameElement ? usernameElement.href : null;
          
          // Extraheer comment tekst
          const textElement = comment.querySelector('span');
          const text = textElement ? textElement.textContent.trim() : null;
          
          // Extraheer timestamp
          const timeElement = comment.querySelector('time');
          const timestamp = timeElement ? timeElement.dateTime : null;
          
          // Extraheer likes
          const likeElement = comment.querySelector('button span');
          let likesCount = null;
          
          if (likeElement) {
            const likeText = likeElement.textContent.trim();
            if (likeText.includes('like') || likeText.includes('vind-ik-leuk')) {
              const match = likeText.match(/(\d+(?:,\d+)*)/);
              likesCount = match ? match[1].replace(/,/g, '') : null;
            }
          }
          
          return {
            username,
            userUrl,
            text,
            timestamp,
            likesCount: likesCount ? parseInt(likesCount, 10) : null
          };
        });
      }, maxComments);
    } catch (error) {
      logger.error(`Fout bij extraheren van comments: ${error.message}`);
      return [];
    }
  }
  
  /**
   * Laadt meer comments indien nodig
   * @param {Number} targetCount - Gewenst aantal comments
   */
  async loadMoreComments(targetCount) {
    let previousCommentCount = 0;
    let currentCommentCount = 0;
    let loadAttempts = 0;
    const maxLoadAttempts = 10;
    
    while (currentCommentCount < targetCount && loadAttempts < maxLoadAttempts) {
      // Tel het huidige aantal comments
      currentCommentCount = await this.page.evaluate(() => {
        return document.querySelectorAll('ul[data-testid="post-comment-root"] > ul > li').length;
      });
      
      if (currentCommentCount >= targetCount) {
        break;
      }
      
      // Zoek de "Load more comments" knop
      const loadMoreButton = await this.page.$x('//span[contains(text(), "Load more comments") or contains(text(), "Meer reacties laden")]');
      
      if (loadMoreButton.length === 0) {
        logger.info('Geen "Load more comments" knop gevonden, alle comments zijn geladen');
        break;
      }
      
      // Klik op de knop
      await loadMoreButton[0].click();
      
      // Wacht even voor het laden van content
      await this.page.waitForTimeout(2000);
      
      // Controleer of we nieuwe comments hebben geladen
      if (currentCommentCount === previousCommentCount) {
        loadAttempts++;
      } else {
        loadAttempts = 0;
        previousCommentCount = currentCommentCount;
      }
      
      logger.debug(`Load poging ${loadAttempts + 1}: ${currentCommentCount}/${targetCount} comments geladen`);
    }
    
    logger.info(`Comments laden voltooid: ${currentCommentCount} comments geladen`);
  }
}

// Instantieer de scraper
const instagramScraper = new InstagramScraper();

// Lambda handler functie
module.exports.handler = async (event) => {
  return await instagramScraper.handler(event);
};
