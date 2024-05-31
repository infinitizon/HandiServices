/* eslint-disable camelcase */
const cloudinary = require("cloudinary").v2;
const AppError = require('../../../config/apiError')

class CloudinaryService {
   constructor() {
      cloudinary.config({
         cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
         api_key: process.env.CLOUDINARY_API_KEY,
         api_secret: process.env.CLOUDINARY_API_SECRET
      });
      this.cloudinary = cloudinary;
   }
   
   async upload(file) {
      try{
         const uploaded = await new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream((error, result) => {
               if (error) {
                  reject(error);
               } else {
                  resolve(result);
               }
            });      
            uploadStream.end(file.data);
         });
         return {success: true, status: 200, data: { id: uploaded.public_id, service: 'cloudinary', url: uploaded.secure_url}};
      } catch (error) {
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async getFile({id, url}) {
      try {
         console.log(id);
         return {success: true, status: 200, data: url };
      } catch (error) {
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async delete ({id}) {
      try{
         console.log('IInnnnnn', id) //id in this case is the public_id
         const deleted = await this.cloudinary.api.delete_resources(id, function(error, result){
            console.log(result, error)
         })
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

module.exports = CloudinaryService;