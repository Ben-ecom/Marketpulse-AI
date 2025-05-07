/**
 * Babel configuratie voor MarketPulse AI
 * 
 * Deze configuratie zorgt ervoor dat ES modules correct worden getranspileerd
 * voor het testen met Jest.
 */

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'auto'
      },
    ],
    '@babel/preset-react'
  ],
};
