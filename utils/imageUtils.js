const axios = require('axios');
const sharp = require('sharp');

class ImageUtils {
    
    // Download image from URL and convert to base64
    async downloadImageAsBase64(imageUrl) {
        try {
            console.log(`📥 Downloading image: ${imageUrl}`);
            
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ImageToImageAPI/1.0)'
                }
            });
            
            // Convert to base64
            const base64 = Buffer.from(response.data, 'binary').toString('base64');
            
            // Optional: Optimize image with sharp
            const optimizedBase64 = await this.optimizeImage(base64, 1024, 1024);
            
            console.log('✅ Image downloaded and encoded');
            return optimizedBase64 || base64;
            
        } catch (error) {
            console.error('❌ Failed to download image:', error.message);
            throw new Error(`Failed to download image: ${error.message}`);
        }
    }
    
    // Optimize image using sharp
    async optimizeImage(base64String, maxWidth = 1024, maxHeight = 1024) {
        try {
            const buffer = Buffer.from(base64String, 'base64');
            
            const optimizedBuffer = await sharp(buffer)
                .resize(maxWidth, maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .png({ quality: 90 })
                .toBuffer();
            
            return optimizedBuffer.toString('base64');
            
        } catch (error) {
            console.warn('⚠️ Image optimization failed, using original:', error.message);
            return null;
        }
    }
    
    // Convert base64 to buffer
    base64ToBuffer(base64String) {
        return Buffer.from(base64String, 'base64');
    }
    
    // Convert buffer to base64
    bufferToBase64(buffer) {
        return buffer.toString('base64');
    }
    
    // Get image dimensions from base64
    async getImageDimensions(base64String) {
        try {
            const buffer = Buffer.from(base64String, 'base64');
            const metadata = await sharp(buffer).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format
            };
        } catch (error) {
            console.error('Failed to get image dimensions:', error.message);
            return null;
        }
    }
}

module.exports = new ImageUtils();
