const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, teacherOnly } = require('../middleware/auth');
const Assignment = require('../models/Assignment');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// ─── TEACHER: CREATE ASSIGNMENT ───────────────────────────────────────────
router.post('/create', protect, teacherOnly, upload.single('pdf'), async (req, res) => {
  try {
    const { title, description, googleForm, subjectName, semester, section, deadline } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      googleForm: googleForm || null,
      pdfFile: req.file ? req.file.filename : null,
      type: req.file && googleForm ? 'both' : req.file ? 'pdf' : 'googleform',
      teacher: req.user._id,
      subjectName,
      semester: Number(semester),
      section: section.toUpperCase(),
      deadline: deadline || null
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER: GET OWN ASSIGNMENTS ─────────────────────────────────────────
router.get('/teacher', protect, teacherOnly, async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacher: req.user._id })
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── STUDENT: GET ASSIGNMENTS FOR THEIR SEMESTER+SECTION ─────────────────
router.get('/student', protect, async (req, res) => {
  try {
    if (req.role !== 'student') return res.status(403).json({ message: 'Students only' });

    const assignments = await Assignment.find({
      semester: req.user.semester,
      section: req.user.section.toUpperCase()
    })
      .populate('teacher', 'name department')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER: GET SUBMISSIONS FOR AN ASSIGNMENT ───────────────────────────
router.get('/submissions/:assignmentId', protect, teacherOnly, async (req, res) => {
  try {
    const Submission = require('../models/Submission');
    let subs = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name usn section')
      .lean();

    subs.sort((a, b) => {
      const usnA = a.student?.usn || '';
      const usnB = b.student?.usn || '';
      return usnA.localeCompare(usnB);
    });

    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER: DELETE ASSIGNMENT ───────────────────────────────────────────
router.delete('/:id', protect, teacherOnly, async (req, res) => {
  try {
    await Assignment.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
