/**
 * Scraper service voor het verzamelen van trending topics data van verschillende bronnen
 * Gebruikt Puppeteer voor web scraping met proxy ondersteuning
 */

// Puppeteer imports
// Deze imports zullen werken nadat de dependencies zijn geïnstalleerd
// npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth

/**
 * Schraapt trending topics van Twitter/X
 * @param {Object} options - Opties voor de scraper
 * @param {string} options.timeframe - Tijdsperiode ('day', 'week', 'month')
 * @param {string} options.location - Locatie voor trending topics (bijv. 'worldwide', 'netherlands')
 * @param {string} options.proxyServer - Optionele proxy server (bijv. 'http://user:pass@ip:port')
 * @returns {Promise<Array>} - Promise met trending topics data
 */
export const scrapeTwitterTrends = async (options = {}) => {
  const puppeteer = require('puppeteer-extra');
  const StealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(StealthPlugin());
  
  const { 
    timeframe = 'day', 
    location = 'worldwide',
    proxyServer = null
  } = options;
  
  try {
    // Configureer browser opties
    const browserOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    };
    
    // Voeg proxy toe indien opgegeven
    if (proxyServer) {
      browserOptions.args.push(`--proxy-server=${proxyServer}`);
    }
    
    // Start browser
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    
    // Stel user agent in
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36');
    
    // Navigeer naar Twitter Explore pagina
    await page.goto('https://twitter.com/explore', { waitUntil: 'networkidle2' });
    
    // Wacht op trending topics sectie
    await page.waitForSelector('[data-testid="trend"]', { timeout: 30000 });
    
    // Extraheer trending topics
    const trendingTopics = await page.evaluate(() => {
      const trends = Array.from(document.querySelectorAll('[data-testid="trend"]'));
      
      return trends.map(trend => {
        const topicElement = trend.querySelector('[data-testid="trendName"]');
        const categoryElement = trend.querySelector('[data-testid="trendCategory"]');
        const countElement = trend.querySelector('[data-testid="trendMetadata"]');
        
        const topic = topicElement ? topicElement.textContent.trim() : '';
        const category = categoryElement ? categoryElement.textContent.trim() : '';
        const countText = countElement ? countElement.textContent.trim() : '';
        
        // Extraheer aantal tweets (bijv. "12.5K Tweets")
        const countMatch = countText.match(/(\d+(?:\.\d+)?[KMB]?)/);
        const count = countMatch ? countMatch[0] : '';
        
        // Converteer count naar nummer
        let numericCount = 0;
        if (count) {
          const multiplier = count.endsWith('K') ? 1000 : count.endsWith('M') ? 1000000 : count.endsWith('B') ? 1000000000 : 1;
          numericCount = parseFloat(count.replace(/[KMB]/g, '')) * multiplier;
        }
        
        return {
          topic,
          category,
          count: numericCount,
          source: 'twitter',
          timestamp: new Date().toISOString()
        };
      });
    });
    
    // Sluit browser
    await browser.close();
    
    return trendingTopics;
  } catch (error) {
    console.error('Error scraping Twitter trends:', error);
    return [];
  }
};

/**
 * Schraapt trending topics van Google Trends
 * @param {Object} options - Opties voor de scraper
 * @param {string} options.timeframe - Tijdsperiode ('day', 'week', 'month')
 * @param {string} options.geo - Geografische locatie (bijv. 'NL', 'US', 'GB')
 * @param {string} options.proxyServer - Optionele proxy server
 * @returns {Promise<Array>} - Promise met trending topics data
 */
export const scrapeGoogleTrends = async (options = {}) => {
  const puppeteer = require('puppeteer-extra');
  const StealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(StealthPlugin());
  
  const { 
    timeframe = 'day', 
    geo = 'NL',
    proxyServer = null
  } = options;
  
  try {
    // Configureer browser opties
    const browserOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    };
    
    // Voeg proxy toe indien opgegeven
    if (proxyServer) {
      browserOptions.args.push(`--proxy-server=${proxyServer}`);
    }
    
    // Start browser
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    
    // Stel user agent in
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36');
    
    // Bepaal URL op basis van timeframe
    let trendUrl = 'https://trends.google.com/trends/trendingsearches/daily';
    
    if (timeframe === 'realtime') {
      trendUrl = 'https://trends.google.com/trends/trendingsearches/realtime';
    }
    
    // Voeg geo parameter toe
    trendUrl += `?geo=${geo}`;
    
    // Navigeer naar Google Trends pagina
    await page.goto(trendUrl, { waitUntil: 'networkidle2' });
    
    // Wacht op trending searches
    await page.waitForSelector('.feed-item', { timeout: 30000 });
    
    // Extraheer trending topics
    const trendingTopics = await page.evaluate(() => {
      const trends = Array.from(document.querySelectorAll('.feed-item'));
      
      return trends.map(trend => {
        const titleElement = trend.querySelector('.title');
        const trafficElement = trend.querySelector('.search-count-title');
        const articleElement = trend.querySelector('.summary-text');
        
        const topic = titleElement ? titleElement.textContent.trim() : '';
        const trafficText = trafficElement ? trafficElement.textContent.trim() : '';
        const relatedArticle = articleElement ? articleElement.textContent.trim() : '';
        
        // Extraheer zoek volume (bijv. "50K+ searches")
        const trafficMatch = trafficText.match(/(\d+(?:\.\d+)?[KMB]?\+?)/);
        const traffic = trafficMatch ? trafficMatch[0] : '';
        
        // Converteer traffic naar nummer
        let numericTraffic = 0;
        if (traffic) {
          const multiplier = traffic.includes('K') ? 1000 : traffic.includes('M') ? 1000000 : traffic.includes('B') ? 1000000000 : 1;
          numericTraffic = parseFloat(traffic.replace(/[KMB+]/g, '')) * multiplier;
        }
        
        return {
          topic,
          count: numericTraffic,
          relatedArticle,
          source: 'google',
          timestamp: new Date().toISOString()
        };
      });
    });
    
    // Sluit browser
    await browser.close();
    
    return trendingTopics;
  } catch (error) {
    console.error('Error scraping Google Trends:', error);
    return [];
  }
};

/**
 * Schraapt trending topics van Reddit
 * @param {Object} options - Opties voor de scraper
 * @param {string} options.timeframe - Tijdsperiode ('day', 'week', 'month')
 * @param {string} options.subreddit - Specifieke subreddit (optioneel, standaard populaire posts)
 * @param {string} options.proxyServer - Optionele proxy server
 * @returns {Promise<Array>} - Promise met trending topics data
 */
export const scrapeRedditTrends = async (options = {}) => {
  const puppeteer = require('puppeteer-extra');
  const StealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(StealthPlugin());
  
  const { 
    timeframe = 'day', 
    subreddit = '',
    proxyServer = null
  } = options;
  
  try {
    // Configureer browser opties
    const browserOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    };
    
    // Voeg proxy toe indien opgegeven
    if (proxyServer) {
      browserOptions.args.push(`--proxy-server=${proxyServer}`);
    }
    
    // Start browser
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    
    // Stel user agent in
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36');
    
    // Bepaal URL op basis van parameters
    let redditUrl = 'https://www.reddit.com/';
    
    if (subreddit) {
      redditUrl += `r/${subreddit}/`;
    }
    
    // Voeg timeframe toe
    switch (timeframe) {
      case 'day':
        redditUrl += 'top/?t=day';
        break;
      case 'week':
        redditUrl += 'top/?t=week';
        break;
      case 'month':
        redditUrl += 'top/?t=month';
        break;
      default:
        redditUrl += 'hot/';
    }
    
    // Navigeer naar Reddit pagina
    await page.goto(redditUrl, { waitUntil: 'networkidle2' });
    
    // Wacht op posts
    await page.waitForSelector('[data-testid="post-container"]', { timeout: 30000 });
    
    // Extraheer trending topics
    const trendingTopics = await page.evaluate(() => {
      const posts = Array.from(document.querySelectorAll('[data-testid="post-container"]'));
      
      return posts.slice(0, 20).map(post => {
        const titleElement = post.querySelector('[data-testid="post-title"]');
        const upvotesElement = post.querySelector('[data-testid="post-karma"]');
        const commentsElement = post.querySelector('[data-testid="comments-count"]');
        const subredditElement = post.querySelector('[data-testid="subreddit-name"]');
        
        const title = titleElement ? titleElement.textContent.trim() : '';
        const upvotesText = upvotesElement ? upvotesElement.textContent.trim() : '';
        const commentsText = commentsElement ? commentsElement.textContent.trim() : '';
        const subreddit = subredditElement ? subredditElement.textContent.trim() : '';
        
        // Extraheer upvotes (bijv. "12.5k")
        const upvotes = parseFloat(upvotesText.replace(/[k]/gi, '')) * (upvotesText.toLowerCase().includes('k') ? 1000 : 1);
        
        // Extraheer comments (bijv. "123 comments")
        const comments = parseInt(commentsText.replace(/\D/g, '')) || 0;
        
        // Extraheer keywords uit titel
        const keywords = title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .split(' ')
          .filter(word => word.length > 3)
          .filter(word => !['this', 'that', 'what', 'when', 'where', 'which', 'with', 'would', 'could', 'should'].includes(word));
        
        return {
          topic: title,
          keywords,
          upvotes,
          comments,
          subreddit,
          count: upvotes,
          source: 'reddit',
          timestamp: new Date().toISOString()
        };
      });
    });
    
    // Sluit browser
    await browser.close();
    
    return trendingTopics;
  } catch (error) {
    console.error('Error scraping Reddit trends:', error);
    return [];
  }
};

/**
 * Combineert trending topics data van verschillende bronnen
 * @param {Object} options - Opties voor de scraper
 * @param {Array<string>} options.sources - Bronnen om te scrapen ('twitter', 'google', 'reddit')
 * @param {string} options.timeframe - Tijdsperiode ('day', 'week', 'month')
 * @param {Object} options.proxyConfig - Proxy configuratie per bron
 * @returns {Promise<Array>} - Promise met gecombineerde trending topics data
 */
export const scrapeTrendingTopics = async (options = {}) => {
  const {
    sources = ['twitter', 'google', 'reddit'],
    timeframe = 'day',
    proxyConfig = {}
  } = options;
  
  const results = [];
  
  // Scrape elke bron parallel
  const promises = [];
  
  if (sources.includes('twitter')) {
    promises.push(
      scrapeTwitterTrends({
        timeframe,
        proxyServer: proxyConfig.twitter
      })
    );
  }
  
  if (sources.includes('google')) {
    promises.push(
      scrapeGoogleTrends({
        timeframe,
        proxyServer: proxyConfig.google
      })
    );
  }
  
  if (sources.includes('reddit')) {
    promises.push(
      scrapeRedditTrends({
        timeframe,
        proxyServer: proxyConfig.reddit
      })
    );
  }
  
  // Wacht op alle scrape operaties
  const scrapedResults = await Promise.all(promises);
  
  // Combineer resultaten
  scrapedResults.forEach(result => {
    results.push(...result);
  });
  
  return results;
};

/**
 * Schraapt events data die gerelateerd zijn aan trending topics
 * @param {Array} topics - Array met trending topics
 * @param {Object} options - Opties voor de scraper
 * @returns {Promise<Array>} - Promise met events data
 */
export const scrapeRelatedEvents = async (topics, options = {}) => {
  const puppeteer = require('puppeteer-extra');
  const StealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(StealthPlugin());
  
  const { 
    maxEvents = 10,
    proxyServer = null
  } = options;
  
  // Selecteer top topics op basis van count
  const topTopics = [...topics]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(topic => topic.topic);
  
  try {
    // Configureer browser opties
    const browserOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    };
    
    // Voeg proxy toe indien opgegeven
    if (proxyServer) {
      browserOptions.args.push(`--proxy-server=${proxyServer}`);
    }
    
    // Start browser
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    
    // Stel user agent in
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36');
    
    const events = [];
    
    // Zoek naar nieuws voor elk topic
    for (const topic of topTopics) {
      // Navigeer naar Google News
      await page.goto(`https://news.google.com/search?q=${encodeURIComponent(topic)}&hl=nl&gl=NL&ceid=NL:nl`, 
        { waitUntil: 'networkidle2' });
      
      // Wacht op artikelen
      await page.waitForSelector('article', { timeout: 30000 });
      
      // Extraheer nieuws artikelen
      const articles = await page.evaluate((topicName) => {
        const items = Array.from(document.querySelectorAll('article')).slice(0, 3);
        
        return items.map(item => {
          const titleElement = item.querySelector('h3');
          const sourceElement = item.querySelector('time');
          const linkElement = item.querySelector('a');
          
          const title = titleElement ? titleElement.textContent.trim() : '';
          const timeAgo = sourceElement ? sourceElement.textContent.trim() : '';
          const url = linkElement ? linkElement.href : '';
          
          // Bereken geschatte datum op basis van 'timeAgo'
          const now = new Date();
          let eventDate = new Date(now);
          
          if (timeAgo.includes('uur')) {
            const hours = parseInt(timeAgo) || 1;
            eventDate.setHours(now.getHours() - hours);
          } else if (timeAgo.includes('dag')) {
            const days = parseInt(timeAgo) || 1;
            eventDate.setDate(now.getDate() - days);
          } else if (timeAgo.includes('week')) {
            const weeks = parseInt(timeAgo) || 1;
            eventDate.setDate(now.getDate() - (weeks * 7));
          }
          
          return {
            id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title,
            description: `Nieuws gerelateerd aan ${topicName}`,
            date: eventDate.toISOString(),
            source: url,
            category: 'News',
            relatedTopic: topicName
          };
        });
      }, topic);
      
      events.push(...articles);
      
      // Pauzeer om rate limiting te voorkomen
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Sluit browser
    await browser.close();
    
    // Limiteer aantal events
    return events.slice(0, maxEvents);
  } catch (error) {
    console.error('Error scraping related events:', error);
    return [];
  }
};

/**
 * Genereert mock trending topics data voor testen
 * @param {string} timeframe - Tijdsperiode ('day', 'week', 'month', 'quarter', 'year', 'all')
 * @param {Object} options - Extra opties
 * @returns {Array} - Array met mock trending topics data
 */
export const generateMockTopicData = (timeframe = 'month', options = {}) => {
  const { count = 50 } = options;
  
  const topics = [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 
    'Blockchain', 'Cryptocurrency', 'Bitcoin', 'Ethereum',
    'Climate Change', 'Renewable Energy', 'Sustainability',
    'COVID-19', 'Vaccination', 'Public Health',
    'Remote Work', 'Digital Nomad', 'Work-Life Balance',
    'Social Media', 'TikTok', 'Instagram', 'Twitter',
    'Cybersecurity', 'Data Privacy', 'Hacking',
    'Startup', 'Entrepreneurship', 'Venture Capital',
    'Cloud Computing', 'SaaS', 'Serverless',
    'Mobile Apps', 'iOS', 'Android',
    'E-commerce', 'Online Shopping', 'Retail',
    'Gaming', 'Esports', 'Virtual Reality', 'Augmented Reality',
    'Electric Vehicles', 'Tesla', 'Autonomous Driving',
    'Space Exploration', 'SpaceX', 'NASA', 'Mars',
    'Mental Health', 'Wellness', 'Meditation',
    'NFT', 'Digital Art', 'Metaverse'
  ];
  
  const sources = ['twitter', 'reddit', 'news', 'google', 'facebook'];
  
  const result = [];
  
  // Genereer timestamps op basis van timeframe
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }
  
  // Genereer data punten
  for (let i = 0; i < count; i++) {
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    
    // Genereer random timestamp tussen startDate en now
    const timestamp = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
    
    result.push({
      topic: randomTopic,
      count: Math.floor(Math.random() * 10000) + 100,
      source: randomSource,
      timestamp: timestamp.toISOString()
    });
  }
  
  return result;
};

/**
 * Genereert mock events data voor testen
 * @param {string} timeframe - Tijdsperiode ('day', 'week', 'month', 'quarter', 'year', 'all')
 * @param {Object} options - Extra opties
 * @returns {Array} - Array met mock events data
 */
export const generateMockEventsData = (timeframe = 'month', options = {}) => {
  const { count = 10 } = options;
  
  const eventTitles = [
    'Major Product Launch', 'Industry Conference', 'Company Acquisition',
    'New Regulation Announced', 'Market Crash', 'Viral Social Media Trend',
    'Celebrity Endorsement', 'Security Breach', 'Research Breakthrough',
    'Global Summit', 'Policy Change', 'Award Ceremony',
    'Public Scandal', 'Viral Marketing Campaign', 'Major Update Release'
  ];
  
  const categories = ['Product', 'Industry', 'Market', 'Social', 'Technology', 'Policy', 'PR'];
  
  const result = [];
  
  // Genereer timestamps op basis van timeframe
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'day':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
  }
  
  // Genereer events
  for (let i = 0; i < count; i++) {
    const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Genereer random timestamp tussen startDate en now
    const date = new Date(startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime()));
    
    result.push({
      id: `event-${i}`,
      title: randomTitle,
      description: `Dit is een beschrijving van ${randomTitle.toLowerCase()}. Dit event heeft impact gehad op verschillende trending topics.`,
      date: date.toISOString(),
      category: randomCategory,
      source: 'https://example.com/event'
    });
  }
  
  return result;
};
