import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

const Dashboard = () => {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/dashboard/${id}`);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;
  if (!stats) return <div className="p-10 text-center text-red-500">Failed to load stats.</div>;

  // Process data for simple visualization
  const getStatusCount = (status) => {
    const stat = stats.byStatus.find(s => s._id === status);
    return stat ? stat.count : 0;
  };

  const todo = getStatusCount('todo');
  const inprogress = getStatusCount('inprogress');
  const done = getStatusCount('done');
  const total = stats.total || 1; // Prevent divide by zero

  const calcWidth = (val) => `${(val / total) * 100}%`;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Project Dashboard</h2>
        <Link to={`/projects/${id}`} className="text-blue-600 hover:underline font-medium">
          ← Back to Board
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Tasks</h3>
          <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Overdue Tasks</h3>
          <p className="text-4xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Task Breakdown</h3>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">To Do ({todo})</span>
              <span className="text-sm font-medium text-gray-700">{Math.round((todo/total)*100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-gray-400 h-4 rounded-full" style={{ width: calcWidth(todo) }}></div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">In Progress ({inprogress})</span>
              <span className="text-sm font-medium text-gray-700">{Math.round((inprogress/total)*100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-blue-500 h-4 rounded-full" style={{ width: calcWidth(inprogress) }}></div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Done ({done})</span>
              <span className="text-sm font-medium text-gray-700">{Math.round((done/total)*100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: calcWidth(done) }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Tasks Per User</h3>
          <div className="space-y-4">
            {stats.byUser && stats.byUser.length > 0 ? (
              stats.byUser.map(u => (
                <div key={u._id || 'unassigned'} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-gray-700">
                    {u._id ? (u.userDetails?.name || 'User ID: ' + u._id) : 'Unassigned'}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                    {u.count} Tasks
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No tasks assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
