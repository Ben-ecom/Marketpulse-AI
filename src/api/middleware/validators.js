/**
 * Validators Middleware
 *
 * Deze middleware bevat validatiefuncties voor API requests.
 */

/**
 * Valideer marktonderzoeksgegevens
 * Controleert of de verstrekte gegevens voldoen aan de minimale vereisten
 * voor het uitvoeren van een marktanalyse.
 */
const validateMarketData = (req, res, next) => {
  const marketData = req.body;

  // Controleer of er überhaupt data is
  if (!marketData || Object.keys(marketData).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Geen marktgegevens verstrekt',
    });
  }

  // Voor een volledige marktanalyse is ten minste één van de volgende gegevenstypen vereist
  const requiredDataTypes = ['marketSize', 'segmentation', 'trends', 'pricing', 'competitors'];
  const hasRequiredData = requiredDataTypes.some((type) => marketData[type]);

  if (!hasRequiredData) {
    return res.status(400).json({
      success: false,
      error: 'Onvoldoende marktgegevens verstrekt. Ten minste één van de volgende is vereist: marketSize, segmentation, trends, pricing, competitors',
    });
  }

  // Valideer specifieke gegevenstypen indien aanwezig
  if (marketData.marketSize) {
    // Marktgrootte moet numerieke waarden bevatten
    const { totalAddressableMarket, serviceableAvailableMarket, serviceableObtainableMarket } = marketData.marketSize;

    if (
      (totalAddressableMarket !== undefined && typeof totalAddressableMarket !== 'number')
      || (serviceableAvailableMarket !== undefined && typeof serviceableAvailableMarket !== 'number')
      || (serviceableObtainableMarket !== undefined && typeof serviceableObtainableMarket !== 'number')
    ) {
      return res.status(400).json({
        success: false,
        error: 'Marktgrootte moet numerieke waarden bevatten',
      });
    }
  }

  if (marketData.competitors) {
    // Concurrenten moeten een array zijn
    if (!Array.isArray(marketData.competitors)) {
      return res.status(400).json({
        success: false,
        error: 'Concurrentiegegevens moeten een array zijn',
      });
    }

    // Elke concurrent moet een naam hebben
    const hasInvalidCompetitor = marketData.competitors.some((competitor) => !competitor.name);

    if (hasInvalidCompetitor) {
      return res.status(400).json({
        success: false,
        error: 'Elke concurrent moet een naam hebben',
      });
    }
  }

  // Ga verder naar de volgende middleware of route handler
  return next();
};

module.exports = {
  validateMarketData,
};
