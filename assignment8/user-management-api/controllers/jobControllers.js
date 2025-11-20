const Job = require('../models/Job');

exports.createJob = async (req, res) => {
  try {
    const { companyName, jobTitle, description, salary } = req.body;
    if (!companyName || !jobTitle || !description || !salary) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const job = new Job({ companyName, jobTitle, description, salary });
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create job.' });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
};


exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Job ID is required.' });
    }

    const job = await Job.findByIdAndDelete(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    res.status(200).json({ message: 'Job deleted successfully', job });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ error: 'Failed to delete job.' });
  }
};