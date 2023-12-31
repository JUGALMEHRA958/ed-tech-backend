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
const crypto = require('crypto');
const multer = require('multer');

const config = require('../../configs/configs');

aws.config.update({
    secretAccessKey: config.s3SecretAccessKey,
    accessKeyId: config.s3AccessKeyId,
    region: config.s3Region
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



    async convertJsonToCsv(data) {
      return new Promise(async (resolve, reject) => {
        try {
          const jsonData = data.jsonData && Array.isArray(data.jsonData) ? data.jsonData : [];
          const ext = data.ext ? data.ext : '.csv';
          const fields = data.columns;
          const fileName = data.fileName ? data.fileName : 'list';
          const opts = { fields };
          const csv = json2csv(jsonData, opts);
          const uploadDir = path.join('public', 'upload', 'csv');
          const randomString = crypto.randomBytes(3).toString('hex'); // Generate a random 5-letter string
          const flname = `${fileName}${randomString}${ext}`;
          const loc = path.join(uploadDir, flname); // Save the file in the 'public/upload/csv' directory
    
          try {
            await fs.promises.mkdir(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
            await fs.promises.writeFile(loc, csv); // Write the file
            const csvFile = config.serverUrl + 'upload/csv/' + flname; // Append serverUrl before the file link
            return resolve(csvFile);
          } catch (err) {
            console.error(err);
            return reject(err);
          }
        } catch (err) {
          console.error(err);
          return reject(err);
        }
      });
    }
    
    
     generateRandomWord(length) {
        let word = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          word += characters[randomIndex];
        }
      
        return word;
      } 
      async uploadFileOnS3(file) {
        try {
          console.log("file 114", file);
          const fileName = `${file.originalFilename.split('.')[0]}_${Date.now().toString()}.${file.originalFilename.split('.')[1]}`;
      
          // Set up the S3 upload parameters
          const params = {
            Bucket: config.s3Bucket, // Replace with your S3 bucket name
            Key: fileName,
            Body: fs.createReadStream(file.path),
            ACL: "public-read",
          };
      
          // Upload the file to S3
          const data = await s3.upload(params).promise();
      
          // Get the public URL of the uploaded file
          const fileUrl = data.Location;
      
          console.log("File uploaded successfully. URL:", fileUrl);
          return fileUrl;
        } catch (error) {
          console.error("Error uploading file to S3:", error);
          throw error;
        }
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