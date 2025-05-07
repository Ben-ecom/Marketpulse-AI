import express from 'express';
import { marketAnalysisController } from '../controllers/marketAnalysisController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Alle routes vereisen authenticatie
router.use(authMiddleware);

// Route om een volledige marktanalyse uit te voeren
router.post('/analyze/:projectId', marketAnalysisController.performAnalysis);

// Route om de meest recente marktanalyse op te halen
router.get('/latest/:projectId', marketAnalysisController.getLatestAnalysis);

// Route om markttrends op te halen
router.get('/trends/:projectId', marketAnalysisController.getMarketTrends);

// Route om consumentsentiment op te halen
router.get('/sentiment/:projectId', marketAnalysisController.getConsumerSentiment);

// Route om prijsanalyse op te halen
router.get('/pricing/:projectId', marketAnalysisController.getPricingAnalysis);

export default router;
