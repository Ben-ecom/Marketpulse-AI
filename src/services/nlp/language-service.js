/**
 * Language Service
 *
 * Dit bestand bevat de service voor taaldetectie en vertaling.
 * Het biedt functionaliteit voor het detecteren van de taal van een tekst
 * en het vertalen naar een andere taal indien nodig.
 */

const { franc } = require('franc');
const ISO6391 = require('iso-639-1');

/**
 * Language Service klasse
 */
class LanguageService {
  constructor() {
    // Ondersteunde talen voor vertaling
    this.supportedLanguages = new Set([
      'en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko',
      'ar', 'hi', 'bn', 'pa', 'te', 'mr', 'ta', 'ur', 'fa', 'tr', 'pl',
      'uk', 'el', 'he', 'th', 'vi', 'id', 'ms', 'fil', 'sv', 'no', 'da',
      'fi', 'hu', 'cs', 'ro', 'bg', 'hr', 'sr', 'sk', 'sl', 'et', 'lv',
      'lt', 'is', 'ga', 'cy', 'mt', 'eu', 'ca', 'gl', 'lb',
    ]);

    // Taalcodes mapping voor franc
    this.languageMapping = {
      cmn: 'zh', // Chinees
      jpn: 'ja', // Japans
      kor: 'ko', // Koreaans
      nld: 'nl', // Nederlands
      deu: 'de', // Duits
      fra: 'fr', // Frans
      spa: 'es', // Spaans
      ita: 'it', // Italiaans
      por: 'pt', // Portugees
      rus: 'ru', // Russisch
      ara: 'ar', // Arabisch
      hin: 'hi', // Hindi
      ben: 'bn', // Bengaals
      pan: 'pa', // Punjabi
      tel: 'te', // Telugu
      mar: 'mr', // Marathi
      tam: 'ta', // Tamil
      urd: 'ur', // Urdu
      fas: 'fa', // Perzisch
      tur: 'tr', // Turks
      pol: 'pl', // Pools
      ukr: 'uk', // Oekraïens
      ell: 'el', // Grieks
      heb: 'he', // Hebreeuws
      tha: 'th', // Thais
      vie: 'vi', // Vietnamees
      ind: 'id', // Indonesisch
      msa: 'ms', // Maleis
      fil: 'fil', // Filipijns
      swe: 'sv', // Zweeds
      nor: 'no', // Noors
      dan: 'da', // Deens
      fin: 'fi', // Fins
      hun: 'hu', // Hongaars
      ces: 'cs', // Tsjechisch
      ron: 'ro', // Roemeens
      bul: 'bg', // Bulgaars
      hrv: 'hr', // Kroatisch
      srp: 'sr', // Servisch
      slk: 'sk', // Slowaaks
      slv: 'sl', // Sloveens
      est: 'et', // Estisch
      lav: 'lv', // Lets
      lit: 'lt', // Litouws
      isl: 'is', // IJslands
      gle: 'ga', // Iers
      cym: 'cy', // Welsh
      mlt: 'mt', // Maltees
      eus: 'eu', // Baskisch
      cat: 'ca', // Catalaans
      glg: 'gl', // Galicisch
      ltz: 'lb', // Luxemburgs
      eng: 'en', // Engels
    };
  }

  /**
   * Detecteer de taal van een tekst en vertaal indien nodig
   * @param {String} text - Tekst om te verwerken
   * @param {Object} options - Verwerkingsopties
   * @returns {Promise<Object>} - Resultaat met taal en eventueel vertaalde tekst
   */
  async detectAndTranslate(text, options = {}) {
    try {
      if (!text) {
        return {
          language: 'unknown',
          processedText: '',
          translatedText: null,
        };
      }

      // Detecteer taal
      const detectedLanguage = await this.detectLanguage(text);

      let processedText = text;
      let translatedText = null;

      // Vertaal tekst indien nodig
      if (options.translateTo && detectedLanguage !== options.translateTo) {
        translatedText = await this.translateText(
          text,
          detectedLanguage,
          options.translateTo,
        );

        // Gebruik vertaalde tekst voor verdere verwerking indien aangegeven
        if (options.useTranslatedText) {
          processedText = translatedText;
        }
      }

      return {
        language: detectedLanguage,
        processedText,
        translatedText,
      };
    } catch (error) {
      console.error('❌ Fout bij taaldetectie en vertaling:', error);
      return {
        language: 'unknown',
        processedText: text,
        translatedText: null,
        error: error.message,
      };
    }
  }

  /**
   * Detecteer de taal van een tekst
   * @param {String} text - Tekst om te analyseren
   * @returns {Promise<String>} - ISO 639-1 taalcode
   */
  async detectLanguage(text) {
    try {
      // Gebruik franc voor taaldetectie
      const detectedLang = franc(text, { minLength: 3 });

      // Controleer of de taal gedetecteerd is
      if (detectedLang === 'und') {
        return 'unknown';
      }

      // Converteer naar ISO 639-1 formaat
      const iso6391Code = this.languageMapping[detectedLang]
                         || (ISO6391.validate(detectedLang) ? detectedLang : 'unknown');

      return iso6391Code;
    } catch (error) {
      console.error('❌ Fout bij taaldetectie:', error);
      return 'unknown';
    }
  }

  /**
   * Vertaal tekst van brontaal naar doeltaal
   * @param {String} text - Tekst om te vertalen
   * @param {String} sourceLanguage - Brontaal ISO 639-1 code
   * @param {String} targetLanguage - Doeltaal ISO 639-1 code
   * @returns {Promise<String>} - Vertaalde tekst
   */
  async translateText(text, sourceLanguage, targetLanguage) {
    try {
      // Controleer of vertaling nodig is
      if (sourceLanguage === targetLanguage) {
        return text;
      }

      // Controleer of de doeltaal ondersteund wordt
      if (!this.supportedLanguages.has(targetLanguage)) {
        throw new Error(`Doeltaal ${targetLanguage} wordt niet ondersteund`);
      }

      // In een productie-omgeving zou je hier een vertaal-API aanroepen
      // zoals Google Translate, DeepL, of een andere vertaalservice

      // Voor nu gebruiken we een mock implementatie
      console.log(`🔄 Vertalen van ${sourceLanguage} naar ${targetLanguage}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

      // Mock vertaling (in productie vervangen door echte API call)
      return `[Vertaald van ${sourceLanguage} naar ${targetLanguage}] ${text}`;
    } catch (error) {
      console.error('❌ Fout bij vertalen van tekst:', error);
      throw error;
    }
  }

  /**
   * Controleer of een taal ondersteund wordt
   * @param {String} language - ISO 639-1 taalcode
   * @returns {Boolean} - Of de taal ondersteund wordt
   */
  isLanguageSupported(language) {
    return this.supportedLanguages.has(language);
  }

  /**
   * Krijg de naam van een taal op basis van de ISO 639-1 code
   * @param {String} languageCode - ISO 639-1 taalcode
   * @returns {String} - Taalnaam
   */
  getLanguageName(languageCode) {
    return ISO6391.getName(languageCode) || 'Unknown';
  }

  /**
   * Krijg de native naam van een taal op basis van de ISO 639-1 code
   * @param {String} languageCode - ISO 639-1 taalcode
   * @returns {String} - Native taalnaam
   */
  getNativeLanguageName(languageCode) {
    return ISO6391.getNativeName(languageCode) || 'Unknown';
  }
}

// Singleton instance
let instance = null;

/**
 * Krijg een singleton instance van de LanguageService
 * @returns {LanguageService} - LanguageService instance
 */
const getLanguageService = () => {
  if (!instance) {
    instance = new LanguageService();
  }
  return instance;
};

module.exports = {
  getLanguageService,
};
