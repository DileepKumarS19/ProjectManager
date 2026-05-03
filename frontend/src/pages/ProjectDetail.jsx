import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import KanbanBoard from '../components/KanbanBoard.jsx';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  
  const fetchData = async () => {
    try {
      const [taskRes, projRes, usersRes] = await Promise.all([
        api.get(`/tasks/project/${id}`),
        api.get(`/projects/${id}`),
        api.get(`/users`) // assuming this exists from previous step
      ]);
      setTasks(taskRes.data);
      setProject(projRes.data);
      setAllUsers(usersRes.data || []);
      
      if (user && projRes.data) {
        const member = projRes.data.members.find(m => m.user?._id === user._id);
        setIsAdmin(member?.role === 'admin');
      }
    } catch (err) { 
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newTask, projectId: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      
      await api.post('/tasks', payload);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' });
      setShowTaskForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task (Admins only)');
    }
  };

  const handleApproveJoin = async (userId) => {
    try {
      await api.post(`/projects/${id}/approve-join/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleRejectJoin = async (userId) => {
    try {
      await api.delete(`/projects/${id}/reject-join/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserToAdd) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: selectedUserToAdd, role: 'member' });
      setSelectedUserToAdd('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleMoveTask = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      // Optimistic update
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  if (!project) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{project.name}</h2>
          <p className="text-gray-600">{project.description}</p>
        </div>
        <div className="flex space-x-4">
          <Link to={`/dashboard/${id}`} className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded shadow">
            View Dashboard
          </Link>
          {isAdmin && (
            <button 
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow"
            >
              {showTaskForm ? 'Cancel' : '+ New Task'}
            </button>
          )}
        </div>
      </div>

      {isAdmin && project.joinRequests?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-8 shadow-sm">
          <h3 className="font-semibold text-yellow-800 mb-3">Pending Join Requests ({project.joinRequests.length})</h3>
          <div className="space-y-2">
            {project.joinRequests.map(reqUser => (
              <div key={reqUser._id} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-yellow-100">
                <div>
                  <p className="font-medium">{reqUser?.name}</p>
                  <p className="text-sm text-gray-500">{reqUser?.email}</p>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleApproveJoin(reqUser._id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">Approve</button>
                  <button onClick={() => handleRejectJoin(reqUser._id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Manage Members</h3>
          <form onSubmit={handleAddMember} className="flex space-x-4 mb-4">
            <select 
              className="border border-gray-300 rounded px-3 py-2 flex-1"
              value={selectedUserToAdd}
              onChange={e => setSelectedUserToAdd(e.target.value)}
            >
              <option value="">Select User to Add...</option>
              {allUsers.filter(u => !project.members.some(m => m.user?._id === u._id)).map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow">
              Add Member
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {project.members.map(m => (
              <span key={m.user?._id} className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
                {m.user?.name} ({m.role})
                {m.role !== 'admin' && (
                  <button onClick={() => handleRemoveMember(m.user?._id)} className="ml-2 text-red-500 hover:text-red-700 font-bold" title="Remove member">
                    &times;
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {showTaskForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Task</h3>
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" placeholder="Task Title" required
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})}
            />
            <input 
              type="date"
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
            />
            <input 
              type="text" placeholder="Description" 
              className="border border-gray-300 rounded px-3 py-2 w-full md:col-span-2"
              value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
            />
            <select 
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select 
              className="border border-gray-300 rounded px-3 py-2 w-full"
              value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
            >
              <option value="">Unassigned</option>
              {project.members.map(m => (
                <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
              ))}
            </select>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-medium rounded py-2">
              Save Task
            </button>
          </form>
        </div>
      )}

      <KanbanBoard tasks={tasks} onMoveTask={handleMoveTask} />
    </div>
  );
};

export default ProjectDetail;
