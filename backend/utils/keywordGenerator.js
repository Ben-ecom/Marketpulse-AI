/**
 * Keyword Generator
 * 
 * Deze module genereert relevante keywords op basis van productinformatie.
 * Het gebruikt de Claude API voor geavanceerde keyword generatie en heeft een robuust
 * fallback mechanisme voor het geval de API niet beschikbaar is of er fouten optreden.
 * 
 * Features:
 * - Geavanceerde keyword generatie met Claude AI
 * - Meerdere fallback mechanismen
 * - Ondersteuning voor verschillende talen
 * - Filtering van irrelevante woorden
 * - Combinatie van AI-gegenereerde en regelgebaseerde keywords
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

// Configureer Anthropic (Claude) API client met retries en timeout
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
  maxRetries: 3,
  timeout: 30000, // 30 seconden timeout
});

/**
 * Genereer keywords op basis van productomschrijving, categorie en subcategorie
 * 
 * @param {Object} productInfo - Informatie over het product
 * @param {string} productInfo.description - Productomschrijving
 * @param {string} productInfo.category - Productcategorie
 * @param {string} productInfo.subcategory - Productsubcategorie
 * @param {string} [productInfo.target_audience] - Doelgroep (optioneel)
 * @param {string} [productInfo.geographic_focus] - Geografische focus (optioneel)
 * @param {Array} [productInfo.competitors] - Lijst van concurrenten (optioneel)
 * @param {Object} [options] - Extra opties voor de keyword generatie
 * @param {string} [options.language='nl'] - Taal voor de keywords (nl, en, etc.)
 * @param {number} [options.count=20] - Aantal gewenste keywords
 * @param {boolean} [options.includeCompetitors=true] - Of concurrenten moeten worden meegenomen
 * @returns {Promise<{keywords: string[], source: string, confidence: number}>} Object met keywords, bron en betrouwbaarheidsscore
 */
const generateKeywords = async (productInfo, options = {}) => {
  try {
    // Stel standaardwaarden in voor opties
    const {
      language = 'nl',
      count = 20,
      includeCompetitors = true
    } = options;
    
    // Destructure productInfo met defaults
    const {
      description = '',
      category = '',
      subcategory = '',
      target_audience = '',
      geographic_focus = '',
      competitors = []
    } = productInfo;
    
    // Controleer of de API-sleutel is ingesteld
    if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_API_KEY) {
      console.warn('ANTHROPIC_API_KEY of CLAUDE_API_KEY niet gevonden, gebruik fallback keyword generatie');
      return await generateKeywordsFallback(productInfo, options);
    }
    
    // Bereid concurrenten voor als ze beschikbaar zijn
    const competitorsText = competitors && competitors.length > 0 && includeCompetitors
      ? `Concurrenten: ${competitors.join(', ')}` 
      : '';
    
    // Bereid doelgroep voor als die beschikbaar is
    const audienceText = target_audience 
      ? `Doelgroep: ${target_audience}` 
      : '';
    
    // Bereid geografische focus voor als die beschikbaar is
    const geoText = geographic_focus 
      ? `Geografische focus: ${geographic_focus}` 
      : '';
    
    // Stel de prompt op voor de Claude API
    const systemPrompt = `
    Je bent een expert in marktonderzoek, SEO en keyword analyse. 
    Je taak is om zeer relevante zoekwoorden te genereren voor producten of diensten.
    Je moet rekening houden met de categorie, doelgroep, concurrenten en geografische focus.
    Genereer keywords in het ${language === 'nl' ? 'Nederlands' : 'Engels'}.
    `;
    
    const userPrompt = `
    Genereer een lijst van ${count} relevante zoekwoorden en zoekzinnen voor het volgende product:
    
    Productomschrijving: ${description || 'Niet opgegeven'}
    Categorie: ${category || 'Niet opgegeven'}
    ${subcategory ? `Subcategorie: ${subcategory}` : ''}
    ${audienceText}
    ${geoText}
    ${competitorsText}
    
    De zoekwoorden moeten:
    1. Relevant zijn voor marktonderzoek en consumentengedrag rond dit product
    2. Een mix bevatten van algemene en specifieke termen
    3. Termen bevatten die consumenten daadwerkelijk zouden gebruiken bij het zoeken
    4. Rekening houden met de doelgroep en geografische focus indien opgegeven
    5. Zowel korte zoekwoorden als langere zoekzinnen bevatten
    
    Geef alleen de zoekwoorden, één per regel, zonder nummering of andere tekst.
    `;

    try {
      // Roep de Claude API aan met verbeterde parameters
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.5, // Lagere temperatuur voor consistentere resultaten
      });

      // Verwerk het resultaat
      const keywordsText = response.content[0].text;
      const keywords = keywordsText
        .split('\n')
        .map(kw => kw.trim())
        .filter(kw => kw.length > 0)
        .filter(kw => !stopWords.includes(kw.toLowerCase()));
      
      // Voeg enkele keywords toe op basis van de categorie en subcategorie als fallback
      const fallbackKeywords = generateBasicKeywords(productInfo);
      
      // Combineer en verwijder duplicaten
      const combinedKeywords = [...new Set([...keywords, ...fallbackKeywords])].slice(0, count);
      
      return {
        keywords: combinedKeywords,
        source: 'claude_api',
        confidence: 0.9
      };
    } catch (apiError) {
      console.error('Fout bij het aanroepen van Claude API:', apiError);
      console.log('Probeer alternatieve API-aanroep met vereenvoudigde prompt...');
      
      try {
        // Probeer een vereenvoudigde prompt als fallback
        const simplifiedResponse = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          system: "Je bent een keyword generator voor marktonderzoek.",
          messages: [
            { 
              role: "user", 
              content: `Geef ${count} zoekwoorden voor: ${category} ${subcategory} ${description}. Alleen keywords, één per regel.` 
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });
        
        const simplifiedKeywords = simplifiedResponse.content[0].text
          .split('\n')
          .map(kw => kw.trim())
          .filter(kw => kw.length > 0);
        
        // Combineer met basis keywords
        const fallbackKeywords = generateBasicKeywords(productInfo);
        const combinedKeywords = [...new Set([...simplifiedKeywords, ...fallbackKeywords])].slice(0, count);
        
        return {
          keywords: combinedKeywords,
          source: 'claude_api_simplified',
          confidence: 0.7
        };
      } catch (secondApiError) {
        console.error('Tweede API-aanroep mislukt:', secondApiError);
        console.log('Gebruik fallback keyword generatie...');
        return await generateKeywordsFallback(productInfo, options);
      }
    }
  } catch (error) {
    console.error('Onverwachte fout bij het genereren van keywords:', error);
    return await generateKeywordsFallback(productInfo, options);
  }
};

/**
 * Genereer basis keywords uit de productinformatie
 * 
 * @param {Object} productInfo - Informatie over het product
 * @returns {Array} Array van basis keywords
 */
const generateBasicKeywords = (productInfo) => {
  const { description = '', category = '', subcategory = '' } = productInfo;
  
  // Extraheer woorden uit de beschrijving
  const descriptionWords = description
    ? description
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !stopWords.includes(word))
    : [];
  
  // Voeg categorie en subcategorie toe
  const categoryKeywords = [
    category ? category.toLowerCase() : null,
    subcategory ? subcategory.toLowerCase() : null,
  ].filter(Boolean);
  
  // Genereer combinaties van categorie en subcategorie
  const combinationKeywords = [];
  if (category && subcategory) {
    combinationKeywords.push(`${category.toLowerCase()} ${subcategory.toLowerCase()}`);
  }
  
  // Combineer alles en verwijder duplicaten
  return [...new Set([...descriptionWords, ...categoryKeywords, ...combinationKeywords])];
};

/**
 * Fallback methode voor het genereren van keywords zonder AI
 * 
 * @param {Object} productInfo - Informatie over het product
 * @param {string} productInfo.description - Productomschrijving
 * @param {string} productInfo.category - Productcategorie
 * @param {string} productInfo.subcategory - Productsubcategorie
 * @param {string} [productInfo.target_audience] - Doelgroep (optioneel)
 * @param {Object} [options] - Extra opties voor de keyword generatie
 * @param {number} [options.count=20] - Aantal gewenste keywords
 * @returns {Promise<{keywords: string[], source: string, confidence: number}>} Object met keywords, bron en betrouwbaarheidsscore
 */
const generateKeywordsFallback = async (productInfo, options = {}) => {
  try {
    const { count = 20 } = options;
    const { description = '', category = '', subcategory = '', target_audience = '' } = productInfo;
    
    // Stap 1: Extraheer basis keywords
    const basicKeywords = generateBasicKeywords(productInfo);
    
    // Stap 2: Genereer n-grams (2-grams en 3-grams) uit de beschrijving
    const ngrams = [];
    if (description) {
      const words = description
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      // Genereer 2-grams
      for (let i = 0; i < words.length - 1; i++) {
        if (!stopWords.includes(words[i]) && !stopWords.includes(words[i+1])) {
          ngrams.push(`${words[i]} ${words[i+1]}`);
        }
      }
      
      // Genereer 3-grams
      for (let i = 0; i < words.length - 2; i++) {
        if (!stopWords.includes(words[i]) && !stopWords.includes(words[i+2])) {
          ngrams.push(`${words[i]} ${words[i+1]} ${words[i+2]}`);
        }
      }
    }
    
    // Stap 3: Voeg categorie-specifieke keywords toe
    const categorySpecificKeywords = getCategorySpecificKeywords(category, subcategory);
    
    // Stap 4: Voeg doelgroep-gerelateerde keywords toe
    const audienceKeywords = [];
    if (target_audience) {
      audienceKeywords.push(
        `${target_audience} ${category}`,
        `${category} voor ${target_audience}`,
        `beste ${category} ${target_audience}`
      );
      
      if (subcategory) {
        audienceKeywords.push(
          `${subcategory} voor ${target_audience}`,
          `${target_audience} ${subcategory}`
        );
      }
    }
    
    // Stap 5: Combineer alle keywords en verwijder duplicaten
    const allKeywords = [
      ...basicKeywords,
      ...ngrams,
      ...categorySpecificKeywords,
      ...audienceKeywords
    ];
    
    const uniqueKeywords = [...new Set(allKeywords)];
    
    // Stap 6: Sorteer op relevantie (eenvoudige implementatie: kortere keywords eerst)
    const sortedKeywords = uniqueKeywords.sort((a, b) => a.length - b.length);
    
    // Stap 7: Beperk tot het gewenste aantal
    const finalKeywords = sortedKeywords.slice(0, count);
    
    return {
      keywords: finalKeywords,
      source: 'rule_based_fallback',
      confidence: 0.6
    };
  } catch (error) {
    console.error('Fout in fallback keyword generatie:', error);
    
    // Absolute minimale fallback voor het geval er iets misgaat
    return {
      keywords: [
        productInfo.category,
        productInfo.subcategory,
        ...productInfo.description.split(' ').slice(0, 10)
      ].filter(Boolean),
      source: 'minimal_fallback',
      confidence: 0.3
    };
  }
};

/**
 * Genereer categorie-specifieke keywords op basis van de categorie en subcategorie
 * 
 * @param {string} category - Productcategorie
 * @param {string} subcategory - Productsubcategorie
 * @returns {Array} Array van categorie-specifieke keywords
 */
const getCategorySpecificKeywords = (category = '', subcategory = '') => {
  if (!category) return [];
  
  const categoryLower = category.toLowerCase();
  const subcategoryLower = subcategory ? subcategory.toLowerCase() : '';
  
  // Algemene templates voor alle categorieën
  const generalTemplates = [
    `beste ${categoryLower}`,
    `${categoryLower} kopen`,
    `${categoryLower} vergelijken`,
    `${categoryLower} review`,
    `${categoryLower} prijs`,
    `goedkope ${categoryLower}`,
    `${categoryLower} aanbieding`,
    `${categoryLower} online`,
    `${categoryLower} webshop`,
    `${categoryLower} winkel`
  ];
  
  // Subcategorie templates indien beschikbaar
  const subcategoryTemplates = subcategoryLower ? [
    `${subcategoryLower} ${categoryLower}`,
    `${categoryLower} ${subcategoryLower}`,
    `beste ${subcategoryLower}`,
    `${subcategoryLower} kopen`,
    `${subcategoryLower} vergelijken`,
    `${subcategoryLower} review`
  ] : [];
  
  // Categorie-specifieke templates
  const specificTemplates = [];
  
  switch (categoryLower) {
    case 'elektronica':
      specificTemplates.push(
        'technische specificaties',
        'garantie elektronica',
        'elektronica reparatie',
        'nieuwste elektronica',
        'elektronica accessoires'
      );
      break;
      
    case 'kleding':
    case 'kleding & fashion':
      specificTemplates.push(
        'kleding maten',
        'kleding stijl',
        'kleding trends',
        'seizoenskleding',
        'duurzame kleding'
      );
      break;
      
    case 'gezondheid':
      specificTemplates.push(
        'gezondheidsvoordelen',
        'medisch advies',
        'gezondheidsproducten',
        'natuurlijke remedies',
        'gezondheid supplementen'
      );
      break;
      
    case 'voedsel':
    case 'voedsel & dranken':
      specificTemplates.push(
        'voedingswaarde',
        'ingrediënten',
        'recepten met',
        'biologisch voedsel',
        'dieetvoeding'
      );
      break;
      
    // Voeg meer categorieën toe indien nodig
  }
  
  return [...generalTemplates, ...subcategoryTemplates, ...specificTemplates];
};

// Nederlandse stopwoorden die we willen filteren
const stopWords = [
  // Lidwoorden
  'de', 'het', 'een', 'der', 'des', 'den',
  
  // Voorzetsels
  'aan', 'bij', 'met', 'door', 'voor', 'naar', 'over', 'onder', 'tegen', 'tussen',
  'tijdens', 'zonder', 'vanaf', 'tot', 'totdat', 'binnen', 'buiten', 'achter', 'naast',
  'boven', 'beneden', 'langs', 'nabij', 'omheen', 'rondom', 'omtrent',
  
  // Voegwoorden
  'en', 'of', 'maar', 'want', 'omdat', 'zodat', 'terwijl', 'hoewel', 'zolang', 'zodra',
  'tenzij', 'behalve', 'sinds', 'als', 'dan', 'indien', 'mits', 'ofschoon', 'aangezien',
  'doordat', 'alhoewel', 'opdat',
  
  // Aanwijzende voornaamwoorden
  'deze', 'die', 'dit', 'dat', 'zulke', 'dergelijke',
  
  // Persoonlijke voornaamwoorden
  'ik', 'jij', 'je', 'hij', 'zij', 'ze', 'wij', 'we', 'jullie', 'hen', 'hun',
  'mij', 'mijn', 'jou', 'jouw', 'hem', 'haar', 'ons', 'onze', 'uw',
  
  // Betrekkelijke voornaamwoorden
  'die', 'dat', 'welke', 'wat', 'wie',
  
  // Vragende voornaamwoorden
  'wie', 'wat', 'welke', 'waar', 'wanneer', 'waarom', 'hoe',
  
  // Bijwoorden
  'niet', 'wel', 'ook', 'zeer', 'heel', 'erg', 'nogal', 'tamelijk', 'vrij',
  'zo', 'hoe', 'hier', 'daar', 'nu', 'dan', 'altijd', 'nooit', 'soms',
  'meestal', 'vaak', 'zelden', 'reeds', 'al', 'nog', 'steeds',
  
  // Telwoorden
  'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien',
  'eerste', 'tweede', 'derde', 'vierde', 'vijfde',
  
  // Hulpwerkwoorden
  'zijn', 'is', 'ben', 'bent', 'was', 'waren', 'geweest',
  'hebben', 'heb', 'hebt', 'heeft', 'had', 'hadden', 'gehad',
  'worden', 'word', 'wordt', 'werd', 'werden', 'geworden',
  'zullen', 'zal', 'zult', 'zou', 'zouden',
  'kunnen', 'kan', 'kunt', 'kon', 'konden', 'gekund',
  'mogen', 'mag', 'mocht', 'mochten', 'gemogen',
  'moeten', 'moet', 'moest', 'moesten', 'gemoeten',
  'willen', 'wil', 'wilt', 'wilde', 'wilden', 'gewild',
  
  // Relatieve bijwoorden
  'waarbij', 'waarop', 'waaraan', 'waarmee', 'waardoor', 'waarvan', 'waaruit',
  'waarvoor', 'waarna', 'waarin', 'waaronder', 'waarboven'
];

export {
  generateKeywords,
  generateKeywordsFallback,
  generateBasicKeywords
};
