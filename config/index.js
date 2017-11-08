const env = process.env;
const path = require('path');

let dbUri = 'mysql://' +
    process.env.MARIADB_USERNAME + ':' +
    process.env.MARIADB_PASSWORD + '@' +
    process.env.MARIADB_HOST + '/' +
    process.env.MARIADB_DB;

config = {
    port: 8080,
    root: path.normalize(__dirname + '/..'),
    sequelize: {
        uri: dbUri,
        options: {
            logging: false,
            pool: {
                minConnections: 20,
                maxConnections: 50
            },
            define: {
                charset: 'utf8',
                timestamps: false,
                underscored: true
            },
            dialectOptions: {
                flags: ''
            }
        }
    }
};

module.exports = config;