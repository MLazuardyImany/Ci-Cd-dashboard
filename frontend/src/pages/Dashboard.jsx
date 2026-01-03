import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI, buildsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Activity, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalBuilds: 0,
    successRate: 0,
    recentBuilds: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsData, buildsData] = await Promise.all([
        projectsAPI.getAll(),
        buildsAPI.getAll({ limit: 5 }),
      ]);

      const totalBuilds = buildsData.count || 0;
      const successBuilds = buildsData.data?.filter(b => b.status === 'success').length || 0;
      const successRate = totalBuilds > 0 ? ((successBuilds / totalBuilds) * 100).toFixed(1) : 0;

      setStats({
        totalProjects: projectsData.count || 0,
        totalBuilds: totalBuilds,
        successRate: successRate,
        recentBuilds: buildsData.data || [],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Builds',
      value: stats.totalBuilds,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage Your Projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {statCards.map((stat, index) => {
    const Icon = stat.icon;
    return (
      <div key={index} className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
          </div>
          <div className={`${stat.bg} p-3 rounded-lg`}>
            <Icon className={`w-6 h-6 ${stat.color}`} />
          </div>
        </div>
      </div>
    );
  })}
</div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Builds</h2>
          <Link to="/builds" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {stats.recentBuilds.map((build) => (
            <div key={build.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all">
              <div className="flex items-center gap-4">
                {build.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {build.status === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
                {build.status === 'running' && <Clock className="w-5 h-5 text-blue-600 animate-spin" />}
                
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{build.project?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Build #{build.buildNumber}</p>
                </div>
              </div>
              
              <Link 
                to={`/builds/${build.id}`}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                View logs →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;