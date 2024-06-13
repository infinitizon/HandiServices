// DROP SCHEMA public CASCADE;
// CREATE SCHEMA public;
// GRANT ALL ON SCHEMA public TO public;

// npx sequelize-cli db:migrate
// npx sequelize-cli db:migrate:undo
const {postgres} = require('../../models');


module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(postgres.models.User.tableName, postgres.models.User.tableAttributes, { transaction })
            console.log('user');            
            await queryInterface.createTable(postgres.models.Tenant.tableName, postgres.models.Tenant.tableAttributes, { transaction })
            console.log('tenant');
            await queryInterface.createTable(postgres.models.Order.tableName, postgres.models.Order.tableAttributes, { transaction })
            console.log('Order');
            await queryInterface.createTable(postgres.models.Product.tableName, postgres.models.Product.tableAttributes, { transaction })
            console.log('product');
            await queryInterface.createTable(postgres.models.Role.tableName, postgres.models.Role.tableAttributes, { transaction })
            console.log('role');
            await queryInterface.createTable(postgres.models.TenantCategory.tableName, postgres.models.TenantCategory.tableAttributes, { transaction })
            console.log('TenantCategory');
            await queryInterface.createTable(postgres.models.NextOfKin.tableName, postgres.models.NextOfKin.tableAttributes, { transaction })
            console.log('NextOfKin ');
            await queryInterface.createTable(postgres.models.TxnHeader.tableName, postgres.models.TxnHeader.tableAttributes, { transaction })
            console.log('txnHeader');
            await queryInterface.createTable(postgres.models.TxnDetail.tableName, postgres.models.TxnDetail.tableAttributes, { transaction })
            console.log('txnDetail');
            await queryInterface.createTable(postgres.models.Media.tableName, postgres.models.Media.tableAttributes, { transaction })
            console.log('Media');
            await queryInterface.createTable(postgres.models.Address.tableName, postgres.models.Address.tableAttributes, { transaction })
            console.log('Address');
            await queryInterface.createTable(postgres.models.OrderAddress.tableName, postgres.models.OrderAddress.tableAttributes, { transaction })
            console.log('OrderAddress');
            await queryInterface.createTable(postgres.models.ProductBank.tableName, postgres.models.ProductBank.tableAttributes, { transaction })
            console.log('ProductBank');
            await queryInterface.createTable(postgres.models.ProductBankGateway.tableName, postgres.models.ProductBankGateway.tableAttributes, { transaction })
            console.log('ProductBankGateway');
            await queryInterface.createTable(postgres.models.ProductCharacter.tableName, postgres.models.ProductCharacter.tableAttributes, { transaction })
            console.log('ProductCharacter');
            await queryInterface.createTable(postgres.models.ProductVendorCharacter.tableName, postgres.models.ProductVendorCharacter.tableAttributes, { transaction })
            console.log('ProductVendorCharacter');
            await queryInterface.createTable(postgres.models.OrderItem.tableName, postgres.models.OrderItem.tableAttributes, { transaction })
            console.log('OrderItem');
            await queryInterface.createTable(postgres.models.Card.tableName, postgres.models.Card.tableAttributes, { transaction })
            console.log('card');
            await queryInterface.createTable(postgres.models.Beneficiary.tableName, postgres.models.Beneficiary.tableAttributes, { transaction })
            console.log('bank');
            await queryInterface.createTable(postgres.models.TenantUserRole.tableName, postgres.models.TenantUserRole.tableAttributes, { transaction })
            console.log('TenantUserRole');
            await queryInterface.createTable(postgres.models.BvnData.tableName, postgres.models.BvnData.tableAttributes, { transaction })
            console.log('BvnData');
            await queryInterface.createTable(postgres.models.Token.tableName, postgres.models.Token.tableAttributes, { transaction })
            console.log('token');
            await queryInterface.createTable(postgres.models.AuditLogs.tableName, postgres.models.AuditLogs.tableAttributes, { transaction })
            console.log('AuditLogs');
            await queryInterface.createTable(postgres.models.Wallet.tableName, postgres.models.Wallet.tableAttributes, { transaction })
            console.log('Wallet');
            await queryInterface.createTable(postgres.models.Feedback.tableName, postgres.models.Feedback.tableAttributes, { transaction })
            console.log('Feedback');
            await queryInterface.createTable(postgres.models.ChatSession.tableName, postgres.models.ChatSession.tableAttributes, { transaction })
            console.log('ChatSession');
            await queryInterface.createTable(postgres.models.ChatMessage.tableName, postgres.models.ChatMessage.tableAttributes, { transaction })
            console.log('ChatMessage');
            await queryInterface.createTable(sqlite.models.SecurityQuestion.tableName, sqlite.models.SecurityQuestion.tableAttributes, { transaction })
            console.log('SecurityQuestion');
            await queryInterface.createTable(sqlite.models.UserSecurityQuestion.tableName, sqlite.models.UserSecurityQuestion.tableAttributes, { transaction })
            console.log('UserSecurityQuestion');
            
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            console.log(error.message);
            console.log(error);
        }
    },

    // async down(queryInterface, Sequelize) {
    //     await queryInterface.removeIndex('entry', 'create_date_username');
    //     await queryInterface.removeIndex('entry', 'username');
    //     await queryInterface.removeIndex('entry', 'source_id_source_type');
    // }
};