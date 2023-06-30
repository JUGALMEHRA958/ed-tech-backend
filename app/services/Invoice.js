/****************************
 FILE HANDLING OPERATIONS
 ****************************/
 let fs = require('fs');
//  let path = require('path');
 const _ = require("lodash");
 const json2csv = require('json2csv').parse;
 const mv = require('mv');
 const aws = require('aws-sdk');
 const Jimp = require('jimp');
 const crypto = require('crypto');
 const multer = require('multer');
 const PDFDocument = require("pdfkit");
//  const fs = require('fs');
 const https = require('https');
 const path = require('path');
 const config = require('../../configs/configs');
 const File = require("../services/File");



 aws.config.update({
     secretAccessKey: config.s3SecretAccessKey,
     accessKeyId: config.s3AccessKeyId,
     region: config.s3Region
 });
 
 const s3 = new aws.S3();
 
 
class Invoice {
    constructor(){
        this.file = new File();
    }
    // Function to download an image from the S3 link
    downloadImage(s3Link, localPath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(localPath);
            https.get(s3Link, (response) => {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            }).on('error', (err) => {
                reject(err);
            });
        });
    }


     async generateInvoice(invoiceData) {

         const doc = new PDFDocument();

         // Inside the generateInvoice function
         const logoFilePath = path.join(__dirname, 'logo.png'); // Provide the desired local file path
         await this.downloadImage(invoiceData.sellerDetails.logo, logoFilePath);

         // Adding seller logo
         doc.image(logoFilePath, 30, 30, {
             fit: [100, 100],
             align: "left",
             valign: "center",
         });

         // Adding seller details - name, email, GSTIN
         doc.font("Helvetica-Bold").fontSize(12);
         doc.text(invoiceData.sellerDetails.name.toUpperCase(), 30, 150); // Capitalized and in bold
         doc.font("Helvetica").fontSize(10);
         doc.text(invoiceData.sellerDetails.address, 30, 165);
         doc.text(`City: ${invoiceData.sellerDetails.city}, State: ${invoiceData.sellerDetails.state}`, 30, 180);
         doc.text(`Country: ${invoiceData.sellerDetails.country}`, 30, 195);
         doc.text("CIN: " + invoiceData.sellerDetails.CIN, 30, 210);
         doc.text("Contact Number: " + invoiceData.sellerDetails.contactNumber, 30, 225);
         doc.text("Email: " + invoiceData.sellerDetails.email, 30, 240);
         doc.text("GSTIN: " + invoiceData.sellerDetails.GST, 30, 255);

         // Adding invoice title
         doc.fontSize(22).text("Invoice", { align: "center" });

         // Adding customer details - name, email, phone
         doc.fontSize(10).text("To:", 30, 290);
         doc.fontSize(10).text("Name: " + invoiceData.customerDetails.name, 30, 310);
         doc.fontSize(10).text("Email: " + invoiceData.customerDetails.email, 30, 325);
         doc.fontSize(10).text("Phone: " + invoiceData.customerDetails.phone, 30, 340);

         // Adding products table
         const tableTop = 380;
         const columnSpacing = 15;
         const tableHeaders = ["Product", "Qty", "Price", "Total"];
         const tableData = invoiceData.products.map((product) => [
             product.name,
             product.qty,
             product.price.toFixed(2),
             (product.qty * product.price).toFixed(2),
         ]);

         doc.font("Helvetica-Bold").fontSize(12);
         doc.text("Product", 30, tableTop);
         doc.text("Qty", 250, tableTop, { width: 60, align: "right" });
         doc.text("Price", 320, tableTop, { width: 80, align: "right" });
         doc.text("Total", 400, tableTop, { width: 80, align: "right" });
         doc.font("Helvetica").fontSize(10);

         let currentY = tableTop + 20;
         doc.lineWidth(1).moveTo(30, currentY).lineTo(550, currentY).stroke();

         tableData.forEach((row) => {
             const [product, qty, price, total] = row;
             doc.text(product, 30, currentY);
             doc.text(qty, 250, currentY, { width: 60, align: "right" });
             doc.text(price, 320, currentY, { width: 80, align: "right" });
             doc.text(total, 400, currentY, { width: 80, align: "right" });
             currentY += 20;
         });

         doc.lineWidth(1).moveTo(30, currentY).lineTo(550, currentY).stroke();

         // Adding summary - total bill, discount, SGST, CGST, grand total
         // Adding summary - total bill, discount, SGST, CGST, grand total
         // Adding summary - total bill, discount, SGST, CGST, grand total
         const summaryTop = currentY + 40;
         const { discount, sgst, cgst } = invoiceData;
         const total = invoiceData.products.reduce(
             (acc, product) => acc + product.qty * product.price,
             0
         );
         const discountAmount = (discount / 100) * total;
         const sgstAmount = (sgst / 100) * (total - discountAmount);
         const cgstAmount = (cgst / 100) * (total - discountAmount);
         const grandTotal = total - discountAmount + sgstAmount + cgstAmount;

         doc.font("Helvetica-Bold").fontSize(12);
         doc.text("Total Bill:", 30, summaryTop, { width: 100, align: "left" });
         doc.text("Discount (" + discount + "%):", 30, summaryTop + 20, { width: 100, align: "left" });
         doc.text("SGST (" + sgst + "%):", 30, summaryTop + 40, { width: 100, align: "left" });
         doc.text("CGST (" + cgst + "%):", 30, summaryTop + 60, { width: 100, align: "left" });
         doc.text("Grand Total:", 30, summaryTop + 80, { width: 100, align: "left" });

         doc.font("Helvetica").fontSize(12);
         doc.text(total.toFixed(2), 400, summaryTop, { width: 120, align: "right" });
         doc.text(discountAmount.toFixed(2), 400, summaryTop + 20, { width: 120, align: "right" });
         doc.text(sgstAmount.toFixed(2), 400, summaryTop + 40, { width: 120, align: "right" });
         doc.text(cgstAmount.toFixed(2), 400, summaryTop + 60, { width: 120, align: "right" });
         doc.text(grandTotal.toFixed(2), 400, summaryTop + 80, { width: 120, align: "right" });

         // Finalize PDF file
         const filePath = path.join(__dirname, "Invoice.pdf");
         const writeStream = fs.createWriteStream(filePath);
         doc.pipe(writeStream);
         doc.end();
            //now just upload on s3 and return url
            return new Promise((resolve, reject) => {
              writeStream.on("finish", async () => {
                  // File has been written successfully
      
                  // Create a new unique filename
                  const fileName = "Invoice_" + Date.now().toString() + ".pdf";
      
                  // Set up the S3 upload parameters
                  const params = {
                      Bucket: config.s3Bucket, // Replace with your S3 bucket name
                      Key: fileName,
                      Body: fs.createReadStream(filePath),
                      ACL: "public-read",
                  };
      
                  // Upload the file to S3
                  s3.upload(params, async (err, data) => {
                      if (err) {
                          console.error("Error uploading file to S3:", err);
                          reject(err);
                      } else {
                          // Get the public URL of the uploaded file
                          const fileUrl = data.Location;
                          // Delete the file from the local storage
                          fs.unlinkSync(filePath);
                          // Return the file URL
                          resolve(fileUrl);
                      }
                  });
              });
      
              writeStream.on("error", (err) => {
                  // Error occurred while writing the file
                  console.error("Error writing PDF file:", err);
                  reject(err);
              });
          });
          
     };
 }
 
 module.exports = Invoice;