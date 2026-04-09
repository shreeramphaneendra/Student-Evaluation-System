const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Student, Teacher } = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── STUDENT REGISTER ──────────────────────────────────────────────────────
router.post('/student/register', async (req, res) => {
  try {
    const { name, usn, email, password, semester, section, branch } = req.body;

    if (!name || !usn || !email || !password || !semester || !section || !branch)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await Student.findOne({ $or: [{ email }, { usn }] });
    if (exists) return res.status(400).json({ message: 'Email or USN already registered' });

    const student = await Student.create({ name, usn, email, password, semester: Number(semester), section, branch });

    res.status(201).json({
      token: sign(student._id, 'student'),
      user: { id: student._id, name, usn, email, semester: student.semester, section, branch, role: 'student' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── STUDENT LOGIN ─────────────────────────────────────────────────────────
router.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const student = await Student.findOne({ email });
    if (!student || !(await student.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      token: sign(student._id, 'student'),
      user: { id: student._id, name: student.name, usn: student.usn, email: student.email, semester: student.semester, section: student.section, branch: student.branch, role: 'student' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER REGISTER ──────────────────────────────────────────────────────
router.post('/teacher/register', async (req, res) => {
  try {
    const { name, employeeId, email, password, department, subjects } = req.body;

    if (!name || !employeeId || !email || !password || !department)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await Teacher.findOne({ $or: [{ email }, { employeeId }] });
    if (exists) return res.status(400).json({ message: 'Email or Employee ID already registered' });

    const teacher = await Teacher.create({ name, employeeId, email, password, department, subjects: subjects || [] });

    res.status(201).json({
      token: sign(teacher._id, 'teacher'),
      user: { id: teacher._id, name, employeeId, email, department, subjects: teacher.subjects, role: 'teacher' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER LOGIN ─────────────────────────────────────────────────────────
router.post('/teacher/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const teacher = await Teacher.findOne({ email });
    if (!teacher || !(await teacher.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      token: sign(teacher._id, 'teacher'),
      user: { id: teacher._id, name: teacher.name, employeeId: teacher.employeeId, email: teacher.email, department: teacher.department, subjects: teacher.subjects, role: 'teacher' }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET PROFILE ───────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user, role: req.role });
});

// ─── TEACHER: ADD SUBJECT ──────────────────────────────────────────────────
router.post('/teacher/add-subject', protect, async (req, res) => {
  try {
    if (req.role !== 'teacher') return res.status(403).json({ message: 'Teacher only' });
    const { subjectName, subjectCode, semester, section, subjectType, maxMarks } = req.body;

    await Teacher.findByIdAndUpdate(req.user._id, {
      $push: { subjects: { subjectName, subjectCode, semester: Number(semester), section, subjectType, maxMarks: Number(maxMarks) } }
    });

    const updated = await Teacher.findById(req.user._id).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER: REMOVE SUBJECT ───────────────────────────────────────────────
router.delete('/teacher/remove-subject/:subjectId', protect, async (req, res) => {
  try {
    if (req.role !== 'teacher') return res.status(403).json({ message: 'Teacher only' });

    await Teacher.findByIdAndUpdate(req.user._id, {
      $pull: { subjects: { _id: req.params.subjectId } }
    });

    const updated = await Teacher.findById(req.user._id).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
