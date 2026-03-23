const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Client");

const BUCKET = process.env.AWS_S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

/**
 * Upload a base64 data-URL string to S3 and return the public URL.
 *
 * @param {string} base64DataUrl  e.g. "data:image/jpeg;base64,/9j/4AAQ..."
 * @param {string} folder         S3 prefix/folder, e.g. "rd-testing/device"
 * @param {string} filename       Filename without extension, e.g. "photo_1"
 * @returns {Promise<string>}     Public S3 URL
 */
const uploadBase64ImageToS3 = async (base64DataUrl, folder, filename) => {
    // Strip the data-URL prefix to get raw base64
    const matches = base64DataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 data URL format");
    }

    const mimeType = matches[1]; // e.g. "image/jpeg"
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Derive extension from mime type
    const ext = mimeType.split("/")[1] || "jpg";
    const key = `${folder}/${filename}_${Date.now()}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // ACL removed — bucket policy should make objects public, or use GetObjectCommand for pre-signed URLs
    });

    await s3.send(command);

    // Return the public URL
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
};

module.exports = { uploadBase64ImageToS3 };
