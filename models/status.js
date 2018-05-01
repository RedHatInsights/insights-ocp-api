'use strict';
module.exports = function(sequelize, DataTypes) {
  const report = sequelize.define('status', {
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    scanning: {
      type: DataTypes.BOOLEAN
    }
  }, {
    timestamps: true
  });
  return report;
};
