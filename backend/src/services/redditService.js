import axios from 'axios';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { redditApiService } from './redditApiService.js';
import { apifyService } from './apifyService.js';
import { puppeteerService } from './puppeteerService.js';

/**
 * Service voor het verzamelen en verwerken van Reddit data
 */
export const redditService = {
  /**
   * Verzamel Reddit data voor een project
   * @param {string} projectId - ID van het project
   * @param {object} settings - Instellingen voor dataverzameling
   * @returns {Promise<Array>} - Array met verzamelde Reddit data
   */
  async collectData(projectId, settings) {
    try {
      logger.info(`Reddit data verzamelen gestart voor project ${projectId}`);
      
      // Haal project op om te controleren of het bestaat
      const { data: project, error: projectError } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) {
        logger.error(`Fout bij ophalen project: ${projectError.message}`);
        throw new Error('Project niet gevonden');
      }
      
      // Haal instellingen op uit settings of project
      const keywords = settings?.keywords || project.research_scope?.keywords || [];
      const subreddits = settings?.subreddits || [];
      const timeframe = settings?.timeframe || project.research_scope?.timeframe || 'laatste_maand';
      const includeComments = settings?.includeComments !== undefined ? settings.includeComments : true;
      
      // Controleer of er keywords zijn
      if (keywords.length === 0) {
        throw new Error('Geen zoekwoorden gespecificeerd voor Reddit dataverzameling');
      }
      
      // Verzamel data voor elk keyword
      const allData = [];
      
      // Controleer welke methode we moeten gebruiken voor dataverzameling
      const usePuppeteer = process.env.USE_PUPPETEER === 'true';
      const useApify = !usePuppeteer && process.env.USE_APIFY === 'true' && process.env.APIPY_API_TOKEN;
      const useRealApi = !usePuppeteer && !useApify && process.env.USE_REAL_REDDIT_API === 'true' && 
                         process.env.REDDIT_CLIENT_ID && 
                         process.env.REDDIT_CLIENT_SECRET && 
                         process.env.REDDIT_USERNAME && 
                         process.env.REDDIT_PASSWORD;
      
      for (const keyword of keywords) {
        let redditData;
        
        if (usePuppeteer) {
          // Gebruik Puppeteer voor Reddit data
          try {
            logger.info(`Puppeteer gebruiken voor Reddit data voor keyword: ${keyword}`);
            
            // Haal posts op via Puppeteer
            const posts = await puppeteerService.scrapeRedditPosts(keyword, {
              scrollCount: 3 // Scroll 3 keer om meer resultaten te laden
            });
            
            // Als er specifieke subreddits zijn opgegeven, haal daar ook posts op
            if (subreddits.length > 0) {
              for (const subreddit of subreddits) {
                try {
                  // Gebruik de puppeteerService om de subreddit te scrapen
                  const subredditPosts = await puppeteerService.scrapeRedditPosts(`${keyword} subreddit:${subreddit}`, {
                    scrollCount: 2
                  });
                  
                  // Voeg de posts toe aan de hoofdlijst
                  if (subredditPosts && subredditPosts.length > 0) {
                    posts.push(...subredditPosts);
                  }
                } catch (subredditError) {
                  logger.warn(`Fout bij scrapen subreddit ${subreddit}: ${subredditError.message}`);
                }
              }
            }
            
            // Haal details op voor de eerste paar posts als comments nodig zijn
            if (includeComments && posts.length > 0) {
              // Beperk tot maximaal 5 posts om performance te behouden
              const postsForDetails = posts.slice(0, 5);
              
              for (let i = 0; i < postsForDetails.length; i++) {
                try {
                  const postDetails = await puppeteerService.scrapeRedditPostDetails(posts[i].url);
                  if (postDetails && postDetails.comments) {
                    posts[i].comments = postDetails.comments;
                    posts[i].content = postDetails.content || posts[i].content;
                  }
                } catch (detailsError) {
                  logger.warn(`Fout bij ophalen details voor post ${posts[i].id}: ${detailsError.message}`);
                }
              }
            }
            
            // Verwerk de posts naar het juiste formaat voor onze applicatie
            redditData = posts.map(post => ({
              id: post.id,
              subreddit: post.subreddit,
              title: post.title,
              content: post.content || '',
              upvotes: post.score || 0,
              commentCount: post.commentCount || 0,
              author: post.author || '',
              created_at: post.created || new Date().toISOString(),
              comments: post.comments || [],
              sentiment: this.calculateSentiment(post.score || 0, post.title, post.content || ''),
              keywords: this.generateRelatedKeywords(keyword, 5)
            }));
          } catch (puppeteerError) {
            logger.error(`Fout bij gebruik Puppeteer voor Reddit data: ${puppeteerError.message}. Terugvallen op volgende methode.`);
            // Terugvallen op Apify of directe API
            if (useApify) {
              try {
                logger.info(`Terugvallen op Apify voor Reddit data voor keyword: ${keyword}`);
                
                // Stel opties samen voor Apify
                const apifyOptions = {
                  maxItems: 50,
                  includeComments: includeComments,
                  maxComments: 20
                };
                
                // Voeg subreddits toe als ze zijn opgegeven
                if (subreddits.length > 0) {
                  apifyOptions.subreddits = subreddits;
                }
                
                // Haal posts op via Apify
                const posts = await apifyService.getRedditPosts(keyword, apifyOptions);
                
                // Verwerk de posts naar het juiste formaat
                redditData = apifyService.processRedditPosts(posts);
              } catch (apifyError) {
                logger.error(`Fout bij gebruik Apify voor Reddit data: ${apifyError.message}. Terugvallen op gesimuleerde data.`);
                // Terugvallen op gesimuleerde data
                redditData = await this.simulateRedditDataCollection(
                  keyword, 
                  subreddits, 
                  timeframe, 
                  includeComments
                );
              }
            } else {
              // Terugvallen op gesimuleerde data
              redditData = await this.simulateRedditDataCollection(
                keyword, 
                subreddits, 
                timeframe, 
                includeComments
              );
            }
          }
        } else if (useApify) {
          // Gebruik Apify voor Reddit data
          try {
            logger.info(`Apify gebruiken voor Reddit data voor keyword: ${keyword}`);
            
            // Stel opties samen voor Apify
            const apifyOptions = {
              maxItems: 50,
              includeComments: includeComments,
              maxComments: 20
            };
            
            // Voeg subreddits toe als ze zijn opgegeven
            if (subreddits.length > 0) {
              apifyOptions.subreddits = subreddits;
            }
            
            // Haal posts op via Apify
            const posts = await apifyService.getRedditPosts(keyword, apifyOptions);
            
            // Verwerk de posts naar het juiste formaat
            redditData = apifyService.processRedditPosts(posts);
          } catch (apifyError) {
            logger.error(`Fout bij gebruik Apify voor Reddit data: ${apifyError.message}. Terugvallen op gesimuleerde data.`);
            // Terugvallen op gesimuleerde data bij een API fout
            redditData = await this.simulateRedditDataCollection(
              keyword, 
              subreddits, 
              timeframe, 
              includeComments
            );
          }
        } else if (useRealApi) {
          // Gebruik de echte Reddit API
          try {
            logger.info(`Echte Reddit API gebruiken voor keyword: ${keyword}`);
            
            // Bepaal de juiste timeframe voor de Reddit API
            const apiTimeframe = this.convertTimeframeToRedditApi(timeframe);
            
            // Zoek posts op Reddit met het keyword
            const searchResults = await redditApiService.searchPosts(keyword, {
              sort: 'relevance',
              timeframe: apiTimeframe,
              limit: 25
            });
            
            // Als er specifieke subreddits zijn opgegeven, haal daar ook posts op
            if (subreddits.length > 0) {
              for (const subreddit of subreddits) {
                const subredditPosts = await redditApiService.getSubredditPosts(subreddit, {
                  sort: 'hot',
                  timeframe: apiTimeframe,
                  limit: 10
                });
                
                // Filter posts die relevant zijn voor het keyword
                const relevantPosts = subredditPosts.filter(post => 
                  post.title.toLowerCase().includes(keyword.toLowerCase()) || 
                  (post.selftext && post.selftext.toLowerCase().includes(keyword.toLowerCase()))
                );
                
                // Voeg relevante posts toe aan de zoekresultaten
                searchResults.push(...relevantPosts);
              }
            }
            
            // Haal comments op voor de posts als dat is ingeschakeld
            if (includeComments && searchResults.length > 0) {
              // Beperk tot maximaal 5 posts om API-limieten te respecteren
              const postsForComments = searchResults.slice(0, 5);
              
              for (const post of postsForComments) {
                try {
                  const comments = await redditApiService.getPostComments(post.id, post.subreddit, {
                    sort: 'confidence',
                    limit: 10
                  });
                  
                  // Voeg comments toe aan de post
                  post.comments = comments;
                } catch (commentError) {
                  logger.warn(`Fout bij ophalen comments voor post ${post.id}: ${commentError.message}`);
                  post.comments = [];
                }
              }
            }
            
            // Analyseer de posts voor sentiment en keywords
            const analysis = redditApiService.analyzePosts(searchResults);
            
            // Converteer de data naar het juiste formaat
            redditData = this.convertRedditApiDataToFormat(searchResults, keyword, analysis);
          } catch (apiError) {
            logger.error(`Fout bij gebruik echte Reddit API: ${apiError.message}. Terugvallen op gesimuleerde data.`);
            // Terugvallen op gesimuleerde data bij een API fout
            redditData = await this.simulateRedditDataCollection(
              keyword, 
              subreddits, 
              timeframe, 
              includeComments
            );
          }
        } else {
          // Gebruik gesimuleerde data
          logger.info(`Gesimuleerde Reddit data gebruiken voor keyword: ${keyword}`);
          redditData = await this.simulateRedditDataCollection(
            keyword, 
            subreddits, 
            timeframe, 
            includeComments
          );
        }
        
        // Voeg data toe aan allData array
        allData.push(...redditData);
      }
      
      // Sla data op in Supabase
      if (allData.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('reddit_data')
          .insert(allData.map(item => ({
            project_id: projectId,
            subreddit: item.subreddit,
            post_id: item.id,
            title: item.title,
            content: item.content,
            upvotes: item.upvotes,
            comment_count: item.commentCount,
            sentiment: item.sentiment,
            keywords: item.keywords,
            created_at: new Date().toISOString()
          })));
        
        if (insertError) {
          logger.error(`Fout bij opslaan Reddit data: ${insertError.message}`);
          throw new Error('Fout bij opslaan van Reddit data');
        }
      }
      
      logger.info(`Reddit data verzamelen voltooid voor project ${projectId}, ${allData.length} items verzameld`);
      return allData;
    } catch (error) {
      logger.error(`Fout bij verzamelen Reddit data: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Simuleer het verzamelen van Reddit data (voor demo doeleinden)
   * In een echte implementatie zou je hier de Reddit API gebruiken
   */
  async simulateRedditDataCollection(keyword, subreddits, timeframe, includeComments) {
    // Simuleer een vertraging om een API call na te bootsen
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Genereer een aantal willekeurige posts
    const numPosts = Math.floor(Math.random() * 10) + 5; // 5-15 posts
    const posts = [];
    
    // Lijst van mogelijke subreddits als er geen zijn gespecificeerd
    const defaultSubreddits = [
      'technology', 'gadgets', 'apple', 'android', 'programming',
      'webdev', 'marketing', 'business', 'entrepreneur', 'startups'
    ];
    
    // Gebruik gespecificeerde subreddits of defaults
    const subredditList = subreddits.length > 0 ? subreddits : defaultSubreddits;
    
    for (let i = 0; i < numPosts; i++) {
      // Kies een willekeurige subreddit
      const subreddit = subredditList[Math.floor(Math.random() * subredditList.length)];
      
      // Genereer een willekeurige post
      const post = {
        id: `t3_${Math.random().toString(36).substring(2, 10)}`,
        subreddit,
        title: this.generateTitle(keyword, subreddit),
        content: this.generateContent(keyword),
        upvotes: Math.floor(Math.random() * 1000),
        commentCount: Math.floor(Math.random() * 100),
        sentiment: (Math.random() * 2 - 1).toFixed(2), // -1 tot 1
        keywords: [keyword, ...this.generateRelatedKeywords(keyword, 3)],
        created_at: new Date(Date.now() - Math.random() * this.getTimeframeMilliseconds(timeframe)).toISOString()
      };
      
      posts.push(post);
      
      // Voeg comments toe als dat is ingeschakeld
      if (includeComments) {
        const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments
        
        for (let j = 0; j < numComments; j++) {
          const comment = {
            id: `t1_${Math.random().toString(36).substring(2, 10)}`,
            subreddit,
            title: '', // Comments hebben geen titel
            content: this.generateComment(keyword),
            upvotes: Math.floor(Math.random() * 100),
            commentCount: 0,
            sentiment: (Math.random() * 2 - 1).toFixed(2), // -1 tot 1
            keywords: [keyword, ...this.generateRelatedKeywords(keyword, 2)],
            created_at: new Date(Date.now() - Math.random() * this.getTimeframeMilliseconds(timeframe)).toISOString()
          };
          
          posts.push(comment);
        }
      }
    }
    
    return posts;
  },
  
  /**
   * Genereer een titel voor een gesimuleerde Reddit post
   */
  generateTitle(keyword, subreddit) {
    const templates = [
      `Wat vinden jullie van ${keyword}?`,
      `Mijn ervaring met ${keyword}`,
      `${keyword} review na 6 maanden gebruik`,
      `Heeft iemand ervaring met ${keyword}?`,
      `${keyword} vs concurrenten - mijn mening`,
      `Nieuw op de markt: ${keyword}`,
      `Problemen met ${keyword}`,
      `${keyword} - waarom is het zo populair?`,
      `Ik ben teleurgesteld in ${keyword}`,
      `${keyword} heeft mijn verwachtingen overtroffen!`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  },
  
  /**
   * Genereer content voor een gesimuleerde Reddit post
   */
  generateContent(keyword) {
    const templates = [
      `Ik heb onlangs ${keyword} aangeschaft en wilde mijn ervaringen delen. Tot nu toe ben ik erg tevreden met de kwaliteit en functionaliteit. Het heeft alle functies die ik nodig heb en werkt betrouwbaar. De prijs-kwaliteitverhouding is uitstekend.`,
      
      `Heeft iemand ervaring met ${keyword}? Ik overweeg het te kopen maar twijfel nog. Wat zijn de voor- en nadelen volgens jullie? Is het de investering waard of zijn er betere alternatieven?`,
      
      `Na 6 maanden gebruik van ${keyword} kan ik zeggen dat ik gemengde gevoelens heb. Aan de ene kant werkt het goed voor basistaken, maar ik heb ook wat problemen ondervonden met de duurzaamheid. Ik vraag me af of anderen dezelfde ervaring hebben.`,
      
      `${keyword} heeft me echt teleurgesteld. De kwaliteit is veel lager dan verwacht en de klantenservice is verschrikkelijk. Ik zou het niemand aanraden. Heeft iemand suggesties voor betere alternatieven?`,
      
      `Ik ben super enthousiast over mijn nieuwe ${keyword}! Het heeft mijn verwachtingen overtroffen op alle gebieden. De functionaliteit is geweldig, het design is prachtig en het werkt feilloos. Absoluut een aanrader voor iedereen die op zoek is naar dit soort product.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  },
  
  /**
   * Genereer een comment voor een gesimuleerde Reddit post
   */
  generateComment(keyword) {
    const templates = [
      `Ik heb ${keyword} nu een jaar en ben er erg tevreden mee. Geen klachten!`,
      `${keyword} was een teleurstelling voor mij. Niet aan te raden.`,
      `Heeft iemand problemen gehad met de klantenservice van ${keyword}?`,
      `Ik vind ${keyword} geweldig! Beste aankoop van het jaar.`,
      `${keyword} is oké, maar er zijn betere alternatieven voor dezelfde prijs.`,
      `Ik heb gemengde gevoelens over ${keyword}. Sommige functies zijn geweldig, andere niet zo.`,
      `Weet iemand of er binnenkort een nieuwe versie van ${keyword} uitkomt?`,
      `${keyword} heeft mijn verwachtingen overtroffen. Echt een aanrader!`,
      `Ik heb ${keyword} vergeleken met concurrenten en het komt als beste uit de test.`,
      `${keyword} heeft een aantal bugs die echt opgelost moeten worden.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  },
  
  /**
   * Genereer gerelateerde keywords voor een gesimuleerde Reddit post
   */
  generateRelatedKeywords(keyword, count) {
    const relatedKeywords = [
      `${keyword} review`,
      `${keyword} problemen`,
      `${keyword} alternatieven`,
      `${keyword} vs`,
      `${keyword} kopen`,
      `${keyword} prijs`,
      `${keyword} kwaliteit`,
      `${keyword} ervaring`,
      `${keyword} handleiding`,
      `${keyword} support`
    ];
    
    // Shuffle en pak de eerste 'count' items
    return relatedKeywords
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  },
  
  /**
   * Converteer een timeframe string naar milliseconden
   */
  getTimeframeMilliseconds(timeframe) {
    const day = 24 * 60 * 60 * 1000;
    
    switch (timeframe) {
      case 'laatste_week':
        return 7 * day;
      case 'laatste_maand':
        return 30 * day;
      case 'laatste_jaar':
        return 365 * day;
      case 'alles':
        return 3 * 365 * day; // 3 jaar
      default:
        return 30 * day; // Standaard: laatste maand
    }
  },
  
  /**
   * Converteer een timeframe string naar Reddit API timeframe formaat
   * @param {string} timeframe - Timeframe in intern formaat
   * @returns {string} - Timeframe in Reddit API formaat
   */
  convertTimeframeToRedditApi(timeframe) {
    switch (timeframe) {
      case 'laatste_week':
        return 'week';
      case 'laatste_maand':
        return 'month';
      case 'laatste_jaar':
        return 'year';
      case 'alles':
        return 'all';
      default:
        return 'month'; // Standaard: laatste maand
    }
  },
  
  /**
   * Converteer Reddit API data naar het interne formaat
   * @param {Array} posts - Array met posts van de Reddit API
   * @param {string} keyword - Zoekwoord waarmee de posts zijn gevonden
   * @param {object} analysis - Analyse resultaten van de posts
   * @returns {Array} - Array met posts in het interne formaat
   */
  convertRedditApiDataToFormat(posts, keyword, analysis) {
    try {
      if (!posts || posts.length === 0) {
        return [];
      }
      
      return posts.map(post => {
        // Basisinformatie
        const formattedPost = {
          id: post.id || `reddit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          subreddit: post.subreddit || '',
          title: post.title || '',
          content: post.selftext || '',
          upvotes: post.score || 0,
          commentCount: post.num_comments || 0,
          author: post.author || '',
          created_utc: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : new Date().toISOString()
        };
        
        // Voeg sentiment toe (uit analyse of bereken op basis van upvotes)
        if (analysis && analysis.sentiment !== undefined) {
          formattedPost.sentiment = analysis.sentiment;
        } else {
          // Eenvoudige sentiment berekening op basis van upvotes
          formattedPost.sentiment = Math.min(1, Math.max(-1, (post.score || 0) / 100));
        }
        
        // Voeg keywords toe (uit analyse of genereer op basis van titel/content)
        if (analysis && analysis.keywords && analysis.keywords.length > 0) {
          formattedPost.keywords = analysis.keywords.slice(0, 5).map(k => k.word);
        } else {
          formattedPost.keywords = this.generateRelatedKeywords(keyword, 5);
        }
        
        return formattedPost;
      });
    } catch (error) {
      logger.error(`Fout bij converteren Reddit API data: ${error.message}`);
      return [];
    }
  }
};

export default redditService;
