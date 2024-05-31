/* eslint-disable camelcase */
const Vendors = {
   verifymeService: require('./verifyme.service'),
   paystackService: require('./gateways/paystack.service'),
};
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../../config/apiError')
const { postgres } = require('../../database/models');


class VerificationsService {
   constructor({vendor, initialize}) {
      this.vendor = new Vendors[vendor+'Service']({initialize});
      console.log(this.vendor)
   }
   async verifyBVN ({ bvn, dob, firstname, lastname, refresh }) {
      try {
         const bvnExists = await postgres.models.User.findOne({ where: { bvn } });
         if (bvnExists)
            throw new AppError('A user is already signed up with this bvn', __line, __path.basename(__filename), { status: 409, show: true })

         const bvnDataExists = await postgres.models.BvnData.findOne({where: {bvn}});

         if (bvnDataExists && !refresh) {
            const data = this.renameBVNParams(bvnDataExists.bvn_response);
            if (bvnDataExists.isVerified ){
               return { success: true, status: 200, data, };
            }

            let formattedDOB = moment(dob, 'DD-MM-YYYY').format('DDMMYYYY');
            
            let formattedBVNDate = bvnDataExists.bvn_response?.birthdate.replace(/-/g, '');
            if (formattedDOB != formattedBVNDate)
               throw new AppError('Entered date of birth does not match bvn details', __line, __path.basename(__filename), { status: 403, show: true });

            bvnDataExists.update({isVerified: true})
            return {
               success: true,
               data,
            };
         }
         const vendorData = await this.vendor.verifyBVN(bvn, firstname, lastname, refresh)

         if(!vendorData.success) throw new AppError(vendorData.message, __line, __path.basename(__filename), { status: 409, show: true })
         let bvnData;

         if (bvnDataExists) {
            await bvnDataExists.update({ bvn_response: vendorData.data });
            bvnData = bvnDataExists;
         } else {
            bvnData = await postgres.models.BvnData.create({
               id: uuidv4(),
               bvn,
               bvn_response: vendorData.data,
            });
         }
       
         // Check if date of birth matches BVN details
         const formattedDOB = moment(dob, 'DD-MM-YYYY').format('DDMMYYYY');
         const formattedBVNDate = vendorData.data.birthdate.replace(/-/g, '');
       
         if (formattedDOB !== formattedBVNDate) {
            // Mark BVN data as not verified
            await bvnData.update({ isVerified: false });
       
            throw new AppError('Entered date of birth does not match BVN details', __line, __filename, {
               status: 403,
               show: true,
            });
         }
         return {...vendorData, status: 200, message: 'BVN data retrieved successfully', data: this.renameBVNParams(vendorData.data)};
      } catch (error) {
         console.log(error.message);
         return new AppError(
            error.success==false?error.message:`Kindly input a valid BVN/DoB or contact support for assistance`
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async verifyNUBAN ({ userId, nuban, bankCode, }) {
      try {
         const verified = await this.vendor.verifyNUBAN({ nuban, bankCode })
         if (!verified.success) throw new AppError(verified.message, __line, __path.basename(__filename), { status: verified.status });

         if(userId) {
            const customer = await postgres.models.User.findByPk(userId, {
               attributes: ['firstName', 'middleName', 'lastName'],
            })
            const bankAccountName = verified.data.accountName.split(" ");
            let found = 0;
            bankAccountName.forEach(name => {
               [customer.firstName ?? '', customer.middleName ?? '', customer.lastName ?? ''].forEach(cName => {
                  if (cName && (name?.trim()?.toLowerCase() == cName?.trim()?.toLowerCase())) found++;
               })
            });
            if (found < 2) throw new AppError('The BVN name does not match the bank name', __line, __path.basename(__filename), { status: 400, show: true});
         }
         return verified;
         
      } catch (error) {
         console.log(error.message);
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async getBankList () {
      try {
         const bankResponse = await this.vendor.getBankList({});
         if (!bankResponse.success) throw new AppError(bankResponse.message, __line, __path.basename(__filename), { status: bankResponse.status });

         const {banks, ...rest} = bankResponse;
         return { ...rest, data: banks, };
         
      } catch (error) {
         console.log(error.message);
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   renameBVNParams (data={}) {
      const newKeyMap = {
         firstname: 'firstName',
         middlename: 'middleName',
         lastname: 'lastName',
         enrollment_bank: 'enrollmentBank',
         enrollment_branch: 'enrollmentBranch',
         birthdate: 'dateOfBirth',
         id: 'user_id',
         level_of_account: 'levelOfAccount',
         lga_of_origin: 'lgaOfOrigin',
         lga_of_residence: 'lgaOfResidence',
         marital_status: 'maritalStatus',
         name_on_card: 'nameOnCard',
         phone: 'phoneNumber',
         photo: 'image',
         registration_date: 'registrationDate',
         residential_address: 'residentialAddress',
         state_of_origin: 'stateOfOrigin',
         state_of_residence: 'stateOfResidence',
         watch_listed: 'watchlisted',
      }
      const keyValues = Object.keys(data).map(key => {
         const newKey = newKeyMap[key] || key;
         return { [newKey]: data[key] };
       });
       return Object.assign({}, ...keyValues);
   }
}
module.exports = VerificationsService;
