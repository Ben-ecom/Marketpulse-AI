import { logger } from './logger.js';

/**
 * Utility functies voor tekstanalyse, zoals extractie van pijnpunten, verlangens en terminologie
 */
export const textAnalysisUtils = {
  /**
   * Identificeer pijnpunten in een tekst
   * @param {string} text - De te analyseren tekst
   * @returns {Array<Object>} - Geïdentificeerde pijnpunten met score en context
   */
  identifyPainPoints(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    try {
      // Lijst met pijnpunt-indicatoren (woorden en frasen die vaak pijnpunten signaleren)
      const painPointIndicators = [
        // Problemen
        { pattern: /probleem|problem/i, weight: 0.8 },
        { pattern: /issue|kwestie|moeilijkheid/i, weight: 0.7 },
        { pattern: /struggle|worstelen|moeite/i, weight: 0.9 },
        { pattern: /uitdaging|challenge|obstakel/i, weight: 0.6 },
        { pattern: /frustrerend|frustrating|irritant/i, weight: 0.9 },
        { pattern: /irriteert|annoys|stoort/i, weight: 0.8 },
        { pattern: /haat|hate|can't stand/i, weight: 1.0 },
        { pattern: /teleurgesteld|disappointed/i, weight: 0.8 },
        
        // Klachten
        { pattern: /klacht|complaint/i, weight: 0.8 },
        { pattern: /niet tevreden|not satisfied|ontevreden/i, weight: 0.9 },
        { pattern: /niet goed|not good|slecht/i, weight: 0.7 },
        { pattern: /werkt niet|doesn't work|kapot/i, weight: 0.9 },
        { pattern: /defect|broken|stuk/i, weight: 0.9 },
        
        // Negatieve emoties
        { pattern: /gefrustreerd|frustrated/i, weight: 0.9 },
        { pattern: /geïrriteerd|irritated|annoyed/i, weight: 0.8 },
        { pattern: /boos|angry|mad/i, weight: 0.9 },
        { pattern: /verdrietig|sad|upset/i, weight: 0.7 },
        { pattern: /teleurgesteld|disappointed/i, weight: 0.8 },
        
        // Vragen/hulpzoekend
        { pattern: /hoe los ik|how do I solve|how to fix/i, weight: 0.8 },
        { pattern: /help|hulp nodig|need assistance/i, weight: 0.7 },
        { pattern: /advies nodig|need advice|suggestions/i, weight: 0.6 },
        { pattern: /alternatief voor|alternative to/i, weight: 0.7 },
        
        // Specifieke product issues
        { pattern: /te duur|too expensive|overpriced/i, weight: 0.8 },
        { pattern: /slechte kwaliteit|poor quality|low quality/i, weight: 0.9 },
        { pattern: /moeilijk te gebruiken|difficult to use|not user friendly/i, weight: 0.8 },
        { pattern: /tijdrovend|time consuming|takes too long/i, weight: 0.7 },
        { pattern: /onbetrouwbaar|unreliable|inconsistent/i, weight: 0.8 },
        { pattern: /niet effectief|not effective|doesn't work well/i, weight: 0.8 },
        { pattern: /bijwerkingen|side effects|negative effects/i, weight: 0.9 }
      ];

      // Zoek naar zinnen die pijnpunten kunnen bevatten
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const painPoints = [];

      // Analyseer elke zin op pijnpunten
      sentences.forEach(sentence => {
        const trimmedSentence = sentence.trim();
        let sentenceScore = 0;
        let matchedIndicators = [];

        // Controleer op pijnpunt-indicatoren
        painPointIndicators.forEach(indicator => {
          if (indicator.pattern.test(trimmedSentence)) {
            sentenceScore += indicator.weight;
            matchedIndicators.push({
              indicator: indicator.pattern.toString().replace(/\/i$|^\//, ''),
              weight: indicator.weight
            });
          }
        });

        // Als de zin een voldoende hoge score heeft, voeg toe aan pijnpunten
        if (sentenceScore > 0.7 && matchedIndicators.length > 0) {
          painPoints.push({
            text: trimmedSentence,
            score: Math.min(sentenceScore, 1.0), // Normaliseer score tussen 0-1
            indicators: matchedIndicators,
            category: this.categorizePainPoint(trimmedSentence)
          });
        }
      });

      return painPoints;
    } catch (error) {
      logger.error(`Fout bij identificeren van pijnpunten: ${error.message}`);
      return [];
    }
  },

  /**
   * Categoriseer een pijnpunt in een specifieke categorie
   * @param {string} text - De tekst van het pijnpunt
   * @returns {string} - De categorie van het pijnpunt
   */
  categorizePainPoint(text) {
    const categories = [
      { name: 'prijs', patterns: [/duur|prijs|kost|betaal|geld|budget|expensive|price|cost|afford/i] },
      { name: 'kwaliteit', patterns: [/kwaliteit|quality|slecht|poor|kapot|broken|defect/i] },
      { name: 'gebruiksgemak', patterns: [/moeilijk|lastig|ingewikkeld|complex|difficult|hard to|confusing|complicated/i] },
      { name: 'effectiviteit', patterns: [/werkt niet|doesn't work|ineffectief|ineffective|resultaat|results/i] },
      { name: 'betrouwbaarheid', patterns: [/betrouwbaar|reliable|consistent|stabiel|stable/i] },
      { name: 'tijd', patterns: [/tijd|time|lang|long|wachten|waiting|traag|slow/i] },
      { name: 'service', patterns: [/service|klantenservice|support|customer service|help desk/i] },
      { name: 'beschikbaarheid', patterns: [/beschikbaar|available|voorraad|stock|uitverkocht|sold out/i] }
    ];

    for (const category of categories) {
      for (const pattern of category.patterns) {
        if (pattern.test(text)) {
          return category.name;
        }
      }
    }

    return 'overig';
  },

  /**
   * Identificeer verlangens en aspiraties in een tekst
   * @param {string} text - De te analyseren tekst
   * @returns {Array<Object>} - Geïdentificeerde verlangens met score en context
   */
  identifyDesires(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }

    try {
      // Lijst met verlangen-indicatoren (woorden en frasen die vaak verlangens signaleren)
      const desireIndicators = [
        // Wensen
        { pattern: /wil|want|would like/i, weight: 0.8 },
        { pattern: /wens|wish|hope/i, weight: 0.9 },
        { pattern: /verlang|desire|crave/i, weight: 1.0 },
        { pattern: /zoek naar|looking for|searching for/i, weight: 0.7 },
        { pattern: /behoefte aan|need for|need to/i, weight: 0.8 },
        
        // Verbetering
        { pattern: /beter|better|improve/i, weight: 0.7 },
        { pattern: /upgrade|verbeteren|enhance/i, weight: 0.8 },
        { pattern: /oplossing voor|solution for|solve/i, weight: 0.8 },
        { pattern: /ideaal|ideal|perfect/i, weight: 0.9 },
        
        // Positieve emoties/uitkomsten
        { pattern: /gelukkig|happy|content/i, weight: 0.7 },
        { pattern: /tevreden|satisfied|pleased/i, weight: 0.7 },
        { pattern: /succesvol|successful|accomplish/i, weight: 0.8 },
        { pattern: /effectief|effective|efficient/i, weight: 0.7 },
        
        // Specifieke verlangen-indicatoren
        { pattern: /zou geweldig zijn als|would be great if|love it if/i, weight: 0.9 },
        { pattern: /droom van|dream of|aspire to/i, weight: 1.0 },
        { pattern: /op zoek naar|searching for|hunting for/i, weight: 0.8 },
        { pattern: /kan niet wachten|can't wait|excited for/i, weight: 0.9 },
        { pattern: /hoop dat|hope that|hoping for/i, weight: 0.8 },
        
        // Producteigenschappen
        { pattern: /gebruiksvriendelijk|user friendly|easy to use/i, weight: 0.7 },
        { pattern: /betaalbaar|affordable|reasonably priced/i, weight: 0.7 },
        { pattern: /duurzaam|sustainable|long lasting/i, weight: 0.7 },
        { pattern: /snel|fast|quick/i, weight: 0.6 },
        { pattern: /betrouwbaar|reliable|dependable/i, weight: 0.7 },
        { pattern: /veelzijdig|versatile|flexible/i, weight: 0.6 }
      ];

      // Zoek naar zinnen die verlangens kunnen bevatten
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const desires = [];

      // Analyseer elke zin op verlangens
      sentences.forEach(sentence => {
        const trimmedSentence = sentence.trim();
        let sentenceScore = 0;
        let matchedIndicators = [];

        // Controleer op verlangen-indicatoren
        desireIndicators.forEach(indicator => {
          if (indicator.pattern.test(trimmedSentence)) {
            sentenceScore += indicator.weight;
            matchedIndicators.push({
              indicator: indicator.pattern.toString().replace(/\/i$|^\//, ''),
              weight: indicator.weight
            });
          }
        });

        // Als de zin een voldoende hoge score heeft, voeg toe aan verlangens
        if (sentenceScore > 0.7 && matchedIndicators.length > 0) {
          desires.push({
            text: trimmedSentence,
            score: Math.min(sentenceScore, 1.0), // Normaliseer score tussen 0-1
            indicators: matchedIndicators,
            category: this.categorizeDesire(trimmedSentence)
          });
        }
      });

      return desires;
    } catch (error) {
      logger.error(`Fout bij identificeren van verlangens: ${error.message}`);
      return [];
    }
  },

  /**
   * Categoriseer een verlangen in een specifieke categorie
   * @param {string} text - De tekst van het verlangen
   * @returns {string} - De categorie van het verlangen
   */
  categorizeDesire(text) {
    const categories = [
      { name: 'gemak', patterns: [/gemak|ease|makkelijk|easy|simple|convenient|handig/i] },
      { name: 'tijd', patterns: [/tijd|time|snel|fast|quick|besparen|save/i] },
      { name: 'kwaliteit', patterns: [/kwaliteit|quality|goed|good|best|beter|better/i] },
      { name: 'prijs', patterns: [/prijs|price|betaalbaar|affordable|goedkoop|cheap|budget/i] },
      { name: 'effectiviteit', patterns: [/effectief|effective|resultaat|result|werkt|works/i] },
      { name: 'duurzaamheid', patterns: [/duurzaam|sustainable|milieuvriendelijk|eco-friendly|groen|green/i] },
      { name: 'status', patterns: [/status|prestige|luxe|luxury|premium|exclusief|exclusive/i] },
      { name: 'innovatie', patterns: [/innovatie|innovation|nieuw|new|modern|geavanceerd|advanced/i] }
    ];

    for (const category of categories) {
      for (const pattern of category.patterns) {
        if (pattern.test(text)) {
          return category.name;
        }
      }
    }

    return 'overig';
  },

  /**
   * Extraheer domein-specifieke terminologie uit een tekst
   * @param {string} text - De te analyseren tekst
   * @param {string} domain - Het domein waarvoor terminologie moet worden geëxtraheerd
   * @returns {Array<Object>} - Geëxtraheerde terminologie met context
   */
  extractTerminology(text, domain = 'general') {
    if (!text || typeof text !== 'string') {
      return [];
    }

    try {
      // Verwijder leestekens en maak alles lowercase voor betere matching
      const cleanedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
      const words = cleanedText.split(/\s+/).filter(word => word.length > 2);
      
      // Zoek naar n-grams (1-3 woorden)
      const ngrams = [];
      for (let i = 0; i < words.length; i++) {
        ngrams.push(words[i]); // unigram
        
        if (i < words.length - 1) {
          ngrams.push(`${words[i]} ${words[i+1]}`); // bigram
        }
        
        if (i < words.length - 2) {
          ngrams.push(`${words[i]} ${words[i+1]} ${words[i+2]}`); // trigram
        }
      }
      
      // Domein-specifieke terminologie patronen
      const domainPatterns = {
        general: [
          /\b\w+\b/i // Algemene woorden
        ],
        ecommerce: [
          /\b(product|prijs|korting|verzending|levering|retour|betaling|winkelwagen|checkout|bestelling)\b/i,
          /\b(product|price|discount|shipping|delivery|return|payment|cart|checkout|order)\b/i
        ],
        beauty: [
          /\b(huid|haar|make-up|crème|serum|shampoo|conditioner|hydrateren|reinigen|verzorgen)\b/i,
          /\b(skin|hair|makeup|cream|serum|shampoo|conditioner|hydrate|cleanse|care)\b/i
        ],
        tech: [
          /\b(app|software|hardware|device|gadget|smartphone|laptop|tablet|functie|interface)\b/i,
          /\b(app|software|hardware|device|gadget|smartphone|laptop|tablet|feature|interface)\b/i
        ],
        food: [
          /\b(smaak|ingrediënt|recept|voeding|dieet|maaltijd|koken|bakken|gezond|biologisch)\b/i,
          /\b(taste|ingredient|recipe|nutrition|diet|meal|cook|bake|healthy|organic)\b/i
        ]
      };
      
      // Selecteer de juiste patronen op basis van het domein
      const patterns = domainPatterns[domain] || domainPatterns.general;
      
      // Match ngrams tegen de patronen
      const terminology = [];
      const addedTerms = new Set(); // Voorkom duplicaten
      
      ngrams.forEach(ngram => {
        patterns.forEach(pattern => {
          if (pattern.test(ngram) && !addedTerms.has(ngram)) {
            // Vind de originele context in de tekst
            const contextRegex = new RegExp(`[^.!?]*${ngram}[^.!?]*`, 'i');
            const contextMatch = text.match(contextRegex);
            const context = contextMatch ? contextMatch[0].trim() : '';
            
            terminology.push({
              term: ngram,
              context: context,
              frequency: this.countOccurrences(cleanedText, ngram)
            });
            
            addedTerms.add(ngram);
          }
        });
      });
      
      // Sorteer op frequentie (hoog naar laag)
      return terminology.sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      logger.error(`Fout bij extraheren van terminologie: ${error.message}`);
      return [];
    }
  },

  /**
   * Tel het aantal keren dat een term voorkomt in een tekst
   * @param {string} text - De tekst waarin gezocht wordt
   * @param {string} term - De term om te tellen
   * @returns {number} - Het aantal keren dat de term voorkomt
   */
  countOccurrences(text, term) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  },

  /**
   * Analyseer een tekst volledig en extraheer pijnpunten, verlangens en terminologie
   * @param {string} text - De te analyseren tekst
   * @param {string} domain - Het domein voor terminologie-extractie
   * @returns {Object} - Object met pijnpunten, verlangens en terminologie
   */
  analyzeText(text, domain = 'general') {
    if (!text || typeof text !== 'string') {
      return {
        painPoints: [],
        desires: [],
        terminology: []
      };
    }

    try {
      return {
        painPoints: this.identifyPainPoints(text),
        desires: this.identifyDesires(text),
        terminology: this.extractTerminology(text, domain)
      };
    } catch (error) {
      logger.error(`Fout bij volledige tekstanalyse: ${error.message}`);
      return {
        painPoints: [],
        desires: [],
        terminology: [],
        error: error.message
      };
    }
  }
};

export default textAnalysisUtils;
