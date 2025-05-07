/**
 * Entity Recognition Service
 *
 * Dit bestand bevat de service voor Named Entity Recognition (NER).
 * Het biedt functionaliteit voor het herkennen van entiteiten zoals personen,
 * organisaties, locaties, producten, en andere benoemde entiteiten in tekst.
 */

/**
 * Entity Recognition Service klasse
 */
class EntityRecognitionService {
  constructor() {
    // Entiteitstypes
    this.entityTypes = {
      PERSON: 'PERSON',
      ORGANIZATION: 'ORGANIZATION',
      LOCATION: 'LOCATION',
      PRODUCT: 'PRODUCT',
      EVENT: 'EVENT',
      DATE: 'DATE',
      TIME: 'TIME',
      MONEY: 'MONEY',
      PERCENT: 'PERCENT',
      FACILITY: 'FACILITY',
      GPE: 'GPE', // Geo-Political Entity
      NORP: 'NORP', // Nationalities, Religious or Political groups
      WORK_OF_ART: 'WORK_OF_ART',
      LAW: 'LAW',
      LANGUAGE: 'LANGUAGE',
      QUANTITY: 'QUANTITY',
    };

    // Regex patronen voor eenvoudige entity herkenning
    this.patterns = {
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      url: /(https?:\/\/[^\s]+)/g,
      phone: /(\+?[0-9]{1,3}[\s-]?)?(\([0-9]{1,4}\)[\s-]?)?[0-9]{1,4}[\s-]?[0-9]{1,4}[\s-]?[0-9]{1,9}/g,
      ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      money: /\$\s?[0-9]+(?:\.[0-9]{2})?|\€\s?[0-9]+(?:,[0-9]{2})?|\£\s?[0-9]+(?:\.[0-9]{2})?/g,
      date: /\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g,
      time: /\b(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s?[ap]\.?m\.?)?)\b/g,
      hashtag: /#[a-zA-Z0-9_]+/g,
      mention: /@[a-zA-Z0-9_]+/g,
    };

    // Gazetteer voor bekende entiteiten (in een productie-omgeving zou dit veel uitgebreider zijn)
    this.gazetteers = {
      ORGANIZATION: new Set([
        'Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Twitter', 'LinkedIn',
        'Netflix', 'Spotify', 'Uber', 'Airbnb', 'Tesla', 'IBM', 'Intel', 'AMD',
        'Samsung', 'Sony', 'LG', 'Philips', 'Siemens', 'Bosch', 'Shell', 'BP',
        'Exxon', 'Chevron', 'Toyota', 'Honda', 'BMW', 'Mercedes', 'Volkswagen',
        'Audi', 'Ford', 'General Motors', 'Coca-Cola', 'Pepsi', 'Unilever',
        'Procter & Gamble', 'Nestlé', 'McDonald\'s', 'Burger King', 'KFC',
        'Starbucks', 'Nike', 'Adidas', 'Puma', 'Reebok', 'H&M', 'Zara', 'IKEA',
        'Walmart', 'Target', 'Carrefour', 'Aldi', 'Lidl', 'Tesco', 'Sainsbury\'s',
        'Disney', 'Warner Bros', 'Universal', 'Paramount', 'Sony Pictures',
        'BBC', 'CNN', 'NBC', 'ABC', 'CBS', 'Fox', 'HBO', 'Hulu', 'YouTube',
        'Instagram', 'WhatsApp', 'Telegram', 'Signal', 'TikTok', 'Snapchat',
        'Reddit', 'Pinterest', 'Tumblr', 'Flickr', 'Vimeo', 'Twitch',
      ]),
      LOCATION: new Set([
        'Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht', 'Eindhoven', 'Groningen',
        'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'New York', 'Los Angeles',
        'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
        'Dallas', 'San Jose', 'London', 'Birmingham', 'Manchester', 'Liverpool',
        'Bristol', 'Glasgow', 'Edinburgh', 'Leeds', 'Sheffield', 'Newcastle',
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
        'Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart',
        'Düsseldorf', 'Leipzig', 'Dortmund', 'Rome', 'Milan', 'Naples', 'Turin',
        'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania', 'Madrid',
        'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia',
        'Palma', 'Las Palmas', 'Bilbao', 'Tokyo', 'Yokohama', 'Osaka', 'Nagoya',
        'Sapporo', 'Fukuoka', 'Kawasaki', 'Kobe', 'Kyoto', 'Saitama', 'Beijing',
        'Shanghai', 'Guangzhou', 'Shenzhen', 'Tianjin', 'Chongqing', 'Wuhan',
        'Chengdu', 'Nanjing', 'Xi\'an', 'Sydney', 'Melbourne', 'Brisbane',
        'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Hobart', 'Darwin',
      ]),
      PRODUCT: new Set([
        'iPhone', 'iPad', 'MacBook', 'iMac', 'Apple Watch', 'AirPods', 'HomePod',
        'Galaxy S', 'Galaxy Note', 'Galaxy Tab', 'Galaxy Watch', 'Galaxy Buds',
        'Surface Pro', 'Surface Laptop', 'Surface Book', 'Surface Go', 'Xbox',
        'PlayStation', 'Nintendo Switch', 'Wii', 'Tesla Model S', 'Tesla Model 3',
        'Tesla Model X', 'Tesla Model Y', 'Cybertruck', 'Roadster', 'Kindle',
        'Echo', 'Echo Dot', 'Echo Show', 'Fire TV', 'Fire Tablet', 'Alexa',
        'Google Home', 'Google Nest', 'Chromecast', 'Pixel', 'Pixel Buds',
        'Fitbit', 'GoPro', 'Sonos', 'Bose', 'Beats', 'Dyson', 'Roomba',
        'Nespresso', 'Keurig', 'Instant Pot', 'Air Fryer', 'KitchenAid',
        'Vitamix', 'Ninja', 'Weber', 'Traeger', 'Peloton', 'Oculus', 'Ring',
        'Nest Thermostat', 'Philips Hue', 'IKEA Billy', 'IKEA Malm', 'IKEA Kallax',
        'IKEA Poäng', 'IKEA Lack', 'IKEA Expedit', 'IKEA Hemnes', 'IKEA Ektorp',
      ]),
    };
  }

  /**
   * Extraheer entiteiten uit tekst
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Geëxtraheerde entiteiten
   */
  async extractEntities(text, options = {}) {
    try {
      if (!text) {
        return { entities: [] };
      }

      // Bepaal welke methode te gebruiken
      let entities = [];

      if (options.useSpacy) {
        // In een productie-omgeving zou je hier een SpaCy API aanroepen
        // of een andere geavanceerde NER service
        entities = await this.mockSpacyEntityExtraction(text, options);
      } else {
        // Gebruik eenvoudige regex en gazetteer-gebaseerde extractie
        entities = await this.extractEntitiesWithRegexAndGazetteers(text, options);
      }

      // Filter duplicaten en sorteer op vertrouwen
      const uniqueEntities = this.deduplicateEntities(entities);

      return {
        entities: uniqueEntities,
      };
    } catch (error) {
      console.error('❌ Fout bij entity extractie:', error);
      return { entities: [], error: error.message };
    }
  }

  /**
   * Extraheer entiteiten met regex patronen en gazetteers
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Array<Object>>} - Geëxtraheerde entiteiten
   */
  async extractEntitiesWithRegexAndGazetteers(text, options = {}) {
    const entities = [];

    // Extraheer entiteiten met regex patronen
    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const entity = {
          text: match[0],
          type: this.mapPatternToEntityType(patternName),
          start: match.index,
          end: match.index + match[0].length,
          confidence: 0.8,
          method: 'regex',
        };

        entities.push(entity);
      }
    }

    // Extraheer entiteiten met gazetteers
    for (const [entityType, gazetteer] of Object.entries(this.gazetteers)) {
      for (const entity of gazetteer) {
        const regex = new RegExp(`\\b${this.escapeRegExp(entity)}\\b`, 'gi');
        let match;

        while ((match = regex.exec(text)) !== null) {
          const entityObj = {
            text: match[0],
            type: entityType,
            start: match.index,
            end: match.index + match[0].length,
            confidence: 0.9,
            method: 'gazetteer',
          };

          entities.push(entityObj);
        }
      }
    }

    return entities;
  }

  /**
   * Mock SpaCy entity extractie (in productie vervangen door echte API call)
   * @param {String} text - Tekst om te analyseren
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Array<Object>>} - Geëxtraheerde entiteiten
   */
  async mockSpacyEntityExtraction(text, options = {}) {
    // In een productie-omgeving zou je hier een SpaCy API aanroepen
    console.log(`🔍 Mock SpaCy entity extractie voor: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

    // Simuleer een vertraging om een API call na te bootsen
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Genereer enkele mock entiteiten op basis van de tekst
    const entities = [];

    // Voeg enkele willekeurige entiteiten toe
    if (text.toLowerCase().includes('google')) {
      entities.push({
        text: 'Google',
        type: this.entityTypes.ORGANIZATION,
        start: text.toLowerCase().indexOf('google'),
        end: text.toLowerCase().indexOf('google') + 6,
        confidence: 0.95,
        method: 'spacy',
      });
    }

    if (text.toLowerCase().includes('amsterdam')) {
      entities.push({
        text: 'Amsterdam',
        type: this.entityTypes.LOCATION,
        start: text.toLowerCase().indexOf('amsterdam'),
        end: text.toLowerCase().indexOf('amsterdam') + 9,
        confidence: 0.92,
        method: 'spacy',
      });
    }

    if (text.toLowerCase().includes('iphone')) {
      entities.push({
        text: 'iPhone',
        type: this.entityTypes.PRODUCT,
        start: text.toLowerCase().indexOf('iphone'),
        end: text.toLowerCase().indexOf('iphone') + 6,
        confidence: 0.88,
        method: 'spacy',
      });
    }

    // Voeg ook de entiteiten toe die we met regex en gazetteers kunnen vinden
    const regexEntities = await this.extractEntitiesWithRegexAndGazetteers(text, options);
    entities.push(...regexEntities);

    return entities;
  }

  /**
   * Dedupliceert entiteiten en sorteert op vertrouwen
   * @param {Array<Object>} entities - Array van entiteiten
   * @returns {Array<Object>} - Gedupliceeerde en gesorteerde entiteiten
   */
  deduplicateEntities(entities) {
    // Groepeer entiteiten op basis van tekst en type
    const entityGroups = {};

    for (const entity of entities) {
      const key = `${entity.text.toLowerCase()}_${entity.type}`;

      if (!entityGroups[key]) {
        entityGroups[key] = [];
      }

      entityGroups[key].push(entity);
    }

    // Kies de entiteit met het hoogste vertrouwen uit elke groep
    const uniqueEntities = Object.values(entityGroups).map((group) => {
      return group.reduce((best, current) => {
        return current.confidence > best.confidence ? current : best;
      }, group[0]);
    });

    // Sorteer op vertrouwen (hoog naar laag)
    return uniqueEntities.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Mapt een patroon naam naar een entiteitstype
   * @param {String} patternName - Naam van het regex patroon
   * @returns {String} - Entiteitstype
   */
  mapPatternToEntityType(patternName) {
    const mapping = {
      email: 'EMAIL',
      url: 'URL',
      phone: 'PHONE_NUMBER',
      ipAddress: 'IP_ADDRESS',
      money: this.entityTypes.MONEY,
      date: this.entityTypes.DATE,
      time: this.entityTypes.TIME,
      hashtag: 'HASHTAG',
      mention: 'MENTION',
    };

    return mapping[patternName] || 'MISC';
  }

  /**
   * Escapet speciale tekens in een string voor gebruik in een regex
   * @param {String} string - String om te escapen
   * @returns {String} - Geëscapete string
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de EntityRecognitionService
 * @returns {EntityRecognitionService} - EntityRecognitionService instance
 */
const getEntityRecognitionService = () => {
  if (!instance) {
    instance = new EntityRecognitionService();
  }
  return instance;
};

module.exports = {
  getEntityRecognitionService,
};
