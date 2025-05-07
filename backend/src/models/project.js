import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const productDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  attributes: [attributeSchema]
}, { _id: false });

const researchScopeSchema = new mongoose.Schema({
  platforms: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Ten minste één platform moet worden geselecteerd'
    }
  },
  sampleSize: {
    type: String,
    required: true,
    enum: ['klein', 'medium', 'groot'],
    default: 'medium'
  },
  geographicFocus: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Ten minste één geografische focus moet worden geselecteerd'
    }
  },
  timeframe: {
    type: String,
    enum: ['laatste_week', 'laatste_maand', 'laatste_jaar', 'alles'],
    default: 'laatste_maand'
  }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  productDetails: {
    type: productDetailsSchema,
    required: true
  },
  researchScope: {
    type: researchScopeSchema,
    required: true
  },
  competitors: {
    type: [String],
    default: []
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
});

// Update updatedAt bij elke wijziging
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
