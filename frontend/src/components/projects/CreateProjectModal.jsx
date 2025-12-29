import React, { useState } from 'react';
import Modal from '../common/Modal';
import { projectsAPI } from '../../services/api';
import { showToast } from '../../utils/toast';
import { Loader } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    repository: '',
    branch: 'main',
    buildCommand: '',
    deployCommand: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (!formData.repository.trim()) {
      newErrors.repository = 'Repository URL is required';
    } else if (!formData.repository.startsWith('http')) {
      newErrors.repository = 'Repository must be a valid URL';
    }

    if (!formData.buildCommand.trim()) {
      newErrors.buildCommand = 'Build command is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      showToast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    const toastId = showToast.loading('Creating project...');

    try {
      await projectsAPI.create(formData);
      showToast.dismiss(toastId);
      showToast.success('Project created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        repository: '',
        branch: 'main',
        buildCommand: '',
        deployCommand: '',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      showToast.dismiss(toastId);
      const message = error.response?.data?.message || 'Failed to create project';
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setErrors({});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., My Awesome Project"
            disabled={loading}
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            rows="3"
            placeholder="Brief description of your project"
            disabled={loading}
          />
        </div>

        {/* Repository URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repository URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="repository"
            value={formData.repository}
            onChange={handleChange}
            className={`input ${errors.repository ? 'border-red-500' : ''}`}
            placeholder="https://github.com/username/repo"
            disabled={loading}
          />
          {errors.repository && <p className="text-sm text-red-600 mt-1">{errors.repository}</p>}
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch
          </label>
          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="input"
            placeholder="main"
            disabled={loading}
          />
        </div>

        {/* Build Command */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Build Command <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="buildCommand"
            value={formData.buildCommand}
            onChange={handleChange}
            className={`input font-mono text-sm ${errors.buildCommand ? 'border-red-500' : ''}`}
            placeholder="npm install && npm run build"
            disabled={loading}
          />
          {errors.buildCommand && <p className="text-sm text-red-600 mt-1">{errors.buildCommand}</p>}
        </div>

        {/* Deploy Command */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deploy Command
          </label>
          <input
            type="text"
            name="deployCommand"
            value={formData.deployCommand}
            onChange={handleChange}
            className="input font-mono text-sm"
            placeholder="npm run deploy (optional)"
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;