const express = require('express');
const router = express.Router();
const {
  submitEnquiry,
  getUnclaimedEnquiries,
  getMyEnquiries,
  claimEnquiry,
  getEnquiry,
  updateEnquiryStatus,
  addNote
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');
const {
  validateEnquiryForm,
  validateClaimEnquiry,
  validatePagination
} = require('../middleware/validators');

router.post('/', validateEnquiryForm, submitEnquiry);
router.get('/unclaimed', protect, validatePagination, getUnclaimedEnquiries);
router.get('/my-enquiries', protect, validatePagination, getMyEnquiries);
router.post('/:id/claim', protect, validateClaimEnquiry, claimEnquiry);
router.get('/:id', protect, getEnquiry);
router.put('/:id/status', protect, updateEnquiryStatus);
router.post('/:id/notes', protect, addNote);

module.exports = router;