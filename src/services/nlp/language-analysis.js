/**
 * Language Analysis Module
 *
 * Dit bestand bevat de service voor het analyseren van taalgebruik en het extraheren
 * van domein-specifieke terminologie en taalpatronen. Het biedt functionaliteit voor
 * terminologie-extractie, phrase mining, jargon-identificatie, detectie van informele
 * uitdrukkingen en woordfrequentie-analyse.
 */

/**
 * Language Analysis Service klasse
 */
class LanguageAnalysisService {
  constructor() {
    // Domein-specifieke terminologie
    this.domainTerminology = {
      // E-commerce domein
      ecommerce: {
        nl: [
          'webshop', 'webwinkel', 'online winkel', 'bestelling', 'bezorging', 'levering',
          'verzending', 'retourneren', 'retour', 'winkelwagen', 'winkelmandje', 'checkout',
          'betaling', 'betaalmethode', 'product', 'artikel', 'voorraad', 'uitverkocht',
          'korting', 'aanbieding', 'actie', 'klantenservice', 'klantenservice', 'verzendkosten',
          'bestelgeschiedenis', 'account', 'inloggen', 'registreren', 'wachtwoord', 'factuur',
          'garantie', 'review', 'beoordeling', 'waardering', 'sterren', 'filter', 'sorteren',
          'categorie', 'zoeken', 'zoekresultaten', 'productpagina', 'productdetails', 'maat',
          'kleur', 'variant', 'prijs', 'btw', 'verzendadres', 'factuuradres', 'postcode',
        ],
        en: [
          'webshop', 'online store', 'order', 'delivery', 'shipping', 'return', 'cart',
          'shopping cart', 'checkout', 'payment', 'payment method', 'product', 'item',
          'stock', 'out of stock', 'discount', 'offer', 'promotion', 'customer service',
          'shipping costs', 'order history', 'account', 'login', 'register', 'password',
          'invoice', 'warranty', 'review', 'rating', 'stars', 'filter', 'sort', 'category',
          'search', 'search results', 'product page', 'product details', 'size', 'color',
          'variant', 'price', 'vat', 'shipping address', 'billing address', 'zip code',
        ],
      },

      // Technologie domein
      technology: {
        nl: [
          'software', 'hardware', 'applicatie', 'app', 'programma', 'systeem', 'platform',
          'interface', 'gebruikersinterface', 'UI', 'UX', 'gebruikerservaring', 'functie',
          'functionaliteit', 'feature', 'bug', 'fout', 'error', 'crash', 'update', 'versie',
          'upgrade', 'download', 'installeren', 'configureren', 'instellen', 'instellingen',
          'account', 'wachtwoord', 'login', 'inloggen', 'registreren', 'server', 'cloud',
          'database', 'data', 'beveiliging', 'privacy', 'encryptie', 'backup', 'synchronisatie',
          'compatibiliteit', 'integratie', 'API', 'plugin', 'extensie', 'module', 'widget',
        ],
        en: [
          'software', 'hardware', 'application', 'app', 'program', 'system', 'platform',
          'interface', 'user interface', 'UI', 'UX', 'user experience', 'function',
          'functionality', 'feature', 'bug', 'error', 'crash', 'update', 'version',
          'upgrade', 'download', 'install', 'configure', 'set up', 'settings', 'account',
          'password', 'login', 'sign in', 'register', 'server', 'cloud', 'database',
          'data', 'security', 'privacy', 'encryption', 'backup', 'synchronization',
          'compatibility', 'integration', 'API', 'plugin', 'extension', 'module', 'widget',
        ],
      },

      // Financiën domein
      finance: {
        nl: [
          'bank', 'rekening', 'bankrekening', 'spaarrekening', 'betaalrekening', 'saldo',
          'overschrijving', 'overboeking', 'transactie', 'betaling', 'incasso', 'automatische incasso',
          'creditcard', 'debitcard', 'pinpas', 'pincode', 'rente', 'hypotheek', 'lening',
          'krediet', 'schuld', 'investering', 'beleggen', 'aandelen', 'obligaties', 'fonds',
          'beleggingsfonds', 'pensioen', 'verzekering', 'premie', 'claim', 'belasting', 'btw',
          'inkomstenbelasting', 'aangifte', 'fiscaal', 'budget', 'begroting', 'uitgaven', 'inkomsten',
        ],
        en: [
          'bank', 'account', 'bank account', 'savings account', 'checking account', 'balance',
          'transfer', 'transaction', 'payment', 'direct debit', 'credit card', 'debit card',
          'PIN', 'PIN code', 'interest', 'mortgage', 'loan', 'credit', 'debt', 'investment',
          'invest', 'stocks', 'shares', 'bonds', 'fund', 'investment fund', 'pension',
          'insurance', 'premium', 'claim', 'tax', 'VAT', 'income tax', 'tax return',
          'fiscal', 'budget', 'expenses', 'income',
        ],
      },

      // Gezondheidszorg domein
      healthcare: {
        nl: [
          'gezondheid', 'zorg', 'patiënt', 'arts', 'dokter', 'huisarts', 'specialist',
          'ziekenhuis', 'kliniek', 'apotheek', 'medicijn', 'medicatie', 'recept', 'diagnose',
          'symptoom', 'behandeling', 'therapie', 'operatie', 'ingreep', 'onderzoek', 'test',
          'bloedonderzoek', 'scan', 'MRI', 'CT-scan', 'röntgen', 'verzekering', 'zorgverzekering',
          'eigen risico', 'verwijzing', 'afspraak', 'consult', 'second opinion', 'dossier',
          'patiëntendossier', 'medisch dossier', 'allergie', 'bijwerking', 'revalidatie',
        ],
        en: [
          'health', 'care', 'healthcare', 'patient', 'doctor', 'physician', 'GP', 'specialist',
          'hospital', 'clinic', 'pharmacy', 'medicine', 'medication', 'prescription', 'diagnosis',
          'symptom', 'treatment', 'therapy', 'surgery', 'procedure', 'examination', 'test',
          'blood test', 'scan', 'MRI', 'CT scan', 'X-ray', 'insurance', 'health insurance',
          'deductible', 'referral', 'appointment', 'consultation', 'second opinion', 'file',
          'patient file', 'medical record', 'allergy', 'side effect', 'rehabilitation',
        ],
      },
    };

    // Jargon per domein
    this.domainJargon = {
      // E-commerce jargon
      ecommerce: {
        nl: [
          'conversie', 'conversieratio', 'CTR', 'CTA', 'ROI', 'AOV', 'gemiddelde orderwaarde',
          'bounce rate', 'verlaten winkelwagen', 'upselling', 'cross-selling', 'retargeting',
          'SEO', 'zoekmachineoptimalisatie', 'SEM', 'PPC', 'CPC', 'affiliate', 'dropshipping',
          'fulfillment', 'SKU', 'voorraadbeheersysteem', 'ERP', 'CRM', 'API-integratie',
        ],
        en: [
          'conversion', 'conversion rate', 'CTR', 'CTA', 'ROI', 'AOV', 'average order value',
          'bounce rate', 'cart abandonment', 'upselling', 'cross-selling', 'retargeting',
          'SEO', 'search engine optimization', 'SEM', 'PPC', 'CPC', 'affiliate', 'dropshipping',
          'fulfillment', 'SKU', 'inventory management system', 'ERP', 'CRM', 'API integration',
        ],
      },

      // Technologie jargon
      technology: {
        nl: [
          'frontend', 'backend', 'full-stack', 'repository', 'commit', 'pull request', 'merge',
          'deployment', 'CI/CD', 'containerisatie', 'microservices', 'serverless', 'DevOps',
          'agile', 'scrum', 'sprint', 'backlog', 'MVP', 'refactoring', 'legacy code',
          'responsive design', 'mobile-first', 'framework', 'library', 'dependency', 'middleware',
          'endpoint', 'request', 'response', 'payload', 'authentication', 'authorization',
        ],
        en: [
          'frontend', 'backend', 'full-stack', 'repository', 'commit', 'pull request', 'merge',
          'deployment', 'CI/CD', 'containerization', 'microservices', 'serverless', 'DevOps',
          'agile', 'scrum', 'sprint', 'backlog', 'MVP', 'refactoring', 'legacy code',
          'responsive design', 'mobile-first', 'framework', 'library', 'dependency', 'middleware',
          'endpoint', 'request', 'response', 'payload', 'authentication', 'authorization',
        ],
      },

      // Financiën jargon
      finance: {
        nl: [
          'ROI', 'ROE', 'EBITDA', 'liquiditeit', 'solvabiliteit', 'rentabiliteit', 'cashflow',
          'balans', 'winst- en verliesrekening', 'jaarrekening', 'kwartaalcijfers', 'dividend',
          'koers-winstverhouding', 'beurskoers', 'marktkapitalisatie', 'hedge', 'futures',
          'opties', 'derivaten', 'vastrentende waarden', 'asset allocatie', 'diversificatie',
          'volatiliteit', 'bear market', 'bull market', 'inflatie', 'deflatie', 'recessie',
        ],
        en: [
          'ROI', 'ROE', 'EBITDA', 'liquidity', 'solvency', 'profitability', 'cash flow',
          'balance sheet', 'profit and loss statement', 'annual report', 'quarterly figures', 'dividend',
          'price-earnings ratio', 'stock price', 'market capitalization', 'hedge', 'futures',
          'options', 'derivatives', 'fixed income', 'asset allocation', 'diversification',
          'volatility', 'bear market', 'bull market', 'inflation', 'deflation', 'recession',
        ],
      },
    };

    // Informele uitdrukkingen per taal
    this.colloquialExpressions = {
      nl: [
        'super', 'geweldig', 'gaaf', 'tof', 'vet', 'cool', 'chill', 'relaxed', 'nice',
        'top', 'prima', 'oké', 'okee', 'ok', 'goed', 'leuk', 'fijn', 'lekker', 'heerlijk',
        'balen', 'jammer', 'shit', 'kut', 'fuck', 'damn', 'verdorie', 'verdomme', 'gadverdamme',
        'meh', 'mwah', 'nou ja', 'tja', 'tsja', 'ach', 'och', 'pfff', 'zucht', 'hmm',
        'haha', 'hihi', 'lol', 'rofl', 'lmao', 'omg', 'wtf', 'idk', 'idc', 'btw', 'sws',
      ],
      en: [
        'awesome', 'cool', 'great', 'nice', 'sweet', 'amazing', 'fantastic', 'wonderful',
        'super', 'excellent', 'brilliant', 'fab', 'fabulous', 'terrific', 'okay', 'ok',
        'alright', 'fine', 'good', 'lovely', 'sucks', 'crap', 'shit', 'fuck', 'damn', 'darn',
        'meh', 'well', 'hmm', 'ugh', 'pfft', 'sigh', 'haha', 'lol', 'rofl', 'lmao', 'omg',
        'wtf', 'idk', 'idc', 'btw', 'tbh', 'fyi', 'imo', 'imho', 'afaik', 'asap', 'thx',
      ],
    };

    // Stopwoorden per taal
    this.stopwords = {
      nl: [
        'de', 'het', 'een', 'en', 'van', 'in', 'is', 'op', 'dat', 'niet', 'zijn', 'met',
        'voor', 'naar', 'bij', 'ook', 'maar', 'om', 'als', 'dan', 'wat', 'nog', 'wel',
        'door', 'nu', 'je', 'mij', 'hij', 'zij', 'wij', 'jullie', 'hun', 'hem', 'haar',
        'ons', 'deze', 'dit', 'die', 'ik', 'me', 'mijn', 'jou', 'jouw', 'zich', 'ze',
        'zelf', 'te', 'zo', 'al', 'dus', 'daar', 'hier', 'toen', 'hoe', 'wie', 'waar',
        'waarom', 'welke', 'welk', 'aan', 'af', 'all', 'als', 'ben', 'bij', 'dan', 'dat',
        'die', 'dit', 'doe', 'doen', 'dus', 'een', 'eens', 'elk', 'en', 'er', 'had', 'heb',
        'hem', 'het', 'hoe', 'hun', 'ik', 'in', 'is', 'ja', 'je', 'kan', 'kon', 'kun',
        'men', 'met', 'mij', 'nog', 'nu', 'of', 'om', 'ons', 'ook', 'te', 'tot', 'uit',
        'van', 'was', 'wat', 'we', 'wel', 'wij', 'zal', 'ze', 'zei', 'zij', 'zo', 'zou',
      ],
      en: [
        'the', 'a', 'an', 'and', 'of', 'in', 'is', 'on', 'that', 'not', 'are', 'with',
        'for', 'to', 'at', 'also', 'but', 'as', 'if', 'then', 'what', 'still', 'by',
        'now', 'you', 'me', 'he', 'she', 'we', 'they', 'them', 'him', 'her', 'us',
        'this', 'these', 'those', 'i', 'my', 'your', 'his', 'our', 'their', 'it', 'its',
        'itself', 'too', 'so', 'already', 'thus', 'there', 'here', 'when', 'how', 'who',
        'where', 'why', 'which', 'what', 'about', 'after', 'all', 'am', 'an', 'and',
        'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'between',
        'both', 'but', 'by', 'can', 'did', 'do', 'does', 'doing', 'down', 'during',
        'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he',
        'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
        'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my',
        'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or',
        'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
        'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
        'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
        'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
        'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself',
        'yourselves',
      ],
    };

    // N-gram grootte voor phrase mining
    this.ngramSizes = [2, 3, 4];
  }

  /**
   * Analyseer taalgebruik in tekst
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Taalanalyse resultaat
   */
  async analyzeLanguage(text, options = {}) {
    try {
      // Controleer of text is gedefinieerd en een string is
      if (!text || typeof text !== 'string') {
        console.warn('⚠️ Language analysis: Ongeldige tekst input ontvangen', text);
        return {
          terminology: [],
          phrases: [],
          jargon: [],
          colloquialExpressions: [],
          wordFrequency: {},
          visualizationData: {},
          metadata: {
            language: options.language || 'en',
            domain: options.domain || null,
          },
        };
      }

      // Zorg ervoor dat tekst wordt getrimd
      const trimmedText = text.trim();

      if (trimmedText.length === 0) {
        console.warn('⚠️ Language analysis: Lege tekst ontvangen');
        return {
          terminology: [],
          phrases: [],
          jargon: [],
          colloquialExpressions: [],
          wordFrequency: {},
          visualizationData: {},
          metadata: {
            language: options.language || 'en',
            domain: options.domain || null,
          },
        };
      }

      // Bepaal taal
      const language = options.language || this.detectLanguage(trimmedText);

      // Bepaal domein
      const domain = options.domain || this.detectDomain(trimmedText, language);

      // Extraheer terminologie
      const terminology = await this.extractTerminology(trimmedText, language, domain);

      // Extraheer phrases
      const phrases = await this.extractPhrases(trimmedText, language);

      // Identificeer jargon
      const jargon = await this.identifyJargon(trimmedText, language, domain);

      // Detecteer informele uitdrukkingen
      const colloquialExpressions = await this.detectColloquialExpressions(trimmedText, language);

      // Analyseer woordfrequentie
      const wordFrequency = await this.analyzeWordFrequency(trimmedText, language);

      // Bereid data voor voor visualisatie
      const visualizationData = this.prepareVisualizationData(wordFrequency, terminology, jargon);

      return {
        terminology,
        phrases,
        jargon,
        colloquialExpressions,
        wordFrequency,
        visualizationData,
        metadata: {
          language,
          domain,
          wordCount: this.countWords(trimmedText),
          uniqueWordCount: Object.keys(wordFrequency).length,
        },
      };
    } catch (error) {
      console.error('❌ Fout bij taalanalyse:', error);
      return {
        terminology: [],
        phrases: [],
        jargon: [],
        colloquialExpressions: [],
        wordFrequency: {},
        visualizationData: {},
        error: error.message,
        metadata: {
          language: options.language || 'en',
          domain: options.domain || null,
        },
      };
    }
  }

  /**
   * Detecteer de taal van de tekst
   * @param {String} text - Tekst om te analyseren
   * @returns {String} - Gedetecteerde taal (nl of en)
   */
  detectLanguage(text) {
    // Eenvoudige taaldetectie op basis van stopwoorden
    const dutchWords = ['de', 'het', 'een', 'en', 'van', 'in', 'is', 'op', 'dat', 'niet', 'zijn', 'met'];
    const englishWords = ['the', 'a', 'an', 'and', 'of', 'in', 'is', 'on', 'that', 'not', 'are', 'with'];

    const lowerText = text.toLowerCase();
    let dutchCount = 0;
    let englishCount = 0;

    // Tel Nederlandse woorden
    for (const word of dutchWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        dutchCount += matches.length;
      }
    }

    // Tel Engelse woorden
    for (const word of englishWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) {
        englishCount += matches.length;
      }
    }

    // Bepaal taal op basis van tellingen
    return dutchCount > englishCount ? 'nl' : 'en';
  }

  /**
   * Detecteer het domein van de tekst
   * @param {String} text - Tekst om te analyseren
   * @param {String} language - Taal van de tekst
   * @returns {String} - Gedetecteerd domein
   */
  detectDomain(text, language) {
    // Controleer of text is gedefinieerd en een string is
    if (!text || typeof text !== 'string') {
      return null;
    }

    const lowerText = text.toLowerCase();
    const domains = Object.keys(this.domainTerminology);
    const scores = {};

    // Initialiseer scores voor elk domein
    for (const domain of domains) {
      scores[domain] = 0;
    }

    // Bereken score voor elk domein op basis van terminologie
    for (const domain of domains) {
      const terminology = this.domainTerminology[domain][language] || this.domainTerminology[domain].en;

      for (const term of terminology) {
        if (lowerText.includes(term.toLowerCase())) {
          scores[domain] += 1;
        }
      }

      // Controleer ook op jargon
      if (this.domainJargon[domain]) {
        const jargon = this.domainJargon[domain][language] || this.domainJargon[domain].en;

        for (const term of jargon) {
          if (lowerText.includes(term.toLowerCase())) {
            scores[domain] += 2; // Jargon krijgt een hogere score
          }
        }
      }
    }

    // Vind domein met hoogste score
    let maxScore = 0;
    let detectedDomain = null;

    for (const [domain, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedDomain = domain;
      }
    }

    // Alleen een domein retourneren als er voldoende bewijs is
    return maxScore >= 2 ? detectedDomain : null;
  }

  /**
   * Tel het aantal woorden in een tekst
   * @param {String} text - Tekst om te analyseren
   * @returns {Number} - Aantal woorden
   */
  countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }

  /**
   * Extraheer domein-specifieke terminologie uit tekst
   * @param {String} text - Tekst om te analyseren
   * @param {String} language - Taal van de tekst
   * @param {String} domain - Domein van de tekst
   * @returns {Promise<Array<Object>>} - Geëxtraheerde terminologie
   */
  async extractTerminology(text, language, domain) {
    const terminology = [];
    const lowerText = text.toLowerCase();

    // Als domein bekend is, gebruik domein-specifieke terminologie
    if (domain && this.domainTerminology[domain]) {
      const domainTerms = this.domainTerminology[domain][language] || this.domainTerminology[domain].en;

      for (const term of domainTerms) {
        const regex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'g');
        const matches = [...lowerText.matchAll(regex)];

        if (matches.length > 0) {
          terminology.push({
            term,
            count: matches.length,
            domain,
            positions: matches.map((match) => match.index),
          });
        }
      }
    } else {
      // Als domein niet bekend is, controleer alle domeinen
      for (const [domainName, domainData] of Object.entries(this.domainTerminology)) {
        const domainTerms = domainData[language] || domainData.en;

        for (const term of domainTerms) {
          const regex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'g');
          const matches = [...lowerText.matchAll(regex)];

          if (matches.length > 0) {
            terminology.push({
              term,
              count: matches.length,
              domain: domainName,
              positions: matches.map((match) => match.index),
            });
          }
        }
      }
    }

    // Sorteer op aantal voorkomens (hoog naar laag)
    terminology.sort((a, b) => b.count - a.count);

    return terminology;
  }

  /**
   * Extraheer veelvoorkomende uitdrukkingen (phrases) uit tekst
   * @param {String} text - Tekst om te analyseren
   * @param {String} language - Taal van de tekst
   * @returns {Promise<Array<Object>>} - Geëxtraheerde phrases
   */
  async extractPhrases(text, language) {
    const phrases = [];
    const stopwords = new Set(this.stopwords[language] || this.stopwords.en);

    // Tokenize tekst
    const tokens = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Verwijder leestekens
      .split(/\s+/); // Split op whitespace

    // Genereer n-grams voor verschillende groottes
    for (const n of this.ngramSizes) {
      const ngrams = {};

      // Genereer alle mogelijke n-grams
      for (let i = 0; i <= tokens.length - n; i++) {
        const ngram = [];
        let validNgram = true;

        // Bouw n-gram op
        for (let j = 0; j < n; j++) {
          const token = tokens[i + j];

          // Skip n-grams die alleen uit stopwoorden bestaan
          if (j === 0 && stopwords.has(token)) {
            validNgram = false;
            break;
          }

          ngram.push(token);
        }

        if (validNgram) {
          const ngramStr = ngram.join(' ');
          ngrams[ngramStr] = (ngrams[ngramStr] || 0) + 1;
        }
      }

      // Voeg n-grams toe die vaker dan 1 keer voorkomen
      for (const [phrase, count] of Object.entries(ngrams)) {
        if (count > 1) {
          phrases.push({
            phrase,
            count,
            size: n,
          });
        }
      }
    }

    // Sorteer op aantal voorkomens (hoog naar laag)
    phrases.sort((a, b) => b.count - a.count);

    return phrases;
  }

  /**
   * Identificeer jargon in tekst
   * @param {String} text - Tekst om te analyseren
   * @param {String} language - Taal van de tekst
   * @param {String} domain - Domein van de tekst
   * @returns {Promise<Array<Object>>} - Geïdentificeerd jargon
   */
  async identifyJargon(text, language, domain) {
    const jargon = [];
    const lowerText = text.toLowerCase();

    // Als domein bekend is, gebruik domein-specifiek jargon
    if (domain && this.domainJargon[domain]) {
      const domainJargonTerms = this.domainJargon[domain][language] || this.domainJargon[domain].en;

      for (const term of domainJargonTerms) {
        const regex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'g');
        const matches = [...lowerText.matchAll(regex)];

        if (matches.length > 0) {
          jargon.push({
            term,
            count: matches.length,
            domain,
            positions: matches.map((match) => match.index),
          });
        }
      }
    } else {
      // Als domein niet bekend is, controleer alle domeinen
      for (const [domainName, domainData] of Object.entries(this.domainJargon)) {
        const domainJargonTerms = domainData[language] || domainData.en;

        for (const term of domainJargonTerms) {
          const regex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'g');
          const matches = [...lowerText.matchAll(regex)];

          if (matches.length > 0) {
            jargon.push({
              term,
              count: matches.length,
              domain: domainName,
              positions: matches.map((match) => match.index),
            });
          }
        }
      }
    }

    // Sorteer op aantal voorkomens (hoog naar laag)
    jargon.sort((a, b) => b.count - a.count);

    return jargon;
  }

  /**
   * Detecteer informele uitdrukkingen in tekst
   * @param {String} text - Tekst om te analyseren
   * @param {String} language - Taal van de tekst
   * @returns {Promise<Array<Object>>} - Gedetecteerde informele uitdrukkingen
   */
  async detectColloquialExpressions(text, language) {
    const expressions = [];
    const lowerText = text.toLowerCase();
    const colloquialTerms = this.colloquialExpressions[language] || this.colloquialExpressions.en;

    for (const term of colloquialTerms) {
      const regex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'g');
      const matches = [...lowerText.matchAll(regex)];

      if (matches.length > 0) {
        expressions.push({
          term,
          count: matches.length,
          positions: matches.map((match) => match.index),
        });
      }
    }

    // Sorteer op aantal voorkomens (hoog naar laag)
    expressions.sort((a, b) => b.count - a.count);

    return expressions;
  }

  /**
   * Analyseer woordfrequentie in tekst
   * @param {String} text - Tekst om te analyseren
   * @param {String} language - Taal van de tekst
   * @returns {Promise<Object>} - Woordfrequentie analyse
   */
  async analyzeWordFrequency(text, language) {
    const frequency = {};
    const stopwords = new Set(this.stopwords[language] || this.stopwords.en);

    // Tokenize tekst
    const tokens = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Verwijder leestekens
      .split(/\s+/); // Split op whitespace

    // Tel frequentie van elk woord
    for (const token of tokens) {
      // Skip stopwoorden en korte woorden
      if (token.length <= 2 || stopwords.has(token)) {
        continue;
      }

      frequency[token] = (frequency[token] || 0) + 1;
    }

    return frequency;
  }

  /**
   * Bereid data voor voor visualisatie
   * @param {Object} wordFrequency - Woordfrequentie analyse
   * @param {Array<Object>} terminology - Geëxtraheerde terminologie
   * @param {Array<Object>} jargon - Geïdentificeerd jargon
   * @returns {Object} - Data voor visualisatie
   */
  prepareVisualizationData(wordFrequency, terminology, jargon) {
    // Bereid data voor voor word cloud
    const wordCloudData = Object.entries(wordFrequency)
      .map(([word, count]) => ({
        text: word,
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 100); // Beperk tot 100 woorden voor betere visualisatie

    // Bereid data voor voor terminologie visualisatie
    const terminologyByDomain = {};
    for (const term of terminology) {
      if (!terminologyByDomain[term.domain]) {
        terminologyByDomain[term.domain] = [];
      }
      terminologyByDomain[term.domain].push({
        term: term.term,
        count: term.count,
      });
    }

    // Bereid data voor voor jargon visualisatie
    const jargonByDomain = {};
    for (const term of jargon) {
      if (!jargonByDomain[term.domain]) {
        jargonByDomain[term.domain] = [];
      }
      jargonByDomain[term.domain].push({
        term: term.term,
        count: term.count,
      });
    }

    return {
      wordCloud: wordCloudData,
      terminologyByDomain,
      jargonByDomain,
    };
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de LanguageAnalysisService
 * @returns {LanguageAnalysisService} - LanguageAnalysisService instance
 */
const getLanguageAnalysisService = () => {
  if (!instance) {
    instance = new LanguageAnalysisService();
  }
  return instance;
};

module.exports = {
  getLanguageAnalysisService,
};
module.exports.default = getLanguageAnalysisService;
