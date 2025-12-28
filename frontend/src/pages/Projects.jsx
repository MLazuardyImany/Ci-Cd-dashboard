import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, buildsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import { Folder, Plus, GitBranch, Activity, Clock, Play, MoreVertical, Trash2, Edit } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerBuild = async (projectId, projectName) => {
    if (!confirm(`Trigger new build for "${projectName}"?`)) return;

    try {
      await buildsAPI.trigger({
        projectId,
        commitMessage: 'Manual trigger from dashboard',
        author: 'Dashboard User',
      });
      alert('Build triggered successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Failed to trigger build:', error);
      alert('Failed to trigger build. Check console for details.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading projects..." />;
  }

  if (projects.length === 0) {
    return (
      <div className="animate-fadeIn">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Manage your CI/CD projects</p>
          </div>
        </div>

        <div className="card">
          <EmptyState
            icon={Folder}
            title="No projects yet"
            description="Create your first project to start building and deploying."
            action={
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">{projects.length} active projects</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card p-6 group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Folder className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <GitBranch className="w-3 h-3" />
                    {project.branch}
                  </p>
                </div>
              </div>
              
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description || 'No description'}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Activity className="w-4 h-4" />
                <span>{project.totalBuilds || 0} builds</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <span>✓</span>
                <span>{project.successfulBuilds || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <span>✗</span>
                <span>{project.failedBuilds || 0}</span>
              </div>
            </div>

            {/* Last Build */}
            {project.lastBuildAt && (
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(project.lastBuildAt)}
                </span>
                {project.lastBuildStatus && (
                  <StatusBadge status={project.lastBuildStatus} />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTriggerBuild(project.id, project.name)}
                className="flex-1 btn btn-primary text-sm"
              >
                <Play className="w-4 h-4" />
                Trigger Build
              </button>
              <Link
                to={`/projects/${project.id}`}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <p className="text-gray-600 mb-4">Feature coming soon! Use API to create projects for now.</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn btn-secondary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;