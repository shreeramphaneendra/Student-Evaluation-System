const mongoose = require('mongoose');

const cieSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subjectName: { type: String, required: true, trim: true },
  subjectCode: { type: String, trim: true },
  semester:    { type: Number, required: true },
  section:     { type: String, required: true, uppercase: true },
  subjectType: { type: String, enum: ['theory', 'lab', 'none'], default: 'theory' },
  maxMarks:    { type: Number, enum: [40, 50], default: 40 },

  // ── THEORY MARKS ───────────────────────────────────────────────────────
  // ST: Slip Tests (each out of 5), best 2 of 3 → avg → ceil
  st1: { type: Number, default: null, min: 0, max: 5 },
  st2: { type: Number, default: null, min: 0, max: 5 },
  st3: { type: Number, default: null, min: 0, max: 5 },
  // CEP: Continuous Evaluation Performance (out of 10)
  cep: { type: Number, default: null, min: 0, max: 10 },
  // CT: Class Tests (each out of 20), avg → ceil
  ct1: { type: Number, default: null, min: 0, max: 20 },
  ct2: { type: Number, default: null, min: 0, max: 20 },
  // Attendance (out of 5)
  attendance: { type: Number, default: null, min: 0, max: 5 },

  // ── LAB MARKS ──────────────────────────────────────────────────────────
  // Internals (each out of 20), avg → ceil
  internal1:  { type: Number, default: null, min: 0, max: 20 },
  internal2:  { type: Number, default: null, min: 0, max: 20 },
  // Fixed components
  preparation: { type: Number, default: null, min: 0, max: 5 },
  record:      { type: Number, default: null, min: 0, max: 10 },
  execution:   { type: Number, default: null, min: 0, max: 5 },
  report:      { type: Number, default: null, min: 0, max: 5 },
  conduct:     { type: Number, default: null, min: 0, max: 5 },

  // ── COMPUTED ───────────────────────────────────────────────────────────
  computedCIE: { type: Number, default: null },
  breakdown:   { type: Object, default: null }

}, { timestamps: true });

// ─── CIE CALCULATION ────────────────────────────────────────────────────────
cieSchema.methods.calculate = function () {
  if (this.subjectType === 'none') {
    this.computedCIE = null;
    this.breakdown = { note: 'No CIE for this subject' };
    return;
  }

  if (this.subjectType === 'theory') {
    // ST: best 2 of 3
    const sts = [this.st1, this.st2, this.st3].filter(v => v !== null && v !== undefined);
    let stComp = 0;
    if (sts.length >= 2) {
      const sorted = [...sts].sort((a, b) => b - a);
      stComp = Math.ceil((sorted[0] + sorted[1]) / 2);
    } else if (sts.length === 1) {
      stComp = Math.ceil(sts[0]);
    }

    // CEP: direct
    const cepComp = this.cep ?? 0;

    // CT: avg of both → ceil
    const cts = [this.ct1, this.ct2].filter(v => v !== null && v !== undefined);
    let ctComp = 0;
    if (cts.length === 2) ctComp = Math.ceil((cts[0] + cts[1]) / 2);
    else if (cts.length === 1) ctComp = Math.ceil(cts[0]);

    // Attendance
    const attnComp = this.attendance ?? 0;

    const total = stComp + cepComp + ctComp + attnComp;
    this.computedCIE = total;
    this.breakdown = { st: stComp, cep: cepComp, ct: ctComp, attendance: attnComp, total, max: 40 };
    return;
  }

  if (this.subjectType === 'lab') {
    // Internals avg → ceil
    const ints = [this.internal1, this.internal2].filter(v => v !== null && v !== undefined);
    let intComp = 0;
    if (ints.length === 2) intComp = Math.ceil((ints[0] + ints[1]) / 2);
    else if (ints.length === 1) intComp = Math.ceil(ints[0]);

    const prep    = this.preparation ?? 0;
    const rec     = this.record      ?? 0;
    const exec    = this.execution   ?? 0;
    const rep     = this.report      ?? 0;
    const conduct = this.conduct     ?? 0;

    const total = intComp + prep + rec + exec + rep + conduct;
    this.computedCIE = total;
    this.breakdown = { internal: intComp, preparation: prep, record: rec, execution: exec, report: rep, conduct, total, max: 50 };
  }
};

module.exports = mongoose.model('CIE', cieSchema);
