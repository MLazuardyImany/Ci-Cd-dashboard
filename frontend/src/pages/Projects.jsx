import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, buildsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { showToast } from '../utils/toast';
import { Folder, Plus, GitBranch, Activity, Clock, Play, Search, Trash2, MoreVertical } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { Toaster } from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, project: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Filter projects based on search query
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data.data || []);
      setFilteredProjects(data.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      showToast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerBuild = async (projectId, projectName) => {
    const toastId = showToast.loading('Triggering build...');

    try {
      await buildsAPI.trigger({
        projectId,
        commitMessage: 'Manual trigger from dashboard',
        author: 'Dashboard User',
      });
      showToast.dismiss(toastId);
      showToast.success(`Build triggered for ${projectName}!`);
      fetchProjects();
    } catch (error) {
      showToast.dismiss(toastId);
      showToast.error('Failed to trigger build');
    }
  };

  const handleDeleteProject = async () => {
    setDeleting(true);
    const toastId = showToast.loading('Deleting project...');

    try {
      await projectsAPI.delete(deleteModal.project.id);
      showToast.dismiss(toastId);
      showToast.success('Project deleted successfully!');
      setDeleteModal({ show: false, project: null });
      fetchProjects();
    } catch (error) {
      showToast.dismiss(toastId);
      showToast.error('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading projects..." />;
  }

  if (projects.length === 0) {
    return (
      <>
        <Toaster />
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

        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchProjects}
        />
      </>
    );
  }

  return (
    <>
      <Toaster />
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Search}
              title="No projects found"
              description={`No projects match "${searchQuery}"`}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
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
                  
                  <button 
                    onClick={() => setDeleteModal({ show: true, project })}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-600 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
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
        )}
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchProjects}
      />

      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, project: null })}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteModal.project?.name}"? This action cannot be undone and will delete all associated builds.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        danger={true}
      />
    </>
  );
};

export default Projects;