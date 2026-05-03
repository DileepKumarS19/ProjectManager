import mongoose from 'mongoose';
import { Router } from 'express';
import Task from '../db/models/Task.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  // Check membership
  const project = await mongoose.model('Project').findById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const isMember = project.members.some(m => m.user.toString() === req.user.id);
  if (!isMember) return res.status(403).json({ error: 'Not authorized to view dashboard for this project' });

  const [byStatus, byUser, overdue, total] = await Promise.all([
    Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Task.aggregate([
      { $match: { project: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      { $project: { count: 1, 'userDetails.name': 1 } }
    ]),
    Task.countDocuments({
      project: projectId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    }),
    Task.countDocuments({ project: projectId })
  ]);

  res.json({ total, byStatus, byUser, overdue });
});

export default router;