const Enquiry = require('../models/Enquiry');

exports.submitEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, courseInterest, message, source, priority } = req.body;

    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      courseInterest,
      message,
      source: source || 'website',
      priority: priority || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. Our team will contact you soon!',
      data: {
        id: enquiry._id,
        name: enquiry.name,
        email: enquiry.email,
        courseInterest: enquiry.courseInterest,
        submittedAt: enquiry.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUnclaimedEnquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const enquiries = await Enquiry.find({ 
      status: 'unclaimed', 
      claimedBy: null 
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-notes');

    const total = await Enquiry.countDocuments({ 
      status: 'unclaimed', 
      claimedBy: null 
    });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: enquiries
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyEnquiries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { claimedBy: req.employee.id };
    if (status && ['claimed', 'contacted', 'converted', 'lost'].includes(status)) {
      query.status = status;
    }

    const enquiries = await Enquiry.find(query)
      .sort({ claimedAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('claimedBy', 'name email');

    const total = await Enquiry.countDocuments(query);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: enquiries
    });
  } catch (error) {
    next(error);
  }
};

exports.claimEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    if (enquiry.status !== 'unclaimed' || enquiry.claimedBy !== null) {
      return res.status(400).json({
        success: false,
        message: 'This enquiry has already been claimed by another counselor'
      });
    }

    enquiry.claimedBy = req.employee.id;
    enquiry.status = 'claimed';
    enquiry.claimedAt = new Date();

    await enquiry.save();
    await enquiry.populate('claimedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Enquiry claimed successfully',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

exports.getEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id)
      .populate('claimedBy', 'name email')
      .populate('notes.addedBy', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    if (enquiry.claimedBy && enquiry.claimedBy._id.toString() !== req.employee.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this enquiry'
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['claimed', 'contacted', 'converted', 'lost'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: claimed, contacted, converted, lost'
      });
    }

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    if (!enquiry.claimedBy || enquiry.claimedBy.toString() !== req.employee.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update enquiries claimed by you'
      });
    }

    enquiry.status = status;
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};

exports.addNote = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    if (!enquiry.claimedBy || enquiry.claimedBy.toString() !== req.employee.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only add notes to enquiries claimed by you'
      });
    }

    enquiry.notes.push({
      text,
      addedBy: req.employee.id,
      addedAt: new Date()
    });

    await enquiry.save();
    await enquiry.populate('notes.addedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: enquiry
    });
  } catch (error) {
    next(error);
  }
};