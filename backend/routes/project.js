import { Router } from 'express';
import Project from '../db/models/Project.js';
import { protect } from '../middleware/auth.js';
import { requireProjectAdmin } from '../middleware/roleCheck.js';
import { projectCreateSchema, projectMemberSchema } from '../zod/validation.js';

const router = Router();
router.use(protect); // all project routes are protected

// GET all projects the logged-in user is part of
router.get('/', async (req, res) => {
  const projects = await Project.find({ 'members.user': req.user.id })
    .populate('members.user', 'name email')
    .populate('joinRequests', 'name email');
  res.json(projects);
});

// GET all projects globally
router.get('/all', async (req, res) => {
  const projects = await Project.find()
    .populate('members.user', 'name email')
    .populate('joinRequests', 'name email');
  res.json(projects);
});

// GET single project
router.get('/:id', async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members.user', 'name email')
    .populate('joinRequests', 'name email');
  if (!project) return res.status(404).json({ error: 'Project not found' });
  
  const isMember = project.members.some(m => m.user._id.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ error: 'Not authorized' });
  
  res.json(project);
});

// POST create project (creator = admin)
router.post('/', async (req, res) => {
  const { success, data, error } = projectCreateSchema.safeParse(req.body);
  if (!success) return res.status(400).json({ error: error.errors });

  const { name, description } = data;
  const project = await Project.create({
    name, description,
    createdBy: req.user.id,
    members: [{ user: req.user.id, role: 'admin' }]
  });
  res.status(201).json(project);
});

// POST add member (admin only)
router.post('/:id/members', requireProjectAdmin, async (req, res) => {
  const { success, data, error } = projectMemberSchema.safeParse(req.body);
  if (!success) return res.status(400).json({ error: error.errors });
  
  const { userId, role } = data;
  const project = req.project;
  const alreadyMember = project.members.find(m => m.user.toString() === userId);
  if (alreadyMember) return res.status(400).json({ error: 'Already a member' });

  project.members.push({ user: userId, role: role || 'member' });
  await project.save();
  res.json(project);
});

// DELETE remove member (admin only)
router.delete('/:id/members/:userId', requireProjectAdmin, async (req, res) => {
  req.project.members = req.project.members.filter(
    m => m.user.toString() !== req.params.userId
  );
  await req.project.save();
  res.json({ message: 'Member removed' });
});

// POST request to join a project
router.post('/:id/request-join', async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  
  const isMember = project.members.some(m => m.user.toString() === req.user.id);
  if (isMember) return res.status(400).json({ error: 'Already a member' });

  if (!project.joinRequests) project.joinRequests = [];
  const alreadyRequested = project.joinRequests.some(id => id.toString() === req.user.id);
  if (alreadyRequested) return res.status(400).json({ error: 'Already requested to join' });

  project.joinRequests.push(req.user.id);
  await project.save();
  res.json({ message: 'Join request sent' });
});

// POST approve join request (admin only)
router.post('/:id/approve-join/:userId', requireProjectAdmin, async (req, res) => {
  const project = req.project;
  const userId = req.params.userId;
  
  if (!project.joinRequests) project.joinRequests = [];
  project.joinRequests = project.joinRequests.filter(id => id.toString() !== userId);
  
  const alreadyMember = project.members.some(m => m.user.toString() === userId);
  if (!alreadyMember) {
    project.members.push({ user: userId, role: 'member' });
  }
  
  await project.save();
  res.json({ message: 'Request approved' });
});

// DELETE reject join request (admin only)
router.delete('/:id/reject-join/:userId', requireProjectAdmin, async (req, res) => {
  const project = req.project;
  const userId = req.params.userId;
  
  if (!project.joinRequests) project.joinRequests = [];
  project.joinRequests = project.joinRequests.filter(id => id.toString() !== userId);
  
  await project.save();
  res.json({ message: 'Request rejected' });
});

export default router;