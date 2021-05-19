const ApiBuilder = require('claudia-api-builder'),
    api = new ApiBuilder();

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');
const Jimp = require('jimp');
const width = 200;
const height = 200;
const imageType = 'image/png';
const bucket = process.env.Bucket;

module.exports = api;

api.post('/upload', function (request) {
    console.log(request);
    let requestBody = request.post;
    let photoUrl = requestBody.photoUrl;
    let objectId = uuidv4();
    let objectKey = `resize-${width}xheight${height}-${objectId}.png`;

    return fetchImage(photoUrl)
        .then(image => {
            return image.resize(width, height).getBufferAsync(imageType)
        })
        .then(resizedBuffer => {
            return uploadToS3(resizedBuffer, objectKey)
        })
        .then(function (response) {
            return {success: true};
        })
        .catch(error => console.log(error));
})

function uploadToS3(data, key) {
    return s3
        .putObject({
            Bucket: bucket,
            Key: key,
            Body: data,
            ContentType: imageType
        }).promise().catch((error) => console.log(error));
}

function fetchImage(url) {
    return Jimp.read(url);
}

