const XLSX = require('xlsx');
module.exports = class TransactionMiddleware {
   static construct = async (req, res, next) => {
      const { role, ...rest } = res.locals.user
      let details = [], header = { ...req.body };
      header.userRole ? header.userRole?.toUpperCase() : 0;
      if (req?.files?.sheet) {
         const file = req.files.sheet;
         // console.log(file, "<<<<<<<<<<>>>>>>>>>>>>>>>");
         const workbook = XLSX.readFile(file.tempFilePath);
         const sheet_name_list = workbook.SheetNames;
         if(sheet_name_list.length === 1){
            let result = [];
            for (const sheetName of sheet_name_list) {
               let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
               const format = this.generateBulkFileDetails(req.body.fileType, xlData)
               result = format;
            }
            details = result
         }
      } else if(typeof req.body === 'object' &&  Object.keys(req.body).length > 0) {
         details = this.generateBulkFileDetails(req.body.fileType, [req.body])
      }
      req.body = {
         header,
         details
      };
      next();
   }
   
   static generateBulkFileDetails = (fileType, arr) => {
      const result = []
      for(let item of arr){
         if(fileType==='tenant') {
            item.Addresses = (item.Addresses && typeof item.Addresses=='string') ? [JSON.parse(item.Addresses)] : null
            result.push(item);
         }
         if(fileType==='user') {
            let Address = {};
            item.address = (item.address) ? item.address.match(/.{1,40}/g) : [];
            (item.address[0] || item.address1 || item.Address1) ? Address.address1 = item.address[0] || item.address1 || item.Address1 : 0;
            (item.address[1] || item.address2 || item.Address2) ? Address.address2 = item.address[1] || item.address2 || item.Address2 : 0;
            (item.address[3] || item.address3 || item.Address3) ? Address.address3 = item.address[2] || item.address3 || item.Address3 : 0;
            (item.city || item.City) ? Address.city = item.city || item.City : 0;
            (item.country || item.Country) ? Address.country = item.country || item.Country : 0;
            (item.state || item.State) ? Address.state = item.state || item.State : 0;
            
            let NextOfKin = {};
            (item['Next Of Kin Relationship'] || item.nokRelationship) ? NextOfKin.relationship = item['Next Of Kin Relationship'] || item.nokRelationship : 0;
            (item['Next Of Kin Name'] || item.nokName) ? NextOfKin.name = item['Next Of Kin Name'] || item.nokName : 0;
            (item['Next Of Kin Phone'] || item.nokPhone) ? NextOfKin.phone = item['Next Of Kin Phone'] || item.nokPhone : 0;
            (item['Next Of Kin Email'] || item.nokEmail) ? NextOfKin.email = item['Next Of Kin Email'] ||  item.nokEmail : 0;
            (item['Next Of Kin Address'] || item.nokAddress) ? NextOfKin.address = item['Next Of Kin Address'] || item.nokAddress : 0;
            let data = {
               bvn: item.bvn || item.BVN,
               firstName: item.firstName || item['First Name'],
               middleName: item.middleName || item['Middle Name'],
               lastName: item.lastName || item['Last Name'],
               email: item.email || item.Email,
               dob: item.dob || item.DoB,
               gender: (item.gender?.toLowerCase() || item.Gender?.toLowerCase()),//.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() }),
               phone: item.phone?.toString() || item.Phone?.toString(),
               mothersMaidenName: item.mothersMaidenName || item["Mother's Maiden Name"],
               placeOfBirth: item.placeOfBirth || item['Place Of Birth'],
            }
            Object.keys(Address).length === 0 ? 0 :  data['Addresses'] =  [Address];
            Object.keys(NextOfKin).length === 0 ? 0: data['NextOfKins'] =  [NextOfKin];

            result.push(data);
         }
      }
      return result
   }
}