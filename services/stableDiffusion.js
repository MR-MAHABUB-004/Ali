const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const SD_API_URL = process.env.SD_API_URL || 'http://127.0.0.1:7860';
const SD_IMG2IMG_ENDPOINT = `${SD_API_URL}/sdapi/v1/img2img`;
const SD_INPAINT_ENDPOINT = `${SD_API_URL}/sdapi/v1/inpaint`;

class StableDiffusionService {
    
    // Image-to-Image
    async img2img({
        initImage,
        prompt,
        negativePrompt = '',
        strength = 0.75,
        steps = 20,
        seed = -1,
        cfgScale = 7.0,
        width = 512,
        height = 512,
        samplerName = 'Euler a',
        batchSize = 1
    }) {
        try {
            const payload = {
                init_images: [initImage],
                prompt,
                negative_prompt: negativePrompt,
                strength,
                steps,
                seed,
                cfg_scale: cfgScale,
                width,
                height,
                sampler_name: samplerName,
                batch_size: batchSize,
                restore_faces: false,
                tiling: false
            };
            
            console.log('🔄 Calling Stable Diffusion API...');
            
            const response = await axios.post(SD_IMG2IMG_ENDPOINT, payload, {
                timeout: 300000, // 5 minutes timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && response.data.images && response.data.images.length > 0) {
                console.log('✅ Image processed successfully');
                return response.data.images[0];
            } else {
                throw new Error('No image in response');
            }
            
        } catch (error) {
            console.error('❌ Stable Diffusion API error:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            throw new Error(`Stable Diffusion API error: ${error.message}`);
        }
    }
    
    // Inpainting
    async inpaint({
        initImage,
        mask,
        prompt,
        negativePrompt = '',
        strength = 1.0,
        steps = 30,
        seed = -1,
        cfgScale = 7.0,
        width = 512,
        height = 512
    }) {
        try {
            const payload = {
                init_images: [initImage],
                mask,
                prompt,
                negative_prompt: negativePrompt,
                strength,
                steps,
                seed,
                cfg_scale: cfgScale,
                width,
                height,
                sampler_name: 'Euler a',
                inpainting_fill: 1, // 0=fill, 1=original, 2=latent noise
                inpaint_full_res: true,
                inpaint_full_res_padding: 32
            };
            
            console.log('🔄 Calling Stable Diffusion Inpainting API...');
            
            const response = await axios.post(SD_INPAINT_ENDPOINT, payload, {
                timeout: 300000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && response.data.images && response.data.images.length > 0) {
                console.log('✅ Inpainting completed successfully');
                return response.data.images[0];
            } else {
                throw new Error('No image in response');
            }
            
        } catch (error) {
            console.error('❌ Stable Diffusion Inpainting error:', error.message);
            throw new Error(`Stable Diffusion Inpainting error: ${error.message}`);
        }
    }
    
    // Check if SD API is available
    async checkHealth() {
        try {
            const response = await axios.get(`${SD_API_URL}/sdapi/v1/options`, {
                timeout: 5000
            });
            return {
                available: true,
                options: response.data
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }
}

module.exports = new StableDiffusionService();
