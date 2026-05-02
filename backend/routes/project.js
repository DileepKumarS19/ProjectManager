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
    .populate('members.user', 'name email');
  res.json(projects);
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

export default router;