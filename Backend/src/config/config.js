require('dotenv').config();
module.exports = {
    "postgres": {
        "database": process.env.DB_PG_DB_NAME,
        "username": process.env.DB_PG_USERNAME,
        "password": process.env.DB_PG_PASSWORD,
        "host": process.env.DB_PG_HOST,
        "dialect": "postgres",
        "timezone": process.env.DB_PG_TIMEZONE,
        "ssl": true,
        "rejectUnauthorized": false,
        "dialectOptions": {
            "ssl": {
                "require": true,
                "rejectUnauthorized": false
            }
        }
    },
    "development": {
        "databases": {
            "postgres": {
                "database": process.env.DB_PG_DB_NAME,
                "username": process.env.DB_PG_USERNAME,
                "password": process.env.DB_PG_PASSWORD,
                "host": process.env.DB_PG_HOST,
                "dialect": "postgres",
                "timezone": process.env.DB_PG_TIMEZONE,
                "ssl": true,
                "rejectUnauthorized": false,
                "dialectOptions": {
                    "ssl": {
                        "require": true,
                        "rejectUnauthorized": false
                    }
                }
            },
        },
    },
    "localhostdev": {
        "databases": {
            "postgres": {
                "database": process.env.DB_PG_DB_NAME,
                "username": process.env.DB_PG_USERNAME,
                "password": process.env.DB_PG_PASSWORD,
                "host": process.env.DB_PG_HOST,
                "dialect": "postgres",
                "timezone": process.env.DB_PG_TIMEZONE,
            },
        },
    },
    "test": {
        "username": "root",
        "password": null,
        "database": "database_test",
        "host": "127.0.0.1",
        "dialect": "mysql"
    },
    "production": {
        "databases": {
            "postgres": {
                "database": process.env.DB_PG_DB_NAME,
                "username": process.env.DB_PG_USERNAME,
                "password": process.env.DB_PG_PASSWORD,
                "host": process.env.DB_PG_HOST,
                "timezone": process.env.DB_PG_TIMEZONE,
                "dialect": "postgres",
                "ssl": true,
                "rejectUnauthorized": false,
                "dialectOptions": {
                    "ssl": {
                        "require": true,
                        "rejectUnauthorized": false
                    }
                }
            },
        },
    }
}



