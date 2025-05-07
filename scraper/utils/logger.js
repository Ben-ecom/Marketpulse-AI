const winston = require('winston');

// Configuratie voor verschillende omgevingen
const config = {
  development: {
    level: 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(info => `${info.timestamp} ${info.level}: [${info.service}] ${info.message}`)
    ),
    transports: [
      new winston.transports.Console()
    ]
  },
  production: {
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console()
    ]
  }
};

// Bepaal de huidige omgeving
const environment = process.env.NODE_ENV || 'development';
const loggerConfig = config[environment] || config.development;

/**
 * Maakt een logger instantie voor een specifieke service
 * @param {string} serviceName - Naam van de service voor identificatie in logs
 * @returns {winston.Logger} - Winston logger instantie
 */
function getLogger(serviceName) {
  return winston.createLogger({
    level: loggerConfig.level,
    format: loggerConfig.format,
    defaultMeta: { service: serviceName },
    transports: loggerConfig.transports
  });
}

module.exports = {
  getLogger
};
