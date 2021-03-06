const {
  USER_ROLES: { REGULAR }
} = require('../utils/constants');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      lastName: { type: DataTypes.STRING, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: true },
      lastAccess: { type: DataTypes.DATE },
      type: { type: DataTypes.STRING, allowNull: false, defaultValue: REGULAR },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
      deletedAt: DataTypes.DATE,
      external: { type: DataTypes.BOOLEAN }
    },
    { timestamps: true, underscored: true, paranoid: true, tableName: 'users' }
  );
  User.associate = models => {
    User.hasMany(models.List, { as: 'userList', foreignKey: 'userId' });
  };
  return User;
};
