import mongoose from 'mongoose';

const amazonReviewSchema = new mongoose.Schema({
  reviewId: {
    type: String,
    required: true,
    unique: true
  },
  productId: {
    type: String,
    required: true
  },
  productTitle: {
    type: String,
    required: true
  },
  title: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  author: {
    type: String
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    required: true
  },
  country: {
    type: String
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  keywords: {
    type: [String],
    default: []
  }
});

const amazonProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  brand: {
    type: String
  },
  category: {
    type: String
  },
  price: {
    type: Number
  },
  averageRating: {
    type: Number
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  url: {
    type: String
  },
  imageUrl: {
    type: String
  }
});

const amazonDataSchema = new mongoose.Schema({
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
  collectionDate: {
    type: Date,
    default: Date.now
  },
  searchTerms: {
    type: [String],
    required: true
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
  products: [amazonProductSchema],
  reviews: [amazonReviewSchema],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String
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
amazonDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexen voor snellere zoekopdrachten
amazonDataSchema.index({ projectId: 1, collectionDate: -1 });
amazonDataSchema.index({ userId: 1 });
amazonReviewSchema.index({ reviewId: 1 });
amazonReviewSchema.index({ productId: 1 });
amazonReviewSchema.index({ rating: 1 });
amazonProductSchema.index({ productId: 1 });

const AmazonData = mongoose.model('AmazonData', amazonDataSchema);

export default AmazonData;
