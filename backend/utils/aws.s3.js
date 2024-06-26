const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});

const getObjectSignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key
    });

    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return url;
}


module.exports = { client, getObjectSignedUrl };