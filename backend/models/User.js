const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── STUDENT ───────────────────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  usn:      { type: String, required: true, unique: true, trim: true, uppercase: true },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  section:  { type: String, required: true, trim: true, uppercase: true },
  branch:   { type: String, required: true, trim: true },
  role:     { type: String, default: 'student' }
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

studentSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ─── TEACHER ───────────────────────────────────────────────────────────────
const teacherSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, unique: true, trim: true, uppercase: true },
  email:      { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:   { type: String, required: true },
  department: { type: String, required: true, trim: true },
  subjects: [{
    subjectName: { type: String, required: true, trim: true },
    subjectCode: { type: String, trim: true },
    semester:    { type: Number, required: true, min: 1, max: 8 },
    section:     { type: String, required: true, trim: true, uppercase: true },
    subjectType: { type: String, enum: ['theory', 'lab', 'none'], default: 'theory' },
    maxMarks:    { type: Number, enum: [40, 50], default: 40 }
  }],
  role: { type: String, default: 'teacher' }
}, { timestamps: true });

teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

teacherSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = { Student, Teacher };
