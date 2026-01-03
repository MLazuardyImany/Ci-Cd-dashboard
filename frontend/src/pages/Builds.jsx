import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import { Terminal, User, GitCommit, Calendar, ExternalLink, Filter } from 'lucide-react';
import { formatDate, formatDuration } from '../utils/helpers';

const Builds = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBuilds();
  }, [filter]);

  const fetchBuilds = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await buildsAPI.getAll(params);
      setBuilds(data.data || []);
    } catch (error) {
      console.error('Failed to fetch builds:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading builds..." />;
  }

  const filterOptions = [
    { value: 'all', label: 'All Builds' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'running', label: 'Running' },
    { value: 'pending', label: 'Pending' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Builds</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{builds.length} total builds</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input text-sm py-1.5"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Builds List */}
      {builds.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Terminal}
            title="No builds found"
            description="Trigger a build to see it here."
          />
        </div>
      ) : (
        <div className="card divide-y divide-gray-200 dark:divide-gray-700">
          {builds.map((build) => (
            <div key={build.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                {/* Left Side */}
                <div className="flex-1">
                  {/* Project Name & Build Number */}
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      to={`/projects/${build.project?.id}`}
                      className="font-semibold text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-200"
                    >
                      {build.project?.name || 'Unknown Project'}
                    </Link>
                    <span className="text-gray-400 dark:text-gray-600">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Build #{build.buildNumber}</span>
                    <StatusBadge status={build.status} />
                  </div>

                  {/* Commit Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-4 h-4" />
                      <code className="font-mono text-xs text-gray-700 dark:text-gray-300">
                        {build.commit?.substring(0, 7)}
                      </code>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span className="text-gray-700 dark:text-gray-300">{build.author}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(build.createdAt)}
                    </span>
                  </div>

                  {/* Commit Message */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {build.commitMessage || 'No commit message'}
                  </p>

                  {/* Duration */}
                  {build.duration && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Duration: {formatDuration(build.duration)}
                    </div>
                  )}
                </div>

                {/* Right Side - Actions */}
                <Link
                  to={`/builds/${build.id}`}
                  className="btn btn-secondary text-sm"
                >
                  View Logs
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Builds;