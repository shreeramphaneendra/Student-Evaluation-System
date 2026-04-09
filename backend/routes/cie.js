const express = require('express');
const router = express.Router();
const { protect, teacherOnly, studentOnly } = require('../middleware/auth');
const { Student, Teacher } = require('../models/User');
const CIE = require('../models/CIE');

// ─── TEACHER: GET STUDENTS FOR A SUBJECT ──────────────────────────────────
router.get('/students', protect, teacherOnly, async (req, res) => {
  try {
    const { semester, section } = req.query;
    if (!semester || !section)
      return res.status(400).json({ message: 'semester and section required' });

    const students = await Student.find({
      semester: Number(semester),
      section: section.toUpperCase()
    }).select('-password').sort({ usn: 1 });

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER: GET FULL SHEET FOR A SUBJECT ────────────────────────────────
router.get('/sheet', protect, teacherOnly, async (req, res) => {
  try {
    const { subjectName, semester, section } = req.query;

    // Get all students for this semester+section
    const students = await Student.find({
      semester: Number(semester),
      section: section.toUpperCase()
    }).select('-password').sort({ usn: 1 });

    // Get all existing CIE records for this teacher+subject
    const records = await CIE.find({
      teacher: req.user._id,
      subjectName,
      semester: Number(semester),
      section: section.toUpperCase()
    }).lean();

    // Map records by studentId for quick lookup
    const recordMap = {};
    records.forEach(r => { recordMap[r.student.toString()] = r; });

    // Build sheet: every student gets a row (empty if no record yet)
    const sheet = students.map(s => ({
      student: { id: s._id, name: s.name, usn: s.usn },
      record: recordMap[s._id.toString()] || null
    }));

    res.json(sheet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER: SAVE / UPDATE MARKS FOR ONE STUDENT ─────────────────────────
router.post('/save', protect, teacherOnly, async (req, res) => {
  try {
    const {
      studentId, subjectName, subjectCode, semester, section,
      subjectType, maxMarks,
      // theory
      st1, st2, st3, cep, ct1, ct2, attendance,
      // lab
      internal1, internal2, preparation, record, execution, report, conduct
    } = req.body;

    let cie = await CIE.findOne({
      student: studentId,
      teacher: req.user._id,
      subjectName,
      semester: Number(semester),
      section: section.toUpperCase()
    });

    const fields = {
      subjectCode, subjectType, maxMarks: Number(maxMarks),
      st1: num(st1), st2: num(st2), st3: num(st3),
      cep: num(cep), ct1: num(ct1), ct2: num(ct2), attendance: num(attendance),
      internal1: num(internal1), internal2: num(internal2),
      preparation: num(preparation), record: num(record),
      execution: num(execution), report: num(report), conduct: num(conduct)
    };

    if (!cie) {
      cie = new CIE({
        student: studentId,
        teacher: req.user._id,
        subjectName,
        semester: Number(semester),
        section: section.toUpperCase(),
        ...fields
      });
    } else {
      Object.assign(cie, fields);
    }

    cie.calculate();
    await cie.save();
    res.json(cie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER: BULK SAVE (entire sheet at once) ────────────────────────────
router.post('/bulk-save', protect, teacherOnly, async (req, res) => {
  try {
    const { rows } = req.body; // array of mark rows
    const results = [];

    for (const row of rows) {
      const {
        studentId, subjectName, subjectCode, semester, section,
        subjectType, maxMarks,
        st1, st2, st3, cep, ct1, ct2, attendance,
        internal1, internal2, preparation, record, execution, report, conduct
      } = row;

      let cie = await CIE.findOne({
        student: studentId,
        teacher: req.user._id,
        subjectName,
        semester: Number(semester),
        section: section.toUpperCase()
      });

      const fields = {
        subjectCode, subjectType, maxMarks: Number(maxMarks),
        st1: num(st1), st2: num(st2), st3: num(st3),
        cep: num(cep), ct1: num(ct1), ct2: num(ct2), attendance: num(attendance),
        internal1: num(internal1), internal2: num(internal2),
        preparation: num(preparation), record: num(record),
        execution: num(execution), report: num(report), conduct: num(conduct)
      };

      if (!cie) {
        cie = new CIE({
          student: studentId,
          teacher: req.user._id,
          subjectName,
          semester: Number(semester),
          section: section.toUpperCase(),
          ...fields
        });
      } else {
        Object.assign(cie, fields);
      }

      cie.calculate();
      await cie.save();
      results.push(cie);
    }

    res.json({ saved: results.length, records: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── STUDENT: GET OWN MARKS ───────────────────────────────────────────────
router.get('/my-marks', protect, studentOnly, async (req, res) => {
  try {
    const records = await CIE.find({ student: req.user._id })
      .populate('teacher', 'name department')
      .sort({ subjectName: 1 })
      .lean();

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── STUDENT: GET TEACHERS ASSIGNED TO THEIR SEMESTER+SECTION ────────────
router.get('/my-teachers', protect, studentOnly, async (req, res) => {
  try {
    const { semester, section } = req.user;
    const teachers = await Teacher.find({
      subjects: {
        $elemMatch: {
          semester: Number(semester),
          section: section.toUpperCase()
        }
      }
    }).select('-password').lean();

    // Only return subjects relevant to this student
    const filtered = teachers.map(t => ({
      ...t,
      subjects: t.subjects.filter(
        s => s.semester === Number(semester) && s.section.toUpperCase() === section.toUpperCase()
      )
    }));

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEACHER: GET STUDENTS ASSIGNED TO THEM ───────────────────────────────
router.get('/my-students', protect, teacherOnly, async (req, res) => {
  try {
    const result = [];
    for (const sub of req.user.subjects) {
      const students = await Student.find({
        semester: sub.semester,
        section: sub.section.toUpperCase()
      }).select('-password').sort({ usn: 1 }).lean();
      result.push({ subject: sub, students });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper: parse number safely
function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

module.exports = router;
