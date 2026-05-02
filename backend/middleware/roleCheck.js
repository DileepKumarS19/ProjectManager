import Project from '../db/models/Project.js';

export const requireAppAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'App admin access only' });
  next();
};

export const requireProjectAdmin = async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const member = project.members.find(m => m.user.toString() === req.user.id);
  if (!member || member.role !== 'admin')
    return res.status(403).json({ error: 'Project admin access only' });

  req.project = project;
  next();
};

export const requireProjectMember = async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const member = project.members.find(m => m.user.toString() === req.user.id);
  if (!member)
    return res.status(403).json({ error: 'Not a member of this project' });

  req.project = project;
  req.projectRole = member.role; // pass role downstream
  next();
};