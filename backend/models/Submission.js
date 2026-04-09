const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student',    required: true },
  file:       { type: String, default: null },
  submittedAt:{ type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);