'use strict';
module.exports = (sequelize, DataTypes) => {
  var Banner = sequelize.define('Banner', {
    source: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {});
  Banner.associate = function(models) {
    // associations can be defined here
  };
  return Banner;
};
