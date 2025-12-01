const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const EmailAccount = require('./EmailAccount');

const Email = sequelize.define('Email', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: EmailAccount,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  messageId: {
    type: DataTypes.STRING(255),
    unique: true
  },
  subject: {
    type: DataTypes.STRING(255)
  },
  from: {
    type: DataTypes.STRING(255)
  },
  to: {
    type: DataTypes.TEXT
  },
  cc: {
    type: DataTypes.TEXT
  },
  bcc: {
    type: DataTypes.TEXT
  },
  bodyText: {
    type: DataTypes.TEXT('long')
  },
  bodyHtml: {
    type: DataTypes.TEXT('long')
  },
  receivedDate: {
    type: DataTypes.DATE
  },
  sentDate: {
    type: DataTypes.DATE
  },
  folder: {
    type: DataTypes.STRING(100),
    defaultValue: 'INBOX'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isStarred: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attachments: {
    type: DataTypes.JSON, // Array of attachment objects
    defaultValue: []
  },
  size: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'emails',
  timestamps: true,
  indexes: [
    { fields: ['accountId', 'folder'] },
    { fields: ['receivedDate'] }
  ]
});

EmailAccount.hasMany(Email, { foreignKey: 'accountId' });
Email.belongsTo(EmailAccount, { foreignKey: 'accountId' });

module.exports = Email;