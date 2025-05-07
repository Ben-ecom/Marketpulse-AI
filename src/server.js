/**
 * MarketPulse AI - Server
 *
 * Dit bestand start de Express server voor MarketPulse AI.
 */

const dotenv = require('dotenv');
const app = require('./app');

// Laad omgevingsvariabelen
dotenv.config();

// Definieer poort
const PORT = process.env.PORT || 3000;

// Start de server
app.listen(PORT, () => {
  console.log(`🚀 Server draait op poort ${PORT}`);
  console.log(`📊 MarketPulse AI API is beschikbaar op http://localhost:${PORT}`);
});
