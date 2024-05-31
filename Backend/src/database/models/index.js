'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);

const Logger = require('../../config/winston-log');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config')[env];
const db = {};
console.log(`Environment: ${env}`)

//Extract the database information into an array
const databases = Object.keys(config.databases);
//Loop over the array and create a new Sequelize instance for every database from config.js
for(let i = 0; i < databases.length; ++i) {
  let database = databases[i];
  let dbPath = config.databases[database];
  //Store the database connection in our db object
  db[database] = new Sequelize( dbPath.database, dbPath.username, dbPath.password, dbPath );
  if(env === 'development') console.log(dbPath.database, dbPath.username, dbPath.password, dbPath);
  db[database]
    .authenticate()
    .then(() => console.log(`${database} connected....`))
    .catch((err) => {
       Logger.error({status: err.code??500, message: `Error connecting to ${database}...${err.message}`})
    });

  fs
    .readdirSync(path.join(__dirname, database))
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
      require(path.join(__dirname, database, file))(db[database], Sequelize.DataTypes);
    });
}

Object.keys(db).forEach(type => {
  Object.keys(db[type]['models']).forEach(modelName => {
    if (db[type]['models'][modelName].associate) {
      db[type]['models'][modelName].associate(db[type]['models']);
    }
  })
});

db.Sequelize = Sequelize;


module.exports = db;
