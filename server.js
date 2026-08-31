const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const editRoutes = require('./routes/edit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/edit', limiter);

// Routes
app.use('/', editRoutes);

// Home route
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'Image-to-Image API',
        version: '1.0.0',
        usage: {
            endpoint: '/edit',
            format: '/edit=<image_url>$prompt=<your_prompt>',
            optional_params: '&strength=<0-1>&steps=<1-150>&seed=<number>',
            example: '/edit=https://example.com/image.jpg$prompt=make it anime style&strength=0.7'
        },
        endpoints: [
            'GET /edit=<image_url>$prompt=<prompt>',
            'POST /api/edit',
            'POST /api/batch',
            'POST /api/inpaint',
            'GET /health'
        ]
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🎨 Image-to-Image API Server');
    console.log('='.repeat(50));
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log(`📝 Usage: /edit=<image_url>$prompt=<your_prompt>`);
    console.log(`💡 Example: /edit=https://example.com/img.jpg$prompt=make it anime`);
    console.log('='.repeat(50));
});
