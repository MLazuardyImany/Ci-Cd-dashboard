const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  repository: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
      isUrl: true
    }
  },
  branch: {
    type: DataTypes.STRING(100),
    defaultValue: 'main',
    allowNull: false
  },
  buildCommand: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  deployCommand: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'archived'),
    defaultValue: 'active'
  },
  lastBuildAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastBuildStatus: {
    type: DataTypes.ENUM('success', 'failed', 'running', 'pending'),
    allowNull: true
  },
  totalBuilds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successfulBuilds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedBuilds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'projects',
  indexes: [
    { fields: ['name'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Project;