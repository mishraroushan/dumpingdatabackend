const aws = require("aws-sdk")

aws.config.update({
    accessKeyId: "AKIAXPAOMVDDQHYPJUJM",
    secretAccessKey: "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",
    region: "ap-south-1"
})


const uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); 

        var uploadParams = {
            ACL: "public-read",
            Bucket: "sourav6803",  
            Key: "abc/" + file?.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

    })
}

module.exports.uploadFile = uploadFile