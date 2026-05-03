import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { AuthContext } from '../context/AuthContext.jsx';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [myProjects, setMyProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const [myRes, allRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/all')
      ]);
      setMyProjects(myRes.data);
      setAllProjects(allRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name, description });
      setName('');
      setDescription('');
      setError('');
      fetchProjects();
    } catch (err) {
      if (Array.isArray(err.response?.data?.error)) {
        setError(err.response.data.error.map(e => e.message).join(', '));
      } else {
        setError(err.response?.data?.error || 'Failed to create project');
      }
    }
  };

  const handleRequestJoin = async (projectId) => {
    try {
      await api.post(`/projects/${projectId}/request-join`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to request join');
    }
  };

  const renderProjectCard = (project, isMember) => {
    const hasRequested = project.joinRequests?.some(
      r => (r._id || r).toString() === user._id.toString()
    );

    return (
      <div key={project._id} className="bg-white border border-gray-200 p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col h-full">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{project.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{project.description || 'No description provided.'}</p>
        <div className="text-sm text-gray-500 mb-4">
          Members: {project.members.length}
        </div>
        
        {isMember ? (
          <Link to={`/projects/${project._id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center block">
            Open Board
          </Link>
        ) : hasRequested ? (
          <button disabled className="bg-gray-400 text-white font-medium py-2 px-4 rounded cursor-not-allowed w-full">
            Requested
          </button>
        ) : (
          <button 
            onClick={() => handleRequestJoin(project._id)} 
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded w-full"
          >
            Request to Join
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Projects</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Create New Project</h3>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleCreateProject} className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <input 
            type="text" 
            placeholder="Project Name" 
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input 
            type="text" 
            placeholder="Description (Optional)" 
            className="flex-1 border border-gray-300 rounded px-3 py-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded">
            Create
          </button>
        </form>
      </div>

      <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">My Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {myProjects.map(project => renderProjectCard(project, true))}
        {myProjects.length === 0 && (
          <div className="col-span-full text-gray-500 italic">
            You don't have any projects yet.
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">All Projects</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allProjects.map(project => {
          const isMember = project.members.some(m => (m.user._id || m.user).toString() === user._id.toString());
          return renderProjectCard(project, isMember);
        })}
        {allProjects.length === 0 && (
          <div className="col-span-full text-gray-500 italic">
            No projects found on the platform.
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
