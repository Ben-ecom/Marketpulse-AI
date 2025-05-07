import mongoose from 'mongoose';

const dataCollectionJobSchema = new mongoose.Schema({
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
  platforms: {
    type: [String],
    required: true,
    enum: ['reddit', 'amazon'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Ten minste één platform moet worden geselecteerd'
    }
  },
  settings: {
    reddit: {
      subreddits: {
        type: [String]
      },
      searchTerms: {
        type: [String]
      },
      timeframe: {
        type: String,
        enum: ['day', 'week', 'month', 'year', 'all'],
        default: 'month'
      },
      limit: {
        type: Number,
        default: 100,
        min: 10,
        max: 1000
      }
    },
    amazon: {
      searchTerms: {
        type: [String]
      },
      categories: {
        type: [String]
      },
      minRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 1
      },
      maxRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
      },
      verifiedOnly: {
        type: Boolean,
        default: false
      },
      timeframe: {
        type: String,
        enum: ['last_month', 'last_3_months', 'last_6_months', 'last_year', 'all'],
        default: 'last_year'
      },
      limit: {
        type: Number,
        default: 100,
        min: 10,
        max: 1000
      }
    }
  },
  status: {
    type: String,
    enum: ['queued', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'queued'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  results: {
    reddit: {
      dataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RedditData'
      },
      postCount: {
        type: Number,
        default: 0
      },
      commentCount: {
        type: Number,
        default: 0
      },
      error: {
        type: String
      }
    },
    amazon: {
      dataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AmazonData'
      },
      productCount: {
        type: Number,
        default: 0
      },
      reviewCount: {
        type: Number,
        default: 0
      },
      error: {
        type: String
      }
    }
  },
  error: {
    type: String
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
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
dataCollectionJobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexen voor snellere zoekopdrachten
dataCollectionJobSchema.index({ projectId: 1, createdAt: -1 });
dataCollectionJobSchema.index({ userId: 1 });
dataCollectionJobSchema.index({ status: 1 });

const DataCollectionJob = mongoose.model('DataCollectionJob', dataCollectionJobSchema);

export default DataCollectionJob;
