import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2, LogOut, BookOpen, Users, FileText, Plus, Trash2,
  Save, RefreshCw, Upload, X, Settings, Download
} from 'lucide-react';

const SECTIONS    = ['1','2','3','4','5'];
const DEPARTMENTS = ['CSE','ISE','ECE','EEE','ME','CE','AIML','DS','IT','Civil'];

const NAV = [
  { id:'overview',    label:'Overview',      icon:<BarChart2 size={16}/> },
  { id:'cie',         label:'CIE Sheet',     icon:<BookOpen size={16}/> },
  { id:'students',    label:'My Students',   icon:<Users size={16}/> },
  { id:'assignments', label:'Assignments',   icon:<FileText size={16}/> },
  { id:'subjects',    label:'Manage Subjects',icon:<Settings size={16}/> },
];

export default function TeacherDashboard() {
  const { user, logout, updateUser } = useAuth();
  const nav = useNavigate();
  const [tab, setTab]     = useState('overview');
  const [myStudents, setMyStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/cie/my-students'),
      axios.get('/api/assignments/teacher'),
    ]).then(([s, a]) => {
      setMyStudents(s.data);
      setAssignments(a.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const doLogout = () => { logout(); nav('/'); };
  const totalStudents = myStudents.reduce((a, s) => a + s.students.length, 0);

  return (
    <div className="page">
      <nav className="nav">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7c6fff,#22d3ee)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BarChart2 size={16} color="#fff"/>
          </div>
          <span className="nav-logo">Eval<span>Pro</span></span>
          <span className="tag tag-cyan" style={{ marginLeft:4 }}>Teacher</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:13, fontWeight:600 }}>{user?.name}</p>
            <p style={{ fontSize:11, color:'var(--text2)' }}>{user?.department} · <span className="mono">{user?.employeeId}</span></p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={doLogout}><LogOut size={14}/> Logout</button>
        </div>
      </nav>

      <div className="layout">
        <aside className="sidebar">
          {NAV.map(n => (
            <button key={n.id} className={`sidebar-item ${tab===n.id?'active':''}`} onClick={() => setTab(n.id)}>
              {n.icon}{n.label}
            </button>
          ))}
        </aside>

        <main className="main-content">
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
              <span className="spinner" style={{ width:32, height:32 }}/>
            </div>
          ) : (
            <>
              {tab==='overview'    && <TeacherOverview user={user} myStudents={myStudents} assignments={assignments} totalStudents={totalStudents}/>}
              {tab==='cie'         && <CIESheetTab user={user}/>}
              {tab==='students'    && <StudentsTab myStudents={myStudents}/>}
              {tab==='assignments' && <AssignmentsTab assignments={assignments} user={user} reload={loadData}/>}
              {tab==='subjects'    && <SubjectsTab user={user} updateUser={updateUser}/>}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────────
function TeacherOverview({ user, myStudents, assignments, totalStudents }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="card fade-up" style={{ background:'linear-gradient(135deg,rgba(34,211,238,.1),rgba(124,111,255,.08))', border:'1px solid rgba(34,211,238,.2)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:50, height:50, borderRadius:13, background:'rgba(34,211,238,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BookOpen size={26} color="var(--cyan)"/>
          </div>
          <div>
            <h2 style={{ fontFamily:'Syne', fontSize:22 }}>Welcome, {user?.name?.split(' ')[0]}!</h2>
            <p style={{ color:'var(--text2)', fontSize:13 }}>{user?.department} Department · {myStudents.length} subject{myStudents.length!==1?'s':''} assigned</p>
          </div>
        </div>
      </div>
      <div className="grid4 fade-up2">
        <StatCard val={user?.subjects?.length||0} label="Subjects" color="var(--cyan)"/>
        <StatCard val={totalStudents}              label="Total Students" color="var(--accent2)"/>
        <StatCard val={assignments.length}         label="Assignments" color="var(--gold)"/>
        <StatCard val={myStudents.length}          label="Sections" color="var(--green)"/>
      </div>
      {myStudents.length > 0 && (
        <div className="card fade-up3">
          <h3 style={{ fontFamily:'Syne', marginBottom:16, fontSize:16 }}>Your Subjects</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {myStudents.map((s,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg3)', borderRadius:'var(--r3)', border:'1px solid var(--border)' }}>
                <div>
                  <p style={{ fontWeight:600 }}>{s.subject.subjectName}</p>
                  <p style={{ fontSize:12, color:'var(--text2)' }}>Sem {s.subject.semester} · Section {s.subject.section}</p>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span className={`tag ${s.subject.subjectType==='lab'?'tag-cyan':s.subject.subjectType==='none'?'tag-red':'tag-purple'}`}>
                    {s.subject.subjectType==='lab'?'Lab (50)':s.subject.subjectType==='none'?'No CIE':'Theory (40)'}
                  </span>
                  <span className="tag tag-gold">{s.students.length} students</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ val, label, color }) {
  return (
    <div className="stat-card">
      <span className="stat-val" style={{ color }}>{val}</span>
      <span className="stat-lbl">{label}</span>
    </div>
  );
}

// ── CIE SHEET TAB ─────────────────────────────────────────────────────────────
function CIESheetTab({ user }) {
  const subjects = user?.subjects || [];
  const [selectedSub, setSelectedSub] = useState(subjects[0] || null);
  const [sheet, setSheet]   = useState([]);
  const [edits, setEdits]   = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);

  const loadSheet = async (sub) => {
    if (!sub) return;
    setLoading(true);
    try {
      const { data } = await axios.get('/api/cie/sheet', {
        params: { subjectName: sub.subjectName, semester: sub.semester, section: sub.section }
      });
      setSheet(data);
      // seed edits from existing records
      const init = {};
      data.forEach(row => {
        if (row.record) init[row.student.id] = flattenRecord(row.record);
        else init[row.student.id] = emptyMarks(sub.subjectType);
      });
      setEdits(init);
    } catch { toast.error('Failed to load sheet'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSheet(selectedSub); }, [selectedSub]);

  const setMark = (studentId, field, val) => {
    setEdits(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: val } }));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const rows = sheet.map(row => ({
        studentId:   row.student.id,
        subjectName: selectedSub.subjectName,
        subjectCode: selectedSub.subjectCode,
        semester:    selectedSub.semester,
        section:     selectedSub.section,
        subjectType: selectedSub.subjectType,
        maxMarks:    selectedSub.maxMarks,
        ...parseMarks(edits[row.student.id] || {}, selectedSub.subjectType)
      }));
      await axios.post('/api/cie/bulk-save', { rows });
      toast.success('All marks saved!');
      loadSheet(selectedSub);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (!subjects.length) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <p style={{ color:'var(--text2)', marginBottom:16 }}>No subjects assigned yet.</p>
      <p style={{ color:'var(--text3)', fontSize:13 }}>Go to "Manage Subjects" to add subjects.</p>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <h2 style={{ fontFamily:'Syne', fontSize:20 }}>CIE Evaluation Sheet</h2>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => loadSheet(selectedSub)}>
            <RefreshCw size={13}/> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={saveAll} disabled={saving}>
            {saving ? <span className="spinner"/> : <Save size={13}/>} Save All
          </button>
        </div>
      </div>

      {/* Subject selector */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {subjects.map((s, i) => (
          <button key={i}
            onClick={() => setSelectedSub(s)}
            className="btn btn-sm"
            style={{ background: selectedSub?.subjectName===s.subjectName && selectedSub?.section===s.section ? 'var(--accent)' : 'var(--surface2)', color: selectedSub?.subjectName===s.subjectName && selectedSub?.section===s.section ? '#fff' : 'var(--text2)', border:'1px solid var(--border2)' }}>
            {s.subjectName} · Sem{s.semester} · {s.section}
            <span className={`tag ${s.subjectType==='lab'?'tag-cyan':'tag-purple'}`} style={{ marginLeft:4 }}>{s.subjectType==='lab'?'Lab':'Theory'}</span>
          </button>
        ))}
      </div>

      {selectedSub && (
        <div style={{ fontSize:13, color:'var(--text2)', display:'flex', gap:16, flexWrap:'wrap' }}>
          <span>📘 {selectedSub.subjectName} {selectedSub.subjectCode && `(${selectedSub.subjectCode})`}</span>
          <span>📅 Semester {selectedSub.semester}</span>
          <span>👥 Section {selectedSub.section}</span>
          <span className={`tag ${selectedSub.subjectType==='lab'?'tag-cyan':'tag-purple'}`}>
            {selectedSub.subjectType==='lab'?`Lab — Max 50`:selectedSub.subjectType==='none'?'No CIE':'Theory — Max 40'}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:40 }}><span className="spinner" style={{ width:28, height:28 }}/></div>
      ) : sheet.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text2)' }}>
          <p>No students found for Semester {selectedSub?.semester}, Section {selectedSub?.section}.</p>
          <p style={{ fontSize:12, color:'var(--text3)', marginTop:8 }}>Students need to register with matching semester and section.</p>
        </div>
      ) : (
        <div style={{ overflowX:'auto', borderRadius:'var(--r)', border:'1px solid var(--border)' }}>
          {selectedSub?.subjectType === 'theory' && (
            <TheorySheet sheet={sheet} edits={edits} setMark={setMark}/>
          )}
          {selectedSub?.subjectType === 'lab' && (
            <LabSheet sheet={sheet} edits={edits} setMark={setMark}/>
          )}
          {selectedSub?.subjectType === 'none' && (
            <div style={{ padding:24, textAlign:'center', color:'var(--text2)' }}>No CIE for this subject.</div>
          )}
        </div>
      )}
    </div>
  );
}

// THEORY SHEET (ST1 ST2 ST3 | CEP | CT1 CT2 | ATTN | CIE)
function TheorySheet({ sheet, edits, setMark }) {
  return (
    <table className="eval-table">
      <thead>
        <tr>
          <th className="left" rowSpan={2}>#</th>
          <th className="left" rowSpan={2} style={{ minWidth:160 }}>Student</th>
          <th className="left" rowSpan={2} style={{ minWidth:120 }}>USN</th>
          <th className="grp" colSpan={3}>SLIP TEST (5)</th>
          <th rowSpan={2}>CEP<br/>(10)</th>
          <th className="grp" colSpan={2}>CLASS TEST (20)</th>
          <th rowSpan={2}>ATTN<br/>(5)</th>
          <th rowSpan={2} style={{ minWidth:80 }}>CIE<br/>(40)</th>
        </tr>
        <tr>
          <th>ST1</th><th>ST2</th><th>ST3</th>
          <th>CT1</th><th>CT2</th>
        </tr>
      </thead>
      <tbody>
        {sheet.map((row, i) => {
          const e  = edits[row.student.id] || {};
          const bd = row.record?.breakdown;
          return (
            <tr key={row.student.id}>
              <td style={{ color:'var(--text3)', fontFamily:'JetBrains Mono', fontSize:11 }}>{i+1}</td>
              <td className="left" style={{ fontWeight:500 }}>{row.student.name}</td>
              <td className="left mono" style={{ fontSize:11, color:'var(--text2)' }}>{row.student.usn}</td>
              {['st1','st2','st3'].map(f => (
                <td key={f}><MI val={e[f]} max={5} onChange={v => setMark(row.student.id, f, v)}/></td>
              ))}
              <td><MI val={e.cep} max={10} onChange={v => setMark(row.student.id,'cep',v)}/></td>
              {['ct1','ct2'].map(f => (
                <td key={f}><MI val={e[f]} max={20} onChange={v => setMark(row.student.id, f, v)}/></td>
              ))}
              <td><MI val={e.attendance} max={5} onChange={v => setMark(row.student.id,'attendance',v)}/></td>
              <td>
                {row.record?.computedCIE != null
                  ? <span className="cie-cell">{row.record.computedCIE}/40</span>
                  : <span style={{ color:'var(--text3)', fontSize:12 }}>—</span>
                }
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// LAB SHEET (I1 I2 | Prep Record Exec Report Conduct | CIE)
function LabSheet({ sheet, edits, setMark }) {
  return (
    <table className="eval-table">
      <thead>
        <tr>
          <th className="left" rowSpan={2}>#</th>
          <th className="left" rowSpan={2} style={{ minWidth:160 }}>Student</th>
          <th className="left" rowSpan={2} style={{ minWidth:120 }}>USN</th>
          <th className="grp" colSpan={2}>INTERNAL (20)</th>
          <th className="grp" colSpan={5}>COMPONENTS</th>
          <th rowSpan={2} style={{ minWidth:80 }}>CIE<br/>(50)</th>
        </tr>
        <tr>
          <th>I1</th><th>I2</th>
          <th>PREP<br/>(5)</th><th>RECORD<br/>(10)</th><th>EXEC<br/>(5)</th><th>REPORT<br/>(5)</th><th>CONDUCT<br/>(5)</th>
        </tr>
      </thead>
      <tbody>
        {sheet.map((row, i) => {
          const e = edits[row.student.id] || {};
          return (
            <tr key={row.student.id}>
              <td style={{ color:'var(--text3)', fontFamily:'JetBrains Mono', fontSize:11 }}>{i+1}</td>
              <td className="left" style={{ fontWeight:500 }}>{row.student.name}</td>
              <td className="left mono" style={{ fontSize:11, color:'var(--text2)' }}>{row.student.usn}</td>
              <td><MI val={e.internal1} max={20} onChange={v => setMark(row.student.id,'internal1',v)}/></td>
              <td><MI val={e.internal2} max={20} onChange={v => setMark(row.student.id,'internal2',v)}/></td>
              <td><MI val={e.preparation} max={5}  onChange={v => setMark(row.student.id,'preparation',v)}/></td>
              <td><MI val={e.record}      max={10} onChange={v => setMark(row.student.id,'record',v)}/></td>
              <td><MI val={e.execution}   max={5}  onChange={v => setMark(row.student.id,'execution',v)}/></td>
              <td><MI val={e.report}      max={5}  onChange={v => setMark(row.student.id,'report',v)}/></td>
              <td><MI val={e.conduct}     max={5}  onChange={v => setMark(row.student.id,'conduct',v)}/></td>
              <td>
                {row.record?.computedCIE != null
                  ? <span className="cie-cell">{row.record.computedCIE}/50</span>
                  : <span style={{ color:'var(--text3)', fontSize:12 }}>—</span>
                }
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Marks Input cell
function MI({ val, max, onChange }) {
  const [v, setV] = useState(val ?? '');
  useEffect(() => { setV(val ?? ''); }, [val]);
  const invalid = v !== '' && (isNaN(v) || Number(v) < 0 || Number(v) > max);
  return (
    <input
      className={`marks-input${invalid?' err':''}`}
      type="number" min={0} max={max} step="0.5"
      value={v}
      onChange={e => { setV(e.target.value); onChange(e.target.value); }}
      placeholder="—"
      title={`Max: ${max}`}
    />
  );
}

// ── STUDENTS TAB ──────────────────────────────────────────────────────────────
function StudentsTab({ myStudents }) {
  if (!myStudents.length) return <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text2)' }}>No students assigned yet.</div>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <h2 style={{ fontFamily:'Syne', fontSize:20 }}>My Students</h2>
      {myStudents.map((group, i) => (
        <div key={i} className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
            <div>
              <h3 style={{ fontFamily:'Syne', fontSize:17 }}>{group.subject.subjectName}</h3>
              <p style={{ color:'var(--text2)', fontSize:13 }}>Sem {group.subject.semester} · Section {group.subject.section}</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <span className={`tag ${group.subject.subjectType==='lab'?'tag-cyan':'tag-purple'}`}>{group.subject.subjectType==='lab'?'Lab':'Theory'}</span>
              <span className="tag tag-gold">{group.students.length} students</span>
            </div>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="eval-table">
              <thead>
                <tr>
                  <th className="left">#</th>
                  <th className="left">Name</th>
                  <th className="left">USN</th>
                  <th>Branch</th>
                  <th>Semester</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {group.students.map((s, j) => (
                  <tr key={s._id}>
                    <td style={{ color:'var(--text3)', fontFamily:'JetBrains Mono', fontSize:11 }}>{j+1}</td>
                    <td className="left" style={{ fontWeight:500 }}>{s.name}</td>
                    <td className="left mono" style={{ fontSize:11, color:'var(--text2)' }}>{s.usn}</td>
                    <td><span className="tag tag-purple">{s.branch}</span></td>
                    <td>{s.semester}</td>
                    <td>{s.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ASSIGNMENTS TAB ───────────────────────────────────────────────────────────
function AssignmentsTab({ assignments, user, reload }) {
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm]               = useState({ title:'', description:'', googleForm:'', subjectName:'', semester:'', section:'', deadline:'' });
  const [file, setFile]               = useState(null);
  const [saving, setSaving]           = useState(false);
  const [viewSubs, setViewSubs]       = useState(null); // assignment id
  const [subs, setSubs]               = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const fileRef = useRef();
  const subjects = user?.subjects || [];

  const onSubjectChange = e => {
    const idx = e.target.value;
    if (idx === '') { setForm({...form, subjectName:'', semester:'', section:''}); return; }
    const s = subjects[parseInt(idx)];
    setForm({...form, subjectName:s.subjectName, semester:String(s.semester), section:s.section});
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.subjectName) { toast.error('Select a subject'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => v && fd.append(k,v));
      if (file) fd.append('pdf', file);
      await axios.post('/api/assignments/create', fd);
      toast.success('Assignment posted!');
      setShowForm(false);
      setForm({ title:'', description:'', googleForm:'', subjectName:'', semester:'', section:'', deadline:'' });
      setFile(null);
      reload();
    } catch { toast.error('Failed to post assignment'); }
    finally { setSaving(false); }
  };

  const deleteAsgn = async id => {
    if (!window.confirm('Delete this assignment?')) return;
    try { await axios.delete(`/api/assignments/${id}`); toast.success('Deleted'); reload(); }
    catch { toast.error('Delete failed'); }
  };

  const viewSubmissions = async (assignmentId) => {
    if (viewSubs === assignmentId) { setViewSubs(null); return; }
    setViewSubs(assignmentId);
    setLoadingSubs(true);
    try {
      const { data } = await axios.get(`/api/assignments/submissions/${assignmentId}`);
      setSubs(data);
    } catch { toast.error('Could not load submissions'); }
    finally { setLoadingSubs(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h2 style={{ fontFamily:'Syne', fontSize:20 }}>Assignments</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={14}/> {showForm ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {showForm && (
        <div className="card fade-up">
          <h3 style={{ fontFamily:'Syne', marginBottom:16, fontSize:16 }}>Post New Assignment</h3>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label className="lbl">Subject</label>
              <select className="input" onChange={onSubjectChange} required>
                <option value="">Select subject</option>
                {subjects.map((s,i) => <option key={i} value={i}>{s.subjectName} · Sem{s.semester}{s.section}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Title</label>
              <input className="input" placeholder="Assignment 1 - Linked Lists" value={form.title} onChange={e => setForm({...form,title:e.target.value})} required/>
            </div>
            <div>
              <label className="lbl">Description (optional)</label>
              <textarea className="input" placeholder="Instructions..." value={form.description} onChange={e => setForm({...form,description:e.target.value})} rows={3} style={{ resize:'vertical' }}/>
            </div>
            <div className="grid2">
              <div>
                <label className="lbl">Upload PDF (optional)</label>
                <input ref={fileRef} type="file" accept=".pdf" style={{ display:'none' }} onChange={e => setFile(e.target.files[0])}/>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
                  <Upload size={13}/> {file ? file.name : 'Choose PDF'}
                </button>
                {file && <button type="button" onClick={() => setFile(null)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--red)',marginLeft:8 }}><X size={13}/></button>}
              </div>
              <div>
                <label className="lbl">Google Form Link (optional)</label>
                <input className="input" placeholder="https://forms.gle/..." value={form.googleForm} onChange={e => setForm({...form,googleForm:e.target.value})}/>
              </div>
            </div>
            <div style={{ maxWidth:240 }}>
              <label className="lbl">Deadline (optional)</label>
              <input className="input" type="date" value={form.deadline} onChange={e => setForm({...form,deadline:e.target.value})}/>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf:'flex-start' }}>
              {saving ? <span className="spinner"/> : <><Upload size={14}/> Post Assignment</>}
            </button>
          </form>
        </div>
      )}

      {assignments.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--text2)' }}>No assignments posted yet.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {assignments.map(a => (
            <div key={a._id} className="card" style={{ padding:0, overflow:'hidden' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, padding:'16px' }}>
                <div>
                  <h3 style={{ fontFamily:'Syne', fontSize:15, marginBottom:4 }}>{a.title}</h3>
                  {a.description && <p style={{ color:'var(--text2)', fontSize:13, marginBottom:6 }}>{a.description}</p>}
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <span className="tag tag-purple">{a.subjectName}</span>
                    <span className="tag tag-gold">Sem {a.semester} · {a.section}</span>
                    {a.deadline && <span className="tag tag-green">{new Date(a.deadline).toLocaleDateString()}</span>}
                    <span style={{ fontSize:12, color:'var(--text3)' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => viewSubmissions(a._id)}
                    style={{ borderColor: viewSubs===a._id ? 'var(--accent)' : 'var(--border2)', color: viewSubs===a._id ? 'var(--accent2)' : 'var(--text2)' }}
                  >
                    <Users size={13}/> Submissions
                  </button>
                  <button onClick={() => deleteAsgn(a._id)} className="btn btn-danger btn-xs"><Trash2 size={12}/></button>
                </div>
              </div>

              {/* Submissions panel */}
              {viewSubs === a._id && (
                <div style={{ borderTop:'1px solid var(--border)', padding:'16px', background:'var(--bg3)' }}>
                  <p style={{ fontWeight:600, fontSize:13, marginBottom:12 }}>
                    Student Submissions {!loadingSubs && `(${subs.length})`}
                  </p>
                  {loadingSubs ? (
                    <div style={{ display:'flex', justifyContent:'center', padding:20 }}><span className="spinner"/></div>
                  ) : subs.length === 0 ? (
                    <p style={{ color:'var(--text3)', fontSize:13 }}>No submissions yet.</p>
                  ) : (
                    <table className="eval-table">
                      <thead>
                        <tr>
                          <th className="left">#</th>
                          <th className="left">Student</th>
                          <th className="left">USN</th>
                          <th>Section</th>
                          <th>Submitted At</th>
                          <th>File</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subs.map((s,i) => (
                          <tr key={s._id}>
                            <td style={{ color:'var(--text3)', fontFamily:'JetBrains Mono', fontSize:11 }}>{i+1}</td>
                            <td className="left" style={{ fontWeight:500 }}>{s.student?.name}</td>
                            <td className="left mono" style={{ fontSize:11, color:'var(--text2)' }}>{s.student?.usn}</td>
                            <td>{s.student?.section}</td>
                            <td style={{ fontSize:12, color:'var(--text2)' }}>{new Date(s.submittedAt).toLocaleString()}</td>
                            <td>
                              {s.file ? (
                                <a href={`http://localhost:5001/uploads/${s.file}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-xs">
                                  <Download size={11}/> View
                                </a>
                              ) : <span style={{ color:'var(--text3)', fontSize:12 }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SUBJECTS TAB ──────────────────────────────────────────────────────────────
function SubjectsTab({ user, updateUser }) {
  const subjects = user?.subjects || [];
  const [form, setForm] = useState({ subjectName:'', subjectCode:'', semester:'', section:'', subjectType:'theory', maxMarks:'40' });
  const [saving, setSaving] = useState(false);
  const setSub = e => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === 'subjectType') updated.maxMarks = e.target.value === 'lab' ? '50' : e.target.value === 'none' ? '0' : '40';
    setForm(updated);
  };

  const addSubject = async () => {
    if (!form.subjectName || !form.semester || !form.section) { toast.error('Fill all required fields'); return; }
    setSaving(true);
    try {
      const { data } = await axios.post('/api/auth/teacher/add-subject', { ...form, semester: Number(form.semester), maxMarks: Number(form.maxMarks) });
      updateUser(data);
      toast.success('Subject added!');
      setForm({ subjectName:'', subjectCode:'', semester:'', section:'', subjectType:'theory', maxMarks:'40' });
    } catch { toast.error('Failed to add subject'); }
    finally { setSaving(false); }
  };

  const removeSubject = async (subjectId) => {
    try {
      const { data } = await axios.delete(`/api/auth/teacher/remove-subject/${subjectId}`);
      updateUser(data);
      toast.success('Subject removed');
    } catch { toast.error('Failed to remove'); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <h2 style={{ fontFamily:'Syne', fontSize:20 }}>Manage Subjects</h2>

      {/* Add subject form */}
      <div className="card">
        <h3 style={{ fontFamily:'Syne', fontSize:16, marginBottom:16 }}>Add New Subject</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="grid2">
            <div>
              <label className="lbl">Subject Name *</label>
              <input className="input" name="subjectName" placeholder="Data Structures" value={form.subjectName} onChange={setSub}/>
            </div>
            <div>
              <label className="lbl">Subject Code</label>
              <input className="input mono" name="subjectCode" placeholder="BCS301" value={form.subjectCode} onChange={setSub}/>
            </div>
          </div>
          <div className="grid3">
            <div>
              <label className="lbl">Semester *</label>
              <select className="input" name="semester" value={form.semester} onChange={setSub}>
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Section *</label>
              <select className="input" name="section" value={form.section} onChange={setSub}>
                <option value="">Select</option>
                {['A','B','C','D','E'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Type</label>
              <select className="input" name="subjectType" value={form.subjectType} onChange={setSub}>
                <option value="theory">Theory (40)</option>
                <option value="lab">Lab (50)</option>
                <option value="none">No CIE</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={addSubject} disabled={saving} style={{ alignSelf:'flex-start' }}>
            {saving ? <span className="spinner"/> : <><Plus size={14}/> Add Subject</>}
          </button>
        </div>
      </div>

      {/* Current subjects list */}
      <div className="card">
        <h3 style={{ fontFamily:'Syne', fontSize:16, marginBottom:16 }}>Current Subjects ({subjects.length})</h3>
        {subjects.length === 0 ? (
          <p style={{ color:'var(--text2)', fontSize:13 }}>No subjects yet. Add one above.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {subjects.map(s => (
              <div key={s._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg3)', borderRadius:'var(--r3)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:600 }}>{s.subjectName}</span>
                  {s.subjectCode && <span className="mono" style={{ fontSize:11, color:'var(--text2)' }}>{s.subjectCode}</span>}
                  <span className={`tag ${s.subjectType==='lab'?'tag-cyan':s.subjectType==='none'?'tag-red':'tag-purple'}`}>
                    {s.subjectType==='lab'?'Lab (50)':s.subjectType==='none'?'No CIE':'Theory (40)'}
                  </span>
                  <span className="tag tag-gold">Sem {s.semester} · {s.section}</span>
                </div>
                <button onClick={() => removeSubject(s._id)} className="btn btn-danger btn-xs"><Trash2 size={12}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function emptyMarks(type) {
  if (type === 'theory') return { st1:'', st2:'', st3:'', cep:'', ct1:'', ct2:'', attendance:'' };
  if (type === 'lab')    return { internal1:'', internal2:'', preparation:'', record:'', execution:'', report:'', conduct:'' };
  return {};
}

function flattenRecord(r) {
  return {
    st1: r.st1??'', st2:r.st2??'', st3:r.st3??'', cep:r.cep??'', ct1:r.ct1??'', ct2:r.ct2??'', attendance:r.attendance??'',
    internal1:r.internal1??'', internal2:r.internal2??'', preparation:r.preparation??'',
    record:r.record??'', execution:r.execution??'', report:r.report??'', conduct:r.conduct??''
  };
}

function parseMarks(e, type) {
  const n = v => (v===''||v===null||v===undefined) ? null : parseFloat(v);
  if (type === 'theory') return { st1:n(e.st1), st2:n(e.st2), st3:n(e.st3), cep:n(e.cep), ct1:n(e.ct1), ct2:n(e.ct2), attendance:n(e.attendance) };
  if (type === 'lab')    return { internal1:n(e.internal1), internal2:n(e.internal2), preparation:n(e.preparation), record:n(e.record), execution:n(e.execution), report:n(e.report), conduct:n(e.conduct) };
  return {};
}
