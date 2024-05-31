const axios = require('axios').default;
require('dotenv').config();
const AppError = require('../../../config/apiError')

// const { postgres, Sequelize } = require('../../../database/models');
// const moment = require("moment");

class VerifymeService {
    
    getHeaders () {
        return {'Authorization': `Bearer ${process.env.VERIFYME_KEY}`}
    }
    postHeaders () {
        return {
            'Authorization': `Bearer ${process.env.VERIFYME_KEY}`,
            'Content-Type': 'application/json'
        }
    }
    async verifyNIN (nin, firstname, lastname) {
        try {
            let body = {
                firstname,
                lastname
            }
            const response = await axios.request({
                url: `https://vapi.verifyme.ng/v1/verifications/identities/nin/${nin}`,
                method: 'POST',
                headers: this.postHeaders(),
                data: JSON.stringify(body)
            })
            return response.data;
        } catch (error) {
            console.error(error);
            return;
        }
    }
    async verifyBVN (bvn, firstname, lastname, ) {
        try {

            firstname = firstname??'firstname';
            lastname = lastname??'lastname';

            const response = await axios.request({
                url: `${process.env.VERIFYME_BVN_ENDPOINT}/${bvn}?type=premium`,
                method: 'POST',
                headers: this.postHeaders(),
                timeout: 3000,
                data: JSON.stringify({
                    firstname,
                    lastname
                })
            });
            if (response?.status !== 201)
                throw new AppError('Failed to retrieve BVN record', __line, __path.basename(__filename), { status: 404, show: true });

            return {
                success: true,
                data: response?.data?.status==='success' ? response?.data.data : null
            };
        } catch (error) {
            console.error(error);
           
            return new AppError(
                    error.message
                    , error.line||__line, error.file||__path.basename(__filename), {name: error.name, status: error.status??500, show: error.show})
        }
    }
}
module.exports = VerifymeService;
