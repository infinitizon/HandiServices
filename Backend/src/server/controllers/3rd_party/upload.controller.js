const FileUpload = require('../../services/fileupload.service');
const Logger = require('../../../config/winston-log');
const AppError = require('../../../config/apiError');

class UploadController {

    upload= async (req, res, next) => {

    try {
        if (!req.file) {
            throw new Error('A File is required.');
        }

        // Upload the file to Cloudinary
        const cloudinaryResult = await (new FileUpload()).uploadToCloudinary(req.file);

        // Upload the file to S3
        // const s3Result = await FileUpload.uploadToS3(req.file);
        // Return the file metadata for one service
       
        let resp = { code: 200, success: true, data: cloudinaryResult };
        res.status(resp.code).json(resp);
        res.locals.resp = resp;
      } catch (error) {
        Logger.error(`File: ${error.file||__path.basename(__filename)}, Line: ${error.line||__line} => ${error.message}`);
        console.log(`File: ${error.file||__path.basename(__filename)}, Line: ${error.line||__line} => ${error.message}`)
        return next(
            new AppError(
                error.message ?? 'An error occurred while uploading the file'
                ,error.line|| __line, error.file||__path.basename(__filename)
                , {name: error.name, status: error.status??500, show: error.show}
            )
        );
        }
    }
}

module.exports = UploadController