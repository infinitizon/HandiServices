// DROP SCHEMA public CASCADE;
// CREATE SCHEMA public;
// GRANT ALL ON SCHEMA public TO public;

// npx sequelize-cli db:migrate
// npx sequelize-cli db:migrate:undo
const {sqlite} = require('../../models');


module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(sqlite.models.User.tableName, sqlite.models.User.tableAttributes, { transaction })
            console.log('user');            
            await queryInterface.createTable(sqlite.models.Tenant.tableName, sqlite.models.Tenant.tableAttributes, { transaction })
            console.log('tenant');
            await queryInterface.createTable(sqlite.models.Order.tableName, sqlite.models.Order.tableAttributes, { transaction })
            console.log('Order');
            await queryInterface.createTable(sqlite.models.Product.tableName, sqlite.models.Product.tableAttributes, { transaction })
            console.log('product');
            await queryInterface.createTable(sqlite.models.Role.tableName, sqlite.models.Role.tableAttributes, { transaction })
            console.log('role');
            await queryInterface.createTable(sqlite.models.TenantCategory.tableName, sqlite.models.TenantCategory.tableAttributes, { transaction })
            console.log('TenantCategory');
            await queryInterface.createTable(sqlite.models.NextOfKin.tableName, sqlite.models.NextOfKin.tableAttributes, { transaction })
            console.log('NextOfKin ');
            await queryInterface.createTable(sqlite.models.TxnHeader.tableName, sqlite.models.TxnHeader.tableAttributes, { transaction })
            console.log('txnHeader');
            await queryInterface.createTable(sqlite.models.TxnDetail.tableName, sqlite.models.TxnDetail.tableAttributes, { transaction })
            console.log('txnDetail');
            await queryInterface.createTable(sqlite.models.Media.tableName, sqlite.models.Media.tableAttributes, { transaction })
            console.log('Media');
            await queryInterface.createTable(sqlite.models.Address.tableName, sqlite.models.Address.tableAttributes, { transaction })
            console.log('Address');
            await queryInterface.createTable(sqlite.models.OrderAddress.tableName, sqlite.models.OrderAddress.tableAttributes, { transaction })
            console.log('OrderAddress');
            await queryInterface.createTable(sqlite.models.ProductBank.tableName, sqlite.models.ProductBank.tableAttributes, { transaction })
            console.log('ProductBank');
            await queryInterface.createTable(sqlite.models.ProductBankGateway.tableName, sqlite.models.ProductBankGateway.tableAttributes, { transaction })
            console.log('ProductBankGateway');
            await queryInterface.createTable(sqlite.models.ProductCharacter.tableName, sqlite.models.ProductCharacter.tableAttributes, { transaction })
            console.log('ProductCharacter');
            await queryInterface.createTable(sqlite.models.ProductVendorCharacter.tableName, sqlite.models.ProductVendorCharacter.tableAttributes, { transaction })
            console.log('ProductVendorCharacter');
            await queryInterface.createTable(sqlite.models.OrderItem.tableName, sqlite.models.OrderItem.tableAttributes, { transaction })
            console.log('OrderItem');
            await queryInterface.createTable(sqlite.models.Card.tableName, sqlite.models.Card.tableAttributes, { transaction })
            console.log('card');
            await queryInterface.createTable(sqlite.models.Beneficiary.tableName, sqlite.models.Beneficiary.tableAttributes, { transaction })
            console.log('bank');
            await queryInterface.createTable(sqlite.models.TenantUserRole.tableName, sqlite.models.TenantUserRole.tableAttributes, { transaction })
            console.log('TenantUserRole');
            await queryInterface.createTable(sqlite.models.BvnData.tableName, sqlite.models.BvnData.tableAttributes, { transaction })
            console.log('BvnData');
            await queryInterface.createTable(sqlite.models.Token.tableName, sqlite.models.Token.tableAttributes, { transaction })
            console.log('token');
            await queryInterface.createTable(sqlite.models.AuditLogs.tableName, sqlite.models.AuditLogs.tableAttributes, { transaction })
            console.log('AuditLogs');
            await queryInterface.createTable(sqlite.models.Wallet.tableName, sqlite.models.Wallet.tableAttributes, { transaction })
            console.log('Wallet');
            await queryInterface.createTable(sqlite.models.Feedback.tableName, sqlite.models.Feedback.tableAttributes, { transaction })
            console.log('Feedback');
            await queryInterface.createTable(sqlite.models.ChatSession.tableName, sqlite.models.ChatSession.tableAttributes, { transaction })
            console.log('ChatSession');
            await queryInterface.createTable(sqlite.models.ChatMessage.tableName, sqlite.models.ChatMessage.tableAttributes, { transaction })
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