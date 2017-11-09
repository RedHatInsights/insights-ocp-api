'use strict';
module.exports = function(sequelize, DataTypes) {
  const report = sequelize.define('report', {
    report: DataTypes.STRING,
    image_id: DataTypes.STRING,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.NOW,
      onUpdate: true,
      notNull: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return report;
};
