const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { protect } = require('../middleware/auth');
const Submission = require('../models/Submission');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Student submits assignment
router.post('/submit', protect, upload.single('file'), async (req, res) => {
  try {
    const { assignmentId } = req.body;
    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user._id });
    if (existing) {
      existing.file = req.file ? req.file.filename : existing.file;
      existing.submittedAt = new Date();
      await existing.save();
      return res.json({ message: 'Submission updated', submission: existing });
    }
    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      file: req.file ? req.file.filename : null
    });
    res.status(201).json({ message: 'Submitted!', submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student's own submissions
router.get('/my-submissions', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title subjectName')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;