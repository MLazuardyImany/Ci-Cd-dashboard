const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');

const Build = sequelize.define('Build', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  buildNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'success', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  commit: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  commitMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  branch: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  authorEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  logs: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.VIRTUAL,
    get() {
      const startedAt = this.getDataValue('startedAt');
      const completedAt = this.getDataValue('completedAt');
      if (startedAt && completedAt) {
        return Math.floor((new Date(completedAt) - new Date(startedAt)) / 1000);
      }
      return null;
    }
  },
  triggeredBy: {
    type: DataTypes.ENUM('manual', 'webhook', 'schedule'),
    defaultValue: 'manual'
  }
}, {
  timestamps: true,
  tableName: 'builds',
  indexes: [
    { fields: ['projectId'] },
    { fields: ['status'] },
    { fields: ['buildNumber'] },
    { fields: ['createdAt'] }
  ]
});

// Relations
Build.belongsTo(Project, { 
  foreignKey: 'projectId',
  onDelete: 'CASCADE',
  as: 'project'
});

Project.hasMany(Build, { 
  foreignKey: 'projectId',
  as: 'builds'
});

module.exports = Build;