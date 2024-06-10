// npx sequelize-cli db:seed                            -- Seeds admin only
// npx sequelize-cli db:seed --seed seed-all-data.js    -- Seeds admin only
const { v4: uuidv4 } = require('uuid');
/**
// All customers will be automatically added to tenant super admin
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.bulkInsert('products', [
                { id: '04ce6078-a792-4c68-ac3c-132675693f26', type: '100', title: 'Laundry', summary: 'All manner of laundry services', created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), type: '100', title: 'Car Services', summary: 'Look for a good mechanic', created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), type: '100', title: 'Body Care', summary: 'Pedicure, Manicure, facials and more', created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), type: '100', title: 'Construction', summary: 'From bricklaying to finishing and homes to roads', created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), p_id: '04ce6078-a792-4c68-ac3c-132675693f26', type: '101', title: 'Dry Cleaning', summary: 'From bricklaying to finishing and homes to roads', created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), p_id: '04ce6078-a792-4c68-ac3c-132675693f26', type: '101', title: 'Washed and Ironed', summary: 'From bricklaying to finishing and homes to roads', created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), p_id: '04ce6078-a792-4c68-ac3c-132675693f26', type: '101', title: 'Washing alone', summary: 'From bricklaying to finishing and homes to roads', created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), p_id: '04ce6078-a792-4c68-ac3c-132675693f26', type: '101', title: 'Sheets and Duvet', summary: 'From bricklaying to finishing and homes to roads', created_at: new Date(), updated_at: new Date() },
                { id: '9b142bf3-f0d9-43be-9bdb-e3fab4e4c4f6', type: '103', title: 'Simply for Wallet', summary: 'Will help us hold wallet conection', created_at: new Date(), updated_at: new Date() },
            ], {transaction}),
            console.log('Products seeded')
            await queryInterface.bulkInsert('tenants', [
                { id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', name: 'Super Admin', email: 'infinitizon@gmail.com', phone: '+2347065731242'
                , is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date()  },
                { id: '274b082e-5257-497b-ae13-56e315955eec', p_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', name: 'Laundry 1', email: 'infinitizon+1@gmail.com', phone: '+2347065731242'
                , is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date()  },
                { id: '65e9d192-e7d6-4f8d-89a2-e0c79f3f7801', p_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', name: 'Hair Dresser', email: 'infinitizon+2@gmail.com', phone: '+2347065422242'
                , is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date()  },
            ], {transaction}),
            console.log('Tenants seeded')
            await queryInterface.bulkInsert('users', [
                { id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',  bvn: '12345678902', first_name: 'Super', last_name: 'Admin', email: 'infinitizon+3@gmail.com'
                , password: '$2a$10$Bg8dRZwJP5hBR75DgrVQHeeE3TkokdLIUEnYW0Db0E8DnVxf7o0wO', ref_code: 'SA123', is_enabled: true, is_locked: false
                , created_at: new Date(), updated_at: new Date() },
                { id: '96c6133d-6a77-49a2-a690-35a65defd608',  bvn: '12345678901', first_name: 'Olisa', last_name: 'Anderson', email: 'handiservicesltd@gmail.com'
                , password: '$2a$10$Bg8dRZwJP5hBR75DgrVQHeeE3TkokdLIUEnYW0Db0E8DnVxf7o0wO', ref_code: 'OA123', is_enabled: true, is_locked: false
                , created_at: new Date(), updated_at: new Date() },
                { id: '30e6b26b-4363-4c2a-ade2-ce97b1144d39',  bvn: '12345258901', first_name: 'Laundry', last_name: 'One', email: 'infinitizon+4@gmail.com'
                , password: '$2a$10$Bg8dRZwJP5hBR75DgrVQHeeE3TkokdLIUEnYW0Db0E8DnVxf7o0wO', ref_code: 'LO123', is_enabled: true, is_locked: false
                , created_at: new Date(), updated_at: new Date() },
                { id: '062a83db-6764-41dd-aceb-fa454172e867',  bvn: '42536264533', first_name: 'Customer', last_name: 'One', email: 'infinitizon+5@gmail.com'
                , password: '$2a$10$Bg8dRZwJP5hBR75DgrVQHeeE3TkokdLIUEnYW0Db0E8DnVxf7o0wO', ref_code: 'CO123', is_enabled: true, is_locked: false
                , created_at: new Date(), updated_at: new Date() },
            ], {transaction}),
            console.log('Users seeded')
            await queryInterface.bulkInsert('roles', [
                { id: '302320b8-8417-4f09-bb70-15af7dfa8342',  name: 'SUPER_ADMIN', description: 'Handles the overall system duties', },
                { id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc',  name: 'PROVIDER_ADMIN', description: 'Manages tenant', },
                { id: uuidv4(),  name: 'PROVIDER', description: 'An officer in a tenant', },
                { id: 'e5f8395a-a2b1-452b-9beb-0a8ba94a023c',  name: 'CUSTOMER', description: 'A simple customer in a tenant', },
            ], {transaction}),
            console.log('Roles seeded')
            await queryInterface.bulkInsert('wallets', [
                { id: uuidv4(), user_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a',  currency: 'NGN', total: 0, is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), user_id: '30e6b26b-4363-4c2a-ade2-ce97b1144d39',  currency: 'NGN', total: 0, is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), user_id: '062a83db-6764-41dd-aceb-fa454172e867',  currency: 'NGN', total: 0, is_enabled: true, is_locked: false, created_at: new Date(), updated_at: new Date() },
            ], {transaction}),
            console.log('Wakket seeded')
            await queryInterface.bulkInsert('addresses', [
                { id: uuidv4(), common_type: 'tenant', common_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', house_no: '17', address1: 'Ramoni St', address2: 'Surulere', city: 'Ikate', lga: 'Surulere', country: 'NG', state: 'LA', lat: 6.50987330616208, lng: 3.34048703377835, created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), common_type: 'tenant', common_id: '274b082e-5257-497b-ae13-56e315955eec', house_no: '10', address1: 'Asa-Afariogun St', address2: 'Ajao Estate', city: 'Ajao Estate', lga: 'Oshodi-Isolo', country: 'NG', state: 'LA', lat: 6.54761516453506, lng: 3.33109511428974, created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), common_type: 'tenant', common_id: '65e9d192-e7d6-4f8d-89a2-e0c79f3f7801', house_no: '3', address1: 'Ifateludo St', address2: 'Gbagada', city: 'Gbagada', lga: 'Kosofe', country: 'NG', state: 'LA', lat: 6.55338558558611, lng: 3.3915173296401, created_at: new Date(), updated_at: new Date() },
            ], {transaction}),
            console.log('addresses seeded')
            await queryInterface.bulkInsert('tenant_categories', [
                { id: uuidv4(), tenant_id: '274b082e-5257-497b-ae13-56e315955eec', product_id: '04ce6078-a792-4c68-ac3c-132675693f26', created_at: new Date(), updated_at: new Date() },
            ], {transaction}),
            console.log('tenant_categories seeded')
            await queryInterface.bulkInsert('tenant_user_roles', [
                { role_id: '302320b8-8417-4f09-bb70-15af7dfa8342',  user_id: '646d4127-1c58-4ba0-a4a1-6943f178d16a', tenant_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', },
                { role_id: '302320b8-8417-4f09-bb70-15af7dfa8342',  user_id: '96c6133d-6a77-49a2-a690-35a65defd608', tenant_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', },
                { role_id: '79a62264-88b5-46e7-9bcc-b5cf0e2580cc',  user_id: '30e6b26b-4363-4c2a-ade2-ce97b1144d39', tenant_id: '274b082e-5257-497b-ae13-56e315955eec', },
                { role_id: 'e5f8395a-a2b1-452b-9beb-0a8ba94a023c',  user_id: '062a83db-6764-41dd-aceb-fa454172e867', tenant_id: '77fa1eed-bbc8-4ae7-9237-0bec880b513d', },
            ], {transaction}),
            console.log('tenant_user_roles seeded')
            await queryInterface.bulkInsert('product_banks', [
                { id: '94551542-d519-4779-8a44-8c79e0a87f5d', common_type: 'product', common_id: '9b142bf3-f0d9-43be-9bdb-e3fab4e4c4f6', bank_name: 'Access Bank', name_on_account: 'Wallet', account_number: '0707296070', bank_code: '044', created_at: new Date(), updated_at: new Date() },
            ], {transaction}),
            console.log('product-banks seeded')
            await queryInterface.bulkInsert('product_bank_gateways', [
                { id:'5dc61ed4-0a51-424e-bd18-6d5a068e83bb', product_bank_id: '94551542-d519-4779-8a44-8c79e0a87f5d', gateway: 'paystack', sub_account_id: 'ACCT_kjejn79f8qh88yq', created_at: new Date(), updated_at: new Date() },
            ], {transaction}),
            console.log('product_bank_gateways seeded')
            await queryInterface.bulkInsert('product_xters', [
                { id: uuidv4(), product_id: '04ce6078-a792-4c68-ac3c-132675693f26', name: 'Shirt', type: 'inc_dcr', min_price: 10, max_price: 400, created_at: new Date(), updated_at: new Date() },
                { id: uuidv4(), product_id: '04ce6078-a792-4c68-ac3c-132675693f26', name: 'Pantalons', type: 'inc_dcr', min_price: 100, max_price: 1500, created_at: new Date(), updated_at: new Date() },
            ], {transaction}),
            console.log('product_xters seeded')

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.log(error.message);
            console.log(error);
        }
    },
    down: async (queryInterface) => {
      await queryInterface.bulkDelete('admins', {});
      await queryInterface.bulkDelete('gl_entity_txn_type', {});
      await queryInterface.bulkDelete('saveplan_calculator_types', {});
    }
};