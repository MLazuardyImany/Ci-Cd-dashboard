const sequelize = require('../config/database');
const Project = require('./Project');
const Build = require('./Build');

// Initialize all models
const models = {
  sequelize,
  Project,
  Build
};

// Sync all models
const syncModels = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ All models synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing models:', error);
    throw error;
  }
};

module.exports = {
  ...models,
  syncModels
};