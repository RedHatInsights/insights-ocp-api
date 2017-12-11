'use strict';
module.exports = function(sequelize, DataTypes) {
  const report = sequelize.define('report', {
    report: DataTypes.TEXT('medium'),
    image_id: DataTypes.STRING
  }, {
    timestamps: true
  });
  return report;
};
