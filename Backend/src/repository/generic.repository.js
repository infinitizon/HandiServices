const { postgres, Sequelize } = require('../database/models');
class GenericRepo {
   constructor() {
      if (GenericRepo.instance) {
         return GenericRepo.instance;
      }
      this.data = Math.random(); // Example property
      GenericRepo.instance = this;
   }

   setOptions(model, { selectOptions, condition, paginateOptions, transaction, inclussions, data, array, changes, returning, group }) {
      console.log(model, { selectOptions, condition, paginateOptions, transaction, inclussions, data, array, changes, returning, group })
      this.query = { selectOptions, condition, paginateOptions, transaction, inclussions, data, array, changes, returning, group };
      this.dbQuery = postgres.models[model]
      return this
   }

   create = () => {
      const { data, transaction, inclussions } = this.query
      return this.dbQuery.create(data, { ...(transaction && { transaction }), ...(inclussions && {include: inclussions}) });
   }

   bulkCreate = () => {
      const { array, transaction } = this.query
      return this.dbQuery.bulkCreate(array, { ...(transaction && { transaction }) });
   }

   update = async () => {
      const { changes, condition, transaction, returning } = this.query
      const updated = await this.dbQuery.update(
         changes,
         {
            where: condition,
              returning,
            ...(transaction && { transaction })
         }
      )
      return updated;
   }

   _delete = async () => {
      const { condition, transaction } = this.query
      return this.dbQuery.destroy({
         where: condition,
         ...(transaction && { transaction })
      })
   }

   findAll = () => {
      const { selectOptions, condition, transaction, inclussions, paginateOptions } = this.query
      return this.dbQuery.findAll(
         {
            where: condition,
            ...(selectOptions && {attributes: selectOptions}),
            include: inclussions
         }
      )
   }

   findAllWithPagination = async () => {
      const { selectOptions, condition, paginateOptions, inclussions } = this.query
      const findAndCount = await this.dbQuery.findAndCountAll(
         {
            ...paginateOptions,
            where: condition,
            ...(selectOptions && {attributes: selectOptions}),
            include: inclussions
         }
      )
      const {count, rows} = findAndCount
      return {
         rows,
         number_of_pages: Math.ceil(count / paginateOptions.limit),
       }
   }

   findOne = () => {
      const { selectOptions, condition, paginateOptions, transaction, inclussions, group } = this.query
      return this.dbQuery.findOne(
         {
            where: condition,
            attributes: selectOptions,
            include: inclussions,
            ...(group && {group: [group]})
         }
      )
   }
}

module.exports = GenericRepo;