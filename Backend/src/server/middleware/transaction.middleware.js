const XLSX = require('xlsx');
module.exports = class TransactionMiddleware {
   static construct = async (req, res, next) => {
      const { role, ...rest } = res.locals.user
      let txnDetails = [], txnHeader = { ...req.body, userId: rest.userId, tenant_id: rest.tenantId, };
      if (req?.files?.sheet) {
         const file = req.files.sheet;
         // console.log(file, "<<<<<<<<<<>>>>>>>>>>>>>>>");
         const workbook = XLSX.readFile(file.tempFilePath);
         const sheet_name_list = workbook.SheetNames;
         if(sheet_name_list.length === 1){
            let result = [];
            for (const sheetName of sheet_name_list) {
               let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
               const format = this.generateBulkTxnDetails(xlData)
               result = format;
            }
            txnDetails = result
         }
      } else if(typeof req.body === 'object' &&  Object.keys(req.body).length > 0) {
         txnDetails = [
            { userId: req.body.userId||rest.userId, type: req.body.type, amount: req.body.amount, currency: req.body.currency, description: req.body.description }
         ]
      }
      req.body = {
         txnHeader: {amount: this.total, ...txnHeader},
         txnDetails
      };
      next();
   }
   
   static generateBulkTxnDetails = (arr) => {
      const result = []; 
      this.total = 0;
      for(let item of arr){
         this.total = this.total += +item.AMOUNT
         result.push({
            userId: item.userId,
            currency: "NGN",
            amount: item.AMOUNT,
         })
      }
      return result
  }
}