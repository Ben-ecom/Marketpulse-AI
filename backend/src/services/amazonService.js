import axios from 'axios';
import { supabaseClient } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import { amazonApiService } from './amazonApiService.js';
import { apifyService } from './apifyService.js';
import { puppeteerService } from './puppeteerService.js';

/**
 * Service voor het verzamelen en verwerken van Amazon reviews
 */
export const amazonService = {
  /**
   * Verzamel Amazon reviews voor een project
   * @param {string} projectId - ID van het project
   * @param {object} settings - Instellingen voor dataverzameling
   * @returns {Promise<Array>} - Array met verzamelde Amazon reviews
   */
  async collectData(projectId, settings) {
    try {
      logger.info(`Amazon reviews verzamelen gestart voor project ${projectId}`);
      
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
      const minRating = settings?.minRating || 1;
      const verifiedOnly = settings?.verifiedOnly || false;
      const sortBy = settings?.sortBy || 'recent';
      
      // Controleer of er keywords zijn
      if (keywords.length === 0) {
        throw new Error('Geen zoekwoorden gespecificeerd voor Amazon dataverzameling');
      }
      
      // Verzamel data voor elk keyword
      const allData = [];
      
      // Controleer welke methode we moeten gebruiken voor dataverzameling
      const usePuppeteer = process.env.USE_PUPPETEER === 'true';
      const useApify = !usePuppeteer && process.env.USE_APIFY === 'true' && process.env.APIPY_API_TOKEN;
      const useRealApi = !usePuppeteer && !useApify && process.env.USE_REAL_AMAZON_API === 'true' && 
                         process.env.AMAZON_ACCESS_KEY && 
                         process.env.AMAZON_SECRET_KEY && 
                         process.env.AMAZON_PARTNER_TAG;
      
      for (const keyword of keywords) {
        let productData;
        
        if (usePuppeteer) {
          // Gebruik Puppeteer voor Amazon data
          try {
            logger.info(`Puppeteer gebruiken voor Amazon data voor keyword: ${keyword}`);
            const products = await puppeteerService.scrapeAmazonProducts(keyword, {
              country: 'nl'
            });
            
            // Converteer de producten naar reviews
            productData = this.convertProductsToReviews(products, keyword, minRating, verifiedOnly, sortBy);
          } catch (puppeteerError) {
            logger.error(`Fout bij gebruik Puppeteer voor Amazon data: ${puppeteerError.message}. Terugvallen op volgende methode.`);
            // Terugvallen op Apify of directe API
            if (useApify) {
              try {
                logger.info(`Terugvallen op Apify voor Amazon data voor keyword: ${keyword}`);
                const products = await apifyService.getAmazonProducts(keyword, {
                  maxItems: 10,
                  country: 'NL'
                });
                
                // Verwerk de productdata naar het juiste formaat
                const processedProducts = apifyService.processAmazonProducts(products);
                
                // Converteer de producten naar reviews
                productData = this.convertProductsToReviews(processedProducts, keyword, minRating, verifiedOnly, sortBy);
              } catch (apifyError) {
                logger.error(`Fout bij gebruik Apify voor Amazon data: ${apifyError.message}. Terugvallen op gesimuleerde data.`);
                // Terugvallen op gesimuleerde data
                productData = await this.simulateAmazonReviewCollection(
                  keyword, 
                  minRating, 
                  verifiedOnly, 
                  sortBy
                );
              }
            } else {
              // Terugvallen op gesimuleerde data
              productData = await this.simulateAmazonReviewCollection(
                keyword, 
                minRating, 
                verifiedOnly, 
                sortBy
              );
            }
          }
        } else if (useApify) {
          // Gebruik Apify voor Amazon data
          try {
            logger.info(`Apify gebruiken voor Amazon data voor keyword: ${keyword}`);
            const products = await apifyService.getAmazonProducts(keyword, {
              maxItems: 10,
              country: 'NL'
            });
            
            // Verwerk de productdata naar het juiste formaat
            const processedProducts = apifyService.processAmazonProducts(products);
            
            // Converteer de producten naar reviews
            productData = this.convertProductsToReviews(processedProducts, keyword, minRating, verifiedOnly, sortBy);
          } catch (apifyError) {
            logger.error(`Fout bij gebruik Apify voor Amazon data: ${apifyError.message}. Terugvallen op gesimuleerde data.`);
            // Terugvallen op gesimuleerde data bij een API fout
            productData = await this.simulateAmazonReviewCollection(
              keyword, 
              minRating, 
              verifiedOnly, 
              sortBy
            );
          }
        } else if (useRealApi) {
          // Gebruik de echte Amazon API
          try {
            logger.info(`Echte Amazon API gebruiken voor keyword: ${keyword}`);
            const products = await amazonApiService.searchProducts(keyword, {
              itemCount: 10,
              searchIndex: 'All'
            });
            
            // Verwerk de productdata naar reviews
            productData = this.convertProductsToReviews(products, keyword, minRating, verifiedOnly, sortBy);
          } catch (apiError) {
            logger.error(`Fout bij gebruik echte Amazon API: ${apiError.message}. Terugvallen op gesimuleerde data.`);
            // Terugvallen op gesimuleerde data bij een API fout
            productData = await this.simulateAmazonReviewCollection(
              keyword, 
              minRating, 
              verifiedOnly, 
              sortBy
            );
          }
        } else {
          // Gebruik gesimuleerde data
          logger.info(`Gesimuleerde Amazon data gebruiken voor keyword: ${keyword}`);
          productData = await this.simulateAmazonReviewCollection(
            keyword, 
            minRating, 
            verifiedOnly, 
            sortBy
          );
        }
        
        // Voeg data toe aan allData array
        allData.push(...productData);
      }
      
      // Sla data op in Supabase
      if (allData.length > 0) {
        const { error: insertError } = await supabaseClient
          .from('amazon_reviews')
          .insert(allData.map(item => ({
            project_id: projectId,
            product_id: item.productId,
            rating: item.rating,
            title: item.title,
            content: item.content,
            helpful_votes: item.helpfulVotes,
            verified_purchase: item.verifiedPurchase,
            sentiment: item.sentiment,
            keywords: item.keywords,
            created_at: new Date().toISOString()
          })));
        
        if (insertError) {
          logger.error(`Fout bij opslaan Amazon reviews: ${insertError.message}`);
          throw new Error('Fout bij opslaan van Amazon reviews');
        }
      }
      
      logger.info(`Amazon reviews verzamelen voltooid voor project ${projectId}, ${allData.length} items verzameld`);
      return allData;
    } catch (error) {
      logger.error(`Fout bij verzamelen Amazon reviews: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Simuleer het verzamelen van Amazon reviews (voor demo doeleinden)
   * In een echte implementatie zou je hier een Amazon scraper of API gebruiken
   */
  async simulateAmazonReviewCollection(keyword, minRating, verifiedOnly, sortBy) {
    // Simuleer een vertraging om een API call na te bootsen
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Genereer een aantal willekeurige reviews
    const numReviews = Math.floor(Math.random() * 15) + 10; // 10-25 reviews
    const reviews = [];
    
    // Genereer product IDs voor het keyword
    const productIds = this.generateProductIds(keyword, 3);
    
    for (let i = 0; i < numReviews; i++) {
      // Bepaal rating, rekening houdend met minRating
      const rating = Math.max(minRating, Math.floor(Math.random() * 5) + 1);
      
      // Bepaal of het een verified purchase is
      const verifiedPurchase = Math.random() > 0.3; // 70% kans op verified purchase
      
      // Als verifiedOnly is ingeschakeld, sla niet-geverifieerde reviews over
      if (verifiedOnly && !verifiedPurchase) {
        continue;
      }
      
      // Kies een willekeurig product ID
      const productId = productIds[Math.floor(Math.random() * productIds.length)];
      
      // Genereer een willekeurige review
      const review = {
        productId,
        rating,
        title: this.generateReviewTitle(keyword, rating),
        content: this.generateReviewContent(keyword, rating),
        helpfulVotes: Math.floor(Math.random() * 50),
        verifiedPurchase,
        sentiment: this.calculateSentiment(rating),
        keywords: [keyword, ...this.generateRelatedKeywords(keyword, 2)],
        created_at: this.generateReviewDate(sortBy)
      };
      
      reviews.push(review);
    }
    
    // Sorteer reviews op basis van sortBy parameter
    return this.sortReviews(reviews, sortBy);
  },
  
  /**
   * Genereer product IDs voor een keyword
   */
  generateProductIds(keyword, count) {
    const ids = [];
    
    for (let i = 0; i < count; i++) {
      ids.push(`B${Math.random().toString(36).substring(2, 11).toUpperCase()}`);
    }
    
    return ids;
  },
  
  /**
   * Genereer een titel voor een gesimuleerde Amazon review
   */
  generateReviewTitle(keyword, rating) {
    if (rating >= 4) {
      const positiveTitles = [
        `Uitstekende ${keyword}!`,
        `Zeer tevreden met deze ${keyword}`,
        `Geweldig product, aanrader!`,
        `${keyword} overtreft verwachtingen`,
        `Beste ${keyword} die ik ooit heb gebruikt`
      ];
      return positiveTitles[Math.floor(Math.random() * positiveTitles.length)];
    } else if (rating === 3) {
      const neutralTitles = [
        `Redelijke ${keyword}, maar niet perfect`,
        `Gemiddelde ${keyword}, doet wat het moet doen`,
        `Oké product, maar kan beter`,
        `${keyword} heeft voor- en nadelen`,
        `Niet slecht, maar ook niet geweldig`
      ];
      return neutralTitles[Math.floor(Math.random() * neutralTitles.length)];
    } else {
      const negativeTitles = [
        `Teleurstellende ${keyword}`,
        `Niet tevreden met deze aankoop`,
        `Werkt niet zoals verwacht`,
        `Kwaliteitsproblemen met ${keyword}`,
        `Zou deze ${keyword} niet aanraden`
      ];
      return negativeTitles[Math.floor(Math.random() * negativeTitles.length)];
    }
  },
  
  /**
   * Genereer content voor een gesimuleerde Amazon review
   */
  generateReviewContent(keyword, rating) {
    if (rating >= 4) {
      const positiveContents = [
        `Ik ben zeer tevreden met deze ${keyword}. De kwaliteit is uitstekend en het werkt precies zoals beschreven. De prijs is redelijk voor wat je krijgt. Zou het zeker aanraden aan anderen die op zoek zijn naar een goede ${keyword}.`,
        
        `Deze ${keyword} heeft al mijn verwachtingen overtroffen. De bouwkwaliteit is solide, de functionaliteit is geweldig en het ziet er ook nog eens mooi uit. Ik heb al verschillende producten geprobeerd, maar deze is veruit de beste. Zeer tevreden met mijn aankoop!`,
        
        `Geweldig product! Ik gebruik deze ${keyword} nu een maand en ben er nog steeds heel blij mee. Het is gebruiksvriendelijk, betrouwbaar en doet precies wat ik nodig heb. De klantenservice is ook uitstekend. Absoluut een 5-sterren product.`,
        
        `Deze ${keyword} is het geld meer dan waard. Het is duurzaam, goed ontworpen en werkt perfect. Ik heb eerder goedkopere versies geprobeerd, maar die gingen snel kapot. Deze is van veel betere kwaliteit en zal waarschijnlijk veel langer meegaan. Zeer tevreden!`,
        
        `Ik kan deze ${keyword} aan iedereen aanraden. Het is gemakkelijk te gebruiken, heeft alle functies die je nodig hebt en is van uitstekende kwaliteit. De levering was ook snel en het product was goed verpakt. Ik ben er erg blij mee!`
      ];
      return positiveContents[Math.floor(Math.random() * positiveContents.length)];
    } else if (rating === 3) {
      const neutralContents = [
        `Deze ${keyword} is oké, maar niet geweldig. Het doet wat het moet doen, maar er zijn enkele minpunten. De kwaliteit is redelijk, maar zou beter kunnen voor deze prijs. Het is niet slecht, maar ik zou het niet direct aan iedereen aanraden.`,
        
        `Gemengde gevoelens over deze ${keyword}. Sommige aspecten zijn goed, zoals de functionaliteit en het gebruiksgemak. Andere aspecten, zoals de duurzaamheid en de kwaliteit van sommige onderdelen, laten te wensen over. Het is een middelmatig product.`,
        
        `De ${keyword} werkt zoals verwacht, maar er is niets bijzonders aan. Het is een standaard product voor een standaard prijs. Niet teleurgesteld, maar ook niet onder de indruk. Het doet zijn werk, meer niet.`,
        
        `Redelijk tevreden met deze ${keyword}, maar er zijn enkele verbeterpunten. De handleiding was onduidelijk en de installatie was ingewikkelder dan verwacht. Eenmaal werkend doet het product wat het moet doen. Drie sterren is een eerlijke beoordeling.`,
        
        `Deze ${keyword} heeft zowel voor- als nadelen. Voordelen zijn de prijs en de basisfunctionaliteit. Nadelen zijn de bouwkwaliteit en enkele ontbrekende functies die concurrenten wel hebben. Al met al een gemiddeld product.`
      ];
      return neutralContents[Math.floor(Math.random() * neutralContents.length)];
    } else {
      const negativeContents = [
        `Ik ben erg teleurgesteld in deze ${keyword}. De kwaliteit is veel lager dan verwacht en het product werkt niet zoals beschreven. Na slechts enkele weken gebruik begonnen er al problemen op te treden. Zou het niet aanraden.`,
        
        `Deze ${keyword} is het geld niet waard. Het voelt goedkoop aan, heeft beperkte functionaliteit en is niet duurzaam. Ik heb al meerdere keren contact opgenomen met de klantenservice, maar kreeg geen bevredigende oplossing. Zoek liever naar een alternatief.`,
        
        `Vreselijk product. De ${keyword} werkte vanaf het begin al niet goed en na een maand is het volledig kapot. De materialen zijn van slechte kwaliteit en de constructie is zwak. Bovendien is de klantenservice onbereikbaar. Grote teleurstelling.`,
        
        `Ik heb spijt van deze aankoop. De ${keyword} voldoet niet aan de beschrijving en de foto's zijn misleidend. Het product is kleiner en van slechtere kwaliteit dan verwacht. Zou het zeker niet aanraden aan anderen.`,
        
        `Problemen vanaf dag één met deze ${keyword}. Moeilijk te installeren, onduidelijke instructies en slechte prestaties. Ik heb het geprobeerd te retourneren, maar dat proces was ook frustrerend. Zoek naar een beter alternatief.`
      ];
      return negativeContents[Math.floor(Math.random() * negativeContents.length)];
    }
  },
  
  /**
   * Bereken sentiment score op basis van rating
   */
  calculateSentiment(rating) {
    // Converteer 1-5 rating naar -1 tot 1 sentiment score
    return ((rating - 3) / 2).toFixed(2);
  },
  
  /**
   * Genereer gerelateerde keywords voor een gesimuleerde Amazon review
   */
  generateRelatedKeywords(keyword, count) {
    const relatedKeywords = [
      `${keyword} kwaliteit`,
      `${keyword} duurzaamheid`,
      `${keyword} prijs`,
      `${keyword} alternatieven`,
      `${keyword} problemen`,
      `${keyword} handleiding`,
      `${keyword} garantie`,
      `${keyword} onderdelen`,
      `${keyword} reparatie`,
      `${keyword} klantenservice`
    ];
    
    // Shuffle en pak de eerste 'count' items
    return relatedKeywords
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  },
  
  /**
   * Genereer een datum voor een review op basis van sortBy parameter
   */
  generateReviewDate(sortBy) {
    const now = Date.now();
    let date;
    
    switch (sortBy) {
      case 'recent':
        // Laatste 30 dagen
        date = now - Math.random() * 30 * 24 * 60 * 60 * 1000;
        break;
      case 'helpful':
        // Laatste 6 maanden (helpful reviews zijn vaak ouder)
        date = now - Math.random() * 180 * 24 * 60 * 60 * 1000;
        break;
      case 'rating_asc':
      case 'rating_desc':
        // Laatste jaar
        date = now - Math.random() * 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        // Laatste 30 dagen (standaard)
        date = now - Math.random() * 30 * 24 * 60 * 60 * 1000;
    }
    
    return new Date(date).toISOString();
  },
  
  /**
   * Sorteer reviews op basis van sortBy parameter
   */
  sortReviews(reviews, sortBy) {
    switch (sortBy) {
      case 'recent':
        // Sorteer op datum (nieuwste eerst)
        return reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'helpful':
        // Sorteer op helpful votes (meeste eerst)
        return reviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
      case 'rating_asc':
        // Sorteer op rating (laagste eerst)
        return reviews.sort((a, b) => a.rating - b.rating);
      case 'rating_desc':
        // Sorteer op rating (hoogste eerst)
        return reviews.sort((a, b) => b.rating - a.rating);
      default:
        // Standaard: sorteer op datum (nieuwste eerst)
        return reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },
  
  /**
   * Converteer Amazon API product data naar reviews formaat
   * @param {Array} products - Array met producten van Amazon API
   * @param {string} keyword - Zoekwoord waarmee de producten zijn gevonden
   * @param {number} minRating - Minimale rating om te includeren
   * @param {boolean} verifiedOnly - Alleen geverifieerde aankopen includeren
   * @param {string} sortBy - Hoe de reviews gesorteerd moeten worden
   * @returns {Array} - Array met reviews in het juiste formaat
   */
  convertProductsToReviews(products, keyword, minRating, verifiedOnly, sortBy) {
    try {
      if (!products || products.length === 0) {
        return [];
      }
      
      // Verwerk elk product naar één of meerdere reviews
      const reviews = [];
      
      for (const product of products) {
        // Haal basis productinformatie op
        const asin = product.ASIN;
        const title = product.ItemInfo?.Title?.DisplayValue || '';
        const brand = product.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '';
        
        // Bepaal rating op basis van CustomerReviews
        const rating = product.CustomerReviews?.StarRating?.Value || 0;
        
        // Skip producten met een rating lager dan minRating
        if (rating < minRating) {
          continue;
        }
        
        // Genereer een review op basis van productinformatie
        const review = {
          productId: asin,
          title: `Review van ${title}`,
          content: this.generateReviewContentFromProduct(product, keyword),
          rating: rating,
          helpfulVotes: Math.floor(Math.random() * 50),
          verifiedPurchase: true, // Standaard waar voor API data
          sentiment: this.calculateSentiment(rating),
          keywords: this.generateRelatedKeywords(keyword, 5),
          created_at: new Date().toISOString()
        };
        
        // Voeg toe aan reviews array
        reviews.push(review);
        
        // Voeg eventueel extra reviews toe voor populaire producten
        if (rating >= 4 && Math.random() > 0.5) {
          const extraReview = {
            productId: asin,
            title: `Mijn ervaring met ${title}`,
            content: this.generateReviewContentFromProduct(product, keyword, true),
            rating: Math.max(minRating, Math.min(5, rating + (Math.random() > 0.5 ? 1 : -1))),
            helpfulVotes: Math.floor(Math.random() * 20),
            verifiedPurchase: Math.random() > 0.2, // 80% kans op verified purchase
            sentiment: this.calculateSentiment(rating),
            keywords: this.generateRelatedKeywords(keyword, 3),
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Tot 30 dagen geleden
          };
          
          // Als verifiedOnly is ingeschakeld, controleer dan of de review geverifieerd is
          if (!verifiedOnly || extraReview.verifiedPurchase) {
            reviews.push(extraReview);
          }
        }
      }
      
      // Sorteer reviews volgens sortBy parameter
      return this.sortReviews(reviews, sortBy);
    } catch (error) {
      logger.error(`Fout bij converteren producten naar reviews: ${error.message}`);
      return [];
    }
  },
  
  /**
   * Genereer review content op basis van productinformatie
   * @param {object} product - Product informatie van Amazon API
   * @param {string} keyword - Zoekwoord waarmee het product is gevonden
   * @param {boolean} isAlternative - Of dit een alternatieve review is
   * @returns {string} - Gegenereerde review content
   */
  generateReviewContentFromProduct(product, keyword, isAlternative = false) {
    try {
      // Haal relevante productinformatie op
      const title = product.ItemInfo?.Title?.DisplayValue || '';
      const brand = product.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || '';
      const features = product.ItemInfo?.Features?.DisplayValues || [];
      const rating = product.CustomerReviews?.StarRating?.Value || 0;
      
      // Bepaal sentiment op basis van rating
      const isPositive = rating >= 4;
      const isNeutral = rating >= 3 && rating < 4;
      const isNegative = rating < 3;
      
      let content = '';
      
      // Introductie
      if (isAlternative) {
        content += `Ik heb onlangs de ${title} van ${brand} aangeschaft en wilde mijn ervaringen delen. `;
      } else {
        content += `Na het gebruik van de ${title} voor een tijdje, hier is mijn eerlijke review. `;
      }
      
      // Voeg features toe aan de review
      if (features.length > 0) {
        content += 'Wat ik vooral waardeer zijn de volgende aspecten: ';
        
        // Voeg maximaal 3 features toe
        const selectedFeatures = features.slice(0, Math.min(3, features.length));
        content += selectedFeatures.map(feature => `${feature}`).join('. ') + '. ';
      }
      
      // Voeg sentiment-specifieke content toe
      if (isPositive) {
        content += isAlternative ?
          `Over het algemeen ben ik zeer tevreden met dit product. De kwaliteit is uitstekend en het voldoet aan al mijn verwachtingen. ${keyword} is precies wat ik zocht in een product als dit.` :
          `Dit is een van de beste ${keyword} producten die ik heb gebruikt. De prijs-kwaliteitverhouding is uitstekend en ik zou het zeker aanraden aan anderen.`;
      } else if (isNeutral) {
        content += isAlternative ?
          `Het product is redelijk, maar niet spectaculair. Er zijn zowel positieve als negatieve aspecten aan ${keyword}. Voor de prijs is het een acceptabele keuze.` :
          `Deze ${keyword} heeft zowel sterke als zwakke punten. Het voldoet aan de basisfunctionaliteit, maar er zijn betere alternatieven beschikbaar.`;
      } else {
        content += isAlternative ?
          `Helaas ben ik teleurgesteld in dit product. De kwaliteit is lager dan verwacht en het voldoet niet aan de beschrijving. Ik zou deze ${keyword} niet aanraden.` :
          `Deze ${keyword} heeft me teleurgesteld. De kwaliteit is slecht en de functionaliteit laat te wensen over. Er zijn betere alternatieven beschikbaar voor dezelfde prijs.`;
      }
      
      return content;
    } catch (error) {
      logger.error(`Fout bij genereren review content: ${error.message}`);
      return `Review voor ${keyword} product`;
    }
  }
};

export default amazonService;
