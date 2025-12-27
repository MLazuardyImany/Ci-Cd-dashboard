const { Build, Project } = require('../models');
const { Op } = require('sequelize');

// Get all builds
exports.getAllBuilds = async (req, res, next) => {
  try {
    const { projectId, status, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (status) {
      where.status = status;
    }
    
    const builds = await Build.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'repository']
      }]
    });
    
    res.json({
      success: true,
      count: builds.count,
      data: builds.rows,
      pagination: {
        total: builds.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(builds.count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single build
exports.getBuild = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const build = await Build.findByPk(id, {
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'name', 'repository', 'branch']
      }]
    });
    
    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }
    
    res.json({
      success: true,
      data: build
    });
  } catch (error) {
    next(error);
  }
};

// Create/Trigger new build
exports.triggerBuild = async (req, res, next) => {
  try {
    const { projectId, branch, commit, commitMessage, author, authorEmail, triggeredBy = 'manual' } = req.body;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }
    
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Get next build number
    const lastBuild = await Build.findOne({
      where: { projectId },
      order: [['buildNumber', 'DESC']]
    });
    
    const buildNumber = lastBuild ? lastBuild.buildNumber + 1 : 1;
    
    // Create build
    const build = await Build.create({
      projectId,
      buildNumber,
      status: 'pending',
      branch: branch || project.branch,
      commit: commit || Math.random().toString(36).substring(2, 9),
      commitMessage: commitMessage || 'Manual trigger',
      author: author || 'System',
      authorEmail: authorEmail || 'system@cicd-dashboard.com',
      triggeredBy,
      logs: '[INFO] Build queued...\n'
    });
    
    // Update project stats
    await project.update({
      totalBuilds: project.totalBuilds + 1,
      lastBuildAt: new Date(),
      lastBuildStatus: 'pending'
    });
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('build-created', {
        buildId: build.id,
        projectId: project.id,
        projectName: project.name,
        buildNumber: build.buildNumber,
        status: 'pending'
      });
    }
    
    // TODO: Here you would typically queue the actual build job
    // For now, we'll simulate it
    simulateBuild(build, project, io);
    
    res.status(201).json({
      success: true,
      message: 'Build triggered successfully',
      data: build
    });
  } catch (error) {
    next(error);
  }
};

// Simulate build process (in real app, this would be a separate worker)
async function simulateBuild(build, project, io) {
  try {
    // Start build
    await build.update({
      status: 'running',
      startedAt: new Date(),
      logs: build.logs + '[INFO] Build started...\n[INFO] Cloning repository...\n'
    });
    
    if (io) {
      io.to(`build-${build.id}`).emit('build-status', {
        buildId: build.id,
        status: 'running',
        logs: build.logs
      });
    }
    
    // Simulate build steps (total ~10 seconds)
    const steps = [
      { delay: 2000, log: '[INFO] Installing dependencies...\n' },
      { delay: 3000, log: '[INFO] Running tests...\n[TEST] ✓ All tests passed\n' },
      { delay: 2000, log: '[INFO] Building production bundle...\n' },
      { delay: 2000, log: '[BUILD] Optimizing assets...\n' }
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      build.logs += step.log;
      await build.save();
      
      if (io) {
        io.to(`build-${build.id}`).emit('build-logs', {
          buildId: build.id,
          logs: build.logs
        });
      }
    }
    
    // Random success/failure (80% success rate)
    const success = Math.random() > 0.2;
    const finalStatus = success ? 'success' : 'failed';
    const finalLog = success 
      ? '[BUILD] ✓ Build completed successfully\n[SUCCESS] Deployment ready!\n'
      : '[ERROR] Build failed: Module not found\n[FAILED] Build terminated\n';
    
    build.logs += finalLog;
    
    await build.update({
      status: finalStatus,
      completedAt: new Date(),
      logs: build.logs
    });
    
    // Update project stats
    if (success) {
      await project.update({
        successfulBuilds: project.successfulBuilds + 1,
        lastBuildStatus: 'success'
      });
    } else {
      await project.update({
        failedBuilds: project.failedBuilds + 1,
        lastBuildStatus: 'failed'
      });
    }
    
    if (io) {
      io.emit('build-completed', {
        buildId: build.id,
        projectId: project.id,
        status: finalStatus
      });
      
      io.to(`build-${build.id}`).emit('build-status', {
        buildId: build.id,
        status: finalStatus,
        logs: build.logs
      });
    }
  } catch (error) {
    console.error('Error in simulateBuild:', error);
    await build.update({
      status: 'failed',
      completedAt: new Date(),
      logs: build.logs + `[ERROR] Internal error: ${error.message}\n`
    });
  }
}

// Get build logs (streaming)
exports.getBuildLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const build = await Build.findByPk(id, {
      attributes: ['id', 'buildNumber', 'status', 'logs', 'startedAt', 'completedAt']
    });
    
    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        buildId: build.id,
        buildNumber: build.buildNumber,
        status: build.status,
        logs: build.logs || '',
        startedAt: build.startedAt,
        completedAt: build.completedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel build
exports.cancelBuild = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const build = await Build.findByPk(id);
    
    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }
    
    if (build.status !== 'pending' && build.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: 'Only pending or running builds can be cancelled'
      });
    }
    
    await build.update({
      status: 'cancelled',
      completedAt: new Date(),
      logs: build.logs + '\n[INFO] Build cancelled by user\n'
    });
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('build-cancelled', {
        buildId: build.id,
        status: 'cancelled'
      });
    }
    
    res.json({
      success: true,
      message: 'Build cancelled successfully',
      data: build
    });
  } catch (error) {
    next(error);
  }
};

// Delete build
exports.deleteBuild = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const build = await Build.findByPk(id);
    
    if (!build) {
      return res.status(404).json({
        success: false,
        message: 'Build not found'
      });
    }
    
    await build.destroy();
    
    res.json({
      success: true,
      message: 'Build deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};