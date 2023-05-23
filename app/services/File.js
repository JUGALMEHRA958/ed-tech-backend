/****************************
 FILE HANDLING OPERATIONS
 ****************************/
let fs = require('fs');
let path = require('path');
const _ = require("lodash");
const json2csv = require('json2csv').parse;
const mv = require('mv');
const aws = require('aws-sdk');
const Jimp = require('jimp');

const config = require('../../configs/configs');

aws.config.update({
    secretAccessKey: '',
    accessKeyId: '',
    region: ''
});

const s3 = new aws.S3();


class File {

    constructor(file, location) {
        this.file = file;
        this.location = location;
    }

    // Method to Store file (image)
    store(data) {
        return new Promise((resolve, reject) => {
            if (_.isEmpty(this.file.file)) {
                reject('Please send file.');
            }

            let fileName = this.file.file[0].originalFilename.split(".");
            let ext = _.last(fileName);
            let imagePath = data && data.imagePath ? data.imagePath : '/public/upload/images/';
            let name = 'image_' + Date.now().toString() + '.' + ext;
            let filePath = imagePath + name;
            let fileObject = { "filePath": name };
            mv(this.file.file[0].path, appRoot + filePath, { mkdirp: true }, function (err) {
                if (err) {
                    reject(err);
                }
                if (!err) {
                    resolve(fileObject);
                }
            });
        });

    }

    readFile(filepath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filepath, 'utf-8', (err, html) => {
                if (err) {
                    return reject({ message: err, status: 0 });
                }
                return resolve(html);
            });
        });
    }

    convertJsonToCsv(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let jsonData = data.jsonData && Array.isArray(data.jsonData) ? data.jsonData : [];
                let ext = data.ext ? data.ext : ".csv"
                const fields = data.columns;
                const fileName = data.fileName ? data.fileName : "list";
                const opts = { fields };
                const csv = json2csv(jsonData, opts);
                var flname = fileName + Date.now().toString() + ext;
                var loc = path.join(__dirname, '..', '..', 'public', 'upload', 'csv', flname);
                fs.writeFile(loc, csv, (err, result) => {
                    if (err) {
                        return reject(err);
                    } else {
                        let csvFile = path.join('public', 'upload', 'csv', flname);
                        return resolve(config.apiUrl + '/' + csvFile);
                    }
                });
            } catch (err) {
                console.error(err);
                return reject(err);
            }
        });
    }

    uploadFileOnS3(file) {
        let fileName = file.originalFilename.split(".");
        let newFileName = fileName[0] + Date.now().toString() + '.' + fileName[1];
        return new Promise((resolve, reject) => {
            s3.createBucket(() => {
                let params = {
                    Bucket: 'bucket1',
                    Key: newFileName,
                    Body: fs.createReadStream(file.path),
                    ACL: "public-read",
                }
                s3.upload(params, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }

                });
            });
        });
    }

    deleteFile() {
        //TODO
        return new Promise((resolve, reject) => {
            try {
                // create unlink functionality from server
            } catch (error) {
                reject(error);
            }
        });
    }

    deleteFileOnS3() {
        //TODO
        return new Promise((resolve, reject) => {
            try {
                // create unlink functionality from s3
            } catch (error) {
                reject(error);
            }
        });
    }

    /****************************************************** 
      image upload code for image compression and image resizing
      scaleToFit(width, height) for resizing the image, set width and height  of the image according to your requirement
      quality(40) for image compression
      If you don't want any of these you can simply remove this.
     **************************************************************/
    saveImage(data) {
        return new Promise(async (resolve, reject) => {
            await Jimp.read(this.file.file[0].path).then(async (image1) => {
                let fileName = this.file.file[0].originalFilename.split(".");
                let ext = _.last(fileName);
                let imagePath = data && data.imagePath ? data.imagePath : '/public/upload/images/';
                let name = 'image_' + Date.now().toString() + '.' + ext;
                let filePath = appRoot + imagePath + name;
                let fileObject = { "filePath": name };
                let createAndStorecImage = await image1.quality(50).scaleToFit(600, 600).write(filePath, async () => {
                    return resolve(fileObject)
                });
            }).catch(err => {
                resolve(JSON.stringify(err))
            });
        });
    }
}

module.exports = File;