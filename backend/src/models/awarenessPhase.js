/**
 * Awareness Phase Model
 * Gebaseerd op de 5 awareness fasen van Eugene Schwartz
 */

import mongoose from 'mongoose';

const indicatorSchema = new mongoose.Schema({
  pattern: {
    type: String,
    required: true,
    trim: true
  },
  weight: {
    type: Number,
    default: 1,
    min: 0,
    max: 10
  },
  description: {
    type: String,
    trim: true
  }
});

const contentItemSchema = new mongoose.Schema({
  sourceId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['reddit', 'twitter', 'instagram', 'tiktok', 'amazon', 'other'],
    default: 'other'
  },
  url: String,
  author: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  }
});

const marketingAngleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  examples: [String]
});

const awarenessPhaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['unaware', 'problemAware', 'solutionAware', 'productAware', 'mostAware'],
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  indicators: [indicatorSchema],
  content: [contentItemSchema],
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  recommendedAngles: [marketingAngleSchema],
  color: {
    type: String,
    default: '#cccccc'
  },
  order: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook om de displayName te genereren als deze niet is opgegeven
awarenessPhaseSchema.pre('save', function(next) {
  if (!this.displayName) {
    // Converteer 'unaware' naar 'Unaware Fase'
    this.displayName = this.name.charAt(0).toUpperCase() + this.name.slice(1).replace(/([A-Z])/g, ' $1') + ' Fase';
  }
  next();
});

// Statische methode om alle awareness fasen voor een project te initialiseren
awarenessPhaseSchema.statics.initializeForProject = async function(projectId) {
  const phases = [
    {
      name: 'unaware',
      displayName: 'Unaware Fase',
      description: 'Klanten zijn zich niet bewust van hun probleem',
      indicators: [
        { pattern: 'algemene discussie', weight: 3, description: 'Algemene discussies zonder probleemfocus' },
        { pattern: 'lifestyle', weight: 2, description: 'Levensstijl gerelateerde discussies' }
      ],
      recommendedAngles: [
        {
          title: 'Probleem Introductie',
          description: 'Introduceer het probleem dat klanten nog niet herkennen',
          examples: [
            'Wist je dat 80% van de mensen onbewust dit probleem heeft?',
            'De verborgen oorzaak van dagelijkse frustraties'
          ]
        }
      ],
      color: '#E0E0E0',
      order: 1,
      projectId
    },
    {
      name: 'problemAware',
      displayName: 'Problem Aware Fase',
      description: 'Klanten zijn zich bewust van hun probleem, maar niet van oplossingen',
      indicators: [
        { pattern: 'hoe kan ik', weight: 5, description: 'Vragen over hoe een probleem op te lossen' },
        { pattern: 'probleem met', weight: 4, description: 'Directe vermelding van problemen' },
        { pattern: 'gefrustreerd door', weight: 3, description: 'Frustratie-uitingen' }
      ],
      recommendedAngles: [
        {
          title: 'Oplossingsintroductie',
          description: 'Introduceer oplossingsrichtingen voor het erkende probleem',
          examples: [
            'Er zijn 3 bewezen manieren om dit probleem aan te pakken',
            'Ontdek hoe anderen dit probleem hebben opgelost'
          ]
        }
      ],
      color: '#FF6B6B',
      order: 2,
      projectId
    },
    {
      name: 'solutionAware',
      displayName: 'Solution Aware Fase',
      description: 'Klanten kennen mogelijke oplossingsrichtingen, maar niet specifieke producten',
      indicators: [
        { pattern: 'beste manier om', weight: 4, description: 'Zoeken naar de beste oplossingsmethode' },
        { pattern: 'vergelijking van', weight: 3, description: 'Vergelijken van oplossingstypen' },
        { pattern: 'welk type', weight: 3, description: 'Vragen over oplossingstypen' }
      ],
      recommendedAngles: [
        {
          title: 'Productdifferentiatie',
          description: 'Leg uit waarom jouw product de beste oplossing is',
          examples: [
            'Waarom onze aanpak anders is dan traditionele methoden',
            'De 5 criteria voor het kiezen van de juiste oplossing'
          ]
        }
      ],
      color: '#48BEFF',
      order: 3,
      projectId
    },
    {
      name: 'productAware',
      displayName: 'Product Aware Fase',
      description: 'Klanten kennen specifieke producten, maar zijn nog niet overtuigd',
      indicators: [
        { pattern: 'reviews van', weight: 4, description: 'Zoeken naar productreviews' },
        { pattern: 'versus', weight: 3, description: 'Productvergelijkingen' },
        { pattern: 'werkt het echt', weight: 5, description: 'Twijfel over producteffectiviteit' }
      ],
      recommendedAngles: [
        {
          title: 'Overtuiging & Bewijs',
          description: 'Lever bewijs dat jouw product werkt',
          examples: [
            'Wat onze klanten zeggen over onze resultaten',
            'Case study: Hoe Product X het probleem oploste voor Bedrijf Y'
          ]
        }
      ],
      color: '#4CAF50',
      order: 4,
      projectId
    },
    {
      name: 'mostAware',
      displayName: 'Most Aware Fase',
      description: 'Klanten kennen het product en zijn klaar om te kopen',
      indicators: [
        { pattern: 'waar te kopen', weight: 5, description: 'Zoeken naar aankooplocaties' },
        { pattern: 'korting', weight: 4, description: 'Zoeken naar aanbiedingen' },
        { pattern: 'handleiding', weight: 3, description: 'Zoeken naar gebruiksinstructies' }
      ],
      recommendedAngles: [
        {
          title: 'Actie & Urgentie',
          description: 'Creëer urgentie en maak het gemakkelijk om actie te ondernemen',
          examples: [
            'Beperkte aanbieding: 15% korting deze week',
            'Bestel nu en ontvang morgen - gratis verzending'
          ]
        }
      ],
      color: '#9C27B0',
      order: 5,
      projectId
    }
  ];

  // Verwijder bestaande fasen voor dit project
  await this.deleteMany({ projectId });
  
  // Maak nieuwe fasen aan
  return this.insertMany(phases);
};

const AwarenessPhase = mongoose.model('AwarenessPhase', awarenessPhaseSchema);

export default AwarenessPhase;
