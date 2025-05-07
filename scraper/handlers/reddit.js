const ScraperHandler = require('./scraper');
const { getLogger } = require('../utils/logger');

const logger = getLogger('RedditScraper');

/**
 * RedditScraper - Implementeert scraping functionaliteit specifiek voor Reddit
 */
class RedditScraper extends ScraperHandler {
  constructor() {
    super('reddit');
  }
  
  /**
   * Verwerkt een SQS bericht voor Reddit scraping
   * @param {Object} event - AWS Lambda event object
   */
  async handler(event) {
    return await this.handleMessage(event);
  }
  
  /**
   * Implementeert de Reddit-specifieke scraping logica
   * @param {Object} params - Scraping parameters
   * @param {String} params.subreddit - Subreddit om te scrapen
   * @param {String} params.sort - Sorteermethode (hot, new, top, rising)
   * @param {Number} params.limit - Maximum aantal posts om te scrapen
   * @param {Boolean} params.includeComments - Of comments moeten worden meegenomen
   * @param {Number} params.commentDepth - Hoe diep comments moeten worden gescraped
   * @returns {Promise<Object>} - Gescrapete data
   */
  async scrape(params = {}) {
    const {
      subreddit = 'all',
      sort = 'hot',
      limit = 25,
      includeComments = true,
      commentDepth = 2,
      timeframe = 'day' // voor 'top' sortering: hour, day, week, month, year, all
    } = params;
    
    logger.info(`Scraping van r/${subreddit} (${sort}, limit: ${limit})`);
    
    try {
      // Navigeer naar de subreddit
      let url = `https://www.reddit.com/r/${subreddit}`;
      
      if (sort === 'top') {
        url += `/top/?t=${timeframe}`;
      } else if (['hot', 'new', 'rising'].includes(sort)) {
        url += `/${sort}/`;
      }
      
      logger.info(`Navigeren naar ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wacht tot de content geladen is
      await this.page.waitForSelector('div[data-testid="post-container"]', { timeout: 30000 });
      
      // Scroll om meer posts te laden indien nodig
      const actualLimit = Math.min(limit, 100); // Beperk tot maximaal 100 posts
      await this.scrollToLoadPosts(actualLimit);
      
      // Verzamel alle posts
      logger.info(`Verzamelen van ${actualLimit} posts`);
      const posts = await this.extractPosts(actualLimit);
      
      // Verzamel comments voor elke post indien nodig
      if (includeComments && posts.length > 0) {
        logger.info(`Verzamelen van comments voor ${posts.length} posts (diepte: ${commentDepth})`);
        
        for (let i = 0; i < posts.length; i++) {
          const post = posts[i];
          
          if (post.commentsUrl) {
            logger.info(`Verzamelen van comments voor post ${i + 1}/${posts.length}: ${post.title.substring(0, 30)}...`);
            post.comments = await this.extractComments(post.commentsUrl, commentDepth);
          }
        }
      }
      
      // Return het resultaat
      return {
        subreddit,
        sort,
        timeframe: sort === 'top' ? timeframe : null,
        postsCount: posts.length,
        scrapedAt: new Date().toISOString(),
        posts
      };
    } catch (error) {
      logger.error(`Fout bij scrapen van Reddit: ${error.message}`);
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
      currentPostCount = await this.page.$$eval('div[data-testid="post-container"]', posts => posts.length);
      
      if (currentPostCount >= targetCount) {
        break;
      }
      
      // Scroll naar beneden
      await this.page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });
      
      // Wacht even voor het laden van content
      await this.page.waitForTimeout(1000);
      
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
   * Extraheert post data van de huidige pagina
   * @param {Number} limit - Maximum aantal posts om te extraheren
   * @returns {Promise<Array>} - Array van post objecten
   */
  async extractPosts(limit) {
    return await this.page.$$eval(
      'div[data-testid="post-container"]',
      (posts, maxPosts) => {
        return Array.from(posts).slice(0, maxPosts).map(post => {
          // Vind de verschillende elementen binnen de post
          const titleElement = post.querySelector('h3');
          const authorElement = post.querySelector('a[data-testid="post_author"]');
          const scoreElement = post.querySelector('div[data-testid="post-rating"]');
          const timeElement = post.querySelector('span[data-testid="post_timestamp"]');
          const commentsElement = post.querySelector('a[data-testid="comments-count"]');
          const contentElement = post.querySelector('div[data-testid="post-content"]');
          const linkElement = post.querySelector('a[data-testid="post_timestamp"]');
          
          // Extraheer de text content of default waarden
          const title = titleElement ? titleElement.textContent.trim() : '';
          const author = authorElement ? authorElement.textContent.trim() : '';
          const authorUrl = authorElement ? authorElement.href : '';
          const score = scoreElement ? scoreElement.textContent.trim() : '0';
          const postedTime = timeElement ? timeElement.textContent.trim() : '';
          const commentsCount = commentsElement ? commentsElement.textContent.trim() : '0';
          const commentsUrl = commentsElement ? commentsElement.href : '';
          const postUrl = linkElement ? linkElement.href : '';
          
          // Extraheer post content (kan tekst, afbeelding, of link zijn)
          let content = '';
          let contentType = 'unknown';
          let mediaUrl = '';
          
          if (contentElement) {
            // Controleer op tekst post
            const textPost = contentElement.querySelector('div[data-testid="post-content-text"]');
            if (textPost) {
              content = textPost.textContent.trim();
              contentType = 'text';
            }
            
            // Controleer op afbeelding
            const imagePost = contentElement.querySelector('img');
            if (imagePost && imagePost.src) {
              mediaUrl = imagePost.src;
              contentType = 'image';
            }
            
            // Controleer op externe link
            const linkPost = contentElement.querySelector('a[data-testid="outbound-link"]');
            if (linkPost) {
              mediaUrl = linkPost.href;
              contentType = 'link';
            }
          }
          
          // Extraheer subreddit info
          const subredditElement = post.querySelector('a[data-testid="subreddit-name"]');
          const subreddit = subredditElement ? subredditElement.textContent.trim() : '';
          const subredditUrl = subredditElement ? subredditElement.href : '';
          
          // Extraheer flairs indien aanwezig
          const flairElements = Array.from(post.querySelectorAll('span[data-testid="post-flair"]'));
          const flairs = flairElements.map(flair => flair.textContent.trim());
          
          return {
            title,
            author,
            authorUrl,
            score: score.replace(/[^0-9.-]+/g, '') || '0', // Verwijder niet-numerieke karakters
            postedTime,
            commentsCount: commentsCount.replace(/[^0-9.-]+/g, '') || '0',
            commentsUrl,
            postUrl,
            contentType,
            content,
            mediaUrl,
            subreddit,
            subredditUrl,
            flairs,
            comments: [] // Zal later worden gevuld indien nodig
          };
        });
      },
      limit
    );
  }
  
  /**
   * Extraheert comments van een post
   * @param {String} commentsUrl - URL van de comments pagina
   * @param {Number} depth - Hoe diep comments moeten worden gescraped
   * @returns {Promise<Array>} - Array van comment objecten
   */
  async extractComments(commentsUrl, depth = 2) {
    try {
      // Navigeer naar de comments pagina
      logger.info(`Navigeren naar comments pagina: ${commentsUrl}`);
      await this.page.goto(commentsUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wacht tot comments geladen zijn
      await this.page.waitForSelector('div[data-testid="comment"]', { timeout: 30000 });
      
      // Klik op "View more comments" buttons om meer comments te laden
      await this.expandComments();
      
      // Extraheer alle comments
      return await this.page.$$eval(
        'div[data-testid="comment"]',
        (comments, maxDepth) => {
          // Recursieve functie om comments te extraheren met de juiste diepte
          function extractCommentData(comment, currentDepth = 0) {
            if (currentDepth >= maxDepth) {
              return null;
            }
            
            // Vind de verschillende elementen binnen de comment
            const authorElement = comment.querySelector('a[data-testid="comment_author"]');
            const textElement = comment.querySelector('div[data-testid="comment-content"]');
            const scoreElement = comment.querySelector('div[data-testid="vote-arrows"]');
            const timeElement = comment.querySelector('a time');
            
            // Extraheer de text content of default waarden
            const author = authorElement ? authorElement.textContent.trim() : '[deleted]';
            const authorUrl = authorElement ? authorElement.href : '';
            const text = textElement ? textElement.textContent.trim() : '';
            const score = scoreElement ? scoreElement.textContent.trim() : '0';
            const postedTime = timeElement ? timeElement.getAttribute('datetime') : '';
            
            // Vind child comments (replies)
            const childCommentsContainer = comment.querySelector('div[data-testid="replies"]');
            let replies = [];
            
            if (childCommentsContainer && currentDepth < maxDepth - 1) {
              const childComments = childCommentsContainer.querySelectorAll('div[data-testid="comment"]');
              
              replies = Array.from(childComments)
                .map(childComment => extractCommentData(childComment, currentDepth + 1))
                .filter(reply => reply !== null);
            }
            
            return {
              author,
              authorUrl,
              text,
              score: score.replace(/[^0-9.-]+/g, '') || '0',
              postedTime,
              replies
            };
          }
          
          // Start met top-level comments
          return Array.from(comments)
            .filter(comment => !comment.closest('div[data-testid="replies"]')) // Filter alleen top-level comments
            .map(comment => extractCommentData(comment))
            .filter(comment => comment !== null);
        },
        depth
      );
    } catch (error) {
      logger.error(`Fout bij extraheren van comments: ${error.message}`);
      return []; // Return lege array bij fouten
    }
  }
  
  /**
   * Klikt op "View more comments" buttons om meer comments te laden
   */
  async expandComments() {
    let expandButtons = true;
    let expandAttempts = 0;
    const maxExpandAttempts = 5; // Beperk het aantal keer dat we proberen te expanderen
    
    while (expandButtons && expandAttempts < maxExpandAttempts) {
      // Vind alle "View more comments" buttons
      const buttons = await this.page.$$('button[data-testid="expand-button"]');
      
      if (buttons.length === 0) {
        expandButtons = false;
        break;
      }
      
      logger.info(`${buttons.length} "View more comments" buttons gevonden, klikken...`);
      
      // Klik op elke button
      for (const button of buttons) {
        try {
          await button.click();
          // Korte pauze om te voorkomen dat we de pagina overbelasten
          await this.page.waitForTimeout(300);
        } catch (error) {
          // Negeer fouten bij klikken (button kan verdwenen zijn)
        }
      }
      
      // Wacht even voor het laden van content
      await this.page.waitForTimeout(1000);
      
      expandAttempts++;
    }
    
    logger.info(`Comments expanderen voltooid na ${expandAttempts} pogingen`);
  }
}

// Instantieer de scraper
const redditScraper = new RedditScraper();

// Lambda handler functie
module.exports.handler = async (event) => {
  return await redditScraper.handler(event);
};
