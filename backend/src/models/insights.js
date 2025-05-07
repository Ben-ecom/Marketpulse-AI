import mongoose from 'mongoose';

const insightItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  frequency: {
    type: Number,
    default: 1
  },
  sources: [{
    platform: {
      type: String,
      required: true,
      enum: ['reddit', 'amazon']
    },
    sourceId: {
      type: String,
      required: true
    },
    sourceType: {
      type: String,
      required: true,
      enum: ['post', 'comment', 'review']
    },
    excerpt: {
      type: String
    }
  }],
  keywords: {
    type: [String],
    default: []
  }
}, { _id: true });

const painPointsSchema = new mongoose.Schema({
  items: [insightItemSchema],
  summary: {
    type: String
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const desiresSchema = new mongoose.Schema({
  items: [insightItemSchema],
  summary: {
    type: String
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const marketTrendSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  strength: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  direction: {
    type: String,
    enum: ['rising', 'stable', 'declining'],
    default: 'stable'
  },
  timeframe: {
    type: String,
    enum: ['short_term', 'medium_term', 'long_term'],
    default: 'medium_term'
  },
  keywords: {
    type: [String],
    default: []
  }
}, { _id: true });

const marketTrendsSchema = new mongoose.Schema({
  items: [marketTrendSchema],
  summary: {
    type: String
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const competitorInsightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  marketShare: {
    type: Number,
    min: 0,
    max: 100
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  mentionCount: {
    type: Number,
    default: 0
  }
}, { _id: true });

const competitorsSchema = new mongoose.Schema({
  items: [competitorInsightSchema],
  summary: {
    type: String
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const marketingInsightSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['usp', 'messaging', 'channel', 'audience']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  impact: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  implementation: {
    type: String
  },
  examples: {
    type: [String],
    default: []
  }
}, { _id: true });

const marketingSchema = new mongoose.Schema({
  items: [marketingInsightSchema],
  summary: {
    type: String
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const insightsSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  painPoints: {
    type: painPointsSchema,
    default: () => ({})
  },
  desires: {
    type: desiresSchema,
    default: () => ({})
  },
  marketTrends: {
    type: marketTrendsSchema,
    default: () => ({})
  },
  competitors: {
    type: competitorsSchema,
    default: () => ({})
  },
  marketing: {
    type: marketingSchema,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
  },
  generationDate: {
    type: Date,
    default: Date.now
  },
  dataSourceIds: {
    reddit: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RedditData'
    }],
    amazon: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AmazonData'
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt bij elke wijziging
insightsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexen voor snellere zoekopdrachten
insightsSchema.index({ projectId: 1, generationDate: -1 });
insightsSchema.index({ userId: 1 });

const Insights = mongoose.model('Insights', insightsSchema);

export default Insights;
