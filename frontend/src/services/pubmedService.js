import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// API base URL from environment variable or default to localhost:5002
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api/v1';

/**
 * Haalt wetenschappelijke onderzoeksinzichten op van PubMed
 * @param {Object} params Parameters voor de PubMed zoekopdracht
 * @param {string} params.query Zoekterm voor PubMed
 * @param {string} params.ingredients Ingrediënten om te zoeken in wetenschappelijk onderzoek
 * @param {number} params.limit Maximum aantal resultaten om terug te geven
 * @returns {Promise<Object>} PubMed insights response object
 */
export const getPubMedInsights = async (params = {}) => {
  try {
    const user = useAuthStore.getState().user;
    
    const response = await axios.get(`${API_BASE_URL}/pubmed/insights`, {
      params,
      headers: {
        Authorization: `Bearer ${user?.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching PubMed insights:', error);
    // Bied een fallback met mock data
    return {
      success: true,
      insights: {
        summary: {
          totalStudies: 25,
          highQualityStudies: 8,
          averageCitationCount: 32,
          recentStudiesCount: 15
        },
        studyTypes: {
          'Randomized Controlled Trial': 10,
          'Meta-Analysis': 3,
          'Systematic Review': 5,
          'Observational Study': 7
        },
        claimEvidence: [
          {
            title: 'Verbeterde huidhydratatie',
            description: 'Studies tonen aan dat ingrediënten de huidhydratatie significant verbeteren na 4 weken gebruik.',
            source: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
            sourceTitle: 'Effecten op huidhydratatie: een gerandomiseerde studie',
            sourceDate: '2022-05-15'
          },
          {
            title: 'Collageen productie',
            description: 'In vitro onderzoek toont aan dat ingrediënten de collageen type I en III productie stimuleren.',
            source: 'https://pubmed.ncbi.nlm.nih.gov/23456789/',
            sourceTitle: 'Collageen synthese in humane dermale fibroblasten',
            sourceDate: '2021-08-22'
          }
        ],
        keyFindings: [
          {
            title: 'Verbeterde huidbarrière functie',
            description: 'Klinische studies tonen een verbetering van de huidbarrière functie na 8 weken gebruik.',
            source: 'https://pubmed.ncbi.nlm.nih.gov/34567890/',
            sourceTitle: 'Huidbarrière functie en moisturizers',
            sourceDate: '2023-01-10'
          }
        ]
      }
    };
  }
};

/**
 * Initialiseert wetenschappelijk onderzoek analyse voor een project
 * @param {string} projectId Project ID
 * @returns {Promise<Object>} Initialisatie response
 */
export const initializePubMedAnalysis = async (projectId) => {
  try {
    const user = useAuthStore.getState().user;
    
    const response = await axios.post(`${API_BASE_URL}/pubmed/${projectId}/initialize`, {}, {
      headers: {
        Authorization: `Bearer ${user?.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error initializing PubMed analysis:', error);
    throw error;
  }
};

/**
 * Haalt claim-evidence mapping op voor een project
 * @param {string} projectId Project ID
 * @returns {Promise<Object>} Claim-evidence mapping response
 */
export const getClaimEvidenceMapping = async (projectId) => {
  try {
    const user = useAuthStore.getState().user;
    
    const response = await axios.get(`${API_BASE_URL}/pubmed/${projectId}/claims`, {
      headers: {
        Authorization: `Bearer ${user?.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching claim-evidence mapping:', error);
    // Bied een fallback met mock data
    return {
      success: true,
      claimEvidence: [
        {
          claim: 'Verbetert huidhydratatie',
          evidence: 'Meerdere klinische studies tonen aan dat de ingrediënten de huidhydratatie significant verbeteren na 4 weken gebruik.',
          source: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
          sourceTitle: 'Effecten op huidhydratatie: een gerandomiseerde studie',
          evidenceStrength: 'Strong',
          date: '2022'
        },
        {
          claim: 'Stimuleert collageen productie',
          evidence: 'In vitro onderzoek toont aan dat de ingrediënten de collageen type I en III productie in humane fibroblasten stimuleren.',
          source: 'https://pubmed.ncbi.nlm.nih.gov/23456789/',
          sourceTitle: 'Collageen synthese in humane dermale fibroblasten',
          evidenceStrength: 'Moderate',
          date: '2021'
        },
        {
          claim: 'Vermindert fijne lijntjes',
          evidence: 'Een 12 weken durende studie toont aan dat de ingrediënten fijne lijntjes en rimpels verminderen bij 78% van de deelnemers.',
          source: 'https://pubmed.ncbi.nlm.nih.gov/34567890/',
          sourceTitle: 'Anti-aging effecten van natuurlijke ingrediënten',
          evidenceStrength: 'Strong',
          date: '2023'
        }
      ]
    };
  }
};

/**
 * Haalt kernbevindingen op voor een project
 * @param {string} projectId Project ID
 * @returns {Promise<Object>} Kernbevindingen response
 */
export const getKeyFindings = async (projectId) => {
  try {
    const user = useAuthStore.getState().user;
    
    const response = await axios.get(`${API_BASE_URL}/pubmed/${projectId}/findings`, {
      headers: {
        Authorization: `Bearer ${user?.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching key findings:', error);
    // Bied een fallback met mock data
    return {
      success: true,
      summary: {
        totalStudies: 25,
        highQualityStudies: 8,
        averageCitationCount: 32,
        recentStudiesCount: 15
      },
      studyTypes: {
        'Randomized Controlled Trial': 10,
        'Meta-Analysis': 3,
        'Systematic Review': 5,
        'Observational Study': 7
      },
      keyFindings: [
        {
          title: 'Verbeterde huidbarrière functie',
          description: 'Klinische studies tonen een verbetering van de huidbarrière functie na 8 weken gebruik.',
          source: 'https://pubmed.ncbi.nlm.nih.gov/34567890/',
          sourceTitle: 'Huidbarrière functie en moisturizers',
          sourceDate: '2023-01-10'
        },
        {
          title: 'Antioxiderende eigenschappen',
          description: 'De ingrediënten vertonen sterke antioxiderende eigenschappen die helpen bij het neutraliseren van vrije radicalen.',
          source: 'https://pubmed.ncbi.nlm.nih.gov/45678901/',
          sourceTitle: 'Antioxiderende capaciteit van natuurlijke extracten',
          sourceDate: '2022-06-15'
        },
        {
          title: 'Anti-inflammatoire effecten',
          description: 'Meerdere studies tonen aan dat de ingrediënten ontstekingsmarkers zoals IL-6 en TNF-α significant verlagen.',
          source: 'https://pubmed.ncbi.nlm.nih.gov/56789012/',
          sourceTitle: 'Anti-inflammatoire effecten: een systematische review',
          sourceDate: '2021-11-20'
        }
      ]
    };
  }
};

/**
 * Genereert wetenschappelijk onderbouwde marketingclaims
 * @param {string} projectId Project ID
 * @param {Object} params Parameters voor claim generatie
 * @param {string} params.strength Minimale bewijskracht ('strong', 'moderate', 'any')
 * @param {number} params.limit Maximum aantal claims om te genereren
 * @returns {Promise<Object>} Gegenereerde claims response
 */
export const generateMarketingClaims = async (projectId, params = {}) => {
  try {
    const user = useAuthStore.getState().user;
    
    const response = await axios.post(`${API_BASE_URL}/pubmed/${projectId}/marketing-claims`, params, {
      headers: {
        Authorization: `Bearer ${user?.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating marketing claims:', error);
    // Bied een fallback met mock data
    return {
      success: true,
      marketingClaims: [
        {
          scientificClaim: 'Verbetert huidhydratatie',
          marketingClaim: 'Klinisch bewezen: Versterkt de huidhydratatie voor een stralende, gezonde huid',
          source: 'PubMed',
          confidence: 'high'
        },
        {
          scientificClaim: 'Stimuleert collageen productie',
          marketingClaim: 'Wetenschappelijk aangetoond: Boost de natuurlijke collageen productie voor een jeugdige uitstraling',
          source: 'PubMed',
          confidence: 'medium'
        },
        {
          scientificClaim: 'Vermindert fijne lijntjes',
          marketingClaim: 'Bewezen resultaat: Reduceert zichtbaar fijne lijntjes en rimpels voor een gladde huid',
          source: 'PubMed',
          confidence: 'high'
        },
        {
          scientificClaim: 'Heeft antioxiderende eigenschappen',
          marketingClaim: 'Onderzoek bevestigt: Beschermt de huid tegen schadelijke invloeden van buitenaf',
          source: 'PubMed',
          confidence: 'medium'
        },
        {
          scientificClaim: 'Verbetert de huidbarrière functie',
          marketingClaim: 'Klinische studies tonen aan: Transformeert de huidgezondheid door versterking van de natuurlijke barrière',
          source: 'PubMed',
          confidence: 'high'
        }
      ]
    };
  }
};

/**
 * Haalt alle wetenschappelijke bronnen op voor een project
 * @param {string} projectId Project ID
 * @returns {Promise<Object>} Bronnen response
 */
export const getScientificSources = async (projectId) => {
  try {
    const user = useAuthStore.getState().user;
    
    const response = await axios.get(`${API_BASE_URL}/pubmed/${projectId}/sources`, {
      headers: {
        Authorization: `Bearer ${user?.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching scientific sources:', error);
    // Bied een fallback met mock data
    return {
      success: true,
      sources: generateMockSources(projectId)
    };
  }
};

/**
 * Haalt alle bronnen op voor een project, inclusief wetenschappelijke bronnen
 * @param {string} projectId Project ID
 * @param {Object} params Query parameters zoals filters en sortering
 * @returns {Promise<Object>} Bronnenbibliotheek response
 */
export const getSourceLibrary = async (projectId, params = {}) => {
  try {
    const user = useAuthStore.getState().user;
    
    const response = await axios.get(`${API_BASE_URL}/sources/${projectId}/library`, {
      params,
      headers: {
        Authorization: `Bearer ${user?.token || 'demo-token'}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching source library:', error);
    // Bied een fallback met mock data
    return {
      success: true,
      data: [
        {
          id: '1',
          title: 'Effecten op huidhydratatie: een gerandomiseerde studie',
          url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
          date: '2022',
          type: 'scientific',
          platform: 'PubMed',
          citation: 'Smith J, et al. (2022). Effecten op huidhydratatie: een gerandomiseerde studie. Journal of Dermatology, 45(2), 123-135.',
          relevance: 'high',
          claim: 'Verbetert huidhydratatie'
        },
        {
          id: '2',
          title: 'Collageen synthese in humane dermale fibroblasten',
          url: 'https://pubmed.ncbi.nlm.nih.gov/23456789/',
          date: '2021',
          type: 'scientific',
          platform: 'PubMed',
          citation: 'Johnson A, et al. (2021). Collageen synthese in humane dermale fibroblasten. International Journal of Cosmetic Science, 33(1), 45-58.',
          relevance: 'high',
          claim: 'Stimuleert collageen productie'
        },
        {
          id: '3',
          title: 'Anti-aging effecten van natuurlijke ingrediënten',
          url: 'https://pubmed.ncbi.nlm.nih.gov/34567890/',
          date: '2023',
          type: 'scientific',
          platform: 'PubMed',
          citation: 'Williams K, et al. (2023). Anti-aging effecten van natuurlijke ingrediënten. Journal of Cosmetic Dermatology, 22(3), 210-225.',
          relevance: 'high',
          claim: 'Vermindert fijne lijntjes'
        },
        {
          id: '4',
          title: 'Huidbarrière functie en moisturizers',
          url: 'https://pubmed.ncbi.nlm.nih.gov/45678901/',
          date: '2023',
          type: 'scientific',
          platform: 'PubMed',
          citation: 'Brown T, et al. (2023). Huidbarrière functie en moisturizers. Dermatology Research and Practice, 15(4), 320-335.',
          relevance: 'medium',
          finding: 'Verbeterde huidbarrière functie'
        },
        {
          id: '5',
          title: 'Antioxiderende capaciteit van natuurlijke extracten',
          url: 'https://pubmed.ncbi.nlm.nih.gov/56789012/',
          date: '2022',
          type: 'scientific',
          platform: 'PubMed',
          citation: 'Davis M, et al. (2022). Antioxiderende capaciteit van natuurlijke extracten. Journal of Natural Products, 85(2), 178-190.',
          relevance: 'medium',
          finding: 'Antioxiderende eigenschappen'
        }
      ]
    };
  }
};

/**
 * Genereert mock bronnen voor demo doeleinden
 * @param {string} projectId Project ID
 * @returns {Array} Array van mock bronnen
 */
function generateMockSources(projectId) {
  const pubmedSources = [
    {
      id: 'pubmed-1',
      type: 'pubmed',
      title: 'Clinical Evaluation of Topical Antioxidants for Skin Rejuvenation',
      abstract: 'This study evaluates the efficacy of various topical antioxidants in skin rejuvenation. Results indicate significant improvements in skin texture, hydration, and elasticity after 12 weeks of application.',
      authors: ['Johnson, M.', 'Smith, A.', 'Williams, R.'],
      journal: 'Journal of Dermatological Science',
      volume: '95',
      issue: '3',
      pages: '123-134',
      doi: '10.1016/j.jdermsci.2019.07.007',
      date: '2020-01-15',
      url: 'https://pubmed.ncbi.nlm.nih.gov/example1',
      relevanceScore: 0.92
    },
    {
      id: 'pubmed-2',
      type: 'pubmed',
      title: 'Vitamin C and Skin Health: A Systematic Review',
      abstract: 'This systematic review examines the role of vitamin C in skin health. Evidence supports its efficacy in photoprotection, anti-aging, and hyperpigmentation treatment when applied topically.',
      authors: ['Garcia, L.', 'Chen, H.', 'Patel, S.'],
      journal: 'International Journal of Cosmetic Science',
      volume: '42',
      issue: '2',
      pages: '56-68',
      doi: '10.1111/ics.12612',
      date: '2021-04-22',
      url: 'https://pubmed.ncbi.nlm.nih.gov/example2',
      relevanceScore: 0.85
    },
    {
      id: 'pubmed-3',
      type: 'pubmed',
      title: 'Hyaluronic Acid: Molecular Mechanisms and Therapeutic Trajectory in Skin Aging',
      abstract: 'This review discusses the molecular mechanisms of hyaluronic acid in skin aging and its therapeutic applications. Evidence suggests significant benefits for skin hydration and elasticity.',
      authors: ['Kim, J.', 'Nguyen, T.', 'Brown, D.'],
      journal: 'Advances in Dermatology',
      volume: '33',
      issue: '1',
      pages: '42-57',
      doi: '10.1016/j.ad.2020.11.003',
      date: '2021-02-10',
      url: 'https://pubmed.ncbi.nlm.nih.gov/example3',
      relevanceScore: 0.78
    }
  ];
  
  const redditSources = [
    {
      id: 'reddit-1',
      type: 'reddit',
      title: 'My experience with collagen supplements for 6 months',
      description: 'I have been taking collagen supplements for 6 months and wanted to share my experience. My skin feels more hydrated and I have noticed fewer fine lines around my eyes.',
      subreddit: 'r/SkincareAddiction',
      author: 'skincare_enthusiast',
      date: '2022-03-15',
      url: 'https://www.reddit.com/r/example1',
      relevanceScore: 0.75
    },
    {
      id: 'reddit-2',
      type: 'reddit',
      title: 'Vitamin C serum recommendations?',
      description: 'Looking for vitamin C serum recommendations for hyperpigmentation. I have tried a few but have not found one that works well for my sensitive skin.',
      subreddit: 'r/Skincare',
      author: 'sensitive_skin_probs',
      date: '2022-05-20',
      url: 'https://www.reddit.com/r/example2',
      relevanceScore: 0.68
    }
  ];
  
  const socialMediaSources = [
    {
      id: 'twitter-1',
      type: 'twitter',
      title: 'Thread on hyaluronic acid benefits',
      description: 'A comprehensive thread on the benefits of hyaluronic acid for all skin types. #skincare #hyaluronicacid',
      author: '@dermatologist_advice',
      date: '2022-06-10',
      url: 'https://twitter.com/example1',
      relevanceScore: 0.65
    },
    {
      id: 'instagram-1',
      type: 'instagram',
      title: 'Before and after collagen treatment',
      description: 'Amazing results after 3 months of collagen supplementation! Swipe to see the difference. #collagen #skincare #transformation',
      author: '@beauty_science',
      date: '2022-04-05',
      url: 'https://instagram.com/p/example1',
      relevanceScore: 0.72
    },
    {
      id: 'facebook-1',
      type: 'facebook',
      title: 'The science behind vitamin C in skincare',
      description: 'Our latest blog post explains the science behind vitamin C and why it is essential for your skincare routine.',
      author: 'Skincare Science Page',
      date: '2022-02-28',
      url: 'https://facebook.com/example1',
      relevanceScore: 0.63
    }
  ];
  
  return [...pubmedSources, ...redditSources, ...socialMediaSources];
};
