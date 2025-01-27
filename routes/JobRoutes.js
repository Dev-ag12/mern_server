const express = require('express');
const { createJob, getJobs, getJobById, applyJob, deleteJob } = require('../controllers/jobController'); // ✅ Ensure correct path
const { protect, employerOnly } = require('../middleware/jobsMiddleware');

const router = express.Router();

router.route('/').post(protect, employerOnly, createJob).get(getJobs);
router.route('/:id').get(getJobById).delete(protect, employerOnly, deleteJob);
router.route('/:id/apply').post(protect, applyJob);

module.exports = router;
