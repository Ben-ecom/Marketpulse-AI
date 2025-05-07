import mongoose from 'mongoose';

const redditPostSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String
  },
  subreddit: {
    type: String,
    required: true
  },
  author: {
    type: String
  },
  score: {
    type: Number,
    default: 0
  },
  upvoteRatio: {
    type: Number
  },
  commentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    required: true
  },
  permalink: {
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

const redditCommentSchema = new mongoose.Schema({
  commentId: {
    type: String,
    required: true,
    unique: true
  },
  postId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String
  },
  score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    required: true
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

const redditDataSchema = new mongoose.Schema({
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
  subreddits: {
    type: [String],
    required: true
  },
  timeframe: {
    type: String,
    enum: ['day', 'week', 'month', 'year', 'all'],
    default: 'month'
  },
  posts: [redditPostSchema],
  comments: [redditCommentSchema],
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
redditDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexen voor snellere zoekopdrachten
redditDataSchema.index({ projectId: 1, collectionDate: -1 });
redditDataSchema.index({ userId: 1 });
redditPostSchema.index({ postId: 1 });
redditCommentSchema.index({ commentId: 1 });
redditCommentSchema.index({ postId: 1 });

const RedditData = mongoose.model('RedditData', redditDataSchema);

export default RedditData;
