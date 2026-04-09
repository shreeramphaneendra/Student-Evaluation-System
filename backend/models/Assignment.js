const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type:        { type: String, enum: ['pdf', 'googleform', 'both'], default: 'pdf' },
  pdfFile:     { type: String, default: null },
  googleForm:  { type: String, default: null },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subjectName: { type: String, required: true },
  semester:    { type: Number, required: true },
  section:     { type: String, required: true, uppercase: true },
  deadline:    { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
