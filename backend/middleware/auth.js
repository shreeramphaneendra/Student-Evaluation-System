const jwt = require('jsonwebtoken');
const { Student, Teacher } = require('../models/User');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role === 'student') {
      req.user = await Student.findById(decoded.id).select('-password');
    } else {
      req.user = await Teacher.findById(decoded.id).select('-password');
    }
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    req.role = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const teacherOnly = (req, res, next) => {
  if (req.role !== 'teacher')
    return res.status(403).json({ message: 'Teacher access only' });
  next();
};

const studentOnly = (req, res, next) => {
  if (req.role !== 'student')
    return res.status(403).json({ message: 'Student access only' });
  next();
};

module.exports = { protect, teacherOnly, studentOnly };
