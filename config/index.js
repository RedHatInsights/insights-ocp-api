const env = process.env;
const path = require('path');

let dbUri = 'mysql://' +
    process.env.MYSQL_USER + ':' +
    process.env.MYSQL_PASSWORD + '@' +
    process.env.MYSQL_HOST + '/' +
    process.env.MYSQL_DATABASE;

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