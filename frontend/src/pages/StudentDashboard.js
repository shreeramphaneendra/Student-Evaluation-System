import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, BarChart2, BookOpen, Users, FileText, ExternalLink, Download, ChevronDown, ChevronUp, Award, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
const NAV = [
  { id:'overview',    label:'Overview',    icon:<BarChart2 size={16}/> },
  { id:'marks',       label:'My CIE Marks',icon:<Award size={16}/> },
  { id:'teachers',    label:'My Teachers', icon:<Users size={16}/> },
  { id:'assignments', label:'Assignments', icon:<FileText size={16}/> },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab]             = useState('overview');
  const [marks, setMarks]         = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/cie/my-marks'),
      axios.get('/api/cie/my-teachers'),
      axios.get('/api/assignments/student'),
    ]).then(([m, t, a]) => {
      setMarks(m.data);
      setTeachers(t.data);
      setAssignments(a.data);
    }).finally(() => setLoading(false));
  }, []);

  const doLogout = () => { logout(); nav('/'); };

  return (
    <div className="page">
      {/* NAV */}
      <nav className="nav">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7c6fff,#22d3ee)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <BarChart2 size={16} color="#fff"/>
          </div>
          <span className="nav-logo">Eval<span>Pro</span></span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:13, fontWeight:600 }}>{user?.name}</p>
            <p style={{ fontSize:11, color:'var(--text2)', fontFamily:'JetBrains Mono' }}>{user?.usn} · Sem {user?.semester}{user?.section}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={doLogout}><LogOut size={14}/> Logout</button>
        </div>
      </nav>

      <div className="layout">
        {/* SIDEBAR */}
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
              {tab === 'overview'    && <Overview user={user} marks={marks} teachers={teachers} assignments={assignments}/>}
              {tab === 'marks'       && <MarksTab marks={marks}/>}
              {tab === 'teachers'    && <TeachersTab teachers={teachers}/>}
              {tab === 'assignments' && <AssignmentsTab assignments={assignments}/>}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────────
function Overview({ user, marks, teachers, assignments }) {
  const avg = marks.length ? (marks.reduce((a,m) => a+(m.computedCIE||0), 0)/marks.length).toFixed(1) : '—';
  const pending = assignments.filter(a => a.deadline && new Date(a.deadline) > new Date()).length;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Welcome */}
      <div className="card fade-up" style={{ background:'linear-gradient(135deg, rgba(124,111,255,.12), rgba(34,211,238,.08))', border:'1px solid rgba(124,111,255,.25)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:50, height:50, borderRadius:13, background:'rgba(124,111,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <GraduationCap size={26} color="var(--accent2)"/>
          </div>
          <div>
            <h2 style={{ fontFamily:'Syne', fontSize:22 }}>Hey, {user?.name?.split(' ')[0]}! 👋</h2>
            <p style={{ color:'var(--text2)', fontSize:13 }}>{user?.branch} · Semester {user?.semester} · Section {user?.section}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid4 fade-up2">
        <StatCard val={marks.length}      label="Subjects"          color="var(--accent2)"/>
        <StatCard val={avg}               label="Avg CIE Score"     color="var(--cyan)"/>
        <StatCard val={teachers.length}   label="Teachers"          color="var(--gold)"/>
        <StatCard val={assignments.length} label="Assignments"      color="var(--green)"/>
      </div>

      {/* Recent marks preview */}
      {marks.length > 0 && (
        <div className="card fade-up3">
          <h3 style={{ fontFamily:'Syne', marginBottom:16, fontSize:16 }}>Recent CIE Scores</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {marks.slice(0,4).map(m => (
              <div key={m._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'var(--bg3)', borderRadius:'var(--r3)', border:'1px solid var(--border)' }}>
                <div>
                  <p style={{ fontWeight:600, fontSize:14 }}>{m.subjectName}</p>
                  <p style={{ fontSize:11, color:'var(--text2)', marginTop:2 }}>
                    {m.subjectType === 'theory' ? 'Theory' : m.subjectType === 'lab' ? 'Lab' : 'No CIE'}
                    {m.subjectCode && ` · ${m.subjectCode}`}
                  </p>
                </div>
                {m.computedCIE !== null ? (
                  <div style={{ textAlign:'right' }}>
                    <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:18, color: m.computedCIE >= (m.maxMarks*0.75) ? 'var(--green)' : m.computedCIE >= (m.maxMarks*0.5) ? 'var(--gold)' : 'var(--red)' }}>
                      {m.computedCIE}
                    </span>
                    <span style={{ fontSize:11, color:'var(--text2)' }}>/{m.maxMarks}</span>
                  </div>
                ) : <span className="tag tag-red">Pending</span>}
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

// ── MARKS TAB ────────────────────────────────────────────────────────────────
function MarksTab({ marks }) {
  const [expanded, setExpanded] = useState(null);
  if (!marks.length) return <Empty msg="No CIE marks available yet. Your teachers will add them soon."/>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <h2 style={{ fontFamily:'Syne', fontSize:20 }}>My CIE Marks</h2>
      {marks.map(m => (
        <div key={m._id} className="card" style={{ padding:0, overflow:'hidden' }}>
          <div
            style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', cursor:'pointer' }}
            onClick={() => setExpanded(expanded === m._id ? null : m._id)}
          >
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background: m.subjectType==='lab' ? 'rgba(34,211,238,.12)' : 'rgba(124,111,255,.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <BookOpen size={18} color={m.subjectType==='lab'?'var(--cyan)':'var(--accent2)'}/>
              </div>
              <div>
                <p style={{ fontWeight:600 }}>{m.subjectName}</p>
                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  <span className={`tag ${m.subjectType==='lab'?'tag-cyan':'tag-purple'}`}>{m.subjectType==='lab'?'Lab (50)':m.subjectType==='none'?'No CIE':'Theory (40)'}</span>
                  {m.subjectCode && <span className="mono" style={{ fontSize:11, color:'var(--text2)' }}>{m.subjectCode}</span>}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              {m.computedCIE !== null ? (
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:22, color: m.computedCIE>=(m.maxMarks*0.75)?'var(--green)':m.computedCIE>=(m.maxMarks*0.5)?'var(--gold)':'var(--red)' }}>
                    {m.computedCIE}<span style={{ fontSize:13, color:'var(--text2)', fontWeight:400 }}>/{m.maxMarks}</span>
                  </p>
                  <p style={{ fontSize:11, color:'var(--text2)' }}>{((m.computedCIE/m.maxMarks)*100).toFixed(0)}%</p>
                </div>
              ) : <span className="tag tag-red">Not graded</span>}
              {expanded===m._id ? <ChevronUp size={16} color="var(--text2)"/> : <ChevronDown size={16} color="var(--text2)"/>}
            </div>
          </div>

          {expanded===m._id && m.breakdown && (
            <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border)' }}>
              <BreakdownView m={m}/>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BreakdownView({ m }) {
  const b = m.breakdown;
  if (!b || b.note) return <p style={{ color:'var(--text2)', fontSize:13, paddingTop:14 }}>No CIE for this subject.</p>;

  if (m.subjectType === 'theory') return (
    <div style={{ marginTop:16, display:'flex', flexWrap:'wrap', gap:10 }}>
      <ScoreChip label="Slip Test (ST)" val={b.st} max={5}/>
      <ScoreChip label="CEP" val={b.cep} max={10}/>
      <ScoreChip label="Class Test (CT)" val={b.ct} max={20}/>
      <ScoreChip label="Attendance" val={b.attendance} max={5}/>
      <ScoreChip label="Total CIE" val={b.total} max={40} highlight/>
      <RawMarks m={m}/>
    </div>
  );

  if (m.subjectType === 'lab') return (
    <div style={{ marginTop:16, display:'flex', flexWrap:'wrap', gap:10 }}>
      <ScoreChip label="Internal Avg" val={b.internal} max={20}/>
      <ScoreChip label="Preparation" val={b.preparation} max={5}/>
      <ScoreChip label="Record" val={b.record} max={10}/>
      <ScoreChip label="Execution" val={b.execution} max={5}/>
      <ScoreChip label="Report" val={b.report} max={5}/>
      <ScoreChip label="Conduct" val={b.conduct} max={5}/>
      <ScoreChip label="Total CIE" val={b.total} max={50} highlight/>
    </div>
  );
}

function ScoreChip({ label, val, max, highlight }) {
  return (
    <div style={{ padding:'10px 14px', background: highlight ? 'rgba(124,111,255,.15)' : 'var(--bg3)', borderRadius:'var(--r3)', border:`1px solid ${highlight?'rgba(124,111,255,.3)':'var(--border)'}`, minWidth:100 }}>
      <p style={{ fontSize:11, color:'var(--text2)', marginBottom:4 }}>{label}</p>
      <p style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:highlight?18:15, color: highlight?'var(--accent2)':'var(--text)' }}>
        {val ?? '—'}<span style={{ fontSize:11, color:'var(--text3)', fontWeight:400 }}>/{max}</span>
      </p>
    </div>
  );
}

function RawMarks({ m }) {
  return (
    <div style={{ padding:'10px 14px', background:'var(--bg3)', borderRadius:'var(--r3)', border:'1px solid var(--border)', fontSize:12, color:'var(--text2)' }}>
      <p style={{ marginBottom:6, fontWeight:600, color:'var(--text)' }}>Raw Marks</p>
      <p>ST: {m.st1??'—'}, {m.st2??'—'}, {m.st3??'—'}</p>
      <p>CT: {m.ct1??'—'}, {m.ct2??'—'}</p>
    </div>
  );
}

// ── TEACHERS TAB ─────────────────────────────────────────────────────────────
function TeachersTab({ teachers }) {
  if (!teachers.length) return <Empty msg="No teachers assigned to your semester and section yet."/>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <h2 style={{ fontFamily:'Syne', fontSize:20 }}>My Teachers</h2>
      <div className="grid2">
        {teachers.map(t => (
          <div key={t._id} className="card">
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
              <div style={{ width:44, height:44, borderRadius:11, background:'rgba(34,211,238,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Users size={20} color="var(--cyan)"/>
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:15 }}>{t.name}</p>
                <p style={{ fontSize:12, color:'var(--text2)' }}>{t.department} Dept · <span className="mono" style={{ fontSize:11 }}>{t.employeeId}</span></p>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {t.subjects.map((s,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'var(--bg3)', borderRadius:'var(--r3)', border:'1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600 }}>{s.subjectName}</p>
                    {s.subjectCode && <p className="mono" style={{ fontSize:10, color:'var(--text2)' }}>{s.subjectCode}</p>}
                  </div>
                  <span className={`tag ${s.subjectType==='lab'?'tag-cyan':s.subjectType==='none'?'tag-red':'tag-purple'}`}>
                    {s.subjectType==='lab'?'Lab':'Theory'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ASSIGNMENTS TAB ───────────────────────────────────────────────────────────
function AssignmentsTab({ assignments }) {
  const [submitting, setSubmitting] = useState(null);
  const [submitted, setSubmitted]   = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const fileRefs = useRef({});

  const submitAssignment = async (assignmentId) => {
    const file = fileRefs.current[assignmentId]?.files[0];
    if (!file) { toast.error('Please select a file first'); return; }
    setSubmitting(assignmentId);
    try {
      const fd = new FormData();
      fd.append('assignmentId', assignmentId);
      fd.append('file', file);
      await axios.post('/api/submissions/submit', fd);
      toast.success('Assignment submitted successfully!');
      setSubmitted(prev => ({ ...prev, [assignmentId]: true }));
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(null); }
  };

  if (!assignments.length) return <Empty msg="No assignments posted for your semester and section yet." />;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <h2 style={{ fontFamily:'Syne', fontSize:20 }}>Assignments</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {assignments.map(a => {
          const overdue  = a.deadline && new Date(a.deadline) < new Date();
          const hasFile  = !!a.pdfFile;
          const hasForm  = !!a.googleForm;
          const fileName = selectedFiles[a._id];

          return (
            <div key={a._id} className="card">
              {/* Header */}
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                    <FileText size={16} color="var(--gold)" />
                    <h3 style={{ fontFamily:'Syne', fontSize:16 }}>{a.title}</h3>
                    {a.deadline && (
                      <span className={`tag ${overdue ? 'tag-red' : 'tag-green'}`}>
                        {overdue ? 'Overdue' : `Due: ${new Date(a.deadline).toLocaleDateString()}`}
                      </span>
                    )}
                    {hasForm && !hasFile && (
                      <span className="tag tag-gold">Google Form</span>
                    )}
                  </div>
                  {a.description && (
                    <p style={{ color:'var(--text2)', fontSize:13, marginBottom:8 }}>{a.description}</p>
                  )}
                  <p style={{ fontSize:12, color:'var(--text3)' }}>
                    {a.teacher?.name} · {a.subjectName} · {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Download / Open Form buttons */}
                <div style={{ display:'flex', gap:8, flexShrink:0, flexWrap:'wrap' }}>
                  {hasFile && (
                    <a href={`http://localhost:5001/uploads/${a.pdfFile}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      <Download size={13}/> PDF
                    </a>
                  )}
                  {hasForm && (
                    <a href={a.googleForm} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background:'var(--gold)', color:'var(--bg)' }}>
                      <ExternalLink size={13}/> Open Form
                    </a>
                  )}
                </div>
              </div>

              {/* Submit section — only show if it's NOT a google form only assignment */}
              {!(hasForm && !hasFile) && (
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:14 }}>
                  <p style={{ fontSize:12, color:'var(--text2)', marginBottom:10 }}>
                    📎 Submit your work below
                  </p>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <input
                      type="file"
                      ref={el => fileRefs.current[a._id] = el}
                      style={{ display:'none' }}
                      accept=".pdf,.doc,.docx,.zip"
                      onChange={e => {
                        const file = e.target.files[0];
                        setSelectedFiles(prev => ({ ...prev, [a._id]: file ? file.name : null }));
                      }}
                    />
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => fileRefs.current[a._id]?.click()}
                      style={{ borderColor: fileName ? 'var(--green)' : 'var(--border2)' }}
                    >
                      <Upload size={13}/>
                      {fileName ? fileName : 'Choose File'}
                    </button>
                    {fileName && (
                      <span style={{ fontSize:12, color:'var(--green)' }}>✓ Ready to submit</span>
                    )}
                    <button
                      className="btn btn-sm"
                      style={{ background: submitted[a._id] ? 'var(--green)' : 'var(--accent)', color:'#fff' }}
                      onClick={() => submitAssignment(a._id)}
                      disabled={submitting === a._id || !fileName}
                    >
                      {submitting === a._id
                        ? <span className="spinner"/>
                        : submitted[a._id]
                        ? '✓ Submitted'
                        : 'Submit'}
                    </button>
                  </div>
                </div>
              )}

              {/* Google form only — no file upload needed */}
              {hasForm && !hasFile && (
                <div style={{ borderTop:'1px solid var(--border)', paddingTop:12 }}>
                  <p style={{ fontSize:12, color:'var(--text2)' }}>
                    📝 This is a Google Form submission — click <strong>Open Form</strong> above to submit your response directly.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function Empty({ msg }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text2)' }}>
      <p style={{ fontSize:14 }}>{msg}</p>
    </div>
  );
}
