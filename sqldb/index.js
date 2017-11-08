'use strict';

const Sequelize = require('sequelize');
const path = require('path');
const config = require('../config');
const models = [];

let db = null;

module.exports = function () {
    if (!db) {
        db = {
            Sequelize: Sequelize,
            sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
        };

        models.forEach(function (model) {
            db[model] = db.sequelize.import(path.join(
                config.root,
                'api',
                model,
                model + '.model'
            ));
        });

        // workaround for https://github.com/sequelize/sequelize/issues/2805
        // adds transaction.promise property to the transaction object
        const wrapped = db.sequelize.transaction.bind(db.sequelize);
        db.sequelize.transaction = function (opts, fn) {
            if (_.isFunction(opts)) {
                fn = opts;
                opts = undefined;
            }

            if (!fn) {
                return wrapped(opts, fn);
            }

            const promise = wrapped(opts, function (transaction) {
                transaction.promise = promise;
                return fn(transaction);
            });

            return promise;
        };
    }

    return db;
};
