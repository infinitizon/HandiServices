const db = require('../../database/models');
const AppError = require('../../config/apiError');

class ReportsService {
   constructor({}) {}
   valueByCurrency = async ({user_id, currency}) => {
      try {
         let query = `SELECT th.currency, count(*) AS "count", sum(td.amount) AS "total"
                     FROM txn_details td
                        JOIN txn_headers th ON td.txnHeaderId = th.id AND th.status='success' AND td.status='success' {{user_id}} {{currency}}
                     WHERE (td.deleted_at IS NULL) AND (th.deleted_at IS NULL) 
                     GROUP BY th.currency`
         const s_user_id = user_id ? ` AND td.user_id='${user_id}' ` :  '';
         const s_currency = currency ? `AND th.currency='${currency}'` : '';

         query = query.replace(/{{currency}}/g, s_currency);
         query = query.replace(/{{user_id}}/g, s_user_id);
         const summary = await db[process.env.DEFAULT_DB].query(
               query
               , {
               nest: true,
               type: db.Sequelize.QueryTypes.SELECT
            })
         
         return { status: 201, success: true, data: summary, message: 'Summary retrieved successfully' };
      } catch (error) {
         console.log(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   };
   valueByAsset = async ({user_id, currency }) => {
      try {
         let query = `SELECT sum(td."amount") total, a.name "Asset.name", a.sub_title "Asset.title", a.currency "Asset.currency", m.img_name "Asset.image"
                     FROM "txn_details" td
                        LEFT OUTER JOIN "txn_headers" th ON td."txnHeaderId" = th."id" AND (th."deleted_at" IS NULL) 
                        LEFT OUTER JOIN "assets"  a ON th."asset_id" = a."id" AND (a."deleted_at" IS NULL) 
                        LEFT JOIN media m ON a.id=m.commonId AND m.commonType='assets'
                     WHERE (td."deleted_at" IS NULL) {{user_id}} {{currency}}
                     GROUP BY th."asset_id", a.name, a.sub_title, a.currency, m.img_name`;
         const s_user_id = user_id ? ` AND td.user_id='${user_id}' ` :  '';
         const s_currency = currency ? `AND th.currency='${currency}'` : '';
         
         query = query.replace(/{{currency}}/g, s_currency);
         query = query.replace(/{{user_id}}/g, s_user_id);
         const summary = await db[process.env.DEFAULT_DB].query(
               query
               , {
               nest: true,
               type: db.Sequelize.QueryTypes.SELECT
            })

         return { status: 201, success: true, data: summary, message: 'Summary retrieved successfully' };
      } catch (error) {
         console.log(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   valueByCustomer = async ({user_id, currency }) => {
      try {
         let query = `SELECT th.currency, sum(td.amount) AS "total"
                        FROM txn_details td
                           JOIN txn_headers th ON td.txnHeaderId = th.id AND th.status='success' AND td.status='success' {{user_id}} {{currency}}
                           JOIN users u ON th.user_id = u.id AND u.is_enabled=true AND is_locked=false AND u.deleted_at IS NULL
                        WHERE (td.deleted_at IS NULL) AND (th.deleted_at IS NULL) 
                        GROUP BY th.currency`;
         const s_user_id = user_id ? ` AND td.user_id='${user_id}' ` :  '';
         const s_currency = currency ? `AND th.currency='${currency}'` : '';
         query = query.replace(/{{currency}}/g, s_currency);
         query = query.replace(/{{user_id}}/g, s_user_id);
         
         let custQuery = `SELECT  COUNT(u.id) count
                        FROM users u
                           JOIN tenant_user_roles tur ON u.id=tur.user_id
                           JOIN roles r ON tur.role_id=r.id AND r.name='CUSTOMER'
                        WHERE u.is_enabled=true AND is_locked=false AND u.deleted_at IS NULL`;


         const response = await Promise.all([
            db[process.env.DEFAULT_DB].query( query , { type: db.Sequelize.QueryTypes.SELECT }),
            db[process.env.DEFAULT_DB].query( custQuery , { type: db.Sequelize.QueryTypes.SELECT })
         ]);
         return { status: 201, success: true, data: {subscribers: response[1][0]?.count, totalPaid: response[0]}, message: 'Summary retrieved successfully' };
      } catch (error) {
         console.log(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
}
module.exports = ReportsService;
