/**
 * NLP Processing Module
 *
 * Dit bestand exporteert de NLP processing service voor tekstanalyse.
 * Het biedt functionaliteit voor tekstnormalisatie, taaldetectie, tokenization,
 * lemmatization, POS-tagging, en Named Entity Recognition.
 */

const { getNlpProcessingService } = require('./nlp-service');
const { getTextCleaningService } = require('./text-cleaning');
const { getLanguageService } = require('./language-service');
const { getEntityRecognitionService } = require('./entity-recognition');
const { getSentimentAnalysisService } = require('./sentiment-analysis');
const { getTopicModelingService } = require('./topic-modeling');
const { getBatchProcessingService } = require('./batch-processing');

// Initialiseer alle NLP services
const nlpProcessingService = getNlpProcessingService();
const textCleaningService = getTextCleaningService();
const languageService = getLanguageService();
const entityRecognitionService = getEntityRecognitionService();
const sentimentAnalysisService = getSentimentAnalysisService();
const topicModelingService = getTopicModelingService();
const batchProcessingService = getBatchProcessingService();

// Alle NLP services
const nlpServices = {
  nlpProcessing: nlpProcessingService,
  textCleaning: textCleaningService,
  language: languageService,
  entityRecognition: entityRecognitionService,
  sentimentAnalysis: sentimentAnalysisService,
  topicModeling: topicModelingService,
  batchProcessing: batchProcessingService,
};

// Exporteer alle services
module.exports = {
  nlpServices,
  nlpProcessingService,
  textCleaningService,
  languageService,
  entityRecognitionService,
  sentimentAnalysisService,
  topicModelingService,
  batchProcessingService,
};
