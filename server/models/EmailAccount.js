const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const EmailAccount = sequelize.define('EmailAccount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  address: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      is: /@anticensura\.org$/i
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  imapHost: {
    type: DataTypes.STRING(100),
    defaultValue: process.env.IMAP_HOST
  },
  imapPort: {
    type: DataTypes.INTEGER,
    defaultValue: process.env.IMAP_PORT
  },
  smtpHost: {
    type: DataTypes.STRING(100),
    defaultValue: process.env.SMTP_HOST
  },
  smtpPort: {
    type: DataTypes.INTEGER,
    defaultValue: process.env.SMTP_PORT
  },
  quota: {
    type: DataTypes.BIGINT,
    defaultValue: 1073741824 // 1GB
  },
  usedSpace: {
    type: DataTypes.BIGINT,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'email_accounts',
  timestamps: true
});

User.hasMany(EmailAccount, { foreignKey: 'userId' });
EmailAccount.belongsTo(User, { foreignKey: 'userId' });

module.exports = EmailAccount;