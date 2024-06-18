const cloudinary = require('cloudinary').v2;
const fs = require('fs');

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadImage = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, async (error, result) => {
            if (error) {
                console.log('Error uploading image to cloudinary', error);
                return null;
            }
            fs.unlinkSync(localFilePath);
            return result;
        });
        console.log('Image uploaded to cloudinary', response, response.url);
        return response.secure_url;
    }
    catch (error) {
        console.log('Error uploading image to cloudinary', error);
        return null;
    }
}

module.exports = uploadImage ;