import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { buildsAPI } from '../services/api';
import socketService from '../services/socket';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { ArrowLeft, Download, Copy, Check, GitCommit, User, Calendar, Clock } from 'lucide-react';
import { formatDate, formatDuration } from '../utils/helpers';

const BuildDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const logsEndRef = useRef(null);
  
  const [build, setBuild] = useState(null);
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    fetchBuildDetails();
    
    // Connect socket
    const socket = socketService.connect();
    
    // Subscribe to build updates
    socketService.subscribeToBuild(id, (data) => {
      console.log('Build update:', data);
      if (data.logs) {
        setLogs(data.logs);
      }
      if (data.status) {
        setBuild((prev) => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      socketService.unsubscribeFromBuild(id);
    };
  }, [id]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const fetchBuildDetails = async () => {
    try {
      setLoading(true);
      const [buildData, logsData] = await Promise.all([
        buildsAPI.getById(id),
        buildsAPI.getLogs(id),
      ]);
      
      setBuild(buildData.data);
      setLogs(logsData.data.logs || '');
    } catch (error) {
      console.error('Failed to fetch build details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-${build.buildNumber}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner text="Loading build details..." />;
  }

  if (!build) {
    return (
      <div className="card p-12 text-center">
        <p className="text-gray-600 mb-4">Build not found</p>
        <button onClick={() => navigate('/builds')} className="btn btn-secondary">
          Back to Builds
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={() => navigate('/builds')}
        className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Builds
      </button>

      {/* Build Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Build #{build.buildNumber}
              </h1>
              <StatusBadge status={build.status} />
            </div>
            <Link
              to={`/projects/${build.project?.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              {build.project?.name}
            </Link>
          </div>

          {build.status === 'running' && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              Building...
            </div>
          )}
        </div>

        {/* Build Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1 flex items-center gap-1">
              <GitCommit className="w-4 h-4" />
              Commit
            </p>
            <code className="font-mono text-gray-900">{build.commit?.substring(0, 7)}</code>
          </div>
          
          <div>
            <p className="text-gray-600 mb-1 flex items-center gap-1">
              <User className="w-4 h-4" />
              Author
            </p>
            <p className="text-gray-900">{build.author}</p>
          </div>
          
          <div>
            <p className="text-gray-600 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Started
            </p>
            <p className="text-gray-900">{formatDate(build.startedAt)}</p>
          </div>
          
          {build.duration && (
            <div>
              <p className="text-gray-600 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Duration
              </p>
              <p className="text-gray-900">{formatDuration(build.duration)}</p>
            </div>
          )}
        </div>

        {/* Commit Message */}
        {build.commitMessage && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-1">Commit Message</p>
            <p className="text-gray-900">{build.commitMessage}</p>
          </div>
        )}
      </div>

      {/* Build Logs */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-gray-900">Build Logs</h2>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="btn btn-secondary text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownloadLogs}
              className="btn btn-secondary text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="terminal max-h-[600px] overflow-y-auto">
          <pre className="whitespace-pre-wrap">{logs || 'No logs available'}</pre>
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default BuildDetail;
