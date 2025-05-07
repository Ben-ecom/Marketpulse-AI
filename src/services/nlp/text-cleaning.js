/**
 * Text Cleaning Service
 *
 * Dit bestand bevat de service voor tekstnormalisatie en schoonmaak.
 * Het biedt functionaliteit voor het verwijderen van HTML tags, speciale tekens,
 * stopwoorden, en andere tekstelementen die de analyse kunnen verstoren.
 */

/**
 * Text Cleaning Service klasse
 */
class TextCleaningService {
  constructor() {
    // Stopwoorden per taal
    this.stopwords = {
      en: new Set([
        'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'from',
        'in', 'out', 'with', 'about', 'against', 'between', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'up', 'down', 'of', 'off', 'over', 'under',
        'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
        'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
        'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
        'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her',
        'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs',
        'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
        'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'having', 'do', 'does', 'did', 'doing', 'would', 'should', 'could', 'ought',
        'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re', 'i\'ve',
        'you\'ve', 'we\'ve', 'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d',
        'they\'d', 'i\'ll', 'you\'ll', 'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll',
        'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t', 'haven\'t', 'hadn\'t',
        'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t', 'shouldn\'t',
        'can\'t', 'cannot', 'couldn\'t', 'mustn\'t', 'let\'s', 'that\'s', 'who\'s',
        'what\'s', 'here\'s', 'there\'s', 'when\'s', 'where\'s', 'why\'s', 'how\'s',
      ]),
      nl: new Set([
        'de', 'het', 'een', 'en', 'van', 'in', 'is', 'op', 'dat', 'die', 'voor',
        'zijn', 'met', 'ze', 'niet', 'ook', 'door', 'ik', 'je', 'hij', 'maar', 'naar',
        'uit', 'er', 'dan', 'ze', 'als', 'bij', 'nog', 'om', 'hebben', 'heeft', 'had',
        'was', 'kan', 'aan', 'of', 'wordt', 'tot', 'dit', 'deze', 'over', 'al', 'wat',
        'wel', 'nu', 'moet', 'hoe', 'geen', 'mijn', 'worden', 'werd', 'meer', 'wie',
        'omdat', 'iets', 'alles', 'onder', 'ja', 'eens', 'hier', 'daar', 'haar', 'hun',
        'zou', 'zonder', 'kunnen', 'hun', 'dus', 'zelf', 'reeds', 'geweest', 'andere',
        'doch', 'werd', 'waar', 'wij', 'ons', 'onze', 'jullie', 'jouw', 'mijne', 'veel',
        'zo', 'zie', 'zien', 'zich', 'jij', 'wil', 'willen', 'zal', 'zullen', 'zou', 'zouden',
      ]),
      // Voeg meer talen toe indien nodig
    };

    // Regex patronen voor schoonmaak
    this.patterns = {
      html: /<[^>]*>/g,
      url: /https?:\/\/[^\s]+/g,
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      specialChars: /[^\w\s.,!?;:()[\]{}'"]/g,
      multipleSpaces: /\s+/g,
      numbers: /\b\d+\b/g,
      emoji: /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    };
  }

  /**
   * Maak tekst schoon met verschillende schoonmaakstappen
   * @param {String} text - Tekst om schoon te maken
   * @param {Object} options - Schoonmaakopties
   * @returns {Promise<String>} - Schoongemaakte tekst
   */
  async cleanText(text, options = {}) {
    try {
      if (!text) return '';

      let cleanedText = text;

      // Verwijder HTML tags indien nodig
      if (options.removeHtml !== false) {
        cleanedText = this.removeHtml(cleanedText);
      }

      // Verwijder URLs indien nodig
      if (options.removeUrls !== false) {
        cleanedText = this.removeUrls(cleanedText);
      }

      // Verwijder e-mailadressen indien nodig
      if (options.removeEmails !== false) {
        cleanedText = this.removeEmails(cleanedText);
      }

      // Verwijder emoji's indien nodig
      if (options.removeEmojis !== false) {
        cleanedText = this.removeEmojis(cleanedText);
      }

      // Verwijder speciale tekens indien nodig
      if (options.removeSpecialChars !== false) {
        cleanedText = this.removeSpecialChars(cleanedText);
      }

      // Verwijder getallen indien nodig
      if (options.removeNumbers) {
        cleanedText = this.removeNumbers(cleanedText);
      }

      // Normaliseer witruimte
      cleanedText = this.normalizeWhitespace(cleanedText);

      // Verwijder stopwoorden indien nodig
      if (options.removeStopwords) {
        const language = options.language || 'en';
        cleanedText = this.removeStopwords(cleanedText, language);
      }

      // Converteer naar lowercase indien nodig
      if (options.lowercase !== false) {
        cleanedText = cleanedText.toLowerCase();
      }

      // Trim witruimte
      cleanedText = cleanedText.trim();

      return cleanedText;
    } catch (error) {
      console.error('❌ Fout bij schoonmaken van tekst:', error);
      return text; // Retourneer originele tekst bij fout
    }
  }

  /**
   * Verwijder HTML tags uit tekst
   * @param {String} text - Tekst om te verwerken
   * @returns {String} - Tekst zonder HTML tags
   */
  removeHtml(text) {
    return text.replace(this.patterns.html, ' ');
  }

  /**
   * Verwijder URLs uit tekst
   * @param {String} text - Tekst om te verwerken
   * @returns {String} - Tekst zonder URLs
   */
  removeUrls(text) {
    return text.replace(this.patterns.url, ' ');
  }

  /**
   * Verwijder e-mailadressen uit tekst
   * @param {String} text - Tekst om te verwerken
   * @returns {String} - Tekst zonder e-mailadressen
   */
  removeEmails(text) {
    return text.replace(this.patterns.email, ' ');
  }

  /**
   * Verwijder emoji's uit tekst
   * @param {String} text - Tekst om te verwerken
   * @returns {String} - Tekst zonder emoji's
   */
  removeEmojis(text) {
    return text.replace(this.patterns.emoji, '');
  }

  /**
   * Verwijder speciale tekens uit tekst
   * @param {String} text - Tekst om te verwerken
   * @returns {String} - Tekst zonder speciale tekens
   */
  removeSpecialChars(text) {
    return text.replace(this.patterns.specialChars, ' ');
  }

  /**
   * Verwijder getallen uit tekst
   * @param {String} text - Tekst om te verwerken
   * @returns {String} - Tekst zonder getallen
   */
  removeNumbers(text) {
    return text.replace(this.patterns.numbers, ' ');
  }

  /**
   * Normaliseer witruimte in tekst
   * @param {String} text - Tekst om te verwerken
   * @returns {String} - Tekst met genormaliseerde witruimte
   */
  normalizeWhitespace(text) {
    return text.replace(this.patterns.multipleSpaces, ' ');
  }

  /**
   * Verwijder stopwoorden uit tekst
   * @param {String} text - Tekst om te verwerken
   * @param {String} language - Taalcode (en, nl, etc.)
   * @returns {String} - Tekst zonder stopwoorden
   */
  removeStopwords(text, language = 'en') {
    const stopwordSet = this.stopwords[language] || this.stopwords.en;

    // Split tekst in woorden, filter stopwoorden, en voeg weer samen
    return text
      .split(' ')
      .filter((word) => word.length > 0 && !stopwordSet.has(word.toLowerCase()))
      .join(' ');
  }

  /**
   * Tokenize tekst in woorden
   * @param {String} text - Tekst om te tokenizen
   * @returns {Array<String>} - Array van tokens
   */
  tokenize(text) {
    // Eenvoudige tokenization op basis van witruimte en interpunctie
    return text
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 0);
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de TextCleaningService
 * @returns {TextCleaningService} - TextCleaningService instance
 */
const getTextCleaningService = () => {
  if (!instance) {
    instance = new TextCleaningService();
  }
  return instance;
};

module.exports = {
  getTextCleaningService,
};
