const express = require('express');
const router = express.Router();
const buildController = require('../controllers/buildController');

// GET /api/builds - Get all builds
router.get('/', buildController.getAllBuilds);

// GET /api/builds/:id - Get single build
router.get('/:id', buildController.getBuild);

// POST /api/builds/trigger - Trigger new build
router.post('/trigger', buildController.triggerBuild);

// GET /api/builds/:id/logs - Get build logs
router.get('/:id/logs', buildController.getBuildLogs);

// POST /api/builds/:id/cancel - Cancel build
router.post('/:id/cancel', buildController.cancelBuild);

// DELETE /api/builds/:id - Delete build
router.delete('/:id', buildController.deleteBuild);

module.exports = router;