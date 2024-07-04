// DROP SCHEMA public CASCADE;
// CREATE SCHEMA public;
// GRANT ALL ON SCHEMA public TO public;

// npx sequelize-cli db:migrate
// npx sequelize-cli db:migrate:undo
const db = require("../../models");



module.exports = {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.User.tableName, db[process.env.DEFAULT_DB].models.User.tableAttributes, { transaction })
            console.log('user');            
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Tenant.tableName, db[process.env.DEFAULT_DB].models.Tenant.tableAttributes, { transaction })
            console.log('tenant');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Order.tableName, db[process.env.DEFAULT_DB].models.Order.tableAttributes, { transaction })
            console.log('Order');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Product.tableName, db[process.env.DEFAULT_DB].models.Product.tableAttributes, { transaction })
            console.log('product');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Role.tableName, db[process.env.DEFAULT_DB].models.Role.tableAttributes, { transaction })
            console.log('role');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.TenantCategory.tableName, db[process.env.DEFAULT_DB].models.TenantCategory.tableAttributes, { transaction })
            console.log('TenantCategory');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.NextOfKin.tableName, db[process.env.DEFAULT_DB].models.NextOfKin.tableAttributes, { transaction })
            console.log('NextOfKin ');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.TxnHeader.tableName, db[process.env.DEFAULT_DB].models.TxnHeader.tableAttributes, { transaction })
            console.log('txnHeader');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.TxnDetail.tableName, db[process.env.DEFAULT_DB].models.TxnDetail.tableAttributes, { transaction })
            console.log('txnDetail');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Media.tableName, db[process.env.DEFAULT_DB].models.Media.tableAttributes, { transaction })
            console.log('Media');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Address.tableName, db[process.env.DEFAULT_DB].models.Address.tableAttributes, { transaction })
            console.log('Address');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.OrderAddress.tableName, db[process.env.DEFAULT_DB].models.OrderAddress.tableAttributes, { transaction })
            console.log('OrderAddress');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.ProductBank.tableName, db[process.env.DEFAULT_DB].models.ProductBank.tableAttributes, { transaction })
            console.log('ProductBank');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.ProductBankGateway.tableName, db[process.env.DEFAULT_DB].models.ProductBankGateway.tableAttributes, { transaction })
            console.log('ProductBankGateway');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.ProductCharacter.tableName, db[process.env.DEFAULT_DB].models.ProductCharacter.tableAttributes, { transaction })
            console.log('ProductCharacter');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.ProductVendorCharacter.tableName, db[process.env.DEFAULT_DB].models.ProductVendorCharacter.tableAttributes, { transaction })
            console.log('ProductVendorCharacter');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.OrderItem.tableName, db[process.env.DEFAULT_DB].models.OrderItem.tableAttributes, { transaction })
            console.log('OrderItem');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.OrderItemStatus.tableName, db[process.env.DEFAULT_DB].models.OrderItemStatus.tableAttributes, { transaction })
            console.log('OrderItemStatus');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Card.tableName, db[process.env.DEFAULT_DB].models.Card.tableAttributes, { transaction })
            console.log('card');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Beneficiary.tableName, db[process.env.DEFAULT_DB].models.Beneficiary.tableAttributes, { transaction })
            console.log('bank');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.TenantUserRole.tableName, db[process.env.DEFAULT_DB].models.TenantUserRole.tableAttributes, { transaction })
            console.log('TenantUserRole');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.BvnData.tableName, db[process.env.DEFAULT_DB].models.BvnData.tableAttributes, { transaction })
            console.log('BvnData');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Token.tableName, db[process.env.DEFAULT_DB].models.Token.tableAttributes, { transaction })
            console.log('token');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.AuditLogs.tableName, db[process.env.DEFAULT_DB].models.AuditLogs.tableAttributes, { transaction })
            console.log('AuditLogs');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Wallet.tableName, db[process.env.DEFAULT_DB].models.Wallet.tableAttributes, { transaction })
            console.log('Wallet');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.Feedback.tableName, db[process.env.DEFAULT_DB].models.Feedback.tableAttributes, { transaction })
            console.log('Feedback');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.ChatSession.tableName, db[process.env.DEFAULT_DB].models.ChatSession.tableAttributes, { transaction })
            console.log('ChatSession');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.ChatSessionAdminClaim.tableName, db[process.env.DEFAULT_DB].models.ChatSessionAdminClaim.tableAttributes, { transaction })
            console.log('ChatSessionAdminClaim');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.ChatMessage.tableName, db[process.env.DEFAULT_DB].models.ChatMessage.tableAttributes, { transaction })
            console.log('ChatMessage');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.SecurityQuestion.tableName, db[process.env.DEFAULT_DB].models.SecurityQuestion.tableAttributes, { transaction })
            console.log('SecurityQuestion');
            await queryInterface.createTable(db[process.env.DEFAULT_DB].models.UserSecurityQuestion.tableName, db[process.env.DEFAULT_DB].models.UserSecurityQuestion.tableAttributes, { transaction })
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