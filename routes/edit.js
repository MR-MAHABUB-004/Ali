const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Main URL format endpoint
// GET /edit=<image_url>$prompt=<prompt>&strength=<0-1>
router.get('/edit=:imageUrl$prompt=:prompt', imageController.editImage);

// JSON API endpoint
router.post('/api/edit', imageController.editImageJSON);

// Batch processing endpoint
router.post('/api/batch', imageController.batchProcess);

// Inpainting endpoint
router.post('/api/inpaint', imageController.inpaintImage);

module.exports = router;
