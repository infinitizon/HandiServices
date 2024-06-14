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
    "sqlite": {
        "database": 'local-db',
        "username": 'user',
        "password": 'pass',
        "host": './dev.sqlite',
        "dialect": "sqlite",
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
            "sqlite": {
                "database": 'local-db',
                "username": 'user',
                "password": 'pass',
                "host": './dev.sqlite',
                "dialect": "sqlite",
            },
        },
    },
    "staging": {
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



