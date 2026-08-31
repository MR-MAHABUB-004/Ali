const stableDiffusion = require('../services/stableDiffusion');
const imageUtils = require('../utils/imageUtils');

// Main edit endpoint: /edit=<image_url>$prompt=<prompt>
exports.editImage = async (req, res) => {
    try {
        const { imageUrl, prompt } = req.params;
        
        // Get optional parameters
        const strength = parseFloat(req.query.strength) || 0.75;
        const steps = parseInt(req.query.steps) || 20;
        const seed = parseInt(req.query.seed) || -1;
        const cfgScale = parseFloat(req.query.cfg_scale) || 7.0;
        const negativePrompt = req.query.negative_prompt || '';
        const width = parseInt(req.query.width) || 512;
        const height = parseInt(req.query.height) || 512;
        
        console.log(`📥 Processing image: ${imageUrl}`);
        console.log(`📝 Prompt: ${prompt}`);
        console.log(`💪 Strength: ${strength}`);
        
        // Download image from URL
        const imageBase64 = await imageUtils.downloadImageAsBase64(imageUrl);
        
        // Process with Stable Diffusion
        const result = await stableDiffusion.img2img({
            initImage: imageBase64,
            prompt,
            negativePrompt,
            strength,
            steps,
            seed,
            cfgScale,
            width,
            height
        });
        
        // Convert base64 to buffer and send
        const imageBuffer = Buffer.from(result, 'base64');
        res.set('Content-Type', 'image/png');
        res.send(imageBuffer);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({
            error: 'Failed to process image',
            details: error.message
        });
    }
};

// JSON API endpoint
exports.editImageJSON = async (req, res) => {
    try {
        const {
            image_url,
            prompt,
            strength = 0.75,
            steps = 20,
            seed = -1,
            cfg_scale = 7.0,
            negative_prompt = '',
            width = 512,
            height = 512
        } = req.body;
        
        if (!image_url || !prompt) {
            return res.status(400).json({
                error: 'Missing required fields: image_url and prompt'
            });
        }
        
        console.log(`📥 Processing image via JSON API: ${image_url}`);
        
        const imageBase64 = await imageUtils.downloadImageAsBase64(image_url);
        
        const result = await stableDiffusion.img2img({
            initImage: imageBase64,
            prompt,
            negativePrompt: negative_prompt,
            strength,
            steps,
            seed,
            cfgScale: cfg_scale,
            width,
            height
        });
        
        res.json({
            success: true,
            image_base64: result,
            parameters: {
                prompt,
                strength,
                steps
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Batch processing endpoint
exports.batchProcess = async (req, res) => {
    try {
        const { images } = req.body; // Array of {url, prompt, strength}
        
        if (!images || !Array.isArray(images)) {
            return res.status(400).json({
                error: 'Missing images array'
            });
        }
        
        const results = [];
        
        for (const img of images) {
            try {
                const imageBase64 = await imageUtils.downloadImageAsBase64(img.url);
                
                const result = await stableDiffusion.img2img({
                    initImage: imageBase64,
                    prompt: img.prompt,
                    strength: img.strength || 0.75,
                    steps: img.steps || 20,
                    seed: img.seed || -1,
                    cfgScale: img.cfg_scale || 7.0,
                    width: img.width || 512,
                    height: img.height || 512
                });
                
                results.push({
                    original_url: img.url,
                    prompt: img.prompt,
                    output_base64: result,
                    success: true
                });
            } catch (error) {
                results.push({
                    original_url: img.url,
                    success: false,
                    error: error.message
                });
            }
        }
        
        res.json({
            success: true,
            total: images.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Inpainting endpoint
exports.inpaintImage = async (req, res) => {
    try {
        const {
            image_url,
            mask_url,
            prompt,
            strength = 1.0,
            steps = 30,
            seed = -1
        } = req.body;
        
        if (!image_url || !mask_url || !prompt) {
            return res.status(400).json({
                error: 'Missing required fields: image_url, mask_url, and prompt'
            });
        }
        
        const imageBase64 = await imageUtils.downloadImageAsBase64(image_url);
        const maskBase64 = await imageUtils.downloadImageAsBase64(mask_url);
        
        const result = await stableDiffusion.inpaint({
            initImage: imageBase64,
            mask: maskBase64,
            prompt,
            strength,
            steps,
            seed
        });
        
        res.json({
            success: true,
            image_base64: result
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
