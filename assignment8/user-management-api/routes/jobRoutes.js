const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const jobController = require('../controllers/jobControllers');

router.post('/create/job', requireAdmin, jobController.createJob); 
router.get('/jobs', requireAuth, jobController.getJobs);          
router.delete('/delete/job/:id', requireAdmin, jobController.deleteJob);

module.exports = router;
