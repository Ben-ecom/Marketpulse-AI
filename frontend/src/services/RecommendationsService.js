/**
 * RecommendationsService.js
 * Service voor het genereren van marketingaanbevelingen op basis van inzichten
 */

import { supabase } from '../utils/supabaseClient';

/**
 * RecommendationsService klasse voor het genereren en beheren van marketingaanbevelingen
 */
class RecommendationsService {
  /**
   * Genereert marketingaanbevelingen op basis van inzichten
   * @param {Array} insights - Array van inzichten om aanbevelingen voor te genereren
   * @param {string} projectId - Het project ID
   * @returns {Promise<Array>} - De gegenereerde aanbevelingen
   */
  async generateRecommendations(insights, projectId) {
    try {
      // Groepeer inzichten per categorie
      const painPoints = insights.filter(i => i.category === 'pain_point');
      const desires = insights.filter(i => i.category === 'desire');
      const terminology = insights.filter(i => i.category === 'terminology');
      
      // Genereer aanbevelingen op basis van de inzichten
      const recommendations = [];
      
      // 1. Advertentietekst aanbevelingen
      if (painPoints.length > 0 || desires.length > 0) {
        recommendations.push({
          type: 'ad_copy',
          content: this.generateAdCopy(painPoints, desires, terminology),
          insight_count: painPoints.length + desires.length,
          project_id: projectId,
          created_at: new Date().toISOString()
        });
      }
      
      // 2. Email marketing aanbevelingen
      if (desires.length > 0) {
        recommendations.push({
          type: 'email',
          content: this.generateEmailMarketing(desires, terminology),
          insight_count: desires.length,
          project_id: projectId,
          created_at: new Date().toISOString()
        });
      }
      
      // 3. Productpagina aanbevelingen
      if (painPoints.length > 0 && desires.length > 0) {
        recommendations.push({
          type: 'product_page',
          content: this.generateProductPage(painPoints, desires, terminology),
          insight_count: painPoints.length + desires.length,
          project_id: projectId,
          created_at: new Date().toISOString()
        });
      }
      
      // 4. UGC video script aanbevelingen
      if (painPoints.length > 0 || desires.length > 0) {
        recommendations.push({
          type: 'ugc_script',
          content: this.generateUGCScript(painPoints, desires),
          insight_count: painPoints.length + desires.length,
          project_id: projectId,
          created_at: new Date().toISOString()
        });
      }
      
      // 5. SEO optimalisatie aanbevelingen
      if (terminology.length > 0) {
        recommendations.push({
          type: 'seo',
          content: this.generateSEOOptimization(terminology, painPoints, desires),
          insight_count: terminology.length,
          project_id: projectId,
          created_at: new Date().toISOString()
        });
      }
      
      // Sla de aanbevelingen op in de database
      const { data, error } = await supabase
        .from('recommendations')
        .insert(recommendations)
        .select();
      
      if (error) {
        console.error('Fout bij opslaan van aanbevelingen:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Fout bij genereren van aanbevelingen:', error);
      throw error;
    }
  }
  
  /**
   * Haalt aanbevelingen op voor een specifiek project
   * @param {string} projectId - Het project ID
   * @returns {Promise<Array>} - De opgehaalde aanbevelingen
   */
  async getRecommendations(projectId) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fout bij ophalen van aanbevelingen:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Fout bij ophalen van aanbevelingen:', error);
      throw error;
    }
  }
  
  /**
   * Verwijdert een aanbeveling
   * @param {string} recommendationId - Het ID van de aanbeveling om te verwijderen
   * @returns {Promise<void>}
   */
  async deleteRecommendation(recommendationId) {
    try {
      const { error } = await supabase
        .from('recommendations')
        .delete()
        .eq('id', recommendationId);
      
      if (error) {
        console.error('Fout bij verwijderen van aanbeveling:', error);
        throw error;
      }
    } catch (error) {
      console.error('Fout bij verwijderen van aanbeveling:', error);
      throw error;
    }
  }
  
  /**
   * Werkt een aanbeveling bij
   * @param {string} recommendationId - Het ID van de aanbeveling om bij te werken
   * @param {string} content - De nieuwe inhoud van de aanbeveling
   * @returns {Promise<Object>} - De bijgewerkte aanbeveling
   */
  async updateRecommendation(recommendationId, content) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .update({ content })
        .eq('id', recommendationId)
        .select();
      
      if (error) {
        console.error('Fout bij bijwerken van aanbeveling:', error);
        throw error;
      }
      
      return data[0];
    } catch (error) {
      console.error('Fout bij bijwerken van aanbeveling:', error);
      throw error;
    }
  }
  
  // Helper functies voor het genereren van aanbevelingen
  
  /**
   * Genereert een advertentietekst op basis van inzichten
   * @private
   */
  generateAdCopy(painPoints, desires, terminology) {
    // Selecteer relevante pijnpunten en verlangens
    const relevantPainPoints = painPoints.slice(0, 3).map(p => p.content);
    const relevantDesires = desires.slice(0, 3).map(d => d.content);
    const relevantTerms = terminology.slice(0, 5).map(t => t.content);
    
    // Genereer advertentietekst template
    let adCopy = `# Advertentietekst Aanbevelingen\n\n`;
    
    // Headline opties
    adCopy += `## Headline Opties:\n`;
    if (relevantDesires.length > 0) {
      adCopy += `- "${relevantDesires[0]}"\n`;
    }
    if (relevantPainPoints.length > 0) {
      adCopy += `- "Geen ${relevantPainPoints[0]} meer"\n`;
    }
    if (relevantDesires.length > 1) {
      adCopy += `- "Ontdek hoe je ${relevantDesires[1]}"\n`;
    }
    
    // Beschrijving opties
    adCopy += `\n## Beschrijving Opties:\n`;
    if (relevantPainPoints.length > 0) {
      adCopy += `- "Worstel je met ${relevantPainPoints[0]}? Onze oplossing helpt je om ${relevantDesires[0] || 'dit probleem op te lossen'}"\n`;
    }
    if (relevantDesires.length > 0 && relevantPainPoints.length > 0) {
      adCopy += `- "Transformeer van ${relevantPainPoints[0]} naar ${relevantDesires[0]}"\n`;
    }
    
    // Call-to-action opties
    adCopy += `\n## Call-to-Action Opties:\n`;
    adCopy += `- "Begin vandaag nog"\n`;
    adCopy += `- "Ontdek meer"\n`;
    adCopy += `- "Probeer het nu"\n`;
    
    // Aanbevolen termen
    if (relevantTerms.length > 0) {
      adCopy += `\n## Aanbevolen terminologie om te gebruiken:\n`;
      relevantTerms.forEach(term => {
        adCopy += `- "${term}"\n`;
      });
    }
    
    return adCopy;
  }
  
  /**
   * Genereert email marketing content op basis van inzichten
   * @private
   */
  generateEmailMarketing(desires, terminology) {
    const relevantDesires = desires.slice(0, 5).map(d => d.content);
    const relevantTerms = terminology.slice(0, 5).map(t => t.content);
    
    let emailContent = `# Email Marketing Aanbevelingen\n\n`;
    
    // Onderwerpregel opties
    emailContent += `## Onderwerpregel Opties:\n`;
    if (relevantDesires.length > 0) {
      emailContent += `- "Hoe je ${relevantDesires[0]} - Nieuwe gids"\n`;
      if (relevantDesires.length > 1) {
        emailContent += `- "Ontdek het geheim van ${relevantDesires[1]}"\n`;
      }
    }
    emailContent += `- "5 stappen om je doelen te bereiken"\n`;
    
    // Email body structuur
    emailContent += `\n## Email Body Structuur:\n`;
    emailContent += `1. **Introduceer het probleem** - Begin met een herkenbaar probleem\n`;
    emailContent += `2. **Deel een verhaal** - Vertel hoe anderen dit probleem hebben opgelost\n`;
    emailContent += `3. **Presenteer de oplossing** - Introduceer je product/dienst\n`;
    
    // Belangrijkste verlangens om aan te spreken
    emailContent += `\n## Belangrijkste verlangens om aan te spreken:\n`;
    relevantDesires.forEach((desire, index) => {
      emailContent += `${index + 1}. "${desire}"\n`;
    });
    
    // Aanbevolen termen
    if (relevantTerms.length > 0) {
      emailContent += `\n## Aanbevolen terminologie om te gebruiken:\n`;
      relevantTerms.forEach(term => {
        emailContent += `- "${term}"\n`;
      });
    }
    
    return emailContent;
  }
  
  /**
   * Genereert productpagina optimalisaties op basis van inzichten
   * @private
   */
  generateProductPage(painPoints, desires, terminology) {
    const relevantPainPoints = painPoints.slice(0, 3).map(p => p.content);
    const relevantDesires = desires.slice(0, 3).map(d => d.content);
    const relevantTerms = terminology.slice(0, 5).map(t => t.content);
    
    let productContent = `# Productpagina Optimalisatie Aanbevelingen\n\n`;
    
    // Headline opties
    productContent += `## Headline Opties:\n`;
    if (relevantDesires.length > 0) {
      productContent += `- "${relevantDesires[0]}"\n`;
    }
    if (relevantPainPoints.length > 0 && relevantDesires.length > 0) {
      productContent += `- "Van ${relevantPainPoints[0]} naar ${relevantDesires[0]}"\n`;
    }
    
    // USP's
    productContent += `\n## Aanbevolen USP's:\n`;
    if (relevantPainPoints.length > 0) {
      productContent += `- "Lost ${relevantPainPoints[0]} op"\n`;
    }
    if (relevantDesires.length > 0) {
      productContent += `- "Helpt je om ${relevantDesires[0]}"\n`;
    }
    if (relevantPainPoints.length > 1) {
      productContent += `- "Voorkomt ${relevantPainPoints[1]}"\n`;
    }
    
    // Productbeschrijving
    productContent += `\n## Productbeschrijving Structuur:\n`;
    productContent += `1. **Introduceer het probleem** - Beschrijf ${relevantPainPoints[0] || 'het probleem'}\n`;
    productContent += `2. **Presenteer de oplossing** - Hoe je product helpt\n`;
    productContent += `3. **Benadruk de voordelen** - Wat gebruikers zullen ervaren\n`;
    productContent += `4. **Bewijs** - Testimonials, statistieken, etc.\n`;
    productContent += `5. **Call-to-Action** - Duidelijke volgende stap\n`;
    
    // Aanbevolen termen
    if (relevantTerms.length > 0) {
      productContent += `\n## Aanbevolen terminologie om te gebruiken:\n`;
      relevantTerms.forEach(term => {
        productContent += `- "${term}"\n`;
      });
    }
    
    return productContent;
  }
  
  /**
   * Genereert UGC video scripts op basis van inzichten
   * @private
   */
  generateUGCScript(painPoints, desires) {
    const relevantPainPoints = painPoints.slice(0, 3).map(p => p.content);
    const relevantDesires = desires.slice(0, 3).map(d => d.content);
    
    let scriptContent = `# UGC Video Script Aanbevelingen\n\n`;
    
    // Script structuur
    scriptContent += `## Script Structuur (60 seconden):\n\n`;
    
    // Intro (0-10 seconden)
    scriptContent += `### 0-10 seconden: Intro & Aandachtstrekker\n`;
    if (relevantPainPoints.length > 0) {
      scriptContent += `"Heb je ooit last gehad van ${relevantPainPoints[0]}? Ik ook!"\n\n`;
    } else {
      scriptContent += `"Hé! Wil je weten hoe je [probleem] kunt oplossen? Kijk dan verder!"\n\n`;
    }
    
    // Probleem (10-20 seconden)
    scriptContent += `### 10-20 seconden: Het Probleem\n`;
    if (relevantPainPoints.length > 0) {
      scriptContent += `"Ik worstelde met ${relevantPainPoints[0]} en probeerde van alles..."\n\n`;
    } else {
      scriptContent += `"Ik probeerde alles om [probleem] op te lossen, maar niets werkte echt..."\n\n`;
    }
    
    // Oplossing (20-35 seconden)
    scriptContent += `### 20-35 seconden: De Oplossing\n`;
    scriptContent += `"Toen ontdekte ik [product/dienst]. Laat me je laten zien hoe het werkt..."\n\n`;
    
    // Demonstratie (35-50 seconden)
    scriptContent += `### 35-50 seconden: Demonstratie & Resultaten\n`;
    if (relevantDesires.length > 0) {
      scriptContent += `"Kijk hoe eenvoudig het is! Nu kan ik eindelijk ${relevantDesires[0]}"\n\n`;
    } else {
      scriptContent += `"Het is zo simpel te gebruiken en de resultaten zijn geweldig!"\n\n`;
    }
    
    // Call-to-Action (50-60 seconden)
    scriptContent += `### 50-60 seconden: Call-to-Action\n`;
    scriptContent += `"Als jij ook [voordeel] wilt, klik dan op de link in mijn bio om [product] te proberen!"\n\n`;
    
    // Tips voor authenticiteit
    scriptContent += `## Tips voor Authenticiteit:\n`;
    scriptContent += `- Deel een persoonlijk verhaal over je ervaring\n`;
    scriptContent += `- Toon het product in actie\n`;
    scriptContent += `- Wees eerlijk over voor- en nadelen\n`;
    scriptContent += `- Gebruik natuurlijke belichting\n`;
    scriptContent += `- Spreek op een conversationele toon\n`;
    
    return scriptContent;
  }
  
  /**
   * Genereert SEO optimalisaties op basis van inzichten
   * @private
   */
  generateSEOOptimization(terminology, painPoints, desires) {
    const relevantTerms = terminology.slice(0, 10).map(t => t.content);
    const relevantPainPoints = painPoints.slice(0, 3).map(p => p.content);
    const relevantDesires = desires.slice(0, 3).map(d => d.content);
    
    let seoContent = `# SEO Optimalisatie Aanbevelingen\n\n`;
    
    // Keyword suggesties
    seoContent += `## Primaire Keyword Suggesties:\n`;
    if (relevantTerms.length > 0) {
      relevantTerms.slice(0, 3).forEach(term => {
        seoContent += `- "${term}"\n`;
      });
    } else {
      seoContent += `- Geen specifieke terminologie gevonden\n`;
    }
    
    // Secundaire keywords
    if (relevantTerms.length > 3) {
      seoContent += `\n## Secundaire Keyword Suggesties:\n`;
      relevantTerms.slice(3).forEach(term => {
        seoContent += `- "${term}"\n`;
      });
    }
    
    // Meta beschrijving suggesties
    seoContent += `\n## Meta Beschrijving Suggesties:\n`;
    if (relevantPainPoints.length > 0 && relevantDesires.length > 0) {
      seoContent += `- "Ontdek hoe je ${relevantPainPoints[0]} kunt overwinnen en ${relevantDesires[0]}. Klik hier voor meer informatie!"\n`;
    } else if (relevantDesires.length > 0) {
      seoContent += `- "Wil je ${relevantDesires[0]}? Ontdek onze oplossingen en bereik je doelen. Klik hier!"\n`;
    } else if (relevantPainPoints.length > 0) {
      seoContent += `- "Last van ${relevantPainPoints[0]}? Onze oplossingen helpen je dit probleem op te lossen. Lees meer!"\n`;
    }
    
    // Content structuur aanbevelingen
    seoContent += `\n## Content Structuur Aanbevelingen:\n`;
    seoContent += `1. **H1 Titel** - Gebruik je primaire keyword\n`;
    seoContent += `2. **Introductie** - Adresseer het probleem en introduceer de oplossing\n`;
    seoContent += `3. **H2 Subkoppen** - Gebruik secundaire keywords\n`;
    seoContent += `4. **Bullet Points** - Maak voordelen overzichtelijk\n`;
    seoContent += `5. **Conclusie** - Samenvatting met call-to-action\n`;
    
    // Interne linking suggesties
    seoContent += `\n## Interne Linking Suggesties:\n`;
    seoContent += `- Link naar gerelateerde productpagina's\n`;
    seoContent += `- Link naar relevante blogartikelen over ${relevantTerms[0] || 'het onderwerp'}\n`;
    seoContent += `- Creëer een FAQ-sectie met links naar gedetailleerde antwoorden\n`;
    
    return seoContent;
  }
}

// Exporteer een singleton instance
export const recommendationsService = new RecommendationsService();

export default recommendationsService;
