/**
 * HelpSystemTest.js
 * 
 * Geautomatiseerde tests voor het MarketPulse AI help-systeem
 * Deze tests valideren de functionaliteit en gebruiksvriendelijkheid van het help-systeem
 * op basis van de scenario's uit het gebruikerstestplan.
 */

import { Builder, By, until, Key } from 'selenium-webdriver';
import { expect } from 'chai';
import { v4 as uuidv4 } from 'uuid';

// Test configuratie
const config = {
  baseUrl: 'http://localhost:3000',
  implicitWait: 10000, // 10 seconden
  explicitWait: 15000, // 15 seconden
  testUsers: {
    beginner: {
      email: 'test.beginner@example.com',
      password: 'testPassword123',
      role: 'marketeer',
      experienceLevel: 'beginner'
    },
    intermediate: {
      email: 'test.intermediate@example.com',
      password: 'testPassword123',
      role: 'analyst',
      experienceLevel: 'intermediate'
    },
    advanced: {
      email: 'test.advanced@example.com',
      password: 'testPassword123',
      role: 'product_manager',
      experienceLevel: 'advanced'
    }
  },
  testViews: ['dashboard', 'report', 'sentiment', 'trends', 'awareness', 'market-insights']
};

// Test helpers
const helpers = {
  /**
   * Wacht tot een element zichtbaar is
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {By} locator - Locator voor het element
   * @param {number} timeout - Timeout in milliseconden
   */
  async waitUntilVisible(driver, locator, timeout = config.explicitWait) {
    await driver.wait(until.elementIsVisible(driver.findElement(locator)), timeout);
  },
  
  /**
   * Wacht tot een element klikbaar is
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {By} locator - Locator voor het element
   * @param {number} timeout - Timeout in milliseconden
   */
  async waitUntilClickable(driver, locator, timeout = config.explicitWait) {
    await driver.wait(until.elementIsEnabled(driver.findElement(locator)), timeout);
  },
  
  /**
   * Wacht tot een element aanwezig is in de DOM
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {By} locator - Locator voor het element
   * @param {number} timeout - Timeout in milliseconden
   */
  async waitUntilPresent(driver, locator, timeout = config.explicitWait) {
    await driver.wait(until.elementLocated(locator), timeout);
  },
  
  /**
   * Genereert een unieke test ID
   * @returns {string} Unieke test ID
   */
  generateTestId() {
    return `test-${uuidv4().substring(0, 8)}`;
  },
  
  /**
   * Logt in met de opgegeven gebruiker
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {Object} user - Gebruikersobject met email en password
   */
  async login(driver, user) {
    await driver.get(`${config.baseUrl}/login`);
    await driver.findElement(By.id('email')).sendKeys(user.email);
    await driver.findElement(By.id('password')).sendKeys(user.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await helpers.waitUntilPresent(driver, By.css('.dashboard-container'));
  },
  
  /**
   * Navigeert naar de opgegeven view
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {string} view - View naam
   */
  async navigateToView(driver, view) {
    await driver.get(`${config.baseUrl}/${view}`);
    await helpers.waitUntilPresent(driver, By.css(`.${view}-container`));
  },
  
  /**
   * Opent de help-overlay
   * @param {WebDriver} driver - Selenium WebDriver instance
   */
  async openHelpOverlay(driver) {
    const helpButton = await driver.findElement(By.css('button[aria-label="Toon help"]'));
    await helpButton.click();
    // Wacht tot de help markers zichtbaar zijn
    await helpers.waitUntilPresent(driver, By.css('.help-marker'));
  },
  
  /**
   * Sluit de help-overlay
   * @param {WebDriver} driver - Selenium WebDriver instance
   */
  async closeHelpOverlay(driver) {
    const helpButton = await driver.findElement(By.css('button[aria-label="Verberg help"]'));
    await helpButton.click();
    // Wacht tot de help markers verdwenen zijn
    await driver.wait(until.stalenessOf(driver.findElement(By.css('.help-marker'))), config.explicitWait);
  },
  
  /**
   * Klikt op een help marker
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {number} index - Index van de help marker
   */
  async clickHelpMarker(driver, index = 0) {
    const helpMarkers = await driver.findElements(By.css('.help-marker'));
    await helpMarkers[index].click();
    // Wacht tot de help content zichtbaar is
    await helpers.waitUntilPresent(driver, By.css('.help-content'));
  },
  
  /**
   * Geeft feedback op een help item
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {boolean} isPositive - Of de feedback positief is
   * @param {string} comment - Optionele commentaar
   */
  async provideFeedback(driver, isPositive, comment = '') {
    const feedbackButton = isPositive ? 
      await driver.findElement(By.css('button[aria-label="Nuttig"]')) :
      await driver.findElement(By.css('button[aria-label="Niet nuttig"]'));
    
    await feedbackButton.click();
    
    if (comment) {
      const commentField = await driver.findElement(By.css('textarea[name="feedback-comment"]'));
      await commentField.sendKeys(comment);
      const submitButton = await driver.findElement(By.css('button[type="submit"]'));
      await submitButton.click();
    }
    
    // Wacht tot de bedankmelding verschijnt
    await helpers.waitUntilPresent(driver, By.css('.feedback-thank-you'));
  },
  
  /**
   * Opent de gebruikersfeedback dialog
   * @param {WebDriver} driver - Selenium WebDriver instance
   */
  async openUserFeedback(driver) {
    const feedbackButton = await driver.findElement(By.css('button[aria-label="feedback"]'));
    await feedbackButton.click();
    // Wacht tot de feedback dialog zichtbaar is
    await helpers.waitUntilPresent(driver, By.css('.user-feedback-dialog'));
  },
  
  /**
   * Geeft algemene gebruikersfeedback
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {number} rating - Rating (1-5)
   * @param {string} feedback - Feedback tekst
   * @param {Array} aspects - Array met aspecten
   */
  async provideUserFeedback(driver, rating, feedback, aspects = []) {
    // Selecteer rating
    const ratingButton = await driver.findElement(By.css(`input[name="rating"][value="${rating}"]`));
    await ratingButton.click();
    
    // Vul feedback in
    const feedbackField = await driver.findElement(By.css('textarea[name="feedback"]'));
    await feedbackField.sendKeys(feedback);
    
    // Selecteer aspecten
    for (const aspect of aspects) {
      const aspectCheckbox = await driver.findElement(By.css(`input[name="aspects"][value="${aspect}"]`));
      await aspectCheckbox.click();
    }
    
    // Submit feedback
    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();
    
    // Wacht tot de bedankmelding verschijnt
    await helpers.waitUntilPresent(driver, By.css('.feedback-thank-you'));
  },
  
  /**
   * Doorloopt de onboarding wizard
   * @param {WebDriver} driver - Selenium WebDriver instance
   * @param {boolean} complete - Of de onboarding moet worden voltooid of overgeslagen
   */
  async completeOnboarding(driver, complete = true) {
    // Wacht tot de onboarding wizard zichtbaar is
    await helpers.waitUntilPresent(driver, By.css('.onboarding-wizard'));
    
    if (complete) {
      // Doorloop alle stappen
      let hasNextButton = true;
      while (hasNextButton) {
        try {
          const nextButton = await driver.findElement(By.css('button[aria-label="Volgende"]'));
          await nextButton.click();
          await driver.sleep(500); // Korte pauze voor animatie
        } catch (e) {
          hasNextButton = false;
        }
      }
      
      // Voltooi de onboarding
      const completeButton = await driver.findElement(By.css('button[aria-label="Voltooien"]'));
      await completeButton.click();
    } else {
      // Sla de onboarding over
      const skipButton = await driver.findElement(By.css('button[aria-label="Overslaan"]'));
      await skipButton.click();
    }
    
    // Wacht tot de onboarding wizard verdwenen is
    await driver.wait(until.stalenessOf(driver.findElement(By.css('.onboarding-wizard'))), config.explicitWait);
  }
};

// Locators voor UI elementen
const locators = {
  helpButton: By.css('button[aria-label="Toon help"]'),
  helpMarkers: By.css('.help-marker'),
  helpContent: By.css('.help-content'),
  feedbackButton: By.css('button[aria-label="feedback"]'),
  userFeedbackDialog: By.css('.user-feedback-dialog'),
  onboardingWizard: By.css('.onboarding-wizard'),
  helpMenu: By.css('.help-menu'),
  helpMenuButton: By.css('button[aria-label="Help menu"]')
};

// Test suite
describe('MarketPulse AI Help Systeem Tests', function() {
  this.timeout(60000); // 60 seconden timeout voor de hele suite
  let driver;
  
  before(async function() {
    // Setup WebDriver
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().setTimeouts({ implicit: config.implicitWait });
    await driver.manage().window().maximize();
  });
  
  after(async function() {
    // Cleanup
    if (driver) {
      await driver.quit();
    }
  });
  
  // Test scenario 1.1: Eerste Aanmelding en Onboarding Wizard
  describe('Scenario 1.1: Eerste Aanmelding en Onboarding Wizard', function() {
    it('Moet de onboarding wizard tonen bij eerste aanmelding', async function() {
      await helpers.login(driver, config.testUsers.beginner);
      await helpers.waitUntilPresent(driver, locators.onboardingWizard);
      const isDisplayed = await driver.findElement(locators.onboardingWizard).isDisplayed();
      expect(isDisplayed).to.be.true;
    });
    
    it('Moet de onboarding wizard correct doorlopen', async function() {
      await helpers.completeOnboarding(driver, true);
      
      // Controleer of de onboarding is voltooid
      const onboardingCompleted = await driver.executeScript(
        'return localStorage.getItem("onboardingCompleted") === "true"'
      );
      expect(onboardingCompleted).to.be.true;
    });
    
    it('Moet basisacties kunnen uitvoeren na onboarding', async function() {
      // Navigeer naar dashboard
      await helpers.navigateToView(driver, 'dashboard');
      
      // Controleer of de help button aanwezig is
      const helpButton = await driver.findElement(locators.helpButton);
      expect(await helpButton.isDisplayed()).to.be.true;
      
      // Controleer of het help menu toegankelijk is
      await driver.findElement(locators.helpMenuButton).click();
      await helpers.waitUntilPresent(driver, locators.helpMenu);
      expect(await driver.findElement(locators.helpMenu).isDisplayed()).to.be.true;
    });
  });
  
  // Test scenario 2.1: Dashboard Navigatie met Tooltips
  describe('Scenario 2.1: Dashboard Navigatie met Tooltips', function() {
    before(async function() {
      await helpers.login(driver, config.testUsers.intermediate);
      await helpers.navigateToView(driver, 'dashboard');
    });
    
    it('Moet help-overlay kunnen openen', async function() {
      await helpers.openHelpOverlay(driver);
      const helpMarkers = await driver.findElements(locators.helpMarkers);
      expect(helpMarkers.length).to.be.greaterThan(0);
    });
    
    it('Moet help-markers tonen en informatie weergeven bij klikken', async function() {
      await helpers.clickHelpMarker(driver, 0);
      const helpContent = await driver.findElement(locators.helpContent);
      expect(await helpContent.isDisplayed()).to.be.true;
      
      // Controleer of de content tekst bevat
      const contentText = await helpContent.getText();
      expect(contentText.length).to.be.greaterThan(0);
    });
    
    it('Moet feedback kunnen geven op help-items', async function() {
      await helpers.provideFeedback(driver, true, 'Dit was zeer nuttige informatie!');
      
      // Controleer of de bedankmelding wordt getoond
      const thankYouMessage = await driver.findElement(By.css('.feedback-thank-you'));
      expect(await thankYouMessage.isDisplayed()).to.be.true;
    });
    
    it('Moet help-overlay kunnen sluiten', async function() {
      await helpers.closeHelpOverlay(driver);
      
      try {
        await driver.findElement(locators.helpMarkers);
        // Als we hier komen, zijn de markers nog steeds zichtbaar
        expect.fail('Help markers zijn nog steeds zichtbaar na sluiten van help-overlay');
      } catch (e) {
        // Dit is het verwachte gedrag - markers zijn niet meer zichtbaar
        expect(e.name).to.equal('NoSuchElementError');
      }
    });
  });
  
  // Test scenario 3.1: Feedback Geven op Help Items
  describe('Scenario 3.1: Feedback Geven op Help Items', function() {
    before(async function() {
      await helpers.login(driver, config.testUsers.advanced);
      await helpers.navigateToView(driver, 'report');
    });
    
    it('Moet feedback kunnen geven op meerdere help-items', async function() {
      // Open help overlay
      await helpers.openHelpOverlay(driver);
      
      // Geef feedback op eerste help-item
      await helpers.clickHelpMarker(driver, 0);
      await helpers.provideFeedback(driver, true, 'Zeer nuttig!');
      
      // Geef feedback op tweede help-item
      await helpers.clickHelpMarker(driver, 1);
      await helpers.provideFeedback(driver, false, 'Kan duidelijker zijn.');
      
      // Geef feedback op derde help-item
      await helpers.clickHelpMarker(driver, 2);
      await helpers.provideFeedback(driver, true, 'Precies wat ik nodig had.');
      
      // Sluit help overlay
      await helpers.closeHelpOverlay(driver);
    });
  });
  
  // Test scenario 3.2: Algemene Gebruikerservaring Feedback
  describe('Scenario 3.2: Algemene Gebruikerservaring Feedback', function() {
    before(async function() {
      await helpers.login(driver, config.testUsers.beginner);
      await helpers.navigateToView(driver, 'sentiment');
    });
    
    it('Moet algemene gebruikersfeedback kunnen geven', async function() {
      // Open gebruikersfeedback dialog
      await helpers.openUserFeedback(driver);
      
      // Geef feedback
      await helpers.provideUserFeedback(
        driver,
        4, // 4 sterren
        'De interface is intuïtief, maar sommige grafieken zijn moeilijk te interpreteren.',
        ['ui_design', 'data_visualization', 'help_content']
      );
      
      // Controleer of de bedankmelding wordt getoond
      const thankYouMessage = await driver.findElement(By.css('.feedback-thank-you'));
      expect(await thankYouMessage.isDisplayed()).to.be.true;
    });
  });
  
  // Test scenario 5.1: Rolspecifieke Help Content
  describe('Scenario 5.1: Rolspecifieke Help Content', function() {
    it('Moet verschillende help content tonen voor verschillende gebruikersrollen', async function() {
      // Test voor marketeer
      await helpers.login(driver, config.testUsers.beginner);
      await helpers.navigateToView(driver, 'market-insights');
      await helpers.openHelpOverlay(driver);
      await helpers.clickHelpMarker(driver, 0);
      const marketeerContent = await driver.findElement(locators.helpContent).getText();
      await helpers.closeHelpOverlay(driver);
      await driver.navigate().refresh(); // Ververs de pagina om sessie te resetten
      
      // Test voor analyst
      await helpers.login(driver, config.testUsers.intermediate);
      await helpers.navigateToView(driver, 'market-insights');
      await helpers.openHelpOverlay(driver);
      await helpers.clickHelpMarker(driver, 0);
      const analystContent = await driver.findElement(locators.helpContent).getText();
      await helpers.closeHelpOverlay(driver);
      await driver.navigate().refresh(); // Ververs de pagina om sessie te resetten
      
      // Test voor product manager
      await helpers.login(driver, config.testUsers.advanced);
      await helpers.navigateToView(driver, 'market-insights');
      await helpers.openHelpOverlay(driver);
      await helpers.clickHelpMarker(driver, 0);
      const productManagerContent = await driver.findElement(locators.helpContent).getText();
      await helpers.closeHelpOverlay(driver);
      
      // Vergelijk de content - moet verschillend zijn per rol
      expect(marketeerContent).to.not.equal(analystContent);
      expect(marketeerContent).to.not.equal(productManagerContent);
      expect(analystContent).to.not.equal(productManagerContent);
    });
  });
  
  // Test scenario 6.1: Aanpassing aan Ervaringsniveau
  describe('Scenario 6.1: Aanpassing aan Ervaringsniveau', function() {
    it('Moet verschillende help content tonen voor verschillende ervaringsniveaus', async function() {
      // Test voor beginner
      await helpers.login(driver, {
        ...config.testUsers.beginner,
        experienceLevel: 'beginner'
      });
      await helpers.navigateToView(driver, 'awareness');
      await helpers.openHelpOverlay(driver);
      await helpers.clickHelpMarker(driver, 0);
      const beginnerContent = await driver.findElement(locators.helpContent).getText();
      await helpers.closeHelpOverlay(driver);
      await driver.navigate().refresh(); // Ververs de pagina om sessie te resetten
      
      // Test voor intermediate
      await helpers.login(driver, {
        ...config.testUsers.beginner,
        experienceLevel: 'intermediate'
      });
      await helpers.navigateToView(driver, 'awareness');
      await helpers.openHelpOverlay(driver);
      await helpers.clickHelpMarker(driver, 0);
      const intermediateContent = await driver.findElement(locators.helpContent).getText();
      await helpers.closeHelpOverlay(driver);
      await driver.navigate().refresh(); // Ververs de pagina om sessie te resetten
      
      // Test voor advanced
      await helpers.login(driver, {
        ...config.testUsers.beginner,
        experienceLevel: 'advanced'
      });
      await helpers.navigateToView(driver, 'awareness');
      await helpers.openHelpOverlay(driver);
      await helpers.clickHelpMarker(driver, 0);
      const advancedContent = await driver.findElement(locators.helpContent).getText();
      await helpers.closeHelpOverlay(driver);
      
      // Vergelijk de content - moet verschillend zijn per ervaringsniveau
      expect(beginnerContent.length).to.be.greaterThan(advancedContent.length); // Beginners krijgen meer uitleg
      expect(beginnerContent).to.not.equal(intermediateContent);
      expect(beginnerContent).to.not.equal(advancedContent);
      expect(intermediateContent).to.not.equal(advancedContent);
    });
  });
});

// Exporteer helpers en locators voor hergebruik in andere tests
export { helpers, locators, config };
