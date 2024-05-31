// const { postgres, oldpostgres, Sequelize } = require('../../database/models');
const CloudObjUploadService = require('../services/cloud-obj-upload.service');
const AppError = require('../../config/apiError')
class TestController {
  
  static async cloudUpload (req, res, next)  {
    try {
      const uploaderService = new CloudObjUploadService({service: 'awss3'});
    
      const uploaded = await uploaderService.upload(req.files.file)
      if(!uploaded || !uploaded.success)
        throw new AppError(uploaded.message, uploaded.line||__line, uploaded.file||__path.basename(__filename), { status: uploaded.status||404 });
      // returning fileupload location
      return res.status(200).json({ uploaded });
    } catch (error) {
      
      return next(
        new AppError(
           error.message,
           error.line || __line,
           error.file || __path.basename(__filename),
           { name: error.name, status: error.status ?? 500, show: error.show }
        )
     );
    }
  }
  static async cloudDelete (req, res, next)  {
    try {
      const uploaderService = new CloudObjUploadService({service: 'awss3'});
    
      const uploaded = await uploaderService.delete(req.query.id)
      if(!uploaded || !uploaded.success)
        throw new AppError(uploaded.message, uploaded.line||__line, uploaded.file||__path.basename(__filename), { status: uploaded.status||404 });
      // returning fileupload location
      return res.status(200).json({ uploaded });
    } catch (error) {
      return next(
        new AppError(
           error.message,
           error.line || __line,
           error.file || __path.basename(__filename),
           { name: error.name, status: error.status ?? 500, show: error.show }
        )
     );
    }
  }
  static async cloudGetFile (req, res, next)  {
    try {
      const uploaderService = new CloudObjUploadService({service: 'awss3'});
    
      const uploaded = await uploaderService.getFile(req.query.id)
      if(!uploaded || !uploaded.success)
        throw new AppError(uploaded.message, uploaded.line||__line, uploaded.file||__path.basename(__filename), { status: uploaded.status||404 });
      // returning fileupload location
      return res.status(200).json({ uploaded });
    } catch (error) {
      return next(
        new AppError(
           error.message,
           error.line || __line,
           error.file || __path.basename(__filename),
           { name: error.name, status: error.status ?? 500, show: error.show }
        )
     );
    }
  }
  
}

module.exports = TestController;