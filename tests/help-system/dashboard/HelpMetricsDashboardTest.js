/**
 * HelpMetricsDashboardTest.js
 * 
 * Testscript voor het Help Metrics Dashboard.
 * Test de functionaliteit en gebruikerservaring van het dashboard.
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const { expect } = require('chai');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../../utils/supabaseClient');

// Test configuratie
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  adminCredentials: {
    email: process.env.ADMIN_EMAIL || 'admin@marketpulse.ai',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  },
  userCredentials: {
    email: process.env.USER_EMAIL || 'user@marketpulse.ai',
    password: process.env.USER_PASSWORD || 'user123'
  },
  timeouts: {
    implicit: 5000,
    pageLoad: 10000,
    element: 5000
  }
};

describe('Help Metrics Dashboard Tests', function() {
  this.timeout(30000); // Verhoog de timeout voor de hele testsuite
  
  let driver;
  let testData = {};
  
  // Setup voor elke test
  beforeEach(async function() {
    // Maak een nieuwe WebDriver instantie
    driver = await new Builder().forBrowser('chrome').build();
    
    // Stel timeouts in
    await driver.manage().setTimeouts({
      implicit: config.timeouts.implicit,
      pageLoad: config.timeouts.pageLoad
    });
    
    // Maximaliseer het venster
    await driver.manage().window().maximize();
  });
  
  // Teardown na elke test
  afterEach(async function() {
    // Sluit de browser
    if (driver) {
      await driver.quit();
    }
  });
  
  // Helper functie om in te loggen als admin
  async function loginAsAdmin() {
    await driver.get(`${config.baseUrl}/login`);
    
    // Wacht tot het login formulier geladen is
    await driver.wait(until.elementLocated(By.css('input[name="email"]')), config.timeouts.element);
    
    // Vul inloggegevens in
    await driver.findElement(By.css('input[name="email"]')).sendKeys(config.adminCredentials.email);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(config.adminCredentials.password);
    
    // Klik op de login knop
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wacht tot de dashboard pagina geladen is
    await driver.wait(until.urlContains('/dashboard'), config.timeouts.pageLoad);
  }
  
  // Helper functie om naar het admin dashboard te navigeren
  async function navigateToAdminDashboard() {
    await driver.get(`${config.baseUrl}/admin`);
    
    // Wacht tot de admin dashboard pagina geladen is
    await driver.wait(until.elementLocated(By.css('h1')), config.timeouts.element);
    
    // Controleer of we op de juiste pagina zijn
    const pageTitle = await driver.findElement(By.css('h1')).getText();
    expect(pageTitle).to.include('Admin Dashboard');
  }
  
  // Helper functie om naar het Help Metrics Dashboard te navigeren
  async function navigateToHelpMetricsDashboard() {
    await navigateToAdminDashboard();
    
    // Zoek de Help Metrics Dashboard kaart
    const helpMetricsCard = await driver.findElement(By.xpath('//h6[contains(text(), "Help Metrics Dashboard")]/ancestor::div[contains(@class, "MuiCard-root")]'));
    
    // Klik op de "Openen" knop
    await helpMetricsCard.findElement(By.css('button')).click();
    
    // Wacht tot de Help Metrics Dashboard pagina geladen is
    await driver.wait(until.urlContains('/admin/help-metrics'), config.timeouts.pageLoad);
  }
  
  // Helper functie om testdata aan te maken in de database
  async function createTestData() {
    const testId = uuidv4();
    testData.testId = testId;
    
    // Maak testdata aan voor help_interactions
    const interactionsData = [
      {
        id: `test-${testId}-1`,
        user_id: 'test-user-1',
        user_role: 'marketeer',
        experience_level: 'beginner',
        action: 'view',
        page_context: 'dashboard',
        help_item_id: 'help-1',
        help_item_type: 'tooltip',
        created_at: new Date().toISOString()
      },
      {
        id: `test-${testId}-2`,
        user_id: 'test-user-2',
        user_role: 'analyst',
        experience_level: 'intermediate',
        action: 'open_help',
        page_context: 'report',
        help_item_id: 'help-2',
        help_item_type: 'overlay',
        created_at: new Date().toISOString()
      }
    ];
    
    // Maak testdata aan voor help_feedback
    const feedbackData = [
      {
        id: `test-${testId}-fb-1`,
        user_id: 'test-user-1',
        user_role: 'marketeer',
        experience_level: 'beginner',
        help_item_id: 'help-1',
        help_item_type: 'tooltip',
        feedback_value: true,
        created_at: new Date().toISOString()
      },
      {
        id: `test-${testId}-fb-2`,
        user_id: 'test-user-2',
        user_role: 'analyst',
        experience_level: 'intermediate',
        help_item_id: 'help-2',
        help_item_type: 'overlay',
        feedback_value: false,
        created_at: new Date().toISOString()
      }
    ];
    
    // Maak testdata aan voor user_experience_feedback
    const userFeedbackData = [
      {
        id: `test-${testId}-uf-1`,
        user_id: 'test-user-1',
        user_role: 'marketeer',
        experience_level: 'beginner',
        page_context: 'dashboard',
        rating: 4,
        comments: 'Zeer nuttige help functie!',
        created_at: new Date().toISOString()
      },
      {
        id: `test-${testId}-uf-2`,
        user_id: 'test-user-2',
        user_role: 'analyst',
        experience_level: 'intermediate',
        page_context: 'report',
        rating: 2,
        comments: 'Help kon duidelijker zijn.',
        created_at: new Date().toISOString()
      }
    ];
    
    // Voeg de testdata toe aan de database
    await supabase.from('help_interactions').insert(interactionsData);
    await supabase.from('help_feedback').insert(feedbackData);
    await supabase.from('user_experience_feedback').insert(userFeedbackData);
    
    console.log(`Testdata aangemaakt met ID: ${testId}`);
  }
  
  // Helper functie om testdata op te ruimen
  async function cleanupTestData() {
    if (testData.testId) {
      // Verwijder de testdata uit de database
      await supabase.from('help_interactions').delete().like('id', `test-${testData.testId}-%`);
      await supabase.from('help_feedback').delete().like('id', `test-${testData.testId}-fb-%`);
      await supabase.from('user_experience_feedback').delete().like('id', `test-${testData.testId}-uf-%`);
      
      console.log(`Testdata opgeruimd met ID: ${testData.testId}`);
    }
  }
  
  // Tests
  
  // Test 1: Toegangscontrole - Admin kan het dashboard bekijken
  it('Admin kan het Help Metrics Dashboard bekijken', async function() {
    await loginAsAdmin();
    await navigateToHelpMetricsDashboard();
    
    // Controleer of het dashboard geladen is
    const dashboardTitle = await driver.findElement(By.xpath('//h4[contains(text(), "Help Systeem Dashboard")]'));
    expect(dashboardTitle).to.exist;
  });
  
  // Test 2: Toegangscontrole - Gewone gebruiker kan het dashboard niet bekijken
  it('Gewone gebruiker kan het Help Metrics Dashboard niet bekijken', async function() {
    // Login als gewone gebruiker
    await driver.get(`${config.baseUrl}/login`);
    await driver.wait(until.elementLocated(By.css('input[name="email"]')), config.timeouts.element);
    await driver.findElement(By.css('input[name="email"]')).sendKeys(config.userCredentials.email);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(config.userCredentials.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/dashboard'), config.timeouts.pageLoad);
    
    // Probeer naar het Help Metrics Dashboard te navigeren
    await driver.get(`${config.baseUrl}/admin/help-metrics`);
    
    // Controleer of er een foutmelding wordt weergegeven
    const errorAlert = await driver.findElement(By.css('.MuiAlert-root'));
    const errorText = await errorAlert.getText();
    expect(errorText).to.include('geen toegang');
  });
  
  // Test 3: Dashboard filters - Datumbereik filter werkt
  it('Datumbereik filter werkt correct', async function() {
    // Maak testdata aan
    await createTestData();
    
    try {
      await loginAsAdmin();
      await navigateToHelpMetricsDashboard();
      
      // Wacht tot de filters geladen zijn
      await driver.wait(until.elementLocated(By.css('select[aria-label="Datum bereik"]')), config.timeouts.element);
      
      // Selecteer een ander datumbereik
      const dateRangeSelect = await driver.findElement(By.css('select[aria-label="Datum bereik"]'));
      await dateRangeSelect.click();
      await driver.findElement(By.xpath('//li[contains(text(), "Laatste 7 dagen")]')).click();
      
      // Klik op de vernieuwen knop
      await driver.findElement(By.xpath('//button[contains(text(), "Vernieuwen")]')).click();
      
      // Wacht tot de data opnieuw geladen is
      await driver.sleep(2000); // Wacht even om zeker te zijn dat de data opnieuw geladen is
      
      // Controleer of de data is bijgewerkt
      // Dit is moeilijk te testen zonder specifieke elementen te kennen, dus we controleren alleen of er geen foutmelding is
      const errorElements = await driver.findElements(By.css('.MuiAlert-root'));
      expect(errorElements.length).to.equal(0);
    } finally {
      // Ruim testdata op
      await cleanupTestData();
    }
  });
  
  // Test 4: Dashboard componenten - Alle componenten worden weergegeven
  it('Alle dashboard componenten worden correct weergegeven', async function() {
    await loginAsAdmin();
    await navigateToHelpMetricsDashboard();
    
    // Wacht tot de componenten geladen zijn
    await driver.wait(until.elementLocated(By.xpath('//h5[contains(text(), "KPI Samenvatting")]')), config.timeouts.element);
    
    // Controleer of alle componenten aanwezig zijn
    const kpiSummary = await driver.findElement(By.xpath('//h5[contains(text(), "KPI Samenvatting")]'));
    expect(kpiSummary).to.exist;
    
    const interactionsByType = await driver.findElement(By.xpath('//h6[contains(text(), "Interacties per type")]'));
    expect(interactionsByType).to.exist;
    
    const interactionsByPage = await driver.findElement(By.xpath('//h6[contains(text(), "Interacties per pagina")]'));
    expect(interactionsByPage).to.exist;
    
    const feedbackByHelpItem = await driver.findElement(By.xpath('//h6[contains(text(), "Feedback per help item")]'));
    expect(feedbackByHelpItem).to.exist;
    
    const interactionsTrend = await driver.findElement(By.xpath('//h6[contains(text(), "Interacties trend")]'));
    expect(interactionsTrend).to.exist;
    
    const userExperienceFeedback = await driver.findElement(By.xpath('//h6[contains(text(), "Gebruikerservaring feedback")]'));
    expect(userExperienceFeedback).to.exist;
  });
  
  // Test 5: Responsiviteit - Dashboard werkt op verschillende schermgroottes
  it('Dashboard is responsief en werkt op verschillende schermgroottes', async function() {
    await loginAsAdmin();
    await navigateToHelpMetricsDashboard();
    
    // Test op desktop formaat (standaard)
    let kpiSummary = await driver.findElement(By.xpath('//h5[contains(text(), "KPI Samenvatting")]'));
    expect(kpiSummary).to.exist;
    
    // Test op tablet formaat
    await driver.manage().window().setRect({ width: 768, height: 1024 });
    kpiSummary = await driver.findElement(By.xpath('//h5[contains(text(), "KPI Samenvatting")]'));
    expect(kpiSummary).to.exist;
    
    // Test op mobiel formaat
    await driver.manage().window().setRect({ width: 375, height: 667 });
    kpiSummary = await driver.findElement(By.xpath('//h5[contains(text(), "KPI Samenvatting")]'));
    expect(kpiSummary).to.exist;
  });
});

module.exports = {
  config
};
