
const axios = require('axios');
const HttpStatus = require('http-status');
const AppError = require("../../config/apiError");
const db = require("../../database/models");

class AddressService {
   async getAddresses ({ userId, }) {
      try {
         const addresses = await db[process.env.DEFAULT_DB].models.Address.findAndCountAll({
            where: {commonId: userId},
            order: [[db.Sequelize.literal(`(case when is_active then 1 when is_active is null then 2 else 3 end) asc`)]]
         });
         return {success: true, status: HttpStatus.OK, message: "Address(es) fetched successfully", total: addresses.count, data: addresses.rows,};
      } catch (error) {
         console.error(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }
   async getAddress ({ addressId }) {
      try {
         const address = await db[process.env.DEFAULT_DB].models.Address.findByPk(addressId);
         return {success: true, status: HttpStatus.OK, data: address, message: "Address fetched successfully"};
      } catch (error) {
         console.error(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }
   async addAddress ({ user, phone, houseNo, address1, address2, city, country, state, lga, lat, lng, isDefault=true, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const addresses = await user.getAddresses();
         if(isDefault && addresses.length > 0) {
            for(const addy of addresses) {
               await addy.update({isActive: false}, { transaction: t });
            }
         }
         const address = await user.createAddress({
            phone, houseNo, address1, address2, city, country, state, lga, lat, lng,
            isActive: (isDefault?isDefault:addresses.length === 0)
         }, { transaction: t });

         transaction ? 0 : await t.commit();
         return {success: true, status: HttpStatus.CREATED, data: address, message: "Address created successfully"};
      } catch (error) {
         transaction ? 0 : await t.rollback();
         console.error(error.message);
         return new AppError(
                     error.message
                     , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
               );
      }
   }
   async updateAddress ({ id, phone, houseNo, address1, address2, city, country, state, lga, lat, lng, isActive=true, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         let updates = {}
         phone ? updates['phone'] = phone : 0;
         houseNo ? updates['houseNo'] = houseNo : 0;
         address1 ? updates['address1'] = address1 : 0;
         address2 ? updates['address2'] = address2 : 0;
         city ? updates['city'] = city : 0;
         country ? updates['country'] = country : 0;
         state ? updates['state'] = state : 0;
         lga ? updates['lga'] = lga : 0;
         lat ? updates['lat'] = lat : 0;
         lng ? updates['lng'] = lng : 0;

         const address = await db[process.env.DEFAULT_DB].models.Address.findByPk(id);
         
         if(address.isActive != isActive) {
            await db[process.env.DEFAULT_DB].models.Address.update({
               isActive: !isActive
            },
               {
               where: { commonId: address.commonId, commonType: address.commonType },
               transaction: t
            });
            updates['isActive'] = isActive;
         }
         await address.update(updates, { transaction: t });

         transaction ? 0 : await t.commit();
         return {success: true, status: HttpStatus.OK, message: "Address updated successfully", data: address};
      } catch (error) {
         transaction ? 0 : await t.rollback();
         console.error(error.message);
         return new AppError(
               error.message
               , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async deleteAddress({ id, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const addyExists = await this.getAddress({ addressId: id });
         if (!addyExists || !addyExists.success) 
            throw new AppError(addyExists.message, addyExists.line||__line, addyExists.file||__path.basename(__filename), { status: addyExists.status||404, show: addyExists.show });

         await addyExists.data.destroy({force: true})
         
         transaction ? 0 : await t.commit();
         return { ...addyExists, message: "Address deleted successfully" };
      } catch (error) {
         transaction ? 0 : await t.rollback();
         console.error(error.message);
         return new AppError(
               error.message
               , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }

   }
   async getCountries () {
      try {
         const response = await axios.request({
            method: 'GET',
            url: `https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode,iso2,iso3`,
         });
         response.data.data.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

         return {success: true, status: HttpStatus.OK, message: `Countries retrieved successfully`, data: response.data.data};
      } catch (error) {
         console.error(error.message);
         return new AppError(
               error.message
               , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
   async getCountryStates (countryCode) {
      try {
         const response = await axios.request({
            method: 'POST',
            url: `https://countriesnow.space/api/v0.1/countries/states`,
            data: JSON.stringify({iso2: countryCode?.toUpperCase()}),
            headers: {
               'Content-Type': 'application/json',
            },
         });

         response.data.data?.states?.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);
         return {success: true, status: HttpStatus.OK, message: `States for ${response.data.data?.name} retrieved successfully`, data: response.data.data?.states};
      } catch (error) {
         console.error(error.message);
         return new AppError(
            error.message
            , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show}
         );
      }
   }
}
module.exports = AddressService;