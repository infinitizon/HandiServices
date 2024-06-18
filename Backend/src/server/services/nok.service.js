
const HttpStatus = require('http-status');
const AppError = require("../../config/apiError");
const db = require("../../database/models");

class NOKService {
   async getNOKs ({ userId, isPrimary=true}) {
      try {
         const noks = await db[process.env.DEFAULT_DB].models.NextOfKin.findAndCountAll({
            where: { ...(userId && { userId }), isPrimary },
         });
         return {success: true, status: HttpStatus.OK, message: "Next of kin(s) fetched successfully", total: noks.count, data: noks.rows,};
      } catch (error) {
         console.error(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }
   async getNOK ({ nokId }) {
      try {
         const nok = await db[process.env.DEFAULT_DB].models.NextOfKin.findByPk(nokId);
         return {success: true, status: HttpStatus.OK, data: nok, message: "Next of kin fetched successfully"};
      } catch (error) {
         console.error(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }
   async addNOK ({ userId, body, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         await db[process.env.DEFAULT_DB].models.NextOfKin.update(
            {isPrimary: false}, 
            { 
               where: {userId},
               transaction: t 
            }
         );
         const nok = await db[process.env.DEFAULT_DB].models.NextOfKin.create(
            { ...body, userId, isPrimary: true, }, 
            { transaction: t }
         );

         transaction ? 0 : await t.commit();
         return {success: true, status: HttpStatus.CREATED, data: nok, message: `Next of Kin information updated successfully`};
      } catch (error) {
         transaction ? 0 : await t.rollback();
         console.error(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }
   async updateNOK ({ id, updates, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const {data: nok, ...rest} = await this.getNOK({nokId: id});
         if (!rest || !rest.success)
            throw new AppError(rest.show?rest.message:`Couldn't fetch next of kin details`, __line, __path.basename(__filename), { status: rest.status, show: rest.show });
         
         await nok.update(updates, { transaction: t });

         transaction ? 0 : await t.commit();
         return {success: true, status: HttpStatus.OK, message: "Next of kin data updated successfully", data: nok};
      } catch (error) {
         transaction ? 0 : await t.rollback();
         console.error(error.message);
         return new AppError(
               error.message
               , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
}
module.exports = NOKService;