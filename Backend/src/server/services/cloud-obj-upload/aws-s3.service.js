/* eslint-disable camelcase */
const aws = require("aws-sdk");
const AppError = require('../../../config/apiError')

class AWSS3Service {
   constructor() {
      aws.config.update({
         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
         region: process.env.AWS_REGION
      });
      this.s3 = new aws.S3();
   }
   
   async upload(file, folder='IN') {
      try {
         const uploaded = await new Promise((resolve, reject) => {
            const uploadParams = {
               Bucket: process.env.AWS_BUCKET,
               Key: `${folder}/${Date.now().toString()}-${file.name}`,
               Body: file.data,
            };
            this.s3.upload(uploadParams, (err, data) => {
               if (err) reject(err);
               else resolve(data);
            });
         });
         return {success: true, status: 200, data: { id: uploaded.key, service: 'awss3', url: uploaded.Location}};
      } catch (error) {
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async getFile({id, url}) {
      try {
         const expirationTime = 3600; // 1 hour
         const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: id,
            Expires: expirationTime
         };
         console.log(url);
         const data = await new Promise((resolve, reject) => {
            this.s3.getSignedUrl('getObject', params, (err, data) => {
               if (err) reject(err);
               else resolve(data);
            });
         });
         /* To get file as Buffer*/
         // const data = await new Promise((resolve, reject) => {
         //    this.s3.getObject( params, (err, data) => {
         //       if (err) {
         //          reject(err);
         //       } else {
         //          // resolve(data); // This is pure buffer
         //          resolve(Buffer.from(data.Body, 'base64').toString('ascii')) //Turn to base64
         //       }
         //    });
         // });
         return {success: true, status: 200, data };
      } catch (error) {
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async delete ({id}) {
      try{
         console.log('IInnnnnn', id)
         const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: id,  //id in this case is the fileName
         };
         const deleted = await new Promise((resolve, reject) => {
            this.s3.deleteObject(params, function(err, data) {
               if (err) reject(err);
               else resolve(data);
            });
         });
         return {success: true, status: 200, message: `Record with ID: ${id} deleted successfully`, data: { ...deleted }};
      }catch(error){
         console.error(error.message);
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );    
      }
   }
}
module.exports = AWSS3Service;