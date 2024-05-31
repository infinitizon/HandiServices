const Service = {
   awss3Service: require('./cloud-obj-upload/aws-s3.service'),
   cloudinaryService: require('./cloud-obj-upload/cloudinary.service'),
};
const AppError = require('../../config/apiError')
// const multer = require("multer");

 
class CloudObjUploadService {
   constructor({service='awss3', initialize}) {
      this.gateway = new Service[service+'Service']({initialize});
   }
   
   async upload (file) {
      try {
         // console.log(Buffer.from(str, 'base64').toString('base64') === file );
         // const base64RegExp = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
         // const isBase64 = base64RegExp.test(file);
         const response = await this.gateway.upload(file);
         if(!response || !response.success)
            throw new AppError(response.message, response.line||__line, response.file||__path.basename(__filename), { status: response.status||404 });
         return response;
      } catch (error) {
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async getFile ({id, url}) {
      try {
         const response = await this.gateway.getFile({id, url});
         if(!response || !response.success)
            throw new AppError(response.message, response.line||__line, response.file||__path.basename(__filename), { status: response.status||404 });
         return response;
      } catch (error) {
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async delete (fileId) {
      try {
         const response = await this.gateway.delete({id: fileId});
         if(!response || !response.success)
            throw new AppError(response.message, response.line||__line, response.file||__path.basename(__filename), { status: response.status||404 });
         return response;
      } catch (error) {
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   
   // Middleware for handling file uploads using Multer
   // uploadMiddleware() {
   //    const storage = multer.memoryStorage();
   //    const upload = multer({
   //       storage: storage,
   //       limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10 MB
   //    });
   //    return upload.single("file");      
   // }
}

module.exports = CloudObjUploadService;