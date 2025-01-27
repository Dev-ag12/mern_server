const Job = require('../models/Job');
const { sendJobAlert } = require('../services/emailService');

// Create Job Controller
exports.createJob = async (req, res) => {
  try {
    const { title, description, requirements, location, salary, type, benefits, applicationDeadline } = req.body;

    console.log("api hit toh ho gya");

    const newJob = new Job({
      employer: req.user.id, // Assumes `protect` middleware sets req.user
      title,
      description,
      requirements,
      location,
      salary,
      type,
      benefits,
      applicationDeadline
    });

    const savedJob = await newJob.save();

    const employerName = req.user?.companyName || "Company XYZ";

    await sendJobAlert({
      title,
      description,
      location,
      salary,
      type,
      employerName
    });

    res.status(201).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Ensure all functions are exported properly
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('employer', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.applicants.some(applicant => applicant.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    job.applicants.push({ user: req.user.id });
    await job.save();

    res.json({ message: 'Applied successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await job.remove();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
