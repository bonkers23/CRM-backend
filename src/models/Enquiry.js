const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
  },
  courseInterest: {
    type: String,
    required: [true, 'Course interest is required'],
    trim: true,
    maxlength: [200, 'Course interest cannot exceed 200 characters']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['unclaimed', 'claimed', 'contacted', 'converted', 'lost'],
    default: 'unclaimed'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  claimedAt: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'direct', 'social_media', 'other'],
    default: 'website'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ claimedBy: 1, status: 1 });
enquirySchema.index({ email: 1 });

enquirySchema.virtual('isPublic').get(function() {
  return this.status === 'unclaimed' && this.claimedBy === null;
});

enquirySchema.methods.claimEnquiry = function(employeeId) {
  if (this.status !== 'unclaimed' || this.claimedBy !== null) {
    throw new Error('Enquiry is already claimed');
  }
  
  this.claimedBy = employeeId;
  this.status = 'claimed';
  this.claimedAt = new Date();
  return this.save();
};

enquirySchema.statics.getUnclaimedEnquiries = function(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ status: 'unclaimed', claimedBy: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('-notes');
};

enquirySchema.statics.getClaimedEnquiriesByEmployee = function(employeeId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ claimedBy: employeeId })
    .sort({ claimedAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('claimedBy', 'name email');
};

module.exports = mongoose.model('Enquiry', enquirySchema);