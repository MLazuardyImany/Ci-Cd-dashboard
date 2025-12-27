const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// GET /api/projects - Get all projects
router.get('/', projectController.getAllProjects);

// GET /api/projects/:id - Get single project
router.get('/:id', projectController.getProject);

// POST /api/projects - Create project
router.post('/', projectController.createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', projectController.deleteProject);

// GET /api/projects/:id/stats - Get project statistics
router.get('/:id/stats', projectController.getProjectStats);

module.exports = router;