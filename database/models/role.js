'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Role.hasMany(models.User, {
        as: 'users',
        foreignKey: 'role_id'
      })
      Role.belongsToMany(models.Permission, {
        through: 'RolePermissions',
        foreignKey: 'role_id',
        as: 'permissions'
      })
    }
  }
  Role.init({
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    role_description:  {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Role',
  });
  return Role;
};