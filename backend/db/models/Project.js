import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: String,
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' }
  }]
}, { timestamps: true });

const ProjectModel = mongoose.model("Project", projectSchema);

export default ProjectModel;