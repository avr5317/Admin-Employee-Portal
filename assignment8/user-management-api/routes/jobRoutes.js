const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobControllers');

router.post('/create/job', jobController.createJob); 
router.get('/jobs', jobController.getJobs);          
router.delete('/delete/job/:id', jobController.deleteJob);

module.exports = router;
