const winston = require('winston');
const { format, transports } = winston;

/**
 * Logger utility voor de MarketPulse AI API
 * Gebruikt Winston voor gestructureerde logging
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'marketpulse-api' },
  transports: [
    // Schrijf alle logs naar console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
        )
      )
    })
  ]
});

// In productie, schrijf ook naar een bestand
if (process.env.NODE_ENV === 'production') {
  logger.add(new transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }));
  
  logger.add(new transports.File({ 
    filename: 'logs/combined.log',
    maxsize: 10485760, // 10MB
    maxFiles: 10
  }));
}

// Voeg een stream toe voor Morgan HTTP logging
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  }
};

module.exports = logger;
