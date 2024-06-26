const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { client } = require('./aws.s3');

const uploadImage = async (file, key) => {
    const buffer = await sharp(file.buffer).resize(500, 500).toBuffer();
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.mimetype
    };
    const command = new PutObjectCommand(params);
    await client.send(command);
}

const deleteImage = async (key) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key
    };
    const command = new DeleteObjectCommand(params);
    await client.send(command);
}

module.exports = { uploadImage, deleteImage };
