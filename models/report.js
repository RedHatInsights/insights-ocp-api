'use strict';
module.exports = function(sequelize, DataTypes) {
  const report = sequelize.define('report', {
    report: DataTypes.TEXT('medium'),
    image_id: {
        primaryKey: true,
        type: DataTypes.STRING
    },
    image_name: {
        type: DataTypes.STRING
    },
    skip: {
        type:DataTypes.BOOLEAN
    }
  }, {
    timestamps: true
  });
  return report;
};
