import { Router } from 'express';
import Task from '../db/models/Task.js';
import Project from '../db/models/Project.js';
import { protect } from '../middleware/auth.js';
import { taskCreateSchema, taskUpdateSchema } from '../zod/validation.js';

const router = Router();
router.use(protect);

// GET all tasks for a project
router.get('/project/:projectId', async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  
  const isMember = project.members.some(m => m.user.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ error: 'Not authorized to view tasks for this project' });

  const tasks = await Task.find({ project: req.params.projectId })
    .populate('assignedTo', 'name email');
  res.json(tasks);
});

// POST create task (admin only check inside)
router.post('/', async (req, res) => {
  const { success, data, error } = taskCreateSchema.safeParse(req.body);
  if (!success) return res.status(400).json({ error: error.errors });

  const { title, description, dueDate, priority, projectId, assignedTo } = data;
  const project = await Project.findById(projectId);
  const member = project?.members.find(m => m.user.toString() === req.user.id);
  if (!member || member.role !== 'admin')
    return res.status(403).json({ error: 'Only admins can create tasks' });

  const task = await Task.create({
    title, description, dueDate, priority,
    project: projectId, assignedTo,
    createdBy: req.user.id
  });
  res.status(201).json(task);
});

// PATCH update task status (assigned member or admin)
router.patch('/:id', async (req, res) => {
  const { success, data, error } = taskUpdateSchema.safeParse(req.body);
  if (!success) return res.status(400).json({ error: error.errors });

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const project = await Project.findById(task.project);
  const member = project.members.find(m => m.user.toString() === req.user.id);
  const isAdmin = member?.role === 'admin';
  const isAssigned = task.assignedTo?.toString() === req.user.id;

  if (!isAdmin && !isAssigned)
    return res.status(403).json({ error: 'Not authorized' });

  // Members can only update status; admins can update everything
  if (!isAdmin) {
    if (data.status) task.status = data.status;
  } else {
    Object.assign(task, data);
  }

  await task.save();
  res.json(task);
});

export default router;