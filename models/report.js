'use strict';
module.exports = function(sequelize, DataTypes) {
  const report = sequelize.define('report', {
    report: DataTypes.TEXT('medium'),
    image_id: {
        primaryKey: true,
        type: DataTypes.STRING
    }
  }, {
    timestamps: true
  });
  return report;
};
