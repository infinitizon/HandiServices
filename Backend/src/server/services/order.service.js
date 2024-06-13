const db = require('../../database/models');
const axios = require('axios');
const Pagination = require('../utils/pagination')
const AppError = require("../../config/apiError");

class OrderService {
   async createOrder({ auth, params, orders, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const existingOrder = await db[process.env.DEFAULT_DB].models.Order.findOne({where: {userId: auth.userId, tenantId: params.tenantId, status: 'pending'}});
         let cOrder = [];
         for(const o in orders) {
            let ord = {
               prodVendorXter: o,
               value: orders[o],
            }
            cOrder.push(ord);
         }
         
         let created;
         if(existingOrder) {
            for(const o of cOrder) {
               const oi = await db[process.env.DEFAULT_DB].models.OrderItem.findOrCreate({
                  where: {prodVendorXter: o.prodVendorXter},
                  defaults: {
                     value: o.value,
                  },
                  transaction: t
               },);
               if(oi[1]) {
                  await existingOrder.addOrderItems(oi[0], {
                     include: [db[process.env.DEFAULT_DB].models.OrderItem],
                     transaction: t
                  });
               } else {
                  await oi[0].update({value: +oi[0].value + +o.value}, {transaction: t})
               }
            }
            console.log(existingOrder);
         } else {
            const order = {
               userId: auth.userId,
               tenantId: params.tenantId,
               OrderItems: cOrder,
            }
            created = await db[process.env.DEFAULT_DB].models.Order.create(order, {
               include: [db[process.env.DEFAULT_DB].models.OrderItem],
               transaction: t
            });
         }
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Order created successfully`, data: created }
      } catch (error) {
         console.error(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async updateOrder({ order, transaction }) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction();
      try {
         const existingOrder = await db[process.env.DEFAULT_DB].models.OrderItem.findByPk(order.orderId);
         if(!existingOrder)
            throw new AppError(`Order with id: ${order.orderId} does not exist`, __line, __path.basename(__filename), { status: 404, show: true });

         await existingOrder.update({value: order.value}, { transaction: t })
         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Order updated successfully` }
      } catch (error) {
         console.error(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async getOrder({ orderId, }) { 
      try {
         let order = await db[process.env.DEFAULT_DB].models.Order.findByPk(orderId, {
            attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
            duplicating: false,
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.OrderItem,
                  duplicating: false,
                  attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
               },
            ], 
         });
         return { success: true, status: 200, message: `Orders fetched successfully`, data: order }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   
   async getOrders({ auth, tenantId, query={} }) { 
      try {
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         let orders = await db[process.env.DEFAULT_DB].models.Order.findAndCountAll({
            attributes: [
               "id", "status",
               [db.Sequelize.literal(`SUM("OrderItems->ProductVendorCharacter".price * cast("OrderItems".value as double precision))`), 'amount'], 
               [db.Sequelize.literal(`COUNT("OrderItems"."order_id")`), 'totalItems'], 
               "createdAt"
            ],
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.User,
                  attributes: ['id', 'firstName', 'middleName', 'lastName'],
                  duplicating: false,
                  // include: [
                  //    {
                  //       model: db[process.env.DEFAULT_DB].models.Address,
                  //       attributes: ['id'],
                  //       duplicating: false,
                  //    }
                  // ],
               },
               {
                  model: db[process.env.DEFAULT_DB].models.Tenant,
                  attributes: ['id', 'name'],
                  duplicating: false,
                  // include: [
                  //    {
                  //       model: db[process.env.DEFAULT_DB].models.Address,
                  //       attributes: ['id'],
                  //       duplicating: false,
                  //    }
                  // ],
               },
               {
                  model: db[process.env.DEFAULT_DB].models.OrderItem,
                  attributes: [],
                  duplicating: false,
                  include: [
                     {
                        model: db[process.env.DEFAULT_DB].models.ProductVendorCharacter, attributes: [],
                        duplicating: false,
                     }
                  ],
               },
               {
                  model: db[process.env.DEFAULT_DB].models.Address, through: { attributes: [] },
                  as: 'Addresses',
                  duplicating: false,
               },
            ],
            where: { ...(tenantId && { tenantId }), ...(query.userId && {userId: query.userId}) },
            limit, offset,
            group: [`"Order"."id"`, `"User"."id"`, `"Tenant"."id"`, `"Addresses"."id"`],
            order: [['createdAt', 'DESC']],
         });
         orders?.rows?.forEach(element => {            
            element.dataValues.availableOrderStatus = this.getAvailableOrderStatuses(auth.role, element.status)
         });
         return { success: true, status: 200, message: `Orders fetched successfully`, count: orders?.count[0]?.count, data: orders?.rows }
         // let condition = 'WHERE o."deleted_at" IS NULL ';
         // if(tenantId) {
         //    condition += ` AND o."tenant_id"='${tenantId}' `
         // }
         // if(query.orderId) {
         //    condition += ` AND o."id"='${query.orderId}' `
         // }
         // if(query.userId) {
         //    condition += ` AND o."user_id"='${query.userId}' `
         // }
         
         // let moreJoin = ``;
         // let group = ``;
         // let qOrders = `
         //    SELECT {{fields}}
         //    FROM "orders" o
         //       INNER JOIN "users" u ON o."user_id" = u."id" AND (u."deleted_at" IS NULL) 
         //       INNER JOIN "tenants" t ON o."tenant_id" = t."id" AND (t."deleted_at" IS NULL) 
         //       LEFT OUTER JOIN "addresses" ua ON u."id" = ua."common_id" AND (ua."deleted_at" IS NULL AND ua."is_active" = true AND ua."common_type" = 'user') 
         //       LEFT OUTER JOIN "addresses" ta ON t."id" = ta."common_id" AND (ta."deleted_at" IS NULL AND ua."is_active" = true AND ta."common_type" = 'tenant') 
         //       {{moreJoin}}
         //       ${condition} 
         //       {{group}}
         // `;
         // let countQuery = qOrders.replace(/{{condition}}/g, condition);
         // countQuery = countQuery.replace(/{{fields}}/g, `COUNT(o.id) as count`);
         // countQuery = countQuery.replace(/{{moreJoin}}/g, moreJoin);
         // countQuery = countQuery.replace(/{{group}}/g, group);
         // const countOrders = await db[process.env.DEFAULT_DB].query(countQuery, {
         //    type: Sequelize.QueryTypes.SELECT,
         // });
         
         // moreJoin = `
         //    INNER JOIN "order_items" oi ON o."id" = oi."order_id" AND (oi."deleted_at" IS NULL)
         //    INNER JOIN "product_vendor_xters" pvx ON oi."prod_vendor_xter" = pvx."id" AND (pvx."deleted_at" IS NULL)
         // `;
         // group = `GROUP BY o."id",u."id",t."id",ua."id",ta."id"`;
         // qOrders = qOrders.replace(
         //    /{{fields}}/g,
         //    `o."id", SUM(cast(oi.value as double precision) * pvx.price) amount, COUNT(oi."order_id") totalItems, o."status", o."created_at" AS "createdAt"
         //    , u."id" AS "User.id", u."first_name" AS "User.firstName", u."middle_name" AS "User.middleName", u."last_name" AS "User.lastName", ua."id" AS "User.Addresses.id"
         //    , t."id" AS "Tenant.id", t."name" AS "Tenant.name"
         //    , ta."id" AS "Tenant.Addresses.id"
         //    , (point(ta.lat, ta.lng) <-> point(ua.lat, ua.lng))*111.325*1.60934 AS "User.Addresses.distance"`
         // );
         // qOrders = qOrders.replace(/{{moreJoin}}/g, moreJoin);
         // qOrders = qOrders.replace(/{{group}}/g, group);
         // qOrders = `${qOrders} ORDER BY "createdAt" ASC OFFSET ${offset} LIMIT ${limit}`;
         // const rOrders = await db[process.env.DEFAULT_DB].query(qOrders, {
         //    nest: true,
         //    type: Sequelize.QueryTypes.SELECT,
         // });
         // rOrders.forEach(element => {            
         //    element.availableOrderStatus = this.getAvailableOrderStatuses(auth.role, element.status)
         // });
         // return { success: true, status: 200, message: `Orders fetched successfully`, count: countOrders[0]?.count, data: rOrders }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   
   getAvailableOrderStatuses (role, currentStatus) {
      let availableOrderStatus;
      if(role==='CUSTOMER') {
         switch (currentStatus) {
            case 'pending':
            case 'placed':
               availableOrderStatus = [{key:'cancelled', name: 'Cancel'}];
               break;
            case 'done':
               availableOrderStatus = [{key:'completed', name: 'Complete'}];
               break;
         }
      } else {
         switch (currentStatus) {
            case 'pending':
               availableOrderStatus = [{key:'failed', name: 'Reject'}, {key:'placed', name: 'Accept'}];
               break;
            case 'failed':
               availableOrderStatus = [{key:'failed', name: 'Reject'}];
               break;
            case 'placed':
               availableOrderStatus = [{key:'inprogress', name: 'In Progress'}, {key:'done', name: 'Done'}];
               break;
            case 'inprogress':
               availableOrderStatus = [{key:'done', name: 'Done'}];
               break;
         }
      }
      return availableOrderStatus
   }
   async getOrderDetails({ userId, orderId, tenantId, query={} }) { 
      try {
         const { limit, offset } = Pagination.getPagination(query.page, query.perPage);
         let orders = await db[process.env.DEFAULT_DB].models.OrderItem.findAndCountAll({
            attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
            duplicating: false,
            include: [
               {
                  model: db[process.env.DEFAULT_DB].models.Order,
                  duplicating: false,
                  attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
                  include: [
                     {
                        model: db[process.env.DEFAULT_DB].models.User,
                        attributes: ['id', 'firstName', 'middleName', 'lastName'],
                     }
                  ],
                  where: { ...(orderId && {id: orderId}), ...(userId && {userId}), ...(query.status && {status: query.status}) },
               },
               {
                  model: db[process.env.DEFAULT_DB].models.ProductVendorCharacter,
                  include: [
                     {
                        model: db[process.env.DEFAULT_DB].models.ProductCharacter,
                        attributes: { exclude: [ 'updatedAt', 'deletedAt' ]},
                     }
                  ],
                  where: { ...(tenantId && {vendorId: tenantId}) },
               }
            ],
            limit, offset,
            order: [['createdAt', 'DESC']],
         });
         return { success: true, status: 200, message: `Orders fetched successfully`, count: orders?.count, data: orders?.rows }
      } catch (error) {
         console.log(error.message)
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )
      }
   }
   async call3rdPartyServices ({authorization, uuidToken, data}) {
      try {
         const response = await axios.request({
            method: 'POST',
            url: `${process.env.BACKEND_BASE}/3rd-party-services/payment/initiate`,
            data: JSON.stringify(data),
            headers: {
               "Content-Type": "application/json",
               "authorization": authorization,
               "x-uuid-token": uuidToken
            }
         });
         return response.data;
      } catch (error) {
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )      
      }
   }
   async updateOrderStatus({orderId, status, transaction}) {
      const t = transaction ?? await db[process.env.DEFAULT_DB].transaction()
      try {
         const order = await this.getOrder({orderId});
         if(!order || !order.success)
            throw new AppError('Order not found', __line, __path.basename(__filename), { status: 404, show: true});

         await order.data.update({ status }, {transaction: t});
         // db[process.env.DEFAULT_DB].models.OrderItem.update()

         transaction ? 0 : await t.commit();
         return { success: true, status: 200, message: `Order status updated successfully`, data: order }
      } catch (error) {
         console.error(error.message);
         transaction ? 0 : await t.rollback();
         return new AppError(
            error.message,
            error.line || __line,
            error.file || __path.basename(__filename),
            { name: error.name, status: error.status ?? 500, show: error.show }
         )      
      }
   }
}
module.exports = OrderService;
