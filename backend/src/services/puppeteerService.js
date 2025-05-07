import puppeteer from 'puppeteer';
import { logger } from '../utils/logger.js';
import { proxyService } from './proxyService.js';
import puppeteerUtils from '../utils/puppeteerUtils.js';

/**
 * Helper functie om te wachten voor een bepaalde tijd
 * @param {number} ms - Aantal milliseconden om te wachten
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Constanten voor scraping configuratie
 */
const SCRAPING_CONFIGS = {
  // TikTok configuratie
  tiktok: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    selectors: {
      videoCard: 'div[data-e2e="recommend-list-item-container"]',
      videoTitle: 'div[data-e2e="video-desc"]',
      videoStats: 'div[data-e2e="video-stats"]',
      videoLikes: 'strong[data-e2e="like-count"]',
      videoComments: 'strong[data-e2e="comment-count"]',
      videoShares: 'strong[data-e2e="share-count"]',
      authorName: 'span[data-e2e="author-nickname"]',
      authorUsername: 'span[data-e2e="author-uniqueid"]'
    }
  },
  
  // Instagram configuratie
  instagram: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/85.0.4183.109 Mobile/15E148 Safari/604.1',
    selectors: {
      post: 'article',
      username: 'header a',
      caption: 'div._a9zs span',
      likes: 'section span',
      comments: 'ul._a9ym',
      commentUsername: 'span._aap6',
      commentText: 'span._aap8',
      followersCount: 'li:nth-child(2) span',
      followingCount: 'li:nth-child(3) span'
    }
  },
  
  // Trustpilot configuratie
  trustpilot: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    selectors: {
      reviewCard: 'article.review',
      reviewTitle: 'h2[data-service-review-title-typography]',
      reviewContent: 'p[data-service-review-text-typography]',
      reviewRating: 'div.star-rating',
      reviewDate: 'time',
      reviewerName: 'span.typography_heading-xxs',
      companyRating: 'p.typography_heading-m',
      companyReviewCount: 'p.typography_body-m'
    }
  }
};

/**
 * Service voor het scrapen van websites met Puppeteer
 */
export const puppeteerService = {
  /**
   * Start een Puppeteer browser instance met retry logica
   * @param {object} options - Opties voor de browser
   * @returns {Promise<Browser>} - Puppeteer browser instance
   */
  async startBrowser(options = {}) {
    return await puppeteerUtils.withRetry(async (attempt) => {
      try {
        logger.info(`Puppeteer browser starten... (poging ${attempt + 1})`);
        
        // Basis browser opties
        const browserOptions = {
          headless: options.headless !== false, // Standaard headless
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920x1080',
            '--disable-features=IsolateOrigins,site-per-process', // Verbeterde stabiliteit
            '--disable-extensions',
            '--disable-component-extensions-with-background-pages',
            '--disable-default-apps',
            '--mute-audio'
          ],
          defaultViewport: {
            width: 1920,
            height: 1080
          },
          ignoreHTTPSErrors: true, // Negeer HTTPS certificaat fouten
          ...options
        };
        
        // Configureer browser met proxy als dat is ingeschakeld
        const configuredOptions = proxyService.configurePuppeteerWithProxy(browserOptions);
        
        // Start de browser met de geconfigureerde opties
        const browser = await puppeteer.launch(configuredOptions);
        
        // Voeg event listeners toe voor onverwachte sluitingen
        browser.on('disconnected', () => {
          logger.warn('Puppeteer browser onverwacht afgesloten');
        });
        
        logger.info('Puppeteer browser succesvol gestart');
        return browser;
      } catch (error) {
        logger.error(`Fout bij starten Puppeteer browser (poging ${attempt + 1}): ${error.message}`);
        throw error;
      }
    }, {
      maxAttempts: 3,
      baseDelay: 2000,
      maxDelay: 10000,
      retryableErrors: ['CONNECTION_ERROR', 'CONTEXT_ERROR', 'UNKNOWN_ERROR']
    });
  },
  
  /**
   * Scrape Amazon producten met Puppeteer
   * @param {string} keyword - Zoekwoord voor producten
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met productgegevens
   */
  async scrapeAmazonProducts(keyword, options = {}) {
    let browser;
    
    try {
      logger.info(`Puppeteer: Amazon producten scrapen voor keyword: ${keyword}`);
      
      // Start de browser
      browser = await this.startBrowser();
      const page = await browser.newPage();
      
      // Stel user agent in om detectie te vermijden
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigeer naar Amazon zoekpagina
      const country = options.country || 'nl';
      await page.goto(`https://www.amazon.${country}/s?k=${encodeURIComponent(keyword)}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Wacht tot de zoekresultaten geladen zijn
      await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });
      
      // Scrape de productgegevens
      const products = await page.evaluate(() => {
        const results = [];
        const productElements = document.querySelectorAll('[data-component-type="s-search-result"]');
        
        productElements.forEach(productElement => {
          try {
            // Basisinformatie
            const titleElement = productElement.querySelector('h2 a span');
            const priceElement = productElement.querySelector('.a-price .a-offscreen');
            const ratingElement = productElement.querySelector('.a-icon-star-small');
            const reviewCountElement = productElement.querySelector('.a-size-base.s-underline-text');
            const imageElement = productElement.querySelector('img.s-image');
            const linkElement = productElement.querySelector('h2 a');
            
            // ASIN uit de data-asin attribuut
            const asin = productElement.getAttribute('data-asin');
            
            // Alleen toevoegen als we een titel en ASIN hebben
            if (titleElement && asin) {
              const product = {
                asin: asin,
                title: titleElement.textContent.trim(),
                price: priceElement ? priceElement.textContent.trim() : '',
                rating: ratingElement ? parseFloat(ratingElement.textContent.replace(/[^0-9,.]/g, '').replace(',', '.')) : 0,
                reviewCount: reviewCountElement ? parseInt(reviewCountElement.textContent.replace(/[^0-9]/g, '')) : 0,
                imageUrl: imageElement ? imageElement.getAttribute('src') : '',
                url: linkElement ? 'https://www.amazon.nl' + linkElement.getAttribute('href') : ''
              };
              
              results.push(product);
            }
          } catch (error) {
            console.error('Fout bij verwerken product element:', error);
          }
        });
        
        return results;
      });
      
      logger.info(`Puppeteer: ${products.length} Amazon producten gescraped voor keyword: ${keyword}`);
      
      // Verwerk de producten naar het juiste formaat
      return products.map(product => ({
        asin: product.asin,
        title: product.title,
        url: product.url,
        brand: '', // Niet beschikbaar op de zoekpagina
        imageUrl: product.imageUrl,
        price: {
          amount: parseFloat(product.price.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0,
          currency: 'EUR',
          displayAmount: product.price
        },
        rating: product.rating,
        reviewCount: product.reviewCount,
        features: [], // Niet beschikbaar op de zoekpagina
        description: '' // Niet beschikbaar op de zoekpagina
      }));
    } catch (error) {
      logger.error(`Puppeteer: Fout bij scrapen Amazon producten: ${error.message}`);
      return [];
    } finally {
      // Sluit de browser
      if (browser) {
        await browser.close();
        logger.info('Puppeteer browser gesloten');
      }
    }
  },
  
  /**
   * Scrape Amazon productreviews met Puppeteer
   * @param {string} asin - ASIN van het product
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met reviews
   */
  async scrapeAmazonProductReviews(asin, options = {}) {
    let browser;
    
    try {
      logger.info(`Puppeteer: Amazon reviews scrapen voor ASIN: ${asin}`);
      
      // Start de browser
      browser = await this.startBrowser();
      const page = await browser.newPage();
      
      // Stel user agent in om detectie te vermijden
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigeer naar Amazon reviews pagina
      const country = options.country || 'nl';
      await page.goto(`https://www.amazon.${country}/product-reviews/${asin}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Controleer of er reviews zijn
      const hasReviews = await page.evaluate(() => {
        return !document.querySelector('.noReviewsHelpful');
      });
      
      if (!hasReviews) {
        logger.info(`Puppeteer: Geen reviews gevonden voor ASIN: ${asin}`);
        return [];
      }
      
      // Scrape de reviews
      const reviews = await page.evaluate((asin) => {
        const results = [];
        const reviewElements = document.querySelectorAll('[data-hook="review"]');
        
        reviewElements.forEach(reviewElement => {
          try {
            // Review informatie
            const titleElement = reviewElement.querySelector('[data-hook="review-title"]');
            const ratingElement = reviewElement.querySelector('[data-hook="review-star-rating"]');
            const dateElement = reviewElement.querySelector('[data-hook="review-date"]');
            const bodyElement = reviewElement.querySelector('[data-hook="review-body"]');
            const verifiedElement = reviewElement.querySelector('[data-hook="avp-badge"]');
            
            if (titleElement && bodyElement) {
              const review = {
                id: reviewElement.id || `amazon_${asin}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                title: titleElement.textContent.trim(),
                rating: ratingElement ? parseFloat(ratingElement.textContent.replace(/[^0-9,.]/g, '').replace(',', '.')) : 0,
                date: dateElement ? dateElement.textContent.trim() : '',
                content: bodyElement.textContent.trim(),
                verifiedPurchase: verifiedElement !== null,
                helpfulVotes: 0 // Niet altijd beschikbaar
              };
              
              results.push(review);
            }
          } catch (error) {
            console.error('Fout bij verwerken review element:', error);
          }
        });
        
        return results;
      }, asin);
      
      logger.info(`Puppeteer: ${reviews.length} Amazon reviews gescraped voor ASIN: ${asin}`);
      return reviews;
    } catch (error) {
      logger.error(`Puppeteer: Fout bij scrapen Amazon reviews: ${error.message}`);
      return [];
    } finally {
      // Sluit de browser
      if (browser) {
        await browser.close();
        logger.info('Puppeteer browser gesloten');
      }
    }
  },
  
  /**
   * Scrape Reddit posts met Puppeteer
   * @param {string} keyword - Zoekwoord voor posts
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met Reddit posts
   */
  async scrapeRedditPosts(keyword, options = {}) {
    let browser;
    
    try {
      logger.info(`Puppeteer: Reddit posts scrapen voor keyword: ${keyword}`);
      
      // Start de browser
      browser = await this.startBrowser();
      const page = await browser.newPage();
      
      // Stel user agent in om detectie te vermijden
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigeer naar Reddit zoekpagina
      await page.goto(`https://www.reddit.com/search/?q=${encodeURIComponent(keyword)}`, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Wacht tot de zoekresultaten geladen zijn
      await page.waitForSelector('div[data-testid="post-container"]', { timeout: 10000 });
      
      // Scroll om meer posts te laden (optioneel)
      if (options.scrollCount) {
        for (let i = 0; i < options.scrollCount; i++) {
          await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
          });
          await delay(1000);
        }
      }
      
      // Scrape de posts
      const posts = await page.evaluate(() => {
        const results = [];
        const postElements = document.querySelectorAll('div[data-testid="post-container"]');
        
        postElements.forEach(postElement => {
          try {
            // Post informatie
            const titleElement = postElement.querySelector('h3');
            const authorElement = postElement.querySelector('a[data-testid="post_author_link"]');
            const subredditElement = postElement.querySelector('a[data-testid="subreddit-link"]');
            const scoreElement = postElement.querySelector('div[id^="vote-arrows-"] div');
            const commentsElement = postElement.querySelector('span[data-click-id="comments"]');
            const linkElement = postElement.querySelector('a[data-click-id="body"]');
            
            if (titleElement) {
              const post = {
                id: postElement.id || `reddit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                title: titleElement.textContent.trim(),
                author: authorElement ? authorElement.textContent.trim() : '',
                subreddit: subredditElement ? subredditElement.textContent.trim() : '',
                score: scoreElement ? parseInt(scoreElement.textContent.replace(/[^0-9-]/g, '')) || 0 : 0,
                commentCount: commentsElement ? parseInt(commentsElement.textContent.replace(/[^0-9]/g, '')) || 0 : 0,
                url: linkElement ? linkElement.getAttribute('href') : '',
                content: '' // Niet beschikbaar op de zoekpagina
              };
              
              results.push(post);
            }
          } catch (error) {
            console.error('Fout bij verwerken post element:', error);
          }
        });
        
        return results;
      });
      
      logger.info(`Puppeteer: ${posts.length} Reddit posts gescraped voor keyword: ${keyword}`);
      
      // Verwerk de posts naar het juiste formaat
      return posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        url: post.url.startsWith('http') ? post.url : `https://www.reddit.com${post.url}`,
        author: post.author,
        subreddit: post.subreddit.replace('r/', ''),
        score: post.score,
        commentCount: post.commentCount,
        created: new Date().toISOString(), // Niet beschikbaar op de zoekpagina
        comments: [] // Niet beschikbaar op de zoekpagina
      }));
    } catch (error) {
      logger.error(`Puppeteer: Fout bij scrapen Reddit posts: ${error.message}`);
      return [];
    } finally {
      // Sluit de browser
      if (browser) {
        await browser.close();
        logger.info('Puppeteer browser gesloten');
      }
    }
  },
  
  /**
   * Scrape Reddit post details met Puppeteer
   * @param {string} postUrl - URL van de post
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Object>} - Post details met comments
   */
  async scrapeRedditPostDetails(postUrl, options = {}) {
    let browser;
    
    try {
      logger.info(`Puppeteer: Reddit post details scrapen voor URL: ${postUrl}`);
      
      // Start de browser
      browser = await this.startBrowser();
      const page = await browser.newPage();
      
      // Stel user agent in om detectie te vermijden
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigeer naar de post URL
      await page.goto(postUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Wacht tot de post geladen is
      await page.waitForSelector('div[data-testid="post-container"]', { timeout: 10000 });
      
      // Scrape de post details
      const postDetails = await page.evaluate(() => {
        try {
          const postElement = document.querySelector('div[data-testid="post-container"]');
          
          if (!postElement) {
            return null;
          }
          
          // Post informatie
          const titleElement = postElement.querySelector('h1');
          const authorElement = postElement.querySelector('a[data-testid="post_author_link"]');
          const subredditElement = postElement.querySelector('a[data-testid="subreddit-link"]');
          const scoreElement = postElement.querySelector('div[id^="vote-arrows-"] div');
          const contentElement = postElement.querySelector('div[data-click-id="text"] div');
          
          const post = {
            id: postElement.id || `reddit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            title: titleElement ? titleElement.textContent.trim() : '',
            author: authorElement ? authorElement.textContent.trim() : '',
            subreddit: subredditElement ? subredditElement.textContent.trim() : '',
            score: scoreElement ? parseInt(scoreElement.textContent.replace(/[^0-9-]/g, '')) || 0 : 0,
            content: contentElement ? contentElement.textContent.trim() : '',
            url: window.location.href
          };
          
          // Scrape comments
          const comments = [];
          const commentElements = document.querySelectorAll('div[data-testid="comment"]');
          
          commentElements.forEach(commentElement => {
            try {
              const authorElement = commentElement.querySelector('a[data-testid="comment_author_link"]');
              const contentElement = commentElement.querySelector('div[data-testid="comment"] > div > div:nth-child(2)');
              const scoreElement = commentElement.querySelector('div[id^="vote-arrows-"] div');
              
              if (contentElement) {
                const comment = {
                  id: commentElement.id || `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  author: authorElement ? authorElement.textContent.trim() : '',
                  content: contentElement.textContent.trim(),
                  score: scoreElement ? parseInt(scoreElement.textContent.replace(/[^0-9-]/g, '')) || 0 : 0
                };
                
                comments.push(comment);
              }
            } catch (error) {
              console.error('Fout bij verwerken comment element:', error);
            }
          });
          
          post.comments = comments;
          post.commentCount = comments.length;
          
          return post;
        } catch (error) {
          console.error('Fout bij scrapen post details:', error);
          return null;
        }
      });
      
      if (!postDetails) {
        logger.warn(`Puppeteer: Geen post details gevonden voor URL: ${postUrl}`);
        return null;
      }
      
      logger.info(`Puppeteer: Reddit post details gescraped voor URL: ${postUrl} met ${postDetails.comments.length} comments`);
      
      // Verwerk de post naar het juiste formaat
      return {
        id: postDetails.id,
        title: postDetails.title,
        content: postDetails.content,
        url: postDetails.url,
        author: postDetails.author,
        subreddit: postDetails.subreddit.replace('r/', ''),
        score: postDetails.score,
        commentCount: postDetails.commentCount,
        created: new Date().toISOString(), // Niet beschikbaar op de pagina
        comments: postDetails.comments.map(comment => ({
          id: comment.id,
          author: comment.author,
          content: comment.content,
          score: comment.score,
          created: new Date().toISOString() // Niet beschikbaar op de pagina
        }))
      };
    } catch (error) {
      logger.error(`Puppeteer: Fout bij scrapen Reddit post details: ${error.message}`);
      return null;
    } finally {
      // Sluit de browser
      if (browser) {
        await browser.close();
        logger.info('Puppeteer browser gesloten');
      }
    }
  },
  
  /**
   * Scrape TikTok video's met Puppeteer
   * @param {string} keyword - Zoekwoord voor video's
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met TikTok video gegevens
   */
  async scrapeTikTokVideos(keyword, options = {}) {
    let browser;
    
    try {
      logger.info(`Puppeteer: TikTok video's scrapen voor keyword: ${keyword}`);
      
      // Start de browser met retry logica
      browser = await this.startBrowser();
      
      // Maak een nieuwe pagina aan
      const page = await browser.newPage();
      
      // Stel user agent in
      await page.setUserAgent(SCRAPING_CONFIGS.tiktok.userAgent);
      
      // Extra headers om meer op een echte browser te lijken
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Chromium";v="112", "Google Chrome";v="112"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
      });
      
      // Navigeer naar TikTok zoekpagina met verbeterde error handling
      const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`;
      await puppeteerUtils.gotoSafe(page, searchUrl, { 
        waitUntil: 'networkidle2', 
        timeout: 60000,
        retryOnFailure: true,
        maxAttempts: 3
      });
      
      // Controleer op en handel algemene obstakels af (cookie banners, etc.)
      await puppeteerUtils.handleCommonObstacles(page);
      
      // Wacht op video's met verbeterde error handling
      const videoCardSelector = SCRAPING_CONFIGS.tiktok.selectors.videoCard;
      const hasVideos = await puppeteerUtils.waitForSelectorSafe(page, videoCardSelector, { 
        timeout: 15000,
        retryOnFailure: true,
        maxAttempts: 2
      });
      
      // Als er geen video's zijn gevonden, probeer te scrollen
      if (!hasVideos) {
        logger.info('Geen video\'s direct gevonden, proberen met scrollen...');
        
        // Scroll meerdere keren om te proberen content te laden
        for (let i = 0; i < 3; i++) {
          await puppeteerUtils.evaluateSafe(page, () => {
            window.scrollBy(0, window.innerHeight);
          });
          await puppeteerUtils.delay(1500);
          
          // Controleer of er nu video's zijn
          const foundAfterScroll = await puppeteerUtils.waitForSelectorSafe(page, videoCardSelector, { 
            timeout: 5000,
            logFailure: false
          });
          
          if (foundAfterScroll) {
            logger.info('Video\'s gevonden na scrollen');
            break;
          }
        }
      }
      
      // Scroll om meer video's te laden
      await puppeteerUtils.evaluateSafe(page, () => {
        window.scrollBy(0, 2000);
      });
      
      // Wacht even om video's te laden
      await puppeteerUtils.delay(3000);
      
      // Scrape video's met verbeterde error handling
      const videos = await puppeteerUtils.evaluateSafe(page, (selectors) => {
        try {
          const videoElements = document.querySelectorAll(selectors.videoCard);
          const results = [];
          
          videoElements.forEach((videoElement, index) => {
            try {
              // Basisinformatie
              const titleElement = videoElement.querySelector(selectors.videoTitle);
              const authorNameElement = videoElement.querySelector(selectors.authorName);
              const authorUsernameElement = videoElement.querySelector(selectors.authorUsername);
              const likesElement = videoElement.querySelector(selectors.videoLikes);
              const commentsElement = videoElement.querySelector(selectors.videoComments);
              const sharesElement = videoElement.querySelector(selectors.videoShares);
              
              // Video URL
              const linkElement = videoElement.querySelector('a');
              const videoUrl = linkElement ? linkElement.href : '';
              
              // Thumbnail URL (indien beschikbaar)
              const imgElement = videoElement.querySelector('img');
              const thumbnailUrl = imgElement ? imgElement.src : '';
              
              const video = {
                id: `tiktok_${Date.now()}_${index}`,
                title: titleElement ? titleElement.textContent.trim() : '',
                author: {
                  name: authorNameElement ? authorNameElement.textContent.trim() : '',
                  username: authorUsernameElement ? authorUsernameElement.textContent.trim() : ''
                },
                stats: {
                  likes: likesElement ? likesElement.textContent.trim() : '0',
                  comments: commentsElement ? commentsElement.textContent.trim() : '0',
                  shares: sharesElement ? sharesElement.textContent.trim() : '0'
                },
                url: videoUrl,
                thumbnailUrl: thumbnailUrl
              };
              
              results.push(video);
            } catch (error) {
              console.error('Fout bij verwerken video element:', error);
            }
          });
          
          return results;
        } catch (error) {
          console.error('Fout bij scrapen TikTok video\'s:', error);
          return [];
        }
      }, [SCRAPING_CONFIGS.tiktok.selectors], { defaultValue: [] });
      
      if (!videos || videos.length === 0) {
        logger.warn(`Puppeteer: Geen TikTok video's gevonden voor keyword: ${keyword}`);
        return [];
      }
      
      logger.info(`Puppeteer: ${videos.length} TikTok video's gescraped voor keyword: ${keyword}`);
      
      // Verwerk de video's naar het juiste formaat
      return videos.map(video => ({
        id: video.id,
        title: video.title,
        url: video.url,
        thumbnailUrl: video.thumbnailUrl,
        author: {
          name: video.author.name,
          username: video.author.username,
          profileUrl: video.author.username ? `https://www.tiktok.com/@${video.author.username}` : ''
        },
        stats: {
          likes: extractNumber(video.stats.likes),
          comments: extractNumber(video.stats.comments),
          shares: extractNumber(video.stats.shares)
        },
        platform: 'tiktok',
        createdAt: new Date().toISOString() // Exacte datum niet beschikbaar
      }));
    } catch (error) {
      logger.error(`Puppeteer: Fout bij scrapen TikTok video's: ${error.message}`);
      return [];
    } finally {
      // Sluit de browser
      if (browser) {
        try {
          await browser.close();
          logger.info('Puppeteer browser gesloten');
        } catch (error) {
          logger.warn(`Fout bij sluiten browser: ${error.message}`);
        }
      }
    }
  },
  
  /**
   * Scrape Instagram posts met Puppeteer
   * @param {string} keyword - Zoekwoord of hashtag
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Array>} - Array met Instagram post gegevens
   */
  async scrapeInstagramPosts(keyword, options = {}) {
    let browser;
    
    try {
      // Verwijder # indien aanwezig en voeg toe indien nodig
      const hashtag = keyword.startsWith('#') ? keyword.substring(1) : keyword;
      logger.info(`Puppeteer: Instagram posts scrapen voor hashtag: #${hashtag}`);
      
      // Start de browser
      browser = await this.startBrowser();
      const page = await browser.newPage();
      
      // Stel user agent in voor mobiele weergave (betere kans op succes)
      await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1');
      
      // Extra headers om meer op een echte browser te lijken
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });
      
      // Navigeer naar Instagram hashtag pagina
      const searchUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(hashtag)}/`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Wacht op posts te laden of probeer alternatieve methode
      try {
        await page.waitForSelector(SCRAPING_CONFIGS.instagram.selectors.post, { timeout: 15000 });
      } catch (error) {
        logger.warn(`Puppeteer: Timeout bij wachten op Instagram posts voor hashtag: #${hashtag}`);
        
        // Probeer een alternatieve aanpak - direct naar een populaire hashtag pagina
        logger.info('Puppeteer: Proberen via alternatieve methode...');
        
        // Simuleer wat scrollen om te zien of content laadt
        await page.evaluate(() => {
          window.scrollBy(0, 500);
        });
        await delay(2000);
        
        // Als we nog steeds geen posts kunnen vinden, geven we een lege array terug
        try {
          await page.waitForSelector('article', { timeout: 5000 });
        } catch (error) {
          logger.warn('Puppeteer: Kon geen Instagram posts vinden, zelfs na scrollen');
          return [];
        }
      }
      
      // Scroll om meer posts te laden
      await page.evaluate(() => {
        window.scrollBy(0, 2000);
      });
      
      // Wacht even om posts te laden
      await delay(3000);
      
      // Scrape posts
      const posts = await page.evaluate((selectors) => {
        try {
          const postElements = document.querySelectorAll(selectors.post);
          const results = [];
          
          postElements.forEach((postElement, index) => {
            try {
              // Basisinformatie
              const usernameElement = postElement.querySelector(selectors.username);
              const captionElement = postElement.querySelector(selectors.caption);
              const likesElement = postElement.querySelector(selectors.likes);
              
              // Post URL
              const linkElement = postElement.querySelector('a');
              const postUrl = linkElement ? linkElement.href : '';
              
              // Thumbnail URL
              const imgElement = postElement.querySelector('img');
              const thumbnailUrl = imgElement ? imgElement.src : '';
              
              const post = {
                id: `instagram_${Date.now()}_${index}`,
                caption: captionElement ? captionElement.textContent.trim() : '',
                author: {
                  username: usernameElement ? usernameElement.textContent.trim() : ''
                },
                likes: likesElement ? likesElement.textContent.trim() : '0',
                url: postUrl,
                thumbnailUrl: thumbnailUrl
              };
              
              results.push(post);
            } catch (error) {
              console.error('Fout bij verwerken post element:', error);
            }
          });
          
          return results;
        } catch (error) {
          console.error('Fout bij scrapen Instagram posts:', error);
          return [];
        }
      }, SCRAPING_CONFIGS.instagram.selectors);
      
      if (!posts || posts.length === 0) {
        logger.warn(`Puppeteer: Geen Instagram posts gevonden voor hashtag: #${hashtag}`);
        return [];
      }
      
      logger.info(`Puppeteer: ${posts.length} Instagram posts gescraped voor hashtag: #${hashtag}`);
      
      // Verwerk de posts naar het juiste formaat
      return posts.map(post => ({
        id: post.id,
        caption: post.caption,
        url: post.url,
        thumbnailUrl: post.thumbnailUrl,
        author: {
          username: post.author.username,
          profileUrl: post.author.username ? `https://www.instagram.com/${post.author.username}/` : ''
        },
        stats: {
          likes: extractNumber(post.likes),
          comments: 0 // Niet beschikbaar zonder in te loggen
        },
        platform: 'instagram',
        createdAt: new Date().toISOString() // Exacte datum niet beschikbaar
      }));
    } catch (error) {
      logger.error(`Puppeteer: Fout bij scrapen Instagram posts: ${error.message}`);
      return [];
    } finally {
      // Sluit de browser
      if (browser) {
        await browser.close();
        logger.info('Puppeteer browser gesloten');
      }
    }
  },
  
  /**
   * Scrape Trustpilot reviews voor een bedrijf
   * @param {string} companyName - Naam van het bedrijf
   * @param {object} options - Opties voor scraping
   * @returns {Promise<Object>} - Object met bedrijfsinfo en reviews
   */
  async scrapeTrustpilotReviews(companyName, options = {}) {
    let browser;
    
    try {
      logger.info(`Puppeteer: Trustpilot reviews scrapen voor bedrijf: ${companyName}`);
      
      // Start de browser
      browser = await this.startBrowser();
      const page = await browser.newPage();
      
      // Stel user agent in
      await page.setUserAgent(SCRAPING_CONFIGS.trustpilot.userAgent);
      
      // Extra headers om meer op een echte browser te lijken
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });
      
      // Navigeer direct naar de bedrijfspagina als we een exacte match hebben
      // Dit is betrouwbaarder dan de zoekpagina
      const directUrl = `https://www.trustpilot.com/review/${companyName.toLowerCase().replace(/\s+/g, '-')}`;
      await page.goto(directUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Controleer of we op de juiste pagina zijn
      const isCompanyPage = await page.evaluate(() => {
        return document.querySelector('h1') !== null;
      });
      
      // Als we niet op de juiste pagina zijn, probeer dan via de zoekpagina
      if (!isCompanyPage) {
        logger.info(`Puppeteer: Directe URL niet gevonden, proberen via zoekpagina...`);
        const searchUrl = `https://www.trustpilot.com/search?query=${encodeURIComponent(companyName)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Klik op het eerste zoekresultaat (bedrijfspagina)
        try {
          await page.waitForSelector('.search-result-heading a', { timeout: 10000 });
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('.search-result-heading a')
          ]);
        } catch (error) {
          logger.warn(`Puppeteer: Geen bedrijf gevonden voor: ${companyName}`);
          return { companyName, rating: 0, reviewCount: 0, reviews: [] };
        }
      }
      
      // Wacht op reviews te laden
      await page.waitForSelector(SCRAPING_CONFIGS.trustpilot.selectors.reviewCard, { timeout: 30000 });
      
      // Scroll om meer reviews te laden
      await page.evaluate(() => {
        window.scrollBy(0, 2000);
      });
      
      // Wacht even om reviews te laden
      await delay(3000);
      
      // Scrape bedrijfsinformatie en reviews
      const result = await page.evaluate((selectors) => {
        try {
          // Bedrijfsinformatie
          const companyNameElement = document.querySelector('h1');
          const companyRatingElement = document.querySelector(selectors.companyRating);
          const companyReviewCountElement = document.querySelector(selectors.companyReviewCount);
          
          const companyInfo = {
            name: companyNameElement ? companyNameElement.textContent.trim() : '',
            rating: companyRatingElement ? companyRatingElement.textContent.trim() : '0',
            reviewCount: companyReviewCountElement ? companyReviewCountElement.textContent.trim() : '0',
            url: window.location.href
          };
          
          // Reviews
          const reviewElements = document.querySelectorAll(selectors.reviewCard);
          const reviews = [];
          
          reviewElements.forEach((reviewElement, index) => {
            try {
              const titleElement = reviewElement.querySelector(selectors.reviewTitle);
              const contentElement = reviewElement.querySelector(selectors.reviewContent);
              const ratingElement = reviewElement.querySelector(selectors.reviewRating);
              const dateElement = reviewElement.querySelector(selectors.reviewDate);
              const reviewerNameElement = reviewElement.querySelector(selectors.reviewerName);
              
              const review = {
                id: `trustpilot_${Date.now()}_${index}`,
                title: titleElement ? titleElement.textContent.trim() : '',
                content: contentElement ? contentElement.textContent.trim() : '',
                rating: ratingElement ? ratingElement.getAttribute('data-service-review-rating') || 
                         ratingElement.textContent.trim() : '0',
                date: dateElement ? dateElement.getAttribute('datetime') || 
                       dateElement.textContent.trim() : '',
                reviewer: reviewerNameElement ? reviewerNameElement.textContent.trim() : ''
              };
              
              reviews.push(review);
            } catch (error) {
              console.error('Fout bij verwerken review element:', error);
            }
          });
          
          return { companyInfo, reviews };
        } catch (error) {
          console.error('Fout bij scrapen Trustpilot reviews:', error);
          return { companyInfo: {}, reviews: [] };
        }
      }, SCRAPING_CONFIGS.trustpilot.selectors);
      
      if (!result.reviews || result.reviews.length === 0) {
        logger.warn(`Puppeteer: Geen Trustpilot reviews gevonden voor bedrijf: ${companyName}`);
        return { 
          companyName: result.companyInfo.name || companyName,
          rating: 0,
          reviewCount: 0,
          reviews: [] 
        };
      }
      
      logger.info(`Puppeteer: ${result.reviews.length} Trustpilot reviews gescraped voor bedrijf: ${result.companyInfo.name || companyName}`);
      
      // Verwerk het resultaat naar het juiste formaat
      return {
        companyName: result.companyInfo.name || companyName,
        rating: extractRating(result.companyInfo.rating),
        reviewCount: extractNumber(result.companyInfo.reviewCount),
        url: result.companyInfo.url,
        reviews: result.reviews.map(review => ({
          id: review.id,
          title: review.title,
          content: review.content,
          rating: extractRating(review.rating),
          date: review.date || new Date().toISOString(),
          reviewer: review.reviewer
        }))
      };
    } catch (error) {
      logger.error(`Puppeteer: Fout bij scrapen Trustpilot reviews: ${error.message}`);
      return { companyName, rating: 0, reviewCount: 0, reviews: [] };
    } finally {
      // Sluit de browser
      if (browser) {
        await browser.close();
        logger.info('Puppeteer browser gesloten');
      }
    }
  }
};

/**
 * Helper functie om getallen uit tekst te extraheren (bijv. '1.5M' -> 1500000)
 * @param {string} text - Tekst met getallen
 * @returns {number} - Geëxtraheerd getal
 */
const extractNumber = (text) => {
  if (!text) return 0;
  
  // Verwijder niet-numerieke tekens behalve punt en komma
  let cleanText = text.replace(/[^0-9.,]/g, '');
  
  // Vervang komma's door punten voor decimalen
  cleanText = cleanText.replace(',', '.');
  
  // Converteer naar getal
  let num = parseFloat(cleanText);
  
  // Pas multiplier toe op basis van suffix
  if (text.includes('K') || text.includes('k')) {
    num *= 1000;
  } else if (text.includes('M') || text.includes('m')) {
    num *= 1000000;
  } else if (text.includes('B') || text.includes('b')) {
    num *= 1000000000;
  }
  
  return Math.round(num) || 0;
};

/**
 * Helper functie om sterrenrating te extraheren uit een element
 * @param {string} ratingText - Tekst met sterrenrating
 * @returns {number} - Rating als getal (1-5)
 */
const extractRating = (ratingText) => {
  if (!ratingText) return 0;
  
  // Zoek naar getallen in de tekst
  const matches = ratingText.match(/[0-9]+(\.[0-9]+)?/);
  if (matches && matches.length > 0) {
    return parseFloat(matches[0]);
  }
  
  // Als er geen getallen zijn, tel het aantal sterren-symbolen
  const starCount = (ratingText.match(/★/g) || []).length;
  return starCount || 0;
};

export default puppeteerService;
