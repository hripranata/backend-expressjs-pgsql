'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Verification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Verification.belongsTo(models.User, {
        foreignKey: 'user_id',
      })
    }
  }
  Verification.init({
    user_id: DataTypes.INTEGER,
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    token_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Verification',
  });
  return Verification;
};