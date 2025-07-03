const express = require('express');
const router = express.Router();
const frameController = require('../controllers/frameController');

router.post('/frame', frameController.handleFrameUpload);

router.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'Deep learning model server is running' });
});

module.exports = router;