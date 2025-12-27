const { Project, Build } = require('../models');
const { Op } = require('sequelize');

// Get all projects
exports.getAllProjects = async (req, res, next) => {
  try {
    const { status, search, sortBy = 'createdAt', order = 'DESC' } = req.query;
    
    const where = {};
    
    // Filter by status
    if (status) {
      where.status = status;
    }
    
    // Search by name or repository
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { repository: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const projects = await Project.findAll({
      where,
      order: [[sortBy, order]],
      include: [{
        model: Build,
        as: 'builds',
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'buildNumber', 'status', 'createdAt']
      }]
    });
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
exports.getProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findByPk(id, {
      include: [{
        model: Build,
        as: 'builds',
        order: [['createdAt', 'DESC']],
        limit: 20
      }]
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Create project
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, repository, branch, buildCommand, deployCommand } = req.body;
    
    // Validation
    if (!name || !repository || !buildCommand) {
      return res.status(400).json({
        success: false,
        message: 'Name, repository, and buildCommand are required'
      });
    }
    
    // Check if project name already exists
    const existingProject = await Project.findOne({ where: { name } });
    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: 'Project with this name already exists'
      });
    }
    
    const project = await Project.create({
      name,
      description,
      repository,
      branch: branch || 'main',
      buildCommand,
      deployCommand,
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, repository, branch, buildCommand, deployCommand, status } = req.body;
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if new name conflicts with existing project
    if (name && name !== project.name) {
      const existingProject = await Project.findOne({ where: { name } });
      if (existingProject) {
        return res.status(409).json({
          success: false,
          message: 'Project with this name already exists'
        });
      }
    }
    
    await project.update({
      name: name || project.name,
      description: description !== undefined ? description : project.description,
      repository: repository || project.repository,
      branch: branch || project.branch,
      buildCommand: buildCommand || project.buildCommand,
      deployCommand: deployCommand !== undefined ? deployCommand : project.deployCommand,
      status: status || project.status
    });
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await project.destroy();
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get project statistics
exports.getProjectStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const project = await Project.findByPk(id, {
      include: [{
        model: Build,
        as: 'builds',
        attributes: ['status', 'duration', 'createdAt']
      }]
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    const builds = project.builds;
    const totalBuilds = builds.length;
    const successBuilds = builds.filter(b => b.status === 'success').length;
    const failedBuilds = builds.filter(b => b.status === 'failed').length;
    const runningBuilds = builds.filter(b => b.status === 'running').length;
    const pendingBuilds = builds.filter(b => b.status === 'pending').length;
    
    const successRate = totalBuilds > 0 ? ((successBuilds / totalBuilds) * 100).toFixed(2) : 0;
    
    // Calculate average build duration (only completed builds)
    const completedBuilds = builds.filter(b => b.duration !== null);
    const avgDuration = completedBuilds.length > 0
      ? Math.round(completedBuilds.reduce((sum, b) => sum + b.duration, 0) / completedBuilds.length)
      : 0;
    
    res.json({
      success: true,
      data: {
        projectName: project.name,
        totalBuilds,
        successBuilds,
        failedBuilds,
        runningBuilds,
        pendingBuilds,
        successRate: `${successRate}%`,
        avgBuildDuration: `${avgDuration}s`,
        lastBuildAt: project.lastBuildAt,
        lastBuildStatus: project.lastBuildStatus
      }
    });
  } catch (error) {
    next(error);
  }
};