import { useState, useEffect } from 'react'
import { useAdmin } from '../context/AdminContext'
import { supabase } from '../lib/supabase'

const sendEmail = async (payload) => {
  try { await supabase.functions.invoke('send-booking-email', { body: payload }) }
  catch (err) { console.log('Email error:', err) }
}
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

function exportCSV(data, filename) {
  if (!data || data.length === 0) return
  const keys = Object.keys(data[0])
  const csv = [keys.join(','), ...data.map(row => keys.map(k => { const val = row[k] ?? ''; const str = typeof val === 'object' ? JSON.stringify(val) : String(val); return `"${str.replace(/"/g, '""')}"` }).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const periodStart = (period) => {
  const now = new Date()
  if (period === '7d') return new Date(now - 7 * 86400000).toISOString()
  if (period === '30d') return new Date(now - 30 * 86400000).toISOString()
  if (period === '90d') return new Date(now - 90 * 86400000).toISOString()
  if (period === '1y') return new Date(now - 365 * 86400000).toISOString()
  return null
}

function FilePreviewModal({ url, name, onClose }) {
  if (!url) return null
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.split('?')[0])
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 600 }} />
      <div style={{ position: 'fixed', top: '3%', left: '8%', right: '8%', bottom: '3%', background: '#fff', zIndex: 601, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}>
        <div style={{ background: '#1E293B', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>📄 {name || 'Document Preview'}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '24px', lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isImage
            ? <img src={url} alt={name || 'Document'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
            : <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} title={name || 'Document Preview'} />
          }
        </div>
      </div>
    </>
  )
}

function ReasonModal({ title, description, confirmLabel, confirmStyle, onConfirm, onCancel }) {
  const [reason, setReason] = useState('')
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 700 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', zIndex: 701, borderRadius: '12px', padding: '1.75rem', width: '440px', maxWidth: '90vw', boxShadow: '0 16px 48px rgba(0,0,0,0.25)' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>{title}</h3>
        {description && <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '1rem', lineHeight: '1.6' }}>{description}</p>}
        <label style={formLbl}>Reason (required)</label>
        <textarea autoFocus style={{ ...formInp, height: '90px', resize: 'vertical', marginBottom: '1.25rem' }} placeholder="Enter reason for this action..." value={reason} onChange={e => setReason(e.target.value)} />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnGhost}>Cancel</button>
          <button onClick={() => reason.trim() && onConfirm(reason.trim())} disabled={!reason.trim()} style={{ ...confirmStyle, opacity: !reason.trim() ? 0.5 : 1, cursor: !reason.trim() ? 'not-allowed' : 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </>
  )
}

function FilterBar({ filters, onChange, onClear }) {
  return (
    <div style={{ background: '#F1F5F9', borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      {filters.map(f => (
        <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{f.label}</label>
          {f.type === 'select' ? (
            <select value={f.value} onChange={e => onChange(f.key, e.target.value)} style={{ padding: '7px 10px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#111', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : f.type === 'date' ? (
            <input type="date" value={f.value} onChange={e => onChange(f.key, e.target.value)} style={{ padding: '7px 10px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#111', fontFamily: 'inherit', outline: 'none' }} />
          ) : (
            <input type={f.type || 'text'} value={f.value} onChange={e => onChange(f.key, e.target.value)} placeholder={f.placeholder || ''} style={{ padding: '7px 10px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#111', fontFamily: 'inherit', outline: 'none', width: f.width || '120px' }} />
          )}
        </div>
      ))}
      <button onClick={onClear} style={{ padding: '7px 14px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', color: '#64748B', cursor: 'pointer', alignSelf: 'flex-end' }}>Clear</button>
    </div>
  )
}

function DetailDrawer({ open, onClose, title, subtitle, children }) {
  if (!open) return null
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '580px', background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 32px rgba(0,0,0,0.14)' }}>
        <div style={{ background: '#1E293B', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: '#fff' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '3px' }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '24px', lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>{children}</div>
      </div>
    </>
  )
}

function AdminAvatar({ name, url, size = 44 }) {
  return url ? (
    <img src={url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.38), fontWeight: '700', color: '#fff', flexShrink: 0 }}>
      {name?.charAt(0) || '?'}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending: { bg: '#FEF9C3', color: '#854D0E' }, approved: { bg: '#DCFCE7', color: '#166534' },
    active: { bg: '#DCFCE7', color: '#166534' }, verified: { bg: '#DCFCE7', color: '#166534' },
    declined: { bg: '#FEE2E2', color: '#991B1B' }, rejected: { bg: '#FEE2E2', color: '#991B1B' },
    suspended: { bg: '#FEE2E2', color: '#991B1B' }, paid: { bg: '#DCFCE7', color: '#166534' },
    resolved: { bg: '#DCFCE7', color: '#166534' }, dismissed: { bg: '#F1F5F9', color: '#64748B' },
    hidden: { bg: '#FEE2E2', color: '#991B1B' }, unverified: { bg: '#FEF9C3', color: '#854D0E' },
    confirmed: { bg: '#DCFCE7', color: '#166534' }, success: { bg: '#DCFCE7', color: '#166534' },
    failed: { bg: '#FEE2E2', color: '#991B1B' }, cancelled: { bg: '#F1F5F9', color: '#64748B' },
  }
  const style = map[status?.toLowerCase()] || { bg: '#F1F5F9', color: '#64748B' }
  return <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: style.bg, color: style.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{status}</span>
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: '13px', color: '#64748B', width: '130px', flexShrink: 0, fontWeight: '500' }}>{label}</span>
      <span style={{ fontSize: '13px', color: '#111', flex: 1, wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  )
}

function DrawerSection({ title, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid #E2E8F0' }}>{title}</h4>
      {children}
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '700', color: color || '#111' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

// Resolve a teacher_documents.file_url for viewing. New IDs are a path in the private
// `teacher-ids` bucket; legacy rows stored a full public URL (kept working).
async function resolvePrivateDoc(fileUrl) {
  if (!fileUrl) return null
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl
  const { data, error } = await supabase.storage.from('teacher-ids').createSignedUrl(fileUrl, 120)
  if (error) throw error
  return data?.signedUrl || null
}

function DocViewBtn({ fileUrl, name, label = '📄 View document' }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const open = async () => {
    setLoading(true)
    try { const u = await resolvePrivateDoc(fileUrl); setUrl(u) }
    catch (e) { alert('Could not open document') }
    finally { setLoading(false) }
  }
  return (
    <>
      <button onClick={open} style={{ fontSize: '12px', color: '#6D28D9', fontWeight: '700', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        {loading ? '…' : label}
      </button>
      {url && <FilePreviewModal url={url} name={name} onClose={() => setUrl(null)} />}
    </>
  )
}

function ViewFileBtn({ url, name, label = 'View' }) {
  const [preview, setPreview] = useState(false)
  return (
    <>
      <button onClick={() => setPreview(true)} style={{ fontSize: '12px', color: '#6D28D9', fontWeight: '700', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        {label}
      </button>
      {preview && <FilePreviewModal url={url} name={name} onClose={() => setPreview(false)} />}
    </>
  )
}

function Sidebar({ tab, setTab, pendingApplications, pendingCerts, pendingDocs, pendingPhotos, pendingFlags, pendingPayouts, pendingRefunds, incompletCount }) {
  const groups = [
    { label: null, items: [{ key: 'overview', icon: '📊', label: 'Overview' }] },
    { label: 'People', items: [
      { key: 'applications', icon: '🚀', label: 'Applications', badge: pendingApplications || null },
      { key: 'certificates', icon: '📋', label: 'Certificates', badge: pendingCerts || null },
      { key: 'documents', icon: '🪪', label: 'Documents', badge: pendingDocs || null },
      { key: 'photos', icon: '🖼️', label: 'Photo Reviews', badge: pendingPhotos || null },
      { key: 'teachers', icon: '👩‍🏫', label: 'Teachers' },
      { key: 'learners', icon: '📚', label: 'Learners' },
      { key: 'parents', icon: '👨‍👩‍👧', label: 'Parents' },
      { key: 'users', icon: '👥', label: 'All Users' },
    ]},
    { label: 'Content', items: [
      { key: 'reviews', icon: '⭐', label: 'Reviews' },
      { key: 'sessions', icon: '🎥', label: 'Live Sessions' },
      { key: 'bookings', icon: '📅', label: 'Bookings' },
    ]},
    { label: 'Finance', items: [
      { key: 'payments', icon: '💳', label: 'Payments' },
      { key: 'payouts', icon: '💰', label: 'Payouts', badge: pendingPayouts || null },
      { key: 'refunds', icon: '↩️', label: 'Refunds', badge: pendingRefunds || null, badgeRed: true },
      { key: 'referrals', icon: '🎁', label: 'Referrals' },
    ]},
    { label: 'Platform', items: [
      { key: 'onboarding', icon: '🎯', label: 'Onboarding', badge: incompletCount || null },
      { key: 'quality', icon: '🏆', label: 'Quality Scores' },
      { key: 'flags', icon: '🚩', label: 'Flags', badge: pendingFlags || null, badgeRed: true },
      { key: 'revenue', icon: '📈', label: 'Revenue' },
      { key: 'geography', icon: '🌍', label: 'Geography' },
      { key: 'announcements', icon: '📢', label: 'Announcements' },
      { key: 'audit', icon: '📋', label: 'Audit Log' },
    ]}
  ]
  return (
    <aside style={{ width: '220px', background: '#4C1D95', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ flex: 1, padding: '8px' }}>
        {groups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '4px' }}>
            {group.label && <div style={{ fontSize: '10px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 12px 4px' }}>{group.label}</div>}
            {group.items.map(item => (
              <button key={item.key} onClick={() => setTab(item.key)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 12px', border: 'none', borderRadius: '8px', background: tab === item.key ? '#6D28D9' : 'transparent', color: tab === item.key ? '#fff' : '#94A3B8', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: tab === item.key ? '700' : '400', textAlign: 'left', marginBottom: '1px', transition: 'all 0.12s' }}>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                {item.badge != null && <span style={{ fontSize: '11px', fontWeight: '700', padding: '1px 6px', borderRadius: '20px', background: item.badgeRed ? '#FEE2E2' : '#FEF9C3', color: item.badgeRed ? '#991B1B' : '#854D0E', flexShrink: 0 }}>{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}

function ApplicationDetail({ teacher, onApprove, onReject }) {
  const [docs, setDocs] = useState([])
  const [certs, setCerts] = useState([])
  const [videos, setVideos] = useState([])
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectNotes, setRejectNotes] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [docFile, setDocFile] = useState(null)
  const [docType, setDocType] = useState('National ID')
  const [certFile, setCertFile] = useState(null)
  const [certName, setCertName] = useState('')
  const [certType, setCertType] = useState('teaching')
  const [editForm, setEditForm] = useState({ bio: '', years_experience: '', languages: '', hourly_rate: '', subjects: [], teaching_levels: [] })

  const SUBJECTS = ['Mathematics','English','Physics','Chemistry','Biology','ICT','French','Economics','History','Geography','Science','Social Studies','Art','Music','Business Studies','Accounting']
  const LEVELS = ['Primary','JHS','SHS','University','Adult Learning']

  useEffect(() => {
    const go = async () => {
      const [{ data: d }, { data: c }, { data: v }, { data: p }] = await Promise.all([
        supabase.from('teacher_documents').select('*').eq('teacher_id', teacher.id).order('uploaded_at', { ascending: false }),
        supabase.from('certificates').select('*').eq('teacher_id', teacher.id),
        supabase.from('pitch_videos').select('*').eq('teacher_id', teacher.id),
        supabase.from('teacher_portfolio').select('*').eq('teacher_id', teacher.id),
      ])
      setDocs(d || []); setCerts(c || []); setVideos(v || []); setPortfolio(p || [])
      setEditForm({ bio: teacher.bio || '', years_experience: teacher.years_experience || '', languages: (teacher.languages || []).join(', '), hourly_rate: teacher.hourly_rate || '', subjects: teacher.subjects || [], teaching_levels: teacher.teaching_levels || [] })
      setLoading(false)
    }
    go()
  }, [teacher.id])

  const saveEdit = async () => {
    setSaving(true)
    await supabase.from('teachers').update({ bio: editForm.bio, years_experience: editForm.years_experience ? parseInt(editForm.years_experience) : null, languages: editForm.languages ? editForm.languages.split(',').map(l => l.trim()).filter(Boolean) : [], hourly_rate: editForm.hourly_rate ? parseFloat(editForm.hourly_rate) : 0, subjects: editForm.subjects, teaching_levels: editForm.teaching_levels }).eq('id', teacher.id)
    setSaving(false); setEditing(false); setUploadMsg('✅ Application updated.')
  }

  const uploadDoc = async () => {
    if (!docFile) return setUploadMsg('Please select a file.')
    setUploading(true)
    try {
      const fileName = `${teacher.id}/${Date.now()}.${docFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('teacher-ids').upload(fileName, docFile)
      if (error) throw error
      await supabase.from('teacher_documents').insert({ teacher_id: teacher.id, document_type: docType, file_url: fileName, status: 'approved' })
      setDocFile(null); setUploadMsg('✅ Document uploaded and approved.')
      const { data: d } = await supabase.from('teacher_documents').select('*').eq('teacher_id', teacher.id).order('uploaded_at', { ascending: false })
      setDocs(d || [])
    } catch (err) { setUploadMsg('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  const uploadCert = async () => {
    if (!certFile || !certName) return setUploadMsg('Please enter a name and select a file.')
    setUploading(true)
    try {
      const fileName = `${teacher.id}/${Date.now()}.${certFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('certificates').upload(fileName, certFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName)
      await supabase.from('certificates').insert({ teacher_id: teacher.id, certificate_name: certName, file_url: urlData.publicUrl, status: 'approved', certificate_type: certType })
      setCertFile(null); setCertName(''); setUploadMsg('✅ Certificate uploaded and approved.')
      const { data: c } = await supabase.from('certificates').select('*').eq('teacher_id', teacher.id)
      setCerts(c || [])
    } catch (err) { setUploadMsg('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  const toggleSubject = (s) => setEditForm(f => ({ ...f, subjects: f.subjects.includes(s) ? f.subjects.filter(x => x !== s) : [...f.subjects, s] }))
  const toggleLevel = (l) => setEditForm(f => ({ ...f, teaching_levels: f.teaching_levels.includes(l) ? f.teaching_levels.filter(x => x !== l) : [...f.teaching_levels, l] }))
  const teachingCerts = certs.filter(c => c.certificate_type !== 'academic')
  const academicCerts = certs.filter(c => c.certificate_type === 'academic')

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading application...</div>

  return (
    <div>
      {uploadMsg && (
        <div style={{ background: uploadMsg.startsWith('✅') ? '#DCFCE7' : '#FEE2E2', color: uploadMsg.startsWith('✅') ? '#166534' : '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem', fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
          {uploadMsg}
          <button onClick={() => setUploadMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit', opacity: 0.6, padding: 0 }}>×</button>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <AdminAvatar name={teacher.profiles?.full_name} url={teacher.profiles?.avatar_url} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{teacher.profiles?.full_name}</div>
          <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>📍 {teacher.profiles?.city}, {teacher.profiles?.country}</div>
          <StatusBadge status={teacher.application_status} />
        </div>
        <button onClick={() => setEditing(e => !e)} style={{ padding: '7px 14px', background: editing ? '#F1F5F9' : '#F5F3FF', color: editing ? '#64748B' : '#6D28D9', border: `1px solid ${editing ? '#E2E8F0' : '#DDD6FE'}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700', flexShrink: 0 }}>
          {editing ? 'Cancel edit' : '✏️ Edit application'}
        </button>
      </div>

      <DrawerSection title="Personal info">
        <InfoRow label="Email" value={teacher.profiles?.email} />
        <InfoRow label="Phone" value={teacher.profiles?.phone} />
        <InfoRow label="Submitted" value={teacher.application_submitted_at ? new Date(teacher.application_submitted_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
      </DrawerSection>

      {editing ? (
        <DrawerSection title="Edit Application Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={formLbl}>Bio</label><textarea style={{ ...formInp, height: '100px', resize: 'vertical' }} value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} placeholder="Teacher bio..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={formLbl}>Years experience</label><input type="number" min="0" style={formInp} value={editForm.years_experience} onChange={e => setEditForm(f => ({ ...f, years_experience: e.target.value }))} /></div>
              <div><label style={formLbl}>Hourly rate (GH₵)</label><input type="number" min="0" style={formInp} value={editForm.hourly_rate} onChange={e => setEditForm(f => ({ ...f, hourly_rate: e.target.value }))} /></div>
            </div>
            <div><label style={formLbl}>Languages (comma-separated)</label><input style={formInp} value={editForm.languages} onChange={e => setEditForm(f => ({ ...f, languages: e.target.value }))} placeholder="English, Twi, French" /></div>
            <div>
              <label style={formLbl}>Subjects</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F8FAFC' }}>
                {SUBJECTS.map(s => <button key={s} type="button" onClick={() => toggleSubject(s)} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: editForm.subjects.includes(s) ? '700' : '400', background: editForm.subjects.includes(s) ? '#6D28D9' : '#fff', color: editForm.subjects.includes(s) ? '#fff' : '#64748B', border: `1px solid ${editForm.subjects.includes(s) ? '#6D28D9' : '#E2E8F0'}` }}>{s}</button>)}
              </div>
            </div>
            <div>
              <label style={formLbl}>Teaching levels</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F8FAFC' }}>
                {LEVELS.map(l => <button key={l} type="button" onClick={() => toggleLevel(l)} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: editForm.teaching_levels.includes(l) ? '700' : '400', background: editForm.teaching_levels.includes(l) ? '#6D28D9' : '#fff', color: editForm.teaching_levels.includes(l) ? '#fff' : '#64748B', border: `1px solid ${editForm.teaching_levels.includes(l) ? '#6D28D9' : '#E2E8F0'}` }}>{l}</button>)}
              </div>
            </div>
            <button onClick={saveEdit} disabled={saving} style={{ ...btnGreen, padding: '10px', fontSize: '14px', width: '100%', borderRadius: '8px' }}>{saving ? 'Saving...' : '✓ Save application changes'}</button>
          </div>
        </DrawerSection>
      ) : (
        <DrawerSection title="About & experience">
          {teacher.bio ? <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: '0 0 10px' }}>{teacher.bio}</p> : <p style={{ fontSize: '14px', color: '#94A3B8', fontStyle: 'italic', margin: '0 0 10px' }}>No bio provided</p>}
          <InfoRow label="Experience" value={teacher.years_experience ? `${teacher.years_experience} years` : null} />
          <InfoRow label="Languages" value={teacher.languages?.join(', ')} />
          <InfoRow label="Rate" value={teacher.hourly_rate > 0 ? `GH₵ ${teacher.hourly_rate}/hr` : null} />
          {teacher.teaching_levels?.length > 0 && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px', fontWeight: '600' }}>Teaching levels</div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>{teacher.teaching_levels.map(l => <span key={l} style={{ fontSize: '12px', background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>{l}</span>)}</div>
            </div>
          )}
        </DrawerSection>
      )}

      {teacher.subjects?.length > 0 && !editing && (
        <DrawerSection title="Subjects">
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{teacher.subjects.map(s => <span key={s} style={{ fontSize: '12px', background: '#F5F3FF', color: '#6D28D9', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>{s}</span>)}</div>
        </DrawerSection>
      )}

      <DrawerSection title={`ID & Documents (${docs.length}) — upload on behalf`}>
        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Upload document for this teacher</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select style={{ ...formInp, cursor: 'pointer' }} value={docType} onChange={e => setDocType(e.target.value)}>
              {["National ID","Passport","Police Clearance","Background Check","Driver's License","Voter ID","Other"].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '12px', background: '#fff', textAlign: 'center' }}>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setDocFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#374151' }} />
              {docFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {docFile.name}</p>}
            </div>
            <button onClick={uploadDoc} disabled={uploading || !docFile} style={{ ...btnGreen, padding: '8px', opacity: !docFile ? 0.5 : 1, cursor: !docFile ? 'not-allowed' : 'pointer' }}>{uploading ? '⏳ Uploading...' : '⬆ Upload & auto-approve'}</button>
          </div>
        </div>
        {docs.length === 0 ? <p style={{ fontSize: '14px', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>No documents uploaded</p>
          : docs.map(doc => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>🪪</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{doc.document_type}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</div></div>
              <StatusBadge status={doc.status} />
              <DocViewBtn fileUrl={doc.file_url} name={doc.document_type} label="View" />
            </div>
          ))}
      </DrawerSection>

      <DrawerSection title={`Teaching Certificates (${teachingCerts.length}) — upload on behalf`}>
        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Upload certificate for this teacher</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select style={{ ...formInp, cursor: 'pointer' }} value={certType} onChange={e => setCertType(e.target.value)}>
              <option value="teaching">Teaching certificate</option>
              <option value="academic">Academic degree</option>
            </select>
            <input style={formInp} placeholder="Certificate name (e.g. PGDE — UEW)" value={certName} onChange={e => setCertName(e.target.value)} />
            <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '12px', background: '#fff', textAlign: 'center' }}>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setCertFile(e.target.files[0])} style={{ fontSize: '13px', cursor: 'pointer', color: '#374151' }} />
              {certFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {certFile.name}</p>}
            </div>
            <button onClick={uploadCert} disabled={uploading || !certFile || !certName} style={{ ...btnGreen, padding: '8px', opacity: (!certFile || !certName) ? 0.5 : 1, cursor: (!certFile || !certName) ? 'not-allowed' : 'pointer' }}>{uploading ? '⏳ Uploading...' : '⬆ Upload & auto-approve'}</button>
          </div>
        </div>
        {teachingCerts.length === 0 ? <p style={{ fontSize: '14px', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>None uploaded</p>
          : teachingCerts.map(cert => (
            <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>📋</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{cert.certificate_name}</div></div>
              <StatusBadge status={cert.status} />
              <ViewFileBtn url={cert.file_url} name={cert.certificate_name} />
            </div>
          ))}
      </DrawerSection>

      <DrawerSection title={`Academic Degrees (${academicCerts.length})`}>
        {academicCerts.length === 0 ? <p style={{ fontSize: '14px', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>None uploaded</p>
          : academicCerts.map(cert => (
            <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>🎓</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{cert.certificate_name}</div></div>
              <StatusBadge status={cert.status} />
              <ViewFileBtn url={cert.file_url} name={cert.certificate_name} />
            </div>
          ))}
      </DrawerSection>

      {videos.length > 0 && (
        <DrawerSection title={`Pitch Videos (${videos.length})`}>
          {videos.map(v => (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>🎬</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{v.title}</div></div>
              <ViewFileBtn url={v.video_url} name={v.title} label="Play" />
            </div>
          ))}
        </DrawerSection>
      )}

      {portfolio.length > 0 && (
        <DrawerSection title={`Portfolio (${portfolio.length})`}>
          {portfolio.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>📄</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{p.title}</div>{p.subject && <div style={{ fontSize: '12px', color: '#64748B' }}>{p.subject}</div>}</div>
              <ViewFileBtn url={p.file_url} name={p.title} />
            </div>
          ))}
        </DrawerSection>
      )}

      {teacher.application_notes && (
        <div style={{ background: '#FEF9C3', borderRadius: '10px', padding: '12px 14px', marginBottom: '1.5rem', fontSize: '14px', color: '#854D0E' }}>
          <strong>Previous rejection reason:</strong> {teacher.application_notes}
        </div>
      )}

      {teacher.application_status === 'pending' && (
        <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '1.25rem' }}>
          {!showRejectForm ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onApprove(teacher.id, teacher.profiles?.full_name, teacher.id, teacher.profiles?.email)} style={{ flex: 1, padding: '12px', background: '#DCFCE7', color: '#166534', border: '2px solid #BBF7D0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>✓ Approve</button>
              <button onClick={() => setShowRejectForm(true)} style={{ flex: 1, padding: '12px', background: '#FEE2E2', color: '#991B1B', border: '2px solid #FECACA', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>✗ Reject</button>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#111', display: 'block', marginBottom: '8px' }}>Rejection reason (required)</label>
              <textarea style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', height: '80px', resize: 'vertical', boxSizing: 'border-box', marginBottom: '10px', background: '#fff', color: '#111' }} placeholder="e.g. Missing valid teaching certificate..." value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowRejectForm(false)} style={{ padding: '10px 18px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', color: '#64748B' }}>Cancel</button>
                <button onClick={() => { onReject(teacher.id, teacher.profiles?.full_name, teacher.id, rejectNotes, teacher.profiles?.email); setShowRejectForm(false) }} disabled={!rejectNotes.trim()} style={{ flex: 1, padding: '10px', background: rejectNotes.trim() ? '#EF4444' : '#E2E8F0', color: rejectNotes.trim() ? '#fff' : '#94A3B8', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: rejectNotes.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontWeight: '700' }}>Confirm rejection</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TeacherDetail({ teacher, allReviews, allBookings, onVerify, onSuspend, onUpdateProfile }) {
  const [docs, setDocs] = useState([])
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingAction, setPendingAction] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: teacher.profiles?.full_name || '', phone: teacher.profiles?.phone || '', city: teacher.profiles?.city || '', country: teacher.profiles?.country || '' })
  const [saving, setSaving] = useState(false)
  const teacherReviews = allReviews.filter(r => r.teacher_id === teacher.id)
  const teacherBookings = allBookings.filter(b => b.teacher_id === teacher.id)
  const avgRating = teacherReviews.length > 0 ? (teacherReviews.reduce((s, r) => s + r.rating, 0) / teacherReviews.length).toFixed(1) : null
  const totalEarned = teacherBookings.filter(b => b.payment_status === 'paid' && b.status !== 'cancelled').reduce((s, b) => s + (b.teacher_payout || 0), 0)
  const isSuspended = teacher.profiles?.status === 'suspended'

  useEffect(() => {
    const go = async () => {
      const [{ data: d }, { data: c }] = await Promise.all([
        supabase.from('teacher_documents').select('*').eq('teacher_id', teacher.id),
        supabase.from('certificates').select('*').eq('teacher_id', teacher.id),
      ])
      setDocs(d || []); setCerts(c || []); setLoading(false)
    }
    go()
  }, [teacher.id])

  const saveProfile = async () => {
    setSaving(true)
    if (onUpdateProfile) await onUpdateProfile(teacher.id, editForm)
    setSaving(false); setEditing(false)
  }

  return (
    <div>
      {pendingAction && (
        <ReasonModal title={pendingAction.title} description={pendingAction.description} confirmLabel={pendingAction.confirmLabel} confirmStyle={pendingAction.style} onConfirm={(reason) => { pendingAction.onConfirm(reason); setPendingAction(null) }} onCancel={() => setPendingAction(null)} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <AdminAvatar name={teacher.profiles?.full_name} url={teacher.profiles?.avatar_url} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{teacher.profiles?.full_name}</div>
          <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>📍 {teacher.profiles?.city}, {teacher.profiles?.country}</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <StatusBadge status={teacher.is_verified ? 'verified' : 'unverified'} />
            {isSuspended && <StatusBadge status="suspended" />}
          </div>
        </div>
        <button onClick={() => setEditing(e => !e)} style={{ ...btnGhost, fontSize: '12px', flexShrink: 0 }}>{editing ? 'Cancel edit' : '✏️ Edit profile'}</button>
      </div>

      {editing && (
        <DrawerSection title="Edit Teacher Profile">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[['Full name','full_name'],['Phone','phone'],['City','city'],['Country','country']].map(([label, key]) => (
              <div key={key}><label style={formLbl}>{label}</label><input style={formInp} value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} /></div>
            ))}
            <button onClick={saveProfile} disabled={saving} style={{ ...btnGreen, padding: '10px', fontSize: '14px', width: '100%', borderRadius: '8px' }}>{saving ? 'Saving...' : '✓ Save profile changes'}</button>
          </div>
        </DrawerSection>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
        {[['Bookings', teacherBookings.filter(b => b.status === 'confirmed').length, '#6D28D9'], ['Reviews', teacherReviews.length, '#D97706'], [`GH₵ ${totalEarned.toFixed(0)}`, 'Earned', '#166534']].map(([val, lbl, color]) => (
          <div key={lbl} style={{ background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '700', color }}>{val}</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>{lbl}</div>
          </div>
        ))}
      </div>

      <DrawerSection title="Profile">
        <InfoRow label="Email" value={teacher.profiles?.email} />
        <InfoRow label="Phone" value={teacher.profiles?.phone} />
        <InfoRow label="Rate" value={teacher.hourly_rate > 0 ? `GH₵ ${teacher.hourly_rate}/hr` : null} />
        <InfoRow label="Experience" value={teacher.years_experience ? `${teacher.years_experience} yrs` : null} />
        <InfoRow label="Languages" value={teacher.languages?.join(', ')} />
        <InfoRow label="Rating" value={avgRating ? `⭐ ${avgRating} (${teacherReviews.length} reviews)` : 'No reviews'} />
        <InfoRow label="Application" value={teacher.application_status} />
      </DrawerSection>

      {teacher.subjects?.length > 0 && (
        <DrawerSection title="Subjects">
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>{teacher.subjects.map(s => <span key={s} style={{ fontSize: '12px', background: '#F5F3FF', color: '#6D28D9', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>{s}</span>)}</div>
        </DrawerSection>
      )}
      {teacher.bio && <DrawerSection title="Bio"><p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{teacher.bio}</p></DrawerSection>}

      {!loading && (
        <>
          <DrawerSection title={`Documents (${docs.length})`}>
            {docs.length === 0 ? <p style={{ fontSize: '14px', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>None uploaded</p>
              : docs.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
                  <span>🪪</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{d.document_type}</div></div>
                  <StatusBadge status={d.status} />
                  <DocViewBtn fileUrl={d.file_url} name={d.document_type} label="View" />
                </div>
              ))}
          </DrawerSection>
          <DrawerSection title={`Certificates (${certs.length})`}>
            {certs.length === 0 ? <p style={{ fontSize: '14px', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>None uploaded</p>
              : certs.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
                  <span>{c.certificate_type === 'academic' ? '🎓' : '📋'}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{c.certificate_name}</div></div>
                  <StatusBadge status={c.status} />
                  <ViewFileBtn url={c.file_url} name={c.certificate_name} />
                </div>
              ))}
          </DrawerSection>
        </>
      )}

      {teacherReviews.length > 0 && (
        <DrawerSection title="Recent reviews">
          {teacherReviews.slice(0, 3).map(r => (
            <div key={r.id} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{r.reviewer?.full_name}</span>
                <span style={{ color: '#F59E0B', fontSize: '13px' }}>{'⭐'.repeat(r.rating)}</span>
              </div>
              {r.comment && <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>{r.comment}</p>}
            </div>
          ))}
        </DrawerSection>
      )}

      <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '1.25rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {teacher.is_verified
          ? <button onClick={() => onVerify(teacher.id, false)} style={btnRed}>Remove verification</button>
          : <button onClick={() => onVerify(teacher.id, true)} style={btnGreen}>✓ Verify</button>
        }
        {isSuspended
          ? <button onClick={() => onSuspend(teacher.id, false)} style={btnGreen}>Unblock</button>
          : <button onClick={() => setPendingAction({ title: 'Suspend Teacher', description: 'This will prevent the teacher from accessing their account and hide their profile.', confirmLabel: '⏸ Suspend', style: btnYellow, onConfirm: (reason) => onSuspend(teacher.id, true, reason) })} style={btnYellow}>⏸ Suspend</button>
        }
      </div>
    </div>
  )
}

function UserDetail({ user, allBookings, onSuspend, onDelete, onUpdateProfile }) {
  const userBookings = allBookings.filter(b => b.client_id === user.id)
  const isSuspended = user.status === 'suspended'
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: user.full_name || '', phone: user.phone || '', city: user.city || '', country: user.country || '' })
  const [saving, setSaving] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const saveProfile = async () => {
    setSaving(true)
    await onUpdateProfile(user.id, editForm)
    setSaving(false); setEditing(false)
  }

  return (
    <div>
      {pendingAction && (
        <ReasonModal title={pendingAction.title} description={pendingAction.description} confirmLabel={pendingAction.confirmLabel} confirmStyle={pendingAction.style} onConfirm={(reason) => { pendingAction.onConfirm(reason); setPendingAction(null) }} onCancel={() => setPendingAction(null)} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem', padding: '1rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <AdminAvatar name={user.full_name} url={user.avatar_url} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{user.full_name}</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', textTransform: 'capitalize', background: user.role === 'teacher' ? '#EDE9FE' : user.role === 'learner' ? '#DCFCE7' : '#F3E8FF', color: user.role === 'teacher' ? '#5B21B6' : user.role === 'learner' ? '#166534' : '#6B21A8' }}>{user.role}</span>
            {isSuspended && <StatusBadge status="suspended" />}
          </div>
        </div>
        <button onClick={() => setEditing(e => !e)} style={{ ...btnGhost, fontSize: '12px' }}>{editing ? 'Cancel edit' : '✏️ Edit profile'}</button>
      </div>

      {editing ? (
        <DrawerSection title="Edit Profile">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[['Full name','full_name'],['Phone','phone'],['City','city'],['Country','country']].map(([label, key]) => (
              <div key={key}><label style={formLbl}>{label}</label><input style={formInp} value={editForm[key]} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} /></div>
            ))}
            <button onClick={saveProfile} disabled={saving} style={{ ...btnGreen, padding: '10px', fontSize: '14px', width: '100%', borderRadius: '8px' }}>{saving ? 'Saving...' : '✓ Save changes'}</button>
          </div>
        </DrawerSection>
      ) : (
        <DrawerSection title="Account details">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone} />
          <InfoRow label="City" value={user.city} />
          <InfoRow label="Country" value={user.country} />
          <InfoRow label="Joined" value={new Date(user.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })} />
          <InfoRow label="Status" value={user.status || 'active'} />
          <InfoRow label="Referral code" value={user.referral_code} />
        </DrawerSection>
      )}

      {userBookings.length > 0 && (
        <DrawerSection title={`Bookings (${userBookings.length})`}>
          {userBookings.slice(0, 5).map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{b.subject || 'Tuition'} → {b.teachers?.profiles?.full_name}</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>{new Date(b.created_at).toLocaleDateString()}</div>
              </div>
              {b.amount > 0 && <span style={{ fontSize: '13px', fontWeight: '700', color: '#6D28D9' }}>GH₵ {b.amount}</span>}
              <StatusBadge status={b.status} />
            </div>
          ))}
        </DrawerSection>
      )}

      <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '1.25rem', display: 'flex', gap: '8px' }}>
        {isSuspended
          ? <button onClick={() => onSuspend(user.id, false)} style={btnGreen}>Unblock</button>
          : <button onClick={() => setPendingAction({ title: 'Suspend User', description: 'This will prevent the user from accessing Stuumo.', confirmLabel: '⏸ Suspend', style: btnYellow, onConfirm: (reason) => onSuspend(user.id, true, reason) })} style={btnYellow}>⏸ Suspend</button>
        }
        <button onClick={() => setPendingAction({ title: 'Delete User', description: 'This is permanent and cannot be undone.', confirmLabel: '🗑 Delete permanently', style: btnRed, onConfirm: (reason) => onDelete(user.id, reason) })} style={btnRed}>🗑 Delete</button>
      </div>
    </div>
  )
}

function SessionDetail({ session, enrollmentCount, onUpdate }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: session.title || '', subject: session.subject || '', session_date: session.session_date || '', start_time: session.start_time || '', end_time: session.end_time || '', price: session.price || 0, max_spots: session.max_spots || 20 })
  const [saving, setSaving] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    supabase.from('enrollments').select('*, profiles:user_id (full_name, email)').eq('session_id', session.id)
      .then(({ data }) => { setEnrollments(data || []); setLoading(false) })
  }, [session.id])

  const saveEdit = async () => {
    setSaving(true)
    await onUpdate(session.id, editForm)
    setSaving(false); setEditing(false)
  }

  return (
    <div>
      <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>{session.title}</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {session.subject && <span style={{ fontSize: '12px', background: '#F5F3FF', color: '#6D28D9', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' }}>{session.subject}</span>}
            <StatusBadge status={session.session_date >= today ? 'upcoming' : 'completed'} />
            {session.deleted_at && <StatusBadge status="hidden" />}
          </div>
        </div>
        <button onClick={() => setEditing(e => !e)} style={{ ...btnGhost, fontSize: '12px', flexShrink: 0 }}>{editing ? 'Cancel' : '✏️ Edit'}</button>
      </div>

      {editing ? (
        <DrawerSection title="Edit Session">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={formLbl}>Title</label><input style={formInp} value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label style={formLbl}>Subject</label><input style={formInp} value={editForm.subject} onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))} /></div>
            <div><label style={formLbl}>Date</label><input type="date" style={formInp} value={editForm.session_date} onChange={e => setEditForm(f => ({ ...f, session_date: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={formLbl}>Start time</label><input type="time" style={formInp} value={editForm.start_time} onChange={e => setEditForm(f => ({ ...f, start_time: e.target.value }))} /></div>
              <div><label style={formLbl}>End time</label><input type="time" style={formInp} value={editForm.end_time} onChange={e => setEditForm(f => ({ ...f, end_time: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={formLbl}>Price (GH₵)</label><input type="number" min="0" style={formInp} value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div><label style={formLbl}>Max spots</label><input type="number" min="1" style={formInp} value={editForm.max_spots} onChange={e => setEditForm(f => ({ ...f, max_spots: e.target.value }))} /></div>
            </div>
            <button onClick={saveEdit} disabled={saving} style={{ ...btnGreen, padding: '10px', fontSize: '14px', width: '100%', borderRadius: '8px' }}>{saving ? 'Saving...' : '✓ Save changes'}</button>
          </div>
        </DrawerSection>
      ) : (
        <DrawerSection title="Session info">
          <InfoRow label="Teacher" value={session.teachers?.profiles?.full_name} />
          <InfoRow label="Date" value={new Date(session.session_date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
          <InfoRow label="Time" value={`${session.start_time} – ${session.end_time}`} />
          <InfoRow label="Price" value={session.price > 0 ? `GH₵ ${session.price}` : 'Free'} />
          <InfoRow label="Max spots" value={session.max_spots} />
          <InfoRow label="Enrolled" value={`${enrollmentCount} / ${session.max_spots}`} />
          <InfoRow label="Spots left" value={Math.max(0, session.max_spots - enrollmentCount)} />
          {session.room_id && <InfoRow label="Room ID" value={session.room_id} />}
          <InfoRow label="Created" value={new Date(session.created_at).toLocaleDateString()} />
        </DrawerSection>
      )}

      <DrawerSection title={`Enrolled students (${enrollments.length})`}>
        {loading ? <div style={{ fontSize: '14px', color: '#64748B' }}>Loading...</div>
          : enrollments.length === 0 ? <p style={{ fontSize: '14px', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>No students enrolled yet</p>
          : enrollments.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
              <AdminAvatar name={e.profiles?.full_name} size={32} />
              <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{e.profiles?.full_name}</div><div style={{ fontSize: '12px', color: '#64748B' }}>{e.profiles?.email}</div></div>
              <StatusBadge status={e.payment_status} />
            </div>
          ))}
      </DrawerSection>
    </div>
  )
}

export default function Dashboard() {
  const { admin, signOut } = useAdmin()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [teachers, setTeachers] = useState([])
  const [certificates, setCertificates] = useState([])
  const [documents, setDocuments] = useState([])
  const [reviews, setReviews] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [sessions, setSessions] = useState([])
  const [sessionEnrollCounts, setSessionEnrollCounts] = useState({})
  const [payments, setPayments] = useState([])
  const [referrals, setReferrals] = useState([])
  const [incompletTeachers, setIncompletTeachers] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [flags, setFlags] = useState([])
  const [stats, setStats] = useState({ teachers: 0, pendingCerts: 0, pendingDocs: 0, verified: 0, totalUsers: 0, learners: 0, parents: 0, totalBookings: 0, totalSessions: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [
      { data: teacherData }, { data: certData }, { data: docData }, { data: reviewData },
      { data: userData }, { data: bookingData }, { data: sessionData }, { data: paymentData },
      { data: referralData }, { data: announcementData }, { data: auditData }, { data: flagData },
      { data: enrollData }
    ] = await Promise.all([
      supabase.from('teachers').select('*, profiles (full_name, city, country, avatar_url, status, email, phone)').order('is_verified', { ascending: true }),
      supabase.from('certificates').select('*, teachers:teacher_id (profiles (full_name))').order('uploaded_at', { ascending: false }),
      supabase.from('teacher_documents').select('*, profiles:teacher_id (full_name)').order('uploaded_at', { ascending: false }),
      supabase.from('reviews').select('*, reviewer:reviewer_id (full_name), teacher:teacher_id (profiles (full_name))').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*, profiles:client_id (full_name), teachers (id, profiles (full_name))').order('created_at', { ascending: false }),
      supabase.from('live_sessions').select('*, teachers (id, profiles (full_name, city, country))').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('referral_rewards').select('*, referrer:referrer_id (full_name), referred:referred_id (full_name, role)').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('*, admins (full_name)').order('created_at', { ascending: false }).limit(500),
      supabase.from('flags').select('*, reporter:reporter_id (full_name)').order('created_at', { ascending: false }),
      supabase.from('enrollments').select('session_id'),
    ])

    const enrollCounts = {}
    enrollData?.forEach(e => { enrollCounts[e.session_id] = (enrollCounts[e.session_id] || 0) + 1 })
    setSessionEnrollCounts(enrollCounts)

    const totalRevenue = (paymentData || []).reduce((sum, p) => sum + (p.amount || 0), 0)
    const refundedTotal = (bookingData || []).filter(b => b.refund_status === 'pending' || b.refund_status === 'refunded').reduce((s, b) => s + (b.amount || 0), 0)
    const teacherIdsWithCerts = new Set((certData || []).map(c => c.teacher_id))
    const incomplete = (teacherData || []).filter(t => !teacherIdsWithCerts.has(t.id))
    const reviewsByTeacher = {}
    ;(reviewData || []).forEach(r => { if (!reviewsByTeacher[r.teacher_id]) reviewsByTeacher[r.teacher_id] = []; reviewsByTeacher[r.teacher_id].push(r.rating) })
    const bookingsByTeacher = {}
    ;(bookingData || []).forEach(b => { if (b.status === 'confirmed') bookingsByTeacher[b.teacher_id] = (bookingsByTeacher[b.teacher_id] || 0) + 1 })
    const approvedCertTeachers = new Set((certData || []).filter(c => c.status === 'approved').map(c => c.teacher_id))
    const scoredTeachers = (teacherData || []).map(t => {
      const ratings = reviewsByTeacher[t.id] || []
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      const total = Math.round((avgRating / 5) * 40) + Math.min((bookingsByTeacher[t.id] || 0) * 3, 30) + (approvedCertTeachers.has(t.id) ? 20 : 0) + (t.is_verified ? 10 : 0)
      return { ...t, qualityScore: total, avgRating: avgRating.toFixed(1), reviewCount: ratings.length, bookingCount: bookingsByTeacher[t.id] || 0 }
    }).sort((a, b) => b.qualityScore - a.qualityScore)

    setTeachers(scoredTeachers)
    setCertificates(certData || []); setDocuments(docData || []); setReviews(reviewData || [])
    setAllUsers(userData || []); setBookings(bookingData || []); setSessions(sessionData || [])
    setPayments(paymentData || []); setReferrals(referralData || []); setIncompletTeachers(incomplete)
    setAnnouncements(announcementData || []); setAuditLogs(auditData || []); setFlags(flagData || [])
    setStats({
      teachers: teacherData?.length || 0, pendingCerts: certData?.filter(c => c.status === 'pending').length || 0,
      pendingDocs: docData?.filter(d => d.status === 'pending').length || 0,
      verified: teacherData?.filter(t => t.is_verified).length || 0,
      totalUsers: userData?.length || 0, learners: userData?.filter(u => u.role === 'learner').length || 0,
      parents: userData?.filter(u => u.role === 'parent').length || 0,
      totalBookings: bookingData?.length || 0, totalSessions: sessionData?.length || 0, totalRevenue, refundedTotal,
    })
    setLoading(false)
  }

  const log = async (action, target_type, target_id, details) => {
    await supabase.from('audit_logs').insert({ admin_id: admin?.id, action, target_type, target_id: String(target_id), details })
  }

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 4000) }

  const updateCert = async (id, status) => { await supabase.from('certificates').update({ status }).eq('id', id); await log(`Certificate ${status}`, 'certificate', id); showMsg(`✅ Certificate ${status}.`); fetchAll() }
  const updateDoc = async (id, status) => { await supabase.from('teacher_documents').update({ status }).eq('id', id); await log(`Document ${status}`, 'document', id); showMsg(`✅ Document ${status}.`); fetchAll() }
  const updateTeacher = async (id, is_verified) => { await supabase.from('teachers').update({ is_verified }).eq('id', id); await log(is_verified ? 'Teacher verified' : 'Teacher unverified', 'teacher', id); showMsg(`✅ Teacher ${is_verified ? 'verified' : 'unverified'}.`); fetchAll() }

  const approvePhoto = async (userId, pendingUrl, name = '') => {
    await supabase.from('profiles').update({ avatar_url: pendingUrl, pending_avatar_url: null }).eq('id', userId)
    await supabase.from('notifications').insert({ user_id: userId, title: '✅ Photo approved', message: 'Your new profile photo has been approved and is now live.', type: 'profile', link: '/dashboard' })
    await log('Profile photo approved', 'user', userId, name)
    showMsg('✅ Photo approved.'); fetchAll()
  }
  const rejectPhoto = async (userId, name = '', reason = '') => {
    await supabase.from('profiles').update({ pending_avatar_url: null }).eq('id', userId)
    await supabase.from('notifications').insert({ user_id: userId, title: 'Profile photo not approved', message: `Your new profile photo was not approved. Reason: ${reason}`, type: 'profile', link: '/dashboard' })
    await log('Profile photo rejected', 'user', userId, `${name}: ${reason}`)
    showMsg('✅ Photo rejected.'); fetchAll()
  }

  const suspendUser = async (id, suspend, reason = '') => {
    await supabase.from('profiles').update({ status: suspend ? 'suspended' : 'active' }).eq('id', id)
    await log(suspend ? 'User suspended' : 'User unblocked', 'user', id, reason)
    showMsg(`✅ User ${suspend ? 'suspended' : 'unblocked'}.`); fetchAll()
  }

  const deleteUser = async (id, reason = '') => {
    await supabase.from('profiles').delete().eq('id', id)
    await log('User deleted', 'user', id, reason)
    showMsg('✅ User deleted.'); fetchAll()
  }

  const updateUserProfile = async (id, data) => {
    await supabase.from('profiles').update(data).eq('id', id)
    const changes = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(', ')
    await log('Profile edited by admin', 'user', id, changes)
    showMsg('✅ Profile updated.'); fetchAll()
  }

  const updateBookingStatus = async (bookingId, status) => {
    const booking = bookings.find(b => b.id === bookingId)
    const updateData = { status }
    if (status === 'confirmed') updateData.room_id = 'stuumo-' + bookingId.slice(0, 8) + '-' + Date.now()
    await supabase.from('bookings').update(updateData).eq('id', bookingId)
    await supabase.from('notifications').insert({ user_id: booking.client_id, title: status === 'confirmed' ? '🎉 Booking confirmed!' : 'Booking update', message: status === 'confirmed' ? `Your ${booking.subject} booking has been confirmed.` : `Your ${booking.subject} booking was declined.`, type: status === 'confirmed' ? 'booking_confirmed' : 'booking_declined', link: '/booking' })
    await log(`Booking ${status} by admin`, 'booking', bookingId, booking?.subject)
    showMsg(`✅ Booking ${status}.`); fetchAll()
  }

  const updateSession = async (id, data) => {
    await supabase.from('live_sessions').update({ ...data, max_spots: parseInt(data.max_spots), price: parseFloat(data.price) || 0 }).eq('id', id)
    await log('Session updated by admin', 'session', id, data.title)
    showMsg('✅ Session updated.'); fetchAll()
  }

  const createAdminSession = async (data) => {
    const roomId = 'stuumo-session-' + data.teacher_id.slice(0, 8) + '-' + Date.now()
    await supabase.from('live_sessions').insert({ ...data, room_id: roomId, max_spots: parseInt(data.max_spots), price: parseFloat(data.price) || 0 })
    await log('Session created by admin', 'session', 'new', data.title)
    showMsg('✅ Session created — visible on main app.'); fetchAll()
  }

  const softDeleteReview = async (id, deleted) => { await supabase.from('reviews').update({ deleted_at: deleted ? new Date().toISOString() : null }).eq('id', id); showMsg(`✅ Review ${deleted ? 'hidden' : 'restored'}.`); fetchAll() }
  const softDeleteSession = async (id, deleted) => { await supabase.from('live_sessions').update({ deleted_at: deleted ? new Date().toISOString() : null }).eq('id', id); showMsg(`✅ Session ${deleted ? 'hidden' : 'restored'}.`); fetchAll() }
  const updateReferral = async (id, reward_status) => { await supabase.from('referral_rewards').update({ reward_status }).eq('id', id); showMsg(`✅ Referral marked ${reward_status}.`); fetchAll() }
  const updateFlag = async (id, status) => { await supabase.from('flags').update({ status }).eq('id', id); await log(`Flag ${status}`, 'flag', id); showMsg(`✅ Flag ${status}.`); fetchAll() }
  const markPayoutPaid = async (bookingId) => { await supabase.from('bookings').update({ payout_status: 'paid' }).eq('id', bookingId); await log('Payout marked paid', 'booking', bookingId); showMsg('✅ Payout processed.'); fetchAll() }

  const markRefunded = async (booking) => {
    await supabase.from('bookings').update({ refund_status: 'refunded' }).eq('id', booking.id)
    await supabase.from('notifications').insert({ user_id: booking.client_id, title: '💳 Refund processed', message: `Your refund of GH₵ ${booking.amount} for the cancelled ${booking.subject || 'private'} session has been processed.`, type: 'booking_confirmed', link: '/booking' })
    await log('Refund processed', 'booking', booking.id, `GH₵ ${booking.amount}`)
    showMsg('✅ Refund marked as processed.'); fetchAll()
  }
  const approveApplication = async (teacherId, teacherName, userId, teacherEmail) => {
    await supabase.from('teachers').update({ application_status: 'approved', is_verified: true }).eq('id', teacherId)
    await supabase.from('notifications').insert({ user_id: userId, title: '🎉 Application approved!', message: 'Your teacher application has been approved. Your profile is now live.', type: 'application', link: '/dashboard' })
    if (teacherEmail) await sendEmail({ type: 'application_approved', teacherEmail, teacherName })
    await log('Application approved', 'teacher', teacherId, teacherName)
    showMsg(`✅ ${teacherName}'s application approved.`); fetchAll()
  }
  const rejectApplication = async (teacherId, teacherName, userId, notes, teacherEmail) => {
    await supabase.from('teachers').update({ application_status: 'rejected', application_notes: notes }).eq('id', teacherId)
    await supabase.from('notifications').insert({ user_id: userId, title: 'Application update', message: `Your application was not approved. Reason: ${notes}`, type: 'application', link: '/dashboard' })
    if (teacherEmail) await sendEmail({ type: 'application_rejected', teacherEmail, teacherName, notes })
    await log('Application rejected', 'teacher', teacherId, `${teacherName}: ${notes}`)
    showMsg(`✅ ${teacherName}'s application rejected.`); fetchAll()
  }

  const pendingFlags = flags.filter(f => f.status === 'pending').length
  const pendingApplications = teachers.filter(t => t.application_status === 'pending').length
  const pendingPhotos = allUsers.filter(u => u.pending_avatar_url).length
  const pendingPayouts = bookings.filter(b => b.payment_status === 'paid' && b.payout_status === 'pending' && b.status !== 'cancelled').length
  const pendingRefunds = bookings.filter(b => b.refund_status === 'pending').length

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Tahoma, Geneva, sans-serif', color: '#111', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#6D28D9', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: '22px', fontWeight: '700', color: '#fff' }}>Stuumo</div>
          <span style={{ fontSize: '11px', background: '#FFFFFF', color: '#6D28D9', padding: '2px 10px', borderRadius: '20px', fontWeight: '700' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{admin?.full_name}</span>
          <button onClick={async () => { await signOut(); navigate('/login') }} style={{ padding: '7px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar tab={tab} setTab={setTab} pendingApplications={pendingApplications} pendingCerts={stats.pendingCerts} pendingDocs={stats.pendingDocs} pendingPhotos={pendingPhotos} pendingFlags={pendingFlags} pendingPayouts={pendingPayouts} pendingRefunds={pendingRefunds} incompletCount={incompletTeachers.length} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
          {message && (
            <div style={{ background: message.startsWith('✅') ? '#DCFCE7' : '#FEE2E2', color: message.startsWith('✅') ? '#166534' : '#991B1B', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '1.25rem', border: `1px solid ${message.startsWith('✅') ? '#BBF7D0' : '#FECACA'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {message}
              <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'inherit', opacity: 0.6 }}>×</button>
            </div>
          )}
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748B', padding: '4rem', fontSize: '16px' }}>⏳ Loading...</div>
          ) : (
            <>
              {tab === 'overview' && <OverviewTab stats={stats} bookings={bookings} teachers={teachers} pendingApplications={pendingApplications} pendingPayouts={pendingPayouts} pendingRefunds={pendingRefunds} pendingCerts={stats.pendingCerts} pendingDocs={stats.pendingDocs} pendingPhotos={pendingPhotos} pendingFlags={pendingFlags} setTab={setTab} />}
              {tab === 'applications' && <ApplicationsTab teachers={teachers} allUsers={allUsers} onApprove={approveApplication} onReject={rejectApplication} />}
              {tab === 'certificates' && <CertificatesTab certificates={certificates} onUpdate={updateCert} onRefresh={fetchAll} setMessage={showMsg} log={log} teachers={teachers} />}
              {tab === 'documents' && <DocumentsTab documents={documents} onUpdate={updateDoc} onRefresh={fetchAll} setMessage={showMsg} log={log} teachers={teachers} />}
              {tab === 'photos' && <PhotoReviewsTab users={allUsers} onApprove={approvePhoto} onReject={rejectPhoto} />}
              {tab === 'teachers' && <TeachersTab teachers={teachers} allReviews={reviews} allBookings={bookings} onVerify={updateTeacher} onSuspend={suspendUser} onDelete={deleteUser} onUpdateProfile={updateUserProfile} />}
              {tab === 'learners' && <LearnersTab users={allUsers.filter(u => u.role === 'learner')} allBookings={bookings} onSuspend={suspendUser} onDelete={deleteUser} onUpdateProfile={updateUserProfile} />}
              {tab === 'parents' && <ParentsTab users={allUsers.filter(u => u.role === 'parent')} allBookings={bookings} onSuspend={suspendUser} onDelete={deleteUser} onUpdateProfile={updateUserProfile} />}
              {tab === 'users' && <UsersTab users={allUsers} allBookings={bookings} onSuspend={suspendUser} onDelete={deleteUser} onRefresh={fetchAll} setMessage={showMsg} log={log} onUpdateProfile={updateUserProfile} />}
              {tab === 'reviews' && <ReviewsTab reviews={reviews} onToggle={softDeleteReview} />}
              {tab === 'bookings' && <BookingsTab bookings={bookings} onMarkPayout={markPayoutPaid} onUpdateStatus={updateBookingStatus} />}
              {tab === 'sessions' && <SessionsTab sessions={sessions} enrollCounts={sessionEnrollCounts} onToggle={softDeleteSession} onUpdate={updateSession} onCreate={createAdminSession} teachers={teachers} />}
              {tab === 'payments' && <PaymentsTab payments={payments} />}
              {tab === 'payouts' && <PayoutsTab bookings={bookings} onMarkPayout={markPayoutPaid} />}
              {tab === 'refunds' && <RefundsTab bookings={bookings} onMarkRefunded={markRefunded} />}
              {tab === 'referrals' && <ReferralsTab referrals={referrals} onUpdate={updateReferral} />}
              {tab === 'onboarding' && <OnboardingTab teachers={incompletTeachers} allReviews={reviews} allBookings={bookings} />}
              {tab === 'quality' && <QualityTab teachers={teachers} />}
              {tab === 'flags' && <FlagsTab flags={flags} onUpdate={updateFlag} onRefresh={fetchAll} setMessage={showMsg} log={log} />}
              {tab === 'revenue' && <RevenueTab payments={payments} bookings={bookings} allUsers={allUsers} teachers={teachers} />}
              {tab === 'geography' && <GeographyTab users={allUsers} teachers={teachers} />}
              {tab === 'announcements' && <AnnouncementsTab announcements={announcements} adminId={admin?.id} onRefresh={fetchAll} />}
              {tab === 'audit' && <AuditTab logs={auditLogs} allUsers={allUsers} />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function OverviewTab({ stats, bookings, teachers, pendingApplications, pendingPayouts, pendingRefunds, pendingCerts, pendingDocs, pendingPhotos, pendingFlags, setTab }) {
  const needsAttention = pendingApplications + pendingPayouts + pendingRefunds + pendingCerts + pendingDocs + pendingPhotos + pendingFlags
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[['👥','Total users',stats.totalUsers,'#6D28D9'],['👩‍🏫','Teachers',stats.teachers,'#7C3AED'],['📚','Learners',stats.learners,'#059669'],['👨‍👩‍👧','Parents',stats.parents,'#D97706']].map(([icon,label,value,color]) => <StatCard key={label} icon={icon} label={label} value={value} color={color} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[['📅','Total bookings',stats.totalBookings,'#0891B2'],['🎥','Live sessions',stats.totalSessions,'#7C3AED'],['✅','Verified teachers',stats.verified,'#059669'],['💰','Net GMV',`GH₵ ${((stats.totalRevenue||0) - (stats.refundedTotal||0)).toFixed(2)}`,'#166534']].map(([icon,label,value,color]) => <StatCard key={label} icon={icon} label={label} value={value} color={color} />)}
      </div>
      {needsAttention > 0 && (
        <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #FDE68A' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#92400E', marginBottom: '10px' }}>⚠️ Needs attention</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[[pendingApplications,'🚀','teacher application','applications'],[pendingPayouts,'💰','teacher payout','payouts'],[pendingRefunds,'↩️','learner refund','refunds'],[pendingCerts,'📋','certificate','certificates'],[pendingDocs,'🪪','document','documents'],[pendingPhotos,'🖼️','photo review','photos'],[pendingFlags,'🚩','flag','flags']].filter(([count]) => count > 0).map(([count,icon,label,tabKey]) => (
              <div key={tabKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: '14px', color: '#78350F' }}>{icon} {count} {label}{count !== 1 ? 's' : ''} awaiting review</span>
                <button onClick={() => setTab(tabKey)} style={{ fontSize: '13px', color: '#6D28D9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Review →</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>📅 Recent bookings</h3></div>
        {bookings.slice(0, 6).map(b => (
          <div key={b.id} style={{ padding: '12px 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{b.profiles?.full_name} → {b.teachers?.profiles?.full_name}</div><div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{b.subject} · {new Date(b.created_at).toLocaleDateString()}</div></div>
            <StatusBadge status={b.status} />
            {b.amount > 0 && <span style={{ fontSize: '13px', color: '#6D28D9', fontWeight: '700' }}>GH₵ {b.amount}</span>}
          </div>
        ))}
        {bookings.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>No bookings yet.</div>}
      </div>
    </div>
  )
}

function ApplicationsTab({ teachers, allUsers, onApprove, onReject }) {
  const [filter, setFilter] = useState('pending')
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const filtered = teachers.filter(t => filter === 'all' ? true : t.application_status === filter)
  const counts = { pending: teachers.filter(t => t.application_status === 'pending').length, approved: teachers.filter(t => t.application_status === 'approved').length, rejected: teachers.filter(t => t.application_status === 'rejected').length }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <DetailDrawer open={!!selectedTeacher} onClose={() => setSelectedTeacher(null)} title="Application Review" subtitle={selectedTeacher?.profiles?.full_name}>
        {selectedTeacher && <ApplicationDetail teacher={selectedTeacher} onApprove={(...args) => { onApprove(...args); setSelectedTeacher(null) }} onReject={(...args) => { onReject(...args); setSelectedTeacher(null) }} />}
      </DetailDrawer>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[['⏳','Pending',counts.pending,'#854D0E'],['✅','Approved',counts.approved,'#166534'],['❌','Rejected',counts.rejected,'#991B1B']].map(([icon,label,value,color]) => <StatCard key={label} icon={icon} label={label} value={value} color={color} />)}
      </div>
      <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
        {[['pending','Pending'],['approved','Approved'],['rejected','Rejected'],['all','All']].map(([key,label]) => (
          <button key={key} onClick={() => setFilter(key)} style={{ padding: '7px 18px', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: filter === key ? '#6D28D9' : 'transparent', color: filter === key ? '#fff' : '#64748B', fontWeight: filter === key ? '700' : '400' }}>{label}</button>
        ))}
      </div>
      <div style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} application{filtered.length !== 1 ? 's' : ''}</div>
      {filtered.length === 0 ? <Empty text={filter === 'pending' ? '🎉 No pending applications.' : 'No applications found.'} /> : filtered.map(teacher => (
        <div key={teacher.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', border: `1px solid ${teacher.application_status === 'pending' ? '#C4B5FD' : '#E2E8F0'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <AdminAvatar name={teacher.profiles?.full_name} url={teacher.profiles?.avatar_url} size={48} />
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>{teacher.profiles?.full_name}</span>
                <StatusBadge status={teacher.application_status} />
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>📍 {teacher.profiles?.city}, {teacher.profiles?.country}</div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#64748B', flexWrap: 'wrap' }}>
                {teacher.years_experience && <span>🏆 {teacher.years_experience} yrs</span>}
                {teacher.hourly_rate > 0 && <span>💰 GH₵ {teacher.hourly_rate}/hr</span>}
                {teacher.subjects?.length > 0 && <span>📚 {teacher.subjects.slice(0,3).join(', ')}</span>}
                {teacher.application_submitted_at && <span>📅 {new Date(teacher.application_submitted_at).toLocaleDateString()}</span>}
              </div>
            </div>
            <button onClick={() => setSelectedTeacher(teacher)} style={{ padding: '8px 18px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700', flexShrink: 0 }}>Open & review →</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function CertificatesTab({ certificates, onUpdate, onRefresh, setMessage, log, teachers }) {
  const [selected, setSelected] = useState(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [f, setF] = useState({ status: 'all', type: 'all', dateFrom: '', dateTo: '', search: '' })
  const [showUpload, setShowUpload] = useState(false)
  const [uploadTeacherId, setUploadTeacherId] = useState('')
  const [uploadCertName, setUploadCertName] = useState('')
  const [uploadCertType, setUploadCertType] = useState('teaching')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const filtered = certificates.filter(c => {
    if (f.status !== 'all' && c.status !== f.status) return false
    if (f.type !== 'all') { if (f.type === 'academic' && c.certificate_type !== 'academic') return false; if (f.type === 'teaching' && c.certificate_type === 'academic') return false }
    if (f.dateFrom && new Date(c.uploaded_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(c.uploaded_at) > new Date(f.dateTo + 'T23:59:59')) return false
    if (f.search && !c.certificate_name?.toLowerCase().includes(f.search.toLowerCase()) && !c.teachers?.profiles?.full_name?.toLowerCase().includes(f.search.toLowerCase())) return false
    return true
  })

  const pending = filtered.filter(c => c.status === 'pending')
  const allPendingIds = pending.map(c => c.id)
  const allSelected = allPendingIds.length > 0 && allPendingIds.every(id => selected.has(id))
  const toggle = (id) => { const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next) }

  const bulkAction = async (status) => {
    if (selected.size === 0) return
    if (!window.confirm(`${status === 'approved' ? 'Approve' : 'Decline'} ${selected.size} certificate(s)?`)) return
    setBulkLoading(true)
    const ids = [...selected]
    await supabase.from('certificates').update({ status }).in('id', ids)
    await log(`Bulk certificate ${status}`, 'certificate', ids.join(','), `${ids.length} certificates ${status}`)
    setMessage(`✅ ${ids.length} certificate(s) ${status}.`); setSelected(new Set()); onRefresh(); setBulkLoading(false)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile || !uploadCertName || !uploadTeacherId) return
    setUploading(true)
    try {
      const fileName = `${uploadTeacherId}/${Date.now()}.${uploadFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('certificates').upload(fileName, uploadFile)
      if (error) throw error
      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName)
      await supabase.from('certificates').insert ({ teacher_id: uploadTeacherId, certificate_name: uploadCertName, file_url: urlData.publicUrl, status: 'approved', certificate_type: uploadCertType })
      await log('Admin uploaded certificate', 'certificate', uploadTeacherId, uploadCertName)
      setMessage('✅ Certificate uploaded and approved.')
      setUploadFile(null); setUploadCertName(''); setUploadTeacherId(''); setShowUpload(false); onRefresh()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>Certificates</h3>
        <button onClick={() => setShowUpload(s => !s)} style={{ padding: '8px 16px', background: showUpload ? '#F1F5F9' : '#6D28D9', color: showUpload ? '#64748B' : '#fff', border: showUpload ? '1px solid #E2E8F0' : 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
          {showUpload ? '✕ Cancel' : '⬆ Upload for teacher'}
        </button>
      </div>

      {showUpload && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #6D28D9', overflow: 'hidden' }}>
          <div style={{ background: '#6D28D9', padding: '1rem 1.5rem' }}><h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', margin: 0 }}>Upload certificate on behalf of teacher (auto-approved)</h3></div>
          <form onSubmit={handleUpload} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={formLbl}>Teacher *</label>
              <select style={{ ...formInp, cursor: 'pointer' }} value={uploadTeacherId} onChange={e => setUploadTeacherId(e.target.value)} required>
                <option value="">Select teacher...</option>
                {(teachers || []).map(t => <option key={t.id} value={t.id}>{t.profiles?.full_name} — {t.profiles?.city}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={formLbl}>Certificate name *</label><input style={formInp} placeholder="e.g. PGDE — UEW" value={uploadCertName} onChange={e => setUploadCertName(e.target.value)} required /></div>
              <div><label style={formLbl}>Type</label>
                <select style={{ ...formInp, cursor: 'pointer' }} value={uploadCertType} onChange={e => setUploadCertType(e.target.value)}>
                  <option value="teaching">Teaching certificate</option>
                  <option value="academic">Academic degree</option>
                </select>
              </div>
            </div>
            <div><label style={formLbl}>File (PDF, JPG, PNG) *</label>
              <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '12px', background: '#F8FAFC', textAlign: 'center' }}>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setUploadFile(e.target.files[0])} required style={{ fontSize: '13px', cursor: 'pointer', color: '#374151' }} />
                {uploadFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {uploadFile.name}</p>}
              </div>
            </div>
            <button type="submit" disabled={uploading || !uploadFile || !uploadCertName || !uploadTeacherId} style={{ padding: '10px', background: uploading ? '#E2E8F0' : '#6D28D9', color: uploading ? '#64748B' : '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
              {uploading ? '⏳ Uploading...' : '⬆ Upload & approve'}
            </button>
          </form>
        </div>
      )}

      <FilterBar filters={[
        { key: 'search', label: 'Search', type: 'text', value: f.search, placeholder: 'Name or teacher...', width: '160px' },
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All statuses' },{ value: 'pending', label: 'Pending' },{ value: 'approved', label: 'Approved' },{ value: 'declined', label: 'Declined' }] },
        { key: 'type', label: 'Type', type: 'select', value: f.type, options: [{ value: 'all', label: 'All types' },{ value: 'teaching', label: 'Teaching' },{ value: 'academic', label: 'Academic' }] },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ status: 'all', type: 'all', dateFrom: '', dateTo: '', search: '' })} />

      {pending.length > 0 && (
        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <input type="checkbox" checked={allSelected} onChange={() => allSelected ? setSelected(new Set()) : setSelected(new Set(allPendingIds))} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
          <span style={{ fontSize: '14px', color: '#475569' }}>{selected.size > 0 ? `${selected.size} selected` : 'Select pending to bulk action'}</span>
          {selected.size > 0 && <>
            <button onClick={() => bulkAction('approved')} disabled={bulkLoading} style={btnGreen}>✓ Approve</button>
            <button onClick={() => bulkAction('declined')} disabled={bulkLoading} style={btnRed}>✗ Decline</button>
            <button onClick={() => setSelected(new Set())} style={btnGhost}>Clear</button>
          </>}
        </div>
      )}

      <div style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} certificate{filtered.length !== 1 ? 's' : ''} — click to open and review</div>

      {filtered.length === 0 ? <Empty text="No certificates match filters." /> : filtered.map(cert => {
        const isExpanded = expandedId === cert.id
        return (
          <div key={cert.id} style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${selected.has(cert.id) ? '#C4B5FD' : isExpanded ? '#6D28D9' : '#E2E8F0'}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : cert.id)}>
              {cert.status === 'pending' && <input type="checkbox" checked={selected.has(cert.id)} onChange={e => { e.stopPropagation(); toggle(cert.id) }} onClick={e => e.stopPropagation()} style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#111' }}>{cert.certificate_name}</div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>👩‍🏫 {cert.teachers?.profiles?.full_name} · {cert.certificate_type === 'academic' ? '🎓 Academic' : '📋 Teaching'} · {new Date(cert.uploaded_at).toLocaleDateString()}</div>
              </div>
              <StatusBadge status={cert.status} />
              <span style={{ fontSize: '13px', color: '#6D28D9', fontWeight: '700' }}>{isExpanded ? '▲ Close' : '▼ Open to review'}</span>
            </div>
            {isExpanded && (
              <div style={{ borderTop: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', background: '#F8FAFC' }}>
                <div style={{ marginBottom: '1rem' }}><ViewFileBtn url={cert.file_url} name={cert.certificate_name} label="📄 View certificate" /></div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {cert.status !== 'approved' && <button onClick={() => { onUpdate(cert.id, 'approved'); setExpandedId(null) }} style={btnGreen}>✓ Approve</button>}
                  {cert.status !== 'declined' && <button onClick={() => { onUpdate(cert.id, 'declined'); setExpandedId(null) }} style={btnRed}>✗ Decline</button>}
                  {cert.status !== 'pending' && <button onClick={() => { onUpdate(cert.id, 'pending'); setExpandedId(null) }} style={btnYellow}>Reset to pending</button>}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PhotoReviewsTab({ users, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(null) // the user pending rejection
  const pending = (users || []).filter(u => u.pending_avatar_url)

  const PhotoBox = ({ label, url, initial, highlight }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      {url ? (
        <img src={url} alt={label} style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${highlight ? '#6D28D9' : '#E2E8F0'}`, display: 'block', margin: '0 auto' }} />
      ) : (
        <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: '700', color: '#94A3B8', border: '3px solid #E2E8F0', margin: '0 auto' }}>
          {initial || '—'}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>Photo Reviews</h3>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>New teacher profile photos awaiting approval. Approving makes the photo live; rejecting discards it and keeps the current one.</p>
      </div>

      {pending.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '3rem', textAlign: 'center', color: '#64748B', fontSize: '15px' }}>
          🖼️ No photos waiting for review.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {pending.map(u => (
            <div key={u.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name || 'Unnamed'}</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    <span style={{ textTransform: 'capitalize' }}>{u.role}</span>{[u.city, u.country].filter(Boolean).length > 0 ? ` · ${[u.city, u.country].filter(Boolean).join(', ')}` : ''}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#854D0E', background: '#FEF9C3', border: '1px solid #FDE68A', padding: '3px 10px', borderRadius: '9999px', whiteSpace: 'nowrap', flexShrink: 0 }}>⏳ Pending</span>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <PhotoBox label="Current" url={u.avatar_url} initial={u.full_name?.charAt(0)} />
                <div style={{ alignSelf: 'center', fontSize: '20px', color: '#CBD5E1' }}>→</div>
                <PhotoBox label="New" url={u.pending_avatar_url} highlight />
              </div>

              <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', gap: '8px' }}>
                <button onClick={() => onApprove(u.id, u.pending_avatar_url, u.full_name)} style={{ ...btnGreen, flex: 1, textAlign: 'center' }}>✓ Approve</button>
                <button onClick={() => setRejecting(u)} style={{ ...btnRed, flex: 1, textAlign: 'center' }}>✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejecting && (
        <ReasonModal
          title="Reject photo"
          description={`Discard the pending photo for ${rejecting.full_name || 'this user'}? Their current photo stays in place and they'll be notified.`}
          confirmLabel="✕ Reject photo"
          confirmStyle={btnRed}
          onConfirm={(reason) => { onReject(rejecting.id, rejecting.full_name, reason); setRejecting(null) }}
          onCancel={() => setRejecting(null)}
        />
      )}
    </div>
  )
}

function DocumentsTab({ documents, onUpdate, onRefresh, setMessage, log, teachers }) {
  const [expandedId, setExpandedId] = useState(null)
  const [f, setF] = useState({ status: 'all', type: 'all', dateFrom: '', dateTo: '', search: '' })
  const [showUpload, setShowUpload] = useState(false)
  const [uploadTeacherId, setUploadTeacherId] = useState('')
  const [uploadDocType, setUploadDocType] = useState('National ID')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const docTypes = [...new Set(documents.map(d => d.document_type).filter(Boolean))]
  const filtered = documents.filter(d => {
    if (f.status !== 'all' && d.status !== f.status) return false
    if (f.type !== 'all' && d.document_type !== f.type) return false
    if (f.dateFrom && new Date(d.uploaded_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(d.uploaded_at) > new Date(f.dateTo + 'T23:59:59')) return false
    if (f.search && !d.document_type?.toLowerCase().includes(f.search.toLowerCase()) && !d.profiles?.full_name?.toLowerCase().includes(f.search.toLowerCase())) return false
    return true
  })

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile || !uploadTeacherId) return
    setUploading(true)
    try {
      const fileName = `${uploadTeacherId}/${Date.now()}.${uploadFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('teacher-ids').upload(fileName, uploadFile)
      if (error) throw error
      await supabase.from('teacher_documents').insert({ teacher_id: uploadTeacherId, document_type: uploadDocType, file_url: fileName, status: 'approved' })
      await log('Admin uploaded document', 'document', uploadTeacherId, uploadDocType)
      setMessage('✅ Document uploaded and approved.')
      setUploadFile(null); setUploadTeacherId(''); setShowUpload(false); onRefresh()
    } catch (err) { setMessage('Error: ' + err.message) }
    finally { setUploading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>Documents</h3>
        <button onClick={() => setShowUpload(s => !s)} style={{ padding: '8px 16px', background: showUpload ? '#F1F5F9' : '#6D28D9', color: showUpload ? '#64748B' : '#fff', border: showUpload ? '1px solid #E2E8F0' : 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
          {showUpload ? '✕ Cancel' : '⬆ Upload for teacher'}
        </button>
      </div>

      {showUpload && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #6D28D9', overflow: 'hidden' }}>
          <div style={{ background: '#6D28D9', padding: '1rem 1.5rem' }}><h3 style={{ color: '#fff', fontSize: '14px', fontWeight: '700', margin: 0 }}>Upload document on behalf of teacher (auto-approved)</h3></div>
          <form onSubmit={handleUpload} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><label style={formLbl}>Teacher *</label>
              <select style={{ ...formInp, cursor: 'pointer' }} value={uploadTeacherId} onChange={e => setUploadTeacherId(e.target.value)} required>
                <option value="">Select teacher...</option>
                {(teachers || []).map(t => <option key={t.id} value={t.id}>{t.profiles?.full_name} — {t.profiles?.city}</option>)}
              </select>
            </div>
            <div><label style={formLbl}>Document type</label>
              <select style={{ ...formInp, cursor: 'pointer' }} value={uploadDocType} onChange={e => setUploadDocType(e.target.value)}>
                {["National ID","Passport","Police Clearance","Background Check","Driver's License","Voter ID","Other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={formLbl}>File (PDF, JPG, PNG) *</label>
              <div style={{ border: '2px dashed #CBD5E1', borderRadius: '8px', padding: '12px', background: '#F8FAFC', textAlign: 'center' }}>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setUploadFile(e.target.files[0])} required style={{ fontSize: '13px', cursor: 'pointer', color: '#374151' }} />
                {uploadFile && <p style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: '600', marginBottom: 0 }}>📎 {uploadFile.name}</p>}
              </div>
            </div>
            <button type="submit" disabled={uploading || !uploadFile || !uploadTeacherId} style={{ padding: '10px', background: uploading ? '#E2E8F0' : '#6D28D9', color: uploading ? '#64748B' : '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
              {uploading ? '⏳ Uploading...' : '⬆ Upload & approve'}
            </button>
          </form>
        </div>
      )}

      <FilterBar filters={[
        { key: 'search', label: 'Search', type: 'text', value: f.search, placeholder: 'Type or teacher...', width: '160px' },
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All statuses' },{ value: 'pending', label: 'Pending' },{ value: 'approved', label: 'Approved' },{ value: 'declined', label: 'Declined' }] },
        { key: 'type', label: 'Type', type: 'select', value: f.type, options: [{ value: 'all', label: 'All types' }, ...docTypes.map(t => ({ value: t, label: t }))] },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ status: 'all', type: 'all', dateFrom: '', dateTo: '', search: '' })} />

      <div style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} document{filtered.length !== 1 ? 's' : ''} — click to open and review</div>

      {filtered.length === 0 ? <Empty text="No documents match filters." /> : filtered.map(doc => {
        const isExpanded = expandedId === doc.id
        return (
          <div key={doc.id} style={{ background: '#fff', borderRadius: '12px', border: `1px solid ${isExpanded ? '#6D28D9' : '#E2E8F0'}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : doc.id)}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#111' }}>{doc.document_type}</div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>👩‍🏫 {doc.profiles?.full_name} · {new Date(doc.uploaded_at).toLocaleDateString()}</div>
              </div>
              <StatusBadge status={doc.status} />
              <span style={{ fontSize: '13px', color: '#6D28D9', fontWeight: '700' }}>{isExpanded ? '▲ Close' : '▼ Open to review'}</span>
            </div>
            {isExpanded && (
              <div style={{ borderTop: '1px solid #E2E8F0', padding: '1.25rem 1.5rem', background: '#F8FAFC' }}>
                <div style={{ marginBottom: '1rem' }}><DocViewBtn fileUrl={doc.file_url} name={doc.document_type} label="📄 View document" /></div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {doc.status !== 'approved' && <button onClick={() => { onUpdate(doc.id, 'approved'); setExpandedId(null) }} style={btnGreen}>✓ Approve</button>}
                  {doc.status !== 'declined' && <button onClick={() => { onUpdate(doc.id, 'declined'); setExpandedId(null) }} style={btnRed}>✗ Decline</button>}
                  {doc.status !== 'pending' && <button onClick={() => { onUpdate(doc.id, 'pending'); setExpandedId(null) }} style={btnYellow}>Reset to pending</button>}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TeachersTab({ teachers, allReviews, allBookings, onVerify, onSuspend, onDelete, onUpdateProfile }) {
  const [f, setF] = useState({ search: '', verified: 'all', status: 'all', country: '', city: '' })
  const [selected, setSelected] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const countries = [...new Set(teachers.map(t => t.profiles?.country).filter(Boolean))]
  const cities = [...new Set(teachers.map(t => t.profiles?.city).filter(Boolean))]
  const filtered = teachers.filter(t => {
    if (f.search && !t.profiles?.full_name?.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.verified !== 'all') { if (f.verified === 'verified' && !t.is_verified) return false; if (f.verified === 'unverified' && t.is_verified) return false }
    if (f.status !== 'all') { if (f.status === 'suspended' && t.profiles?.status !== 'suspended') return false; if (f.status === 'active' && t.profiles?.status === 'suspended') return false }
    if (f.country && t.profiles?.country !== f.country) return false
    if (f.city && t.profiles?.city !== f.city) return false
    return true
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {pendingAction && <ReasonModal title={pendingAction.title} description={pendingAction.description} confirmLabel={pendingAction.confirmLabel} confirmStyle={pendingAction.style} onConfirm={(reason) => { pendingAction.onConfirm(reason); setPendingAction(null) }} onCancel={() => setPendingAction(null)} />}
      <DetailDrawer open={!!selected} onClose={() => setSelected(null)} title="Teacher Profile" subtitle={selected?.profiles?.full_name}>
        {selected && <TeacherDetail teacher={selected} allReviews={allReviews} allBookings={allBookings} onVerify={onVerify} onSuspend={onSuspend} onUpdateProfile={onUpdateProfile} />}
      </DetailDrawer>
      <FilterBar filters={[
        { key: 'search', label: 'Search', type: 'text', value: f.search, placeholder: 'Teacher name...', width: '160px' },
        { key: 'verified', label: 'Verification', type: 'select', value: f.verified, options: [{ value: 'all', label: 'All' },{ value: 'verified', label: 'Verified' },{ value: 'unverified', label: 'Unverified' }] },
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All' },{ value: 'active', label: 'Active' },{ value: 'suspended', label: 'Suspended' }] },
        { key: 'country', label: 'Country', type: 'select', value: f.country, options: [{ value: '', label: 'All countries' }, ...countries.map(c => ({ value: c, label: c }))] },
        { key: 'city', label: 'City', type: 'select', value: f.city, options: [{ value: '', label: 'All cities' }, ...cities.map(c => ({ value: c, label: c }))] },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ search: '', verified: 'all', status: 'all', country: '', city: '' })} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} teacher{filtered.length !== 1 ? 's' : ''}</div>
        <button onClick={() => exportCSV(filtered.map(t => ({ name: t.profiles?.full_name, city: t.profiles?.city, country: t.profiles?.country, subjects: t.subjects?.join(', '), verified: t.is_verified, status: t.profiles?.status, rating: t.avgRating, reviews: t.reviewCount, bookings: t.bookingCount, quality_score: t.qualityScore })), 'teachers.csv')} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.length === 0 ? <Empty text="No teachers match filters." /> : filtered.map(teacher => (
        <div key={teacher.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <AdminAvatar name={teacher.profiles?.full_name} url={teacher.profiles?.avatar_url} />
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px', color: '#111' }}>{teacher.profiles?.full_name}</div>
            <div style={{ fontSize: '13px', color: '#64748B' }}>📍 {teacher.profiles?.city}, {teacher.profiles?.country} · ⭐ {teacher.avgRating} ({teacher.reviewCount})</div>
          </div>
          {teacher.profiles?.status === 'suspended' && <StatusBadge status="suspended" />}
          <StatusBadge status={teacher.is_verified ? 'verified' : 'unverified'} />
          <button onClick={() => setSelected(teacher)} style={{ padding: '7px 16px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>View →</button>
          {teacher.is_verified ? <button onClick={() => onVerify(teacher.id, false)} style={btnRed}>Unverify</button> : <button onClick={() => onVerify(teacher.id, true)} style={btnGreen}>Verify</button>}
          {teacher.profiles?.status === 'suspended'
            ? <button onClick={() => onSuspend(teacher.id, false)} style={btnGreen}>Unblock</button>
            : <button onClick={() => setPendingAction({ title: 'Suspend Teacher', description: `Suspend ${teacher.profiles?.full_name}? Their profile will be hidden.`, confirmLabel: '⏸ Suspend', style: btnYellow, onConfirm: (reason) => onSuspend(teacher.id, true, reason) })} style={btnYellow}>⏸ Suspend</button>
          }
          <button onClick={() => setPendingAction({ title: 'Delete Teacher', description: `Permanently delete ${teacher.profiles?.full_name}? Cannot be undone.`, confirmLabel: '🗑 Delete', style: btnRed, onConfirm: (reason) => onDelete(teacher.id, reason) })} style={btnGhost}>Delete</button>
        </div>
      ))}
    </div>
  )
}

function LearnersTab({ users, allBookings, onSuspend, onDelete, onUpdateProfile }) {
  return <UserRoleTab users={users} allBookings={allBookings} onSuspend={onSuspend} onDelete={onDelete} onUpdateProfile={onUpdateProfile} roleLabel="Learner" roleIcon="📚" exportName="learners.csv" />
}

function ParentsTab({ users, allBookings, onSuspend, onDelete, onUpdateProfile }) {
  return <UserRoleTab users={users} allBookings={allBookings} onSuspend={onSuspend} onDelete={onDelete} onUpdateProfile={onUpdateProfile} roleLabel="Parent" roleIcon="👨‍👩‍👧" exportName="parents.csv" />
}

function UserRoleTab({ users, allBookings, onSuspend, onDelete, onUpdateProfile, roleLabel, roleIcon, exportName }) {
  const [search, setSearch] = useState('')
  const [f, setF] = useState({ status: 'all', country: '', city: '', dateFrom: '', dateTo: '' })
  const [selected, setSelected] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const countries = [...new Set(users.map(u => u.country).filter(Boolean))]
  const cities = [...new Set(users.map(u => u.city).filter(Boolean))]
  const filtered = users.filter(u => {
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false
    if (f.status !== 'all') { if (f.status === 'suspended' && u.status !== 'suspended') return false; if (f.status === 'active' && u.status === 'suspended') return false }
    if (f.country && u.country !== f.country) return false
    if (f.city && u.city !== f.city) return false
    if (f.dateFrom && new Date(u.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(u.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {pendingAction && <ReasonModal title={pendingAction.title} description={pendingAction.description} confirmLabel={pendingAction.confirmLabel} confirmStyle={pendingAction.style} onConfirm={(reason) => { pendingAction.onConfirm(reason); setPendingAction(null) }} onCancel={() => setPendingAction(null)} />}
      <DetailDrawer open={!!selected} onClose={() => setSelected(null)} title={`${roleLabel} Profile`} subtitle={selected?.full_name}>
        {selected && <UserDetail user={selected} allBookings={allBookings} onSuspend={onSuspend} onDelete={onDelete} onUpdateProfile={onUpdateProfile} />}
      </DetailDrawer>
      <input style={searchInp} placeholder={`Search ${roleLabel.toLowerCase()}s by name or email...`} value={search} onChange={e => setSearch(e.target.value)} />
      <FilterBar filters={[
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All' },{ value: 'active', label: 'Active' },{ value: 'suspended', label: 'Suspended' }] },
        { key: 'country', label: 'Country', type: 'select', value: f.country, options: [{ value: '', label: 'All countries' }, ...countries.map(c => ({ value: c, label: c }))] },
        { key: 'city', label: 'City', type: 'select', value: f.city, options: [{ value: '', label: 'All cities' }, ...cities.map(c => ({ value: c, label: c }))] },
        { key: 'dateFrom', label: 'Joined from', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'Joined to', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ status: 'all', country: '', city: '', dateFrom: '', dateTo: '' })} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{roleIcon} {filtered.length} {roleLabel.toLowerCase()}{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map(u => ({ name: u.full_name, email: u.email, city: u.city, country: u.country, status: u.status, joined: u.created_at })), exportName)} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.length === 0 ? <Empty text={`No ${roleLabel.toLowerCase()}s found.`} /> : filtered.map(u => (
        <div key={u.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <AdminAvatar name={u.full_name} url={u.avatar_url} />
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '2px' }}>{u.full_name}</div>
            <div style={{ fontSize: '13px', color: '#64748B' }}>{u.email} · 📍 {u.city}, {u.country}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Joined {new Date(u.created_at).toLocaleDateString()}</div>
          </div>
          {u.status === 'suspended' && <StatusBadge status="suspended" />}
          <button onClick={() => setSelected(u)} style={{ padding: '7px 16px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>View →</button>
          {u.status === 'suspended'
            ? <button onClick={() => onSuspend(u.id, false)} style={btnGreen}>Unblock</button>
            : <button onClick={() => setPendingAction({ title: `Suspend ${roleLabel}`, description: `This will prevent ${u.full_name} from accessing Stuumo.`, confirmLabel: '⏸ Suspend', style: btnYellow, onConfirm: (reason) => onSuspend(u.id, true, reason) })} style={btnYellow}>⏸ Suspend</button>
          }
          <button onClick={() => setPendingAction({ title: `Delete ${roleLabel}`, description: 'Permanent — cannot be undone.', confirmLabel: '🗑 Delete', style: btnRed, onConfirm: (reason) => onDelete(u.id, reason) })} style={btnGhost}>Delete</button>
        </div>
      ))}
    </div>
  )
}

function UsersTab({ users, allBookings, onSuspend, onDelete, onRefresh, setMessage, log, onUpdateProfile }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [viewUser, setViewUser] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [f, setF] = useState({ role: 'all', status: 'all', country: '', city: '', dateFrom: '', dateTo: '' })
  const countries = [...new Set(users.map(u => u.country).filter(Boolean))]
  const cities = [...new Set(users.map(u => u.city).filter(Boolean))]
  const filtered = users.filter(u => {
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false
    if (f.role !== 'all' && u.role !== f.role) return false
    if (f.status !== 'all') { if (f.status === 'suspended' && u.status !== 'suspended') return false; if (f.status === 'active' && u.status === 'suspended') return false }
    if (f.country && u.country !== f.country) return false
    if (f.city && u.city !== f.city) return false
    if (f.dateFrom && new Date(u.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(u.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })
  const allSelected = filtered.length > 0 && filtered.every(u => selected.has(u.id))
  const toggle = (id) => { const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next) }
  const bulkSuspend = async () => {
    if (!selected.size || !window.confirm(`Suspend ${selected.size} user(s)?`)) return
    setBulkLoading(true); const ids = [...selected]
    await supabase.from('profiles').update({ status: 'suspended' }).in('id', ids)
    await log('Bulk suspend', 'user', ids.join(',')); setMessage(`✅ ${ids.length} user(s) suspended.`); setSelected(new Set()); onRefresh(); setBulkLoading(false)
  }
  const bulkUnblock = async () => {
    if (!selected.size || !window.confirm(`Unblock ${selected.size} user(s)?`)) return
    setBulkLoading(true); const ids = [...selected]
    await supabase.from('profiles').update({ status: 'active' }).in('id', ids)
    await log('Bulk unblock', 'user', ids.join(',')); setMessage(`✅ ${ids.length} user(s) unblocked.`); setSelected(new Set()); onRefresh(); setBulkLoading(false)
  }
  const bulkDelete = async () => {
    if (!selected.size || !window.confirm(`Permanently delete ${selected.size} user(s)?`)) return
    setBulkLoading(true); const ids = [...selected]
    await supabase.from('profiles').delete().in('id', ids)
    await log('Bulk delete', 'user', ids.join(',')); setMessage(`✅ ${ids.length} user(s) deleted.`); setSelected(new Set()); onRefresh(); setBulkLoading(false)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {pendingAction && <ReasonModal title={pendingAction.title} description={pendingAction.description} confirmLabel={pendingAction.confirmLabel} confirmStyle={pendingAction.style} onConfirm={(reason) => { pendingAction.onConfirm(reason); setPendingAction(null) }} onCancel={() => setPendingAction(null)} />}
      <DetailDrawer open={!!viewUser} onClose={() => setViewUser(null)} title="User Profile" subtitle={viewUser?.full_name}>
        {viewUser && <UserDetail user={viewUser} allBookings={allBookings} onSuspend={onSuspend} onDelete={onDelete} onUpdateProfile={onUpdateProfile} />}
      </DetailDrawer>
      <input style={searchInp} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      <FilterBar filters={[
        { key: 'role', label: 'Role', type: 'select', value: f.role, options: [{ value: 'all', label: 'All roles' },{ value: 'teacher', label: 'Teacher' },{ value: 'learner', label: 'Learner' },{ value: 'parent', label: 'Parent' }] },
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All' },{ value: 'active', label: 'Active' },{ value: 'suspended', label: 'Suspended' }] },
        { key: 'country', label: 'Country', type: 'select', value: f.country, options: [{ value: '', label: 'All countries' }, ...countries.map(c => ({ value: c, label: c }))] },
        { key: 'city', label: 'City', type: 'select', value: f.city, options: [{ value: '', label: 'All cities' }, ...cities.map(c => ({ value: c, label: c }))] },
        { key: 'dateFrom', label: 'Joined from', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'Joined to', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ role: 'all', status: 'all', country: '', city: '', dateFrom: '', dateTo: '' })} />
      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <input type="checkbox" checked={allSelected} onChange={() => allSelected ? setSelected(new Set()) : setSelected(new Set(filtered.map(u => u.id)))} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
        <span style={{ fontSize: '14px', color: '#475569' }}>{selected.size > 0 ? `${selected.size} selected` : 'Select to bulk action'}</span>
        {selected.size > 0 && <>
          <button onClick={bulkSuspend} disabled={bulkLoading} style={btnYellow}>⏸ Suspend</button>
          <button onClick={bulkUnblock} disabled={bulkLoading} style={btnGreen}>✓ Unblock</button>
          <button onClick={bulkDelete} disabled={bulkLoading} style={btnRed}>🗑 Delete</button>
          <button onClick={() => setSelected(new Set())} style={btnGhost}>Clear</button>
        </>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
          <button onClick={() => exportCSV(filtered.map(u => ({ name: u.full_name, email: u.email, role: u.role, city: u.city, country: u.country, status: u.status, joined: u.created_at })), 'users.csv')} style={btnExport}>⬇ CSV</button>
        </div>
      </div>
      {filtered.map(u => (
        <div key={u.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: `1px solid ${selected.has(u.id) ? '#C4B5FD' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggle(u.id)} style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }} />
          <AdminAvatar name={u.full_name} url={u.avatar_url} />
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '2px' }}>{u.full_name}</div>
            <div style={{ fontSize: '13px', color: '#64748B' }}>{u.email} · 📍 {u.city}, {u.country}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>Joined {new Date(u.created_at).toLocaleDateString()}</div>
          </div>
          <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', textTransform: 'capitalize', background: u.role === 'teacher' ? '#EDE9FE' : u.role === 'learner' ? '#DCFCE7' : '#F3E8FF', color: u.role === 'teacher' ? '#5B21B6' : u.role === 'learner' ? '#166534' : '#6B21A8' }}>{u.role}</span>
          {u.status === 'suspended' && <StatusBadge status="suspended" />}
          <button onClick={() => setViewUser(u)} style={{ padding: '7px 16px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>View →</button>
          {u.status === 'suspended'
            ? <button onClick={() => onSuspend(u.id, false)} style={btnGreen}>Unblock</button>
            : <button onClick={() => setPendingAction({ title: 'Suspend User', description: 'This will prevent the user from accessing Stuumo.', confirmLabel: '⏸ Suspend', style: btnYellow, onConfirm: (reason) => onSuspend(u.id, true, reason) })} style={btnYellow}>⏸ Suspend</button>
          }
          <button onClick={() => setPendingAction({ title: 'Delete User', description: 'Permanent — cannot be undone.', confirmLabel: '🗑 Delete', style: btnRed, onConfirm: (reason) => onDelete(u.id, reason) })} style={btnGhost}>Delete</button>
        </div>
      ))}
      {filtered.length === 0 && <Empty text="No users found." />}
    </div>
  )
}

function ReviewsTab({ reviews, onToggle }) {
  const [f, setF] = useState({ rating: 'all', dateFrom: '', dateTo: '', search: '', showDeleted: 'all' })
  const filtered = reviews.filter(r => {
    if (f.showDeleted === 'active' && r.deleted_at) return false
    if (f.showDeleted === 'hidden' && !r.deleted_at) return false
    if (f.rating !== 'all' && r.rating !== parseInt(f.rating)) return false
    if (f.dateFrom && new Date(r.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(r.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    if (f.search && !r.reviewer?.full_name?.toLowerCase().includes(f.search.toLowerCase()) && !r.comment?.toLowerCase().includes(f.search.toLowerCase())) return false
    return true
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <FilterBar filters={[
        { key: 'search', label: 'Search', type: 'text', value: f.search, placeholder: 'Reviewer or comment...', width: '180px' },
        { key: 'rating', label: 'Rating', type: 'select', value: f.rating, options: [{ value: 'all', label: 'All ratings' },{ value: '5', label: '⭐⭐⭐⭐⭐' },{ value: '4', label: '⭐⭐⭐⭐' },{ value: '3', label: '⭐⭐⭐' },{ value: '2', label: '⭐⭐' },{ value: '1', label: '⭐' }] },
        { key: 'showDeleted', label: 'Visibility', type: 'select', value: f.showDeleted, options: [{ value: 'all', label: 'All' },{ value: 'active', label: 'Visible' },{ value: 'hidden', label: 'Hidden' }] },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ rating: 'all', dateFrom: '', dateTo: '', search: '', showDeleted: 'all' })} />
      <div style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} review{filtered.length !== 1 ? 's' : ''}</div>
      {filtered.length === 0 ? <Empty text="No reviews match filters." /> : filtered.map(r => (
        <div key={r.id} style={{ background: r.deleted_at ? '#FFF5F5' : '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', border: `1px solid ${r.deleted_at ? '#FECACA' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', opacity: r.deleted_at ? 0.8 : 1 }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#111' }}>{r.reviewer?.full_name}</span>
              <span style={{ color: '#F59E0B' }}>{'⭐'.repeat(r.rating)}</span>
              {r.deleted_at && <span style={{ fontSize: '11px', background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' }}>Hidden</span>}
            </div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>→ {r.teacher?.profiles?.full_name} · {new Date(r.created_at).toLocaleDateString()}</div>
            {r.comment && <div style={{ fontSize: '14px', color: '#374151' }}>{r.comment}</div>}
          </div>
          {r.deleted_at ? <button onClick={() => onToggle(r.id, false)} style={btnGreen}>Restore</button> : <button onClick={() => onToggle(r.id, true)} style={btnRed}>Hide</button>}
        </div>
      ))}
    </div>
  )
}

function BookingsTab({ bookings, onMarkPayout, onUpdateStatus }) {
  const [search, setSearch] = useState('')
  const [f, setF] = useState({ status: 'all', paymentStatus: 'all', payoutStatus: 'all', dateFrom: '', dateTo: '', subject: '' })
  const subjects = [...new Set(bookings.map(b => b.subject).filter(Boolean))]
  const filtered = bookings.filter(b => {
    if (search && !b.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) && !b.teachers?.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) && !b.subject?.toLowerCase().includes(search.toLowerCase())) return false
    if (f.status !== 'all' && b.status !== f.status) return false
    if (f.paymentStatus !== 'all' && b.payment_status !== f.paymentStatus) return false
    if (f.payoutStatus !== 'all' && b.payout_status !== f.payoutStatus) return false
    if (f.subject && b.subject !== f.subject) return false
    if (f.dateFrom && new Date(b.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(b.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input style={searchInp} placeholder="Search by client, teacher or subject..." value={search} onChange={e => setSearch(e.target.value)} />
      <FilterBar filters={[
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All' },{ value: 'pending', label: 'Pending' },{ value: 'confirmed', label: 'Confirmed' },{ value: 'declined', label: 'Declined' },{ value: 'cancelled', label: 'Cancelled' }] },
        { key: 'paymentStatus', label: 'Payment', type: 'select', value: f.paymentStatus, options: [{ value: 'all', label: 'All' },{ value: 'paid', label: 'Paid' },{ value: 'unpaid', label: 'Unpaid' }] },
        { key: 'payoutStatus', label: 'Payout', type: 'select', value: f.payoutStatus, options: [{ value: 'all', label: 'All' },{ value: 'pending', label: 'Pending' },{ value: 'paid', label: 'Paid out' }] },
        { key: 'subject', label: 'Subject', type: 'select', value: f.subject, options: [{ value: '', label: 'All subjects' }, ...subjects.map(s => ({ value: s, label: s }))] },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ status: 'all', paymentStatus: 'all', payoutStatus: 'all', dateFrom: '', dateTo: '', subject: '' })} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map(b => ({ client: b.profiles?.full_name, teacher: b.teachers?.profiles?.full_name, subject: b.subject, status: b.status, scheduled: b.session_date ? `${b.session_date}${b.start_time ? ' ' + b.start_time.slice(0, 5) : ''}` : '', amount: b.amount, commission: b.commission_amount, payout: b.teacher_payout, payment: b.payment_status, payout_status: b.payout_status, date: b.created_at })), 'bookings.csv')} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.map(b => (
        <div key={b.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: `1px solid ${b.status === 'pending' ? '#C4B5FD' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{b.profiles?.full_name} → {b.teachers?.profiles?.full_name}</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '2px' }}>📚 {b.subject}</div>
            {b.session_date && <div style={{ fontSize: '12px', color: '#6D28D9', fontWeight: '700', marginBottom: '2px' }}>🗓️ {new Date(b.session_date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}{b.start_time ? ` · ${b.start_time.slice(0, 5)}` : ''}</div>}
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>{b.session_date ? 'Requested ' : ''}{new Date(b.created_at).toLocaleDateString()}</div>
          </div>
          {b.amount > 0 && <div style={{ textAlign: 'right' }}><div style={{ fontSize: '15px', fontWeight: '700', color: '#6D28D9' }}>GH₵ {b.amount}</div>{b.teacher_payout > 0 && <div style={{ fontSize: '11px', color: '#64748B' }}>Payout: GH₵ {(b.teacher_payout||0).toFixed(2)}</div>}</div>}
          <StatusBadge status={b.status} />
          {b.status === 'pending' && <>
            <button onClick={() => onUpdateStatus(b.id, 'confirmed')} style={btnGreen}>✓ Accept</button>
            <button onClick={() => onUpdateStatus(b.id, 'declined')} style={btnRed}>✗ Decline</button>
          </>}
          {b.status !== 'cancelled' && b.payment_status === 'paid' && b.payout_status === 'pending' && <button onClick={() => onMarkPayout(b.id)} style={btnGreen}>Mark paid out</button>}
          {b.refund_status === 'pending' && <span style={{ fontSize: '12px', fontWeight: '700', color: '#991B1B', background: '#FEE2E2', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: '20px' }}>⚠ Refund owed</span>}
          {b.refund_status === 'refunded' && <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534', background: '#DCFCE7', border: '1px solid #BBF7D0', padding: '4px 10px', borderRadius: '20px' }}>✓ Refunded</span>}
        </div>
      ))}
      {filtered.length === 0 && <Empty text="No bookings found." />}
    </div>
  )
}

function SessionsTab({ sessions, enrollCounts, onToggle, onUpdate, onCreate, teachers }) {
  const [f, setF] = useState({ search: '', timing: 'all', subject: '', dateFrom: '', dateTo: '', showDeleted: 'all' })
  const [selectedSession, setSelectedSession] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ teacher_id: '', title: '', subject: '', session_date: '', start_time: '', end_time: '', max_spots: 20, price: 0 })
  const today = new Date().toISOString().split('T')[0]
  const subjects = [...new Set(sessions.map(s => s.subject).filter(Boolean))]
  const filtered = sessions.filter(s => {
    if (f.showDeleted === 'active' && s.deleted_at) return false
    if (f.showDeleted === 'hidden' && !s.deleted_at) return false
    if (f.search && !s.title?.toLowerCase().includes(f.search.toLowerCase()) && !s.teachers?.profiles?.full_name?.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.timing === 'upcoming' && s.session_date < today) return false
    if (f.timing === 'completed' && s.session_date >= today) return false
    if (f.subject && s.subject !== f.subject) return false
    if (f.dateFrom && s.session_date < f.dateFrom) return false
    if (f.dateTo && s.session_date > f.dateTo) return false
    return true
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.teacher_id) return
    setCreating(true)
    await onCreate(createForm)
    setCreating(false); setShowCreate(false)
    setCreateForm({ teacher_id: '', title: '', subject: '', session_date: '', start_time: '', end_time: '', max_spots: 20, price: 0 })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <DetailDrawer open={!!selectedSession} onClose={() => setSelectedSession(null)} title="Session Details" subtitle={selectedSession?.title}>
        {selectedSession && <SessionDetail session={selectedSession} enrollmentCount={enrollCounts[selectedSession.id] || 0} onUpdate={onUpdate} />}
      </DetailDrawer>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>Live Sessions</h3>
        <button onClick={() => setShowCreate(s => !s)} style={{ padding: '9px 18px', background: showCreate ? '#F1F5F9' : '#6D28D9', color: showCreate ? '#64748B' : '#fff', border: showCreate ? '1px solid #E2E8F0' : 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
          {showCreate ? '✕ Cancel' : '+ Create session for teacher'}
        </button>
      </div>

      {showCreate && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #6D28D9', overflow: 'hidden' }}>
          <div style={{ background: '#6D28D9', padding: '1rem 1.5rem' }}><h3 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', margin: 0 }}>Create live session (visible on main app immediately)</h3></div>
          <form onSubmit={handleCreate} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label style={formLbl}>Teacher (verified only) *</label>
              <select style={{ ...formInp, cursor: 'pointer' }} value={createForm.teacher_id} onChange={e => setCreateForm(f => ({ ...f, teacher_id: e.target.value }))} required>
                <option value="">Select a teacher...</option>
                {teachers.filter(t => t.is_verified).map(t => <option key={t.id} value={t.id}>{t.profiles?.full_name} — {t.profiles?.city}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={formLbl}>Title *</label><input style={formInp} placeholder="e.g. Advanced Maths — WASSCE Prep" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div><label style={formLbl}>Subject</label><input style={formInp} placeholder="e.g. Mathematics" value={createForm.subject} onChange={e => setCreateForm(f => ({ ...f, subject: e.target.value }))} /></div>
            </div>
            <div><label style={formLbl}>Date *</label><input type="date" style={formInp} value={createForm.session_date} onChange={e => setCreateForm(f => ({ ...f, session_date: e.target.value }))} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={formLbl}>Start time *</label><input type="time" style={formInp} value={createForm.start_time} onChange={e => setCreateForm(f => ({ ...f, start_time: e.target.value }))} required /></div>
              <div><label style={formLbl}>End time *</label><input type="time" style={formInp} value={createForm.end_time} onChange={e => setCreateForm(f => ({ ...f, end_time: e.target.value }))} required /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={formLbl}>Max spots</label><input type="number" min="1" max="500" style={formInp} value={createForm.max_spots} onChange={e => setCreateForm(f => ({ ...f, max_spots: e.target.value }))} /></div>
              <div><label style={formLbl}>Price (GH₵) — 0 for free</label><input type="number" min="0" step="0.01" style={formInp} value={createForm.price} onChange={e => setCreateForm(f => ({ ...f, price: e.target.value }))} /></div>
            </div>
            <button type="submit" disabled={creating || !createForm.teacher_id || !createForm.title || !createForm.session_date} style={{ padding: '12px', background: creating ? '#E2E8F0' : '#6D28D9', color: creating ? '#64748B' : '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
              {creating ? 'Creating...' : '🎥 Create session — will appear on main app'}
            </button>
          </form>
        </div>
      )}

      <FilterBar filters={[
        { key: 'search', label: 'Search', type: 'text', value: f.search, placeholder: 'Title or teacher...', width: '160px' },
        { key: 'timing', label: 'Timing', type: 'select', value: f.timing, options: [{ value: 'all', label: 'All' },{ value: 'upcoming', label: 'Upcoming' },{ value: 'completed', label: 'Completed' }] },
        { key: 'subject', label: 'Subject', type: 'select', value: f.subject, options: [{ value: '', label: 'All subjects' }, ...subjects.map(s => ({ value: s, label: s }))] },
        { key: 'showDeleted', label: 'Visibility', type: 'select', value: f.showDeleted, options: [{ value: 'all', label: 'All' },{ value: 'active', label: 'Visible' },{ value: 'hidden', label: 'Hidden' }] },
        { key: 'dateFrom', label: 'Date from', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'Date to', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ search: '', timing: 'all', subject: '', dateFrom: '', dateTo: '', showDeleted: 'all' })} />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} session{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map(s => ({ title: s.title, teacher: s.teachers?.profiles?.full_name, subject: s.subject, date: s.session_date, time: `${s.start_time}–${s.end_time}`, price: s.price, max_spots: s.max_spots, enrolled: enrollCounts[s.id] || 0 })), 'sessions.csv')} style={btnExport}>⬇ CSV</button>
      </div>

      {filtered.length === 0 ? <Empty text="No sessions found." /> : filtered.map(s => {
        const enrolled = enrollCounts[s.id] || 0
        const spotsLeft = s.max_spots - enrolled
        return (
          <div key={s.id} style={{ background: s.deleted_at ? '#FFF5F5' : '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: `1px solid ${s.deleted_at ? '#FECACA' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', opacity: s.deleted_at ? 0.85 : 1 }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>{s.title}</span>
                {s.deleted_at && <StatusBadge status="hidden" />}
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '2px' }}>👩‍🏫 {s.teachers?.profiles?.full_name} · 📚 {s.subject}</div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>📅 {s.session_date} · 🕐 {s.start_time}–{s.end_time} · 👥 {enrolled}/{s.max_spots} · {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}</div>
            </div>
            {s.price > 0 && <span style={{ fontSize: '14px', fontWeight: '700', color: '#6D28D9' }}>GH₵ {s.price}</span>}
            <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600', background: s.session_date >= today ? '#DCFCE7' : '#F1F5F9', color: s.session_date >= today ? '#166534' : '#64748B' }}>{s.session_date >= today ? 'Upcoming' : 'Completed'}</span>
            <button onClick={() => setSelectedSession(s)} style={{ padding: '7px 14px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>View / Edit →</button>
            {s.deleted_at ? <button onClick={() => onToggle(s.id, false)} style={btnGreen}>Restore</button> : <button onClick={() => onToggle(s.id, true)} style={btnRed}>Hide</button>}
          </div>
        )
      })}
    </div>
  )
}

function PaymentsTab({ payments }) {
  const [search, setSearch] = useState('')
  const [f, setF] = useState({ status: 'all', amountMin: '', amountMax: '', dateFrom: '', dateTo: '' })
  const total = payments.filter(p => p.status === 'success').reduce((s, p) => s + (p.amount || 0), 0)
  const totalCommission = payments.filter(p => p.status === 'success').reduce((s, p) => s + (p.commission_amount || 0), 0)
  const filtered = payments.filter(p => {
    if (search && !p.reference?.toLowerCase().includes(search.toLowerCase())) return false
    if (f.status !== 'all' && p.status !== f.status) return false
    if (f.amountMin && (p.amount || 0) < parseFloat(f.amountMin)) return false
    if (f.amountMax && (p.amount || 0) > parseFloat(f.amountMax)) return false
    if (f.dateFrom && new Date(p.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(p.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <StatCard icon="💰" label="Total GMV" value={`GH₵ ${total.toFixed(2)}`} color="#166534" />
        <StatCard icon="📊" label="Platform commission" value={`GH₵ ${totalCommission.toFixed(2)}`} color="#6D28D9" />
        <StatCard icon="✅" label="Successful" value={payments.filter(p => p.status === 'success').length} color="#166534" />
      </div>
      <input style={searchInp} placeholder="Search by reference..." value={search} onChange={e => setSearch(e.target.value)} />
      <FilterBar filters={[
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All' },{ value: 'success', label: 'Success' },{ value: 'failed', label: 'Failed' },{ value: 'pending', label: 'Pending' }] },
        { key: 'amountMin', label: 'Min (GH₵)', type: 'number', value: f.amountMin, placeholder: '0', width: '90px' },
        { key: 'amountMax', label: 'Max (GH₵)', type: 'number', value: f.amountMax, placeholder: '9999', width: '90px' },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ status: 'all', amountMin: '', amountMax: '', dateFrom: '', dateTo: '' })} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map(p => ({ reference: p.reference, amount: p.amount, commission: p.commission_amount, teacher_payout: p.teacher_payout, status: p.status, date: p.created_at })), 'payments.csv')} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.map(p => (
        <div key={p.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '4px', fontFamily: 'monospace' }}>{p.reference}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(p.created_at).toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: '700', color: '#6D28D9' }}>GH₵ {p.amount}</div>
            {p.commission_amount > 0 && <div style={{ fontSize: '11px', color: '#166534' }}>Commission: GH₵ {(p.commission_amount||0).toFixed(2)}</div>}
            {p.teacher_payout > 0 && <div style={{ fontSize: '11px', color: '#64748B' }}>Payout: GH₵ {(p.teacher_payout||0).toFixed(2)}</div>}
          </div>
          <StatusBadge status={p.status} />
        </div>
      ))}
      {filtered.length === 0 && <Empty text="No payments found." />}
    </div>
  )
}

function RefundsTab({ bookings, onMarkRefunded }) {
  const [f, setF] = useState('pending')
  const [confirmTarget, setConfirmTarget] = useState(null)
  const refundable = bookings.filter(b => b.refund_status === 'pending' || b.refund_status === 'refunded')
  const filtered = f === 'all' ? refundable : refundable.filter(b => b.refund_status === f)
  const pendingTotal = refundable.filter(b => b.refund_status === 'pending').reduce((s, b) => s + (b.amount || 0), 0)
  const refundedTotal = refundable.filter(b => b.refund_status === 'refunded').reduce((s, b) => s + (b.amount || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>Refunds</h3>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Learners who paid for a session that was later cancelled. Process the refund in Paystack, then mark it here.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <StatCard icon="⚠️" label="Refunds owed" value={`GH₵ ${pendingTotal.toFixed(2)}`} color="#991B1B" />
        <StatCard icon="✅" label="Refunds processed" value={`GH₵ ${refundedTotal.toFixed(2)}`} color="#166534" />
      </div>

      <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
        {[['pending', 'Owed'], ['refunded', 'Processed'], ['all', 'All']].map(([key, label]) => (
          <button key={key} onClick={() => setF(key)} style={{ padding: '7px 18px', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: f === key ? '#6D28D9' : 'transparent', color: f === key ? '#fff' : '#64748B', fontWeight: f === key ? '700' : '400' }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty text={f === 'pending' ? '🎉 No refunds owed.' : 'No refunds found.'} />
      ) : filtered.map(b => (
        <div key={b.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: `1px solid ${b.refund_status === 'pending' ? '#FECACA' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{b.profiles?.full_name || 'Learner'} <span style={{ color: '#94A3B8', fontWeight: '400' }}>— {b.subject}</span></div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>Teacher: {b.teachers?.profiles?.full_name || '—'}{b.session_date ? ` · was ${new Date(b.session_date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : ''}</div>
          </div>
          <div style={{ textAlign: 'right' }}><div style={{ fontSize: '15px', fontWeight: '700', color: '#991B1B' }}>GH₵ {(b.amount || 0).toFixed(2)}</div></div>
          {b.refund_status === 'pending'
            ? <button onClick={() => setConfirmTarget(b)} style={btnGreen}>Mark refunded</button>
            : <StatusBadge status="refunded" />}
        </div>
      ))}

      {confirmTarget && (
        <div onClick={() => setConfirmTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111', margin: '0 0 10px' }}>Mark this refund as processed?</h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 1.5rem' }}>Confirm you've refunded <strong style={{ color: '#111' }}>GH₵ {(confirmTarget.amount || 0).toFixed(2)}</strong> to {confirmTarget.profiles?.full_name || 'the learner'} in Paystack. They'll be notified.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmTarget(null)} style={{ ...btnGhost, flex: 1 }}>Cancel</button>
              <button onClick={() => { onMarkRefunded(confirmTarget); setConfirmTarget(null) }} style={{ ...btnGreen, flex: 1 }}>Yes, mark refunded</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PayoutsTab({ bookings, onMarkPayout }) {
  const [f, setF] = useState({ status: 'pending', search: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '' })
  const paidBookings = bookings.filter(b => b.payment_status === 'paid' && b.amount > 0 && b.status !== 'cancelled')
  const filtered = paidBookings.filter(b => {
    if (f.status !== 'all' && b.payout_status !== f.status) return false
    if (f.search && !b.teachers?.profiles?.full_name?.toLowerCase().includes(f.search.toLowerCase()) && !b.subject?.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.dateFrom && new Date(b.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(b.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    if (f.amountMin && (b.teacher_payout || 0) < parseFloat(f.amountMin)) return false
    if (f.amountMax && (b.teacher_payout || 0) > parseFloat(f.amountMax)) return false
    return true
  })
  const totalPending = paidBookings.filter(b => b.payout_status === 'pending').reduce((s, b) => s + (b.teacher_payout || 0), 0)
  const totalPaid = paidBookings.filter(b => b.payout_status === 'paid').reduce((s, b) => s + (b.teacher_payout || 0), 0)
  const totalCommission = paidBookings.reduce((s, b) => s + (b.commission_amount || 0), 0)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <StatCard icon="📊" label="Total commission earned" value={`GH₵ ${totalCommission.toFixed(2)}`} color="#6D28D9" />
        <StatCard icon="⏳" label="Pending payouts" value={`GH₵ ${totalPending.toFixed(2)}`} color="#854D0E" />
        <StatCard icon="✅" label="Processed payouts" value={`GH₵ ${totalPaid.toFixed(2)}`} color="#166534" />
      </div>
      <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
        {[['pending','Pending'],['paid','Paid out'],['all','All']].map(([key,label]) => (
          <button key={key} onClick={() => setF(p => ({ ...p, status: key }))} style={{ padding: '7px 18px', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: f.status === key ? '#6D28D9' : 'transparent', color: f.status === key ? '#fff' : '#64748B', fontWeight: f.status === key ? '700' : '400' }}>{label}</button>
        ))}
      </div>
      <input style={searchInp} placeholder="Search by teacher or subject..." value={f.search} onChange={e => setF(p => ({ ...p, search: e.target.value }))} />
      <FilterBar filters={[
        { key: 'amountMin', label: 'Min payout (GH₵)', type: 'number', value: f.amountMin, placeholder: '0', width: '100px' },
        { key: 'amountMax', label: 'Max payout (GH₵)', type: 'number', value: f.amountMax, placeholder: '9999', width: '100px' },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(p => ({ ...p, [key]: val }))} onClear={() => setF(p => ({ ...p, search: '', amountMin: '', amountMax: '', dateFrom: '', dateTo: '' }))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} payout{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map(b => ({ teacher: b.teachers?.profiles?.full_name, subject: b.subject, client: b.profiles?.full_name, gross_amount: b.amount, commission: b.commission_amount, teacher_payout: b.teacher_payout, payout_status: b.payout_status, date: b.created_at })), 'payouts.csv')} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.length === 0 ? <Empty text={f.status === 'pending' ? '🎉 No pending payouts.' : 'No payouts found.'} /> : filtered.map(b => (
        <div key={b.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: `1px solid ${b.payout_status === 'pending' ? '#FDE68A' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{b.teachers?.profiles?.full_name}</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '2px' }}>📚 {b.subject} · Client: {b.profiles?.full_name}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(b.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '700', color: '#166534' }}>GH₵ {(b.teacher_payout||0).toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>of GH₵ {b.amount} · comm GH₵ {(b.commission_amount||0).toFixed(2)}</div>
          </div>
          <StatusBadge status={b.payout_status === 'paid' ? 'paid' : 'pending'} />
          {b.payout_status === 'pending' && <button onClick={() => onMarkPayout(b.id)} style={btnGreen}>Mark paid out</button>}
        </div>
      ))}
    </div>
  )
}

function ReferralsTab({ referrals, onUpdate }) {
  const [f, setF] = useState({ status: 'all', rewardType: 'all', dateFrom: '', dateTo: '' })
  const rewardTypes = [...new Set(referrals.map(r => r.reward_type).filter(Boolean))]
  const filtered = referrals.filter(r => {
    if (f.status !== 'all' && r.reward_status !== f.status) return false
    if (f.rewardType !== 'all' && r.reward_type !== f.rewardType) return false
    if (f.dateFrom && new Date(r.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(r.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <StatCard icon="🎁" label="Total referrals" value={referrals.length} color="#6D28D9" />
        <StatCard icon="⏳" label="Pending rewards" value={referrals.filter(r => r.reward_status === 'pending').length} color="#854D0E" />
        <StatCard icon="✅" label="Paid rewards" value={referrals.filter(r => r.reward_status === 'paid').length} color="#166534" />
      </div>
      <FilterBar filters={[
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All' },{ value: 'pending', label: 'Pending' },{ value: 'paid', label: 'Paid' }] },
        { key: 'rewardType', label: 'Reward type', type: 'select', value: f.rewardType, options: [{ value: 'all', label: 'All types' }, ...rewardTypes.map(t => ({ value: t, label: t }))] },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ status: 'all', rewardType: 'all', dateFrom: '', dateTo: '' })} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} referral{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map(r => ({ referrer: r.referrer?.full_name, referred: r.referred?.full_name, referred_role: r.referred?.role, reward_type: r.reward_type, reward_status: r.reward_status, date: r.created_at })), 'referrals.csv')} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.length === 0 ? <Empty text="No referrals found." /> : filtered.map(r => (
        <div key={r.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>{r.referrer?.full_name} → {r.referred?.full_name}</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '2px' }}>Referred as <span style={{ textTransform: 'capitalize' }}>{r.referred?.role}</span> · {r.reward_type}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(r.created_at).toLocaleDateString()}</div>
          </div>
          <StatusBadge status={r.reward_status} />
          {r.reward_status === 'pending' && <button onClick={() => onUpdate(r.id, 'paid')} style={btnGreen}>Mark paid</button>}
          {r.reward_status === 'paid' && <button onClick={() => onUpdate(r.id, 'pending')} style={btnYellow}>Mark pending</button>}
        </div>
      ))}
    </div>
  )
}

function OnboardingTab({ teachers, allReviews, allBookings }) {
  const [f, setF] = useState({ search: '', country: '', city: '', dateFrom: '', dateTo: '' })
  const [selected, setSelected] = useState(null)
  const countries = [...new Set(teachers.map(t => t.profiles?.country).filter(Boolean))]
  const cities = [...new Set(teachers.map(t => t.profiles?.city).filter(Boolean))]
  const filtered = teachers.filter(t => {
    if (f.search && !t.profiles?.full_name?.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.country && t.profiles?.country !== f.country) return false
    if (f.city && t.profiles?.city !== f.city) return false
    if (f.dateFrom && t.profiles?.created_at && new Date(t.profiles.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && t.profiles?.created_at && new Date(t.profiles.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <DetailDrawer open={!!selected} onClose={() => setSelected(null)} title="Teacher Profile (Incomplete)" subtitle={selected?.profiles?.full_name}>
        {selected && <TeacherDetail teacher={selected} allReviews={allReviews} allBookings={allBookings} onVerify={() => {}} onSuspend={() => {}} />}
      </DetailDrawer>
      <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #FDE68A', fontSize: '14px', color: '#92400E' }}>
        ⚠️ These {filtered.length} teacher{filtered.length !== 1 ? 's' : ''} registered but have not uploaded any certificates yet.
      </div>
      <input style={searchInp} placeholder="Search by name..." value={f.search} onChange={e => setF(p => ({ ...p, search: e.target.value }))} />
      <FilterBar filters={[
        { key: 'country', label: 'Country', type: 'select', value: f.country, options: [{ value: '', label: 'All countries' }, ...countries.map(c => ({ value: c, label: c }))] },
        { key: 'city', label: 'City', type: 'select', value: f.city, options: [{ value: '', label: 'All cities' }, ...cities.map(c => ({ value: c, label: c }))] },
        { key: 'dateFrom', label: 'Joined from', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'Joined to', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(p => ({ ...p, [key]: val }))} onClear={() => setF({ search: '', country: '', city: '', dateFrom: '', dateTo: '' })} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} teacher{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map(t => ({ name: t.profiles?.full_name, city: t.profiles?.city, country: t.profiles?.country, subjects: t.subjects?.join(', '), verified: t.is_verified })), 'onboarding.csv')} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.length === 0 ? <Empty text="🎉 All teachers have uploaded certificates." /> : filtered.map(t => (
        <div key={t.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <AdminAvatar name={t.profiles?.full_name} url={t.profiles?.avatar_url} />
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', marginBottom: '2px' }}>{t.profiles?.full_name}</div>
            <div style={{ fontSize: '13px', color: '#64748B' }}>📍 {t.profiles?.city}, {t.profiles?.country}{t.subjects?.length > 0 && ` · ${t.subjects.slice(0,3).join(', ')}`}</div>
          </div>
          <StatusBadge status="pending" />
          <StatusBadge status={t.is_verified ? 'verified' : 'unverified'} />
          <button onClick={() => setSelected(t)} style={{ padding: '7px 16px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>View →</button>
        </div>
      ))}
    </div>
  )
}

function QualityTab({ teachers }) {
  const [f, setF] = useState({ search: '', minScore: '', maxScore: '', verified: 'all', period: 'all' })
  const scoreColor = (score) => score >= 75 ? { bg: '#DCFCE7', color: '#166534' } : score >= 50 ? { bg: '#EDE9FE', color: '#5B21B6' } : score >= 25 ? { bg: '#FEF9C3', color: '#854D0E' } : { bg: '#FEE2E2', color: '#991B1B' }
  const scoreLabel = (s) => s >= 75 ? 'Excellent' : s >= 50 ? 'Good' : s >= 25 ? 'Fair' : 'Low'
  const filtered = teachers.filter(t => {
    if (f.search && !t.profiles?.full_name?.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.minScore && t.qualityScore < parseInt(f.minScore)) return false
    if (f.maxScore && t.qualityScore > parseInt(f.maxScore)) return false
    if (f.verified !== 'all') { if (f.verified === 'verified' && !t.is_verified) return false; if (f.verified === 'unverified' && t.is_verified) return false }
    if (f.period !== 'all') { const start = periodStart(f.period); if (start && t.profiles?.created_at && new Date(t.profiles.created_at) < new Date(start)) return false }
    return true
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ background: '#F5F3FF', borderRadius: '10px', padding: '1rem 1.25rem', border: '1px solid #DDD6FE', fontSize: '14px', color: '#5B21B6' }}>
        📊 Score formula: Reviews (40pts) + Confirmed bookings (30pts) + Approved certificates (20pts) + Verified (10pts)
      </div>
      <FilterBar filters={[
        { key: 'search', label: 'Search', type: 'text', value: f.search, placeholder: 'Teacher name...', width: '160px' },
        { key: 'minScore', label: 'Min score', type: 'number', value: f.minScore, placeholder: '0', width: '80px' },
        { key: 'maxScore', label: 'Max score', type: 'number', value: f.maxScore, placeholder: '100', width: '80px' },
        { key: 'verified', label: 'Verified', type: 'select', value: f.verified, options: [{ value: 'all', label: 'All' },{ value: 'verified', label: 'Verified' },{ value: 'unverified', label: 'Unverified' }] },
        { key: 'period', label: 'Joined within', type: 'select', value: f.period, options: [{ value: 'all', label: 'All time' },{ value: '7d', label: 'Last 7 days' },{ value: '30d', label: 'Last 30 days' },{ value: '90d', label: 'Last 90 days' },{ value: '1y', label: 'Last year' }] },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ search: '', minScore: '', maxScore: '', verified: 'all', period: 'all' })} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} teacher{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map((t,i) => ({ rank: i+1, name: t.profiles?.full_name, city: t.profiles?.city, quality_score: t.qualityScore, avg_rating: t.avgRating, reviews: t.reviewCount, bookings: t.bookingCount, verified: t.is_verified })), 'quality_scores.csv')} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.length === 0 ? <Empty text="No teachers match filters." /> : filtered.map((t, i) => {
        const { bg, color } = scoreColor(t.qualityScore)
        return (
          <div key={t.id} style={{ background: '#fff', borderRadius: '12px', padding: '1rem 1.5rem', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#64748B', flexShrink: 0 }}>{i + 1}</div>
            <AdminAvatar name={t.profiles?.full_name} url={t.profiles?.avatar_url} />
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{t.profiles?.full_name}</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>⭐ {t.avgRating} ({t.reviewCount} reviews) · 📅 {t.bookingCount} bookings</div>
            </div>
            <div style={{ minWidth: '160px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{scoreLabel(t.qualityScore)}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>{t.qualityScore}/100</span>
              </div>
              <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${t.qualityScore}%`, background: color, borderRadius: '4px' }} />
              </div>
            </div>
            <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: '700', background: bg, color }}>{t.qualityScore}/100</span>
            <StatusBadge status={t.is_verified ? 'verified' : 'unverified'} />
          </div>
        )
      })}
    </div>
  )
}

function FlagsTab({ flags, onUpdate, onRefresh, setMessage, log }) {
  const [selected, setSelected] = useState(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [f, setF] = useState({ status: 'pending', targetType: 'all', dateFrom: '', dateTo: '' })
  const targetTypes = [...new Set(flags.map(fl => fl.target_type).filter(Boolean))]
  const filtered = flags.filter(fl => {
    if (f.status !== 'all' && fl.status !== f.status) return false
    if (f.targetType !== 'all' && fl.target_type !== f.targetType) return false
    if (f.dateFrom && new Date(fl.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(fl.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })
  const pendingFiltered = filtered.filter(fl => fl.status === 'pending')
  const allPendingIds = pendingFiltered.map(fl => fl.id)
  const allSelected = allPendingIds.length > 0 && allPendingIds.every(id => selected.has(id))
  const toggle = (id) => { const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next) }
  const bulkAction = async (status) => {
    if (!selected.size || !window.confirm(`Mark ${selected.size} flag(s) as ${status}?`)) return
    setBulkLoading(true)
    const ids = [...selected]
    await supabase.from('flags').update({ status }).in('id', ids)
    await log(`Bulk flag ${status}`, 'flag', ids.join(','), `${ids.length} flags`)
    setMessage(`✅ ${ids.length} flag(s) marked as ${status}.`)
    setSelected(new Set()); onRefresh(); setBulkLoading(false)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <StatCard icon="🚩" label="Pending" value={flags.filter(f => f.status === 'pending').length} color="#991B1B" />
        <StatCard icon="✅" label="Resolved" value={flags.filter(f => f.status === 'resolved').length} color="#166534" />
        <StatCard icon="🚫" label="Dismissed" value={flags.filter(f => f.status === 'dismissed').length} color="#64748B" />
      </div>
      <FilterBar filters={[
        { key: 'status', label: 'Status', type: 'select', value: f.status, options: [{ value: 'all', label: 'All' },{ value: 'pending', label: 'Pending' },{ value: 'resolved', label: 'Resolved' },{ value: 'dismissed', label: 'Dismissed' }] },
        { key: 'targetType', label: 'Target type', type: 'select', value: f.targetType, options: [{ value: 'all', label: 'All types' }, ...targetTypes.map(t => ({ value: t, label: t }))] },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => { setF(prev => ({ ...prev, [key]: val })); setSelected(new Set()) }} onClear={() => { setF({ status: 'pending', targetType: 'all', dateFrom: '', dateTo: '' }); setSelected(new Set()) }} />
      {pendingFiltered.length > 0 && (
        <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <input type="checkbox" checked={allSelected} onChange={() => allSelected ? setSelected(new Set()) : setSelected(new Set(allPendingIds))} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
          <span style={{ fontSize: '14px', color: '#475569' }}>{selected.size > 0 ? `${selected.size} selected` : 'Select pending to bulk action'}</span>
          {selected.size > 0 && <>
            <button onClick={() => bulkAction('resolved')} disabled={bulkLoading} style={btnGreen}>✓ Resolve all</button>
            <button onClick={() => bulkAction('dismissed')} disabled={bulkLoading} style={btnGhost}>Dismiss all</button>
            <button onClick={() => setSelected(new Set())} style={btnGhost}>Clear</button>
          </>}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>{filtered.length} flag{filtered.length !== 1 ? 's' : ''}</span>
        <button onClick={() => exportCSV(filtered.map(fl => ({ type: fl.target_type, reason: fl.reason, reporter: fl.reporter?.full_name, status: fl.status, date: fl.created_at })), 'flags.csv')} style={btnExport}>⬇ CSV</button>
      </div>
      {filtered.length === 0 ? <Empty text={f.status === 'pending' ? '🎉 No pending flags.' : 'No flags found.'} /> : filtered.map(fl => (
        <div key={fl.id} style={{ background: fl.status === 'pending' ? '#FFF5F5' : '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', border: `1px solid ${selected.has(fl.id) ? '#C4B5FD' : fl.status === 'pending' ? '#FECACA' : '#E2E8F0'}`, display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          {fl.status === 'pending' && <input type="checkbox" checked={selected.has(fl.id)} onChange={() => toggle(fl.id)} style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0, marginTop: '3px' }} />}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>🚩 {fl.target_type} report</span>
              <StatusBadge status={fl.status} />
            </div>
            <div style={{ fontSize: '14px', color: '#374151', marginBottom: '6px', lineHeight: '1.6' }}>{fl.reason}</div>
            <div style={{ fontSize: '12px', color: '#94A3B8' }}>Reported by {fl.reporter?.full_name || 'Unknown'} · {new Date(fl.created_at).toLocaleDateString()}</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
            {fl.status !== 'resolved' && <button onClick={() => onUpdate(fl.id, 'resolved')} style={btnGreen}>Resolve</button>}
            {fl.status !== 'dismissed' && <button onClick={() => onUpdate(fl.id, 'dismissed')} style={btnGhost}>Dismiss</button>}
            {fl.status !== 'pending' && <button onClick={() => onUpdate(fl.id, 'pending')} style={btnRed}>Reopen</button>}
          </div>
        </div>
      ))}
    </div>
  )
}

function RevenueTab({ payments, bookings, allUsers, teachers }) {
  const [f, setF] = useState({ period: 'all', subject: '', dateFrom: '', dateTo: '' })
  const subjects = [...new Set(bookings.map(b => b.subject).filter(Boolean))]
  const applyFilters = (items, dateKey) => items.filter(item => {
    const d = new Date(item[dateKey])
    if (f.period !== 'all') { const start = periodStart(f.period); if (start && d < new Date(start)) return false }
    if (f.dateFrom && d < new Date(f.dateFrom)) return false
    if (f.dateTo && d > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })
  const filteredPayments = applyFilters(payments.filter(p => p.status === 'success'), 'created_at')
  const filteredBookings = applyFilters(bookings, 'created_at').filter(b => { if (f.subject && b.subject !== f.subject) return false; return true })
  const totalGMV = filteredPayments.reduce((s, p) => s + (p.amount || 0), 0)
  const totalCommission = filteredPayments.reduce((s, p) => s + (p.commission_amount || 0), 0)
  const totalPayout = filteredPayments.reduce((s, p) => s + (p.teacher_payout || 0), 0)
  const totalRefunds = filteredBookings.filter(b => b.refund_status === 'pending' || b.refund_status === 'refunded').reduce((s, b) => s + (b.amount || 0), 0)
  const netGMV = totalGMV - totalRefunds
  const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed')
  const avgValue = confirmedBookings.length > 0 ? (confirmedBookings.reduce((s, b) => s + (b.amount || 0), 0) / confirmedBookings.length).toFixed(2) : '0.00'
  const monthlyData = {}
  filteredPayments.forEach(p => {
    const month = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    if (!monthlyData[month]) monthlyData[month] = { month, gmv: 0, commission: 0 }
    monthlyData[month].gmv += p.amount || 0
    monthlyData[month].commission += p.commission_amount || 0
  })
  const chartData = Object.values(monthlyData).sort((a, b) => new Date('01 ' + a.month) - new Date('01 ' + b.month))
  const bySubject = {}
  filteredBookings.filter(b => b.status === 'confirmed' && b.amount > 0).forEach(b => {
    const s = b.subject || 'Other'
    if (!bySubject[s]) bySubject[s] = { subject: s, count: 0, revenue: 0 }
    bySubject[s].count += 1; bySubject[s].revenue += b.amount || 0
  })
  const subjectRows = Object.values(bySubject).sort((a, b) => b.revenue - a.revenue)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <FilterBar filters={[
        { key: 'period', label: 'Period', type: 'select', value: f.period, options: [{ value: 'all', label: 'All time' },{ value: '7d', label: 'Last 7 days' },{ value: '30d', label: 'Last 30 days' },{ value: '90d', label: 'Last 90 days' },{ value: '1y', label: 'Last year' }] },
        { key: 'subject', label: 'Subject', type: 'select', value: f.subject, options: [{ value: '', label: 'All subjects' }, ...subjects.map(s => ({ value: s, label: s }))] },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ period: 'all', subject: '', dateFrom: '', dateTo: '' })} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <StatCard icon="💰" label="Gross GMV (overall)" value={`GH₵ ${totalGMV.toFixed(2)}`} color="#64748B" />
        <StatCard icon="↩️" label="Refunds" value={`GH₵ ${totalRefunds.toFixed(2)}`} color="#991B1B" />
        <StatCard icon="✅" label="Net GMV" value={`GH₵ ${netGMV.toFixed(2)}`} color="#166534" />
        <StatCard icon="📊" label="Commission" value={`GH₵ ${totalCommission.toFixed(2)}`} color="#6D28D9" />
        <StatCard icon="👩‍🏫" label="Teacher payouts" value={`GH₵ ${totalPayout.toFixed(2)}`} color="#7C3AED" />
        <StatCard icon="📈" label="Avg booking value" value={`GH₵ ${avgValue}`} color="#D97706" />
      </div>
      {chartData.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '1.5rem' }}>💰 GMV vs Commission by Month (GH₵)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#111' }} />
              <Legend wrapperStyle={{ color: '#475569', fontSize: '12px' }} />
              <Bar dataKey="gmv" fill="#6D28D9" radius={[4,4,0,0]} name="GMV (GH₵)" />
              <Bar dataKey="commission" fill="#16A34A" radius={[4,4,0,0]} name="Commission (GH₵)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {subjectRows.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>📚 Revenue by subject</h3>
            <button onClick={() => exportCSV(subjectRows.map(s => ({ subject: s.subject, bookings: s.count, revenue: s.revenue.toFixed(2) })), 'revenue_by_subject.csv')} style={btnExport}>⬇ CSV</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#F8FAFC' }}>{['Subject','Bookings','Revenue (GH₵)','Share'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>)}</tr></thead>
              <tbody>{subjectRows.map((s, i) => (
                <tr key={s.subject} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#F8FAFC' }}>
                  <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: '600', color: '#111' }}>{s.subject}</td>
                  <td style={{ padding: '10px 14px', fontSize: '14px', color: '#374151' }}>{s.count}</td>
                  <td style={{ padding: '10px 14px', fontSize: '14px', fontWeight: '700', color: '#166534' }}>GH₵ {s.revenue.toFixed(2)}</td>
                  <td style={{ padding: '10px 14px', fontSize: '13px', color: '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', maxWidth: '80px' }}><div style={{ height: '100%', width: `${(s.revenue/(subjectRows[0]?.revenue||1))*100}%`, background: '#6D28D9', borderRadius: '3px' }} /></div>
                      {totalGMV > 0 ? `${((s.revenue/totalGMV)*100).toFixed(1)}%` : '—'}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}
      {chartData.length === 0 && subjectRows.length === 0 && <Empty text="No revenue data for the selected filters." />}
    </div>
  )
}

function GeographyTab({ users, teachers }) {
  const [view, setView] = useState('users')
  const countBy = (arr, key) => { const c = {}; arr.forEach(i => { const v = i[key] || 'Unknown'; c[v] = (c[v] || 0) + 1 }); return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value })) }
  const countByNested = (arr, key) => { const c = {}; arr.forEach(i => { const v = i.profiles?.[key] || 'Unknown'; c[v] = (c[v] || 0) + 1 }); return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value })) }
  const BarList = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.length === 0 ? <div style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', padding: '1rem' }}>No data yet.</div>
          : data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '110px', fontSize: '13px', color: '#374151', flexShrink: 0, textAlign: 'right', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
              <div style={{ flex: 1, height: '8px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${(d.value/max)*100}%`, background: color, borderRadius: '4px' }} /></div>
              <div style={{ width: '30px', fontSize: '13px', color: '#111', fontWeight: '700', textAlign: 'right' }}>{d.value}</div>
            </div>
          ))}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0', width: 'fit-content' }}>
        {[['users','All Users'],['teachers','Teachers']].map(([key,label]) => (
          <button key={key} onClick={() => setView(key)} style={{ padding: '7px 18px', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: view === key ? '#6D28D9' : 'transparent', color: view === key ? '#fff' : '#64748B', fontWeight: view === key ? '700' : '400' }}>{label}</button>
        ))}
      </div>
      {view === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0' }}><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '1.25rem' }}>🌍 Users by country</h3><BarList data={countBy(users, 'country')} color="#6D28D9" /></div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0' }}><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '1.25rem' }}>🏙️ Users by city</h3><BarList data={countBy(users, 'city')} color="#16A34A" /></div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '1rem' }}>📊 Role breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[['Teachers',users.filter(u=>u.role==='teacher').length,'#6D28D9','#EDE9FE'],['Learners',users.filter(u=>u.role==='learner').length,'#166534','#DCFCE7'],['Parents',users.filter(u=>u.role==='parent').length,'#6B21A8','#F3E8FF']].map(([label,value,color,bg]) => (
                <div key={label} style={{ background: bg, borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '700', color }}>{value}</div>
                  <div style={{ fontSize: '13px', color, marginTop: '4px', fontWeight: '600' }}>{label}</div>
                  <div style={{ fontSize: '12px', color, opacity: 0.7, marginTop: '2px' }}>{users.length > 0 ? Math.round((value/users.length)*100) : 0}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {view === 'teachers' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0' }}><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '1.25rem' }}>🌍 Teachers by country</h3><BarList data={countByNested(teachers,'country')} color="#6D28D9" /></div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0' }}><h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '1.25rem' }}>🏙️ Teachers by city</h3><BarList data={countByNested(teachers,'city')} color="#D97706" /></div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '1rem' }}>📚 Top subjects</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(() => { const sc = {}; teachers.forEach(t => { (t.subjects||[]).forEach(s => { sc[s]=(sc[s]||0)+1 }) }); return Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([s,c]) => <span key={s} style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '20px', background: '#EDE9FE', color: '#5B21B6', fontWeight: '600' }}>{s} ({c})</span>) })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AnnouncementsTab({ announcements, adminId, onRefresh }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetRole, setTargetRole] = useState('all')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const send = async () => {
    if (!title.trim() || !body.trim()) return
    setSending(true)
    try {
      await supabase.from('announcements').insert({ title, message: body, target_role: targetRole, created_by: adminId })
      setMsg('✅ Announcement published.'); setTitle(''); setBody(''); setTargetRole('all'); onRefresh()
    } catch (err) { setMsg('Error: ' + err.message) } finally { setSending(false) }
  }
  const del = async (id) => { if (!window.confirm('Delete this announcement?')) return; await supabase.from('announcements').delete().eq('id', id); onRefresh() }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '1rem' }}>📢 New announcement</h3>
        {msg && <div style={{ background: msg.startsWith('✅') ? '#DCFCE7' : '#FEE2E2', color: msg.startsWith('✅') ? '#166534' : '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '1rem' }}>{msg}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div><label style={formLbl}>Title</label><input style={formInp} placeholder="e.g. Platform maintenance on Saturday" value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><label style={formLbl}>Message</label><textarea style={{ ...formInp, height: '90px', resize: 'vertical' }} placeholder="Write your announcement..." value={body} onChange={e => setBody(e.target.value)} /></div>
          <div>
            <label style={formLbl}>Target audience</label>
            <select style={{ ...formInp, cursor: 'pointer', width: 'fit-content' }} value={targetRole} onChange={e => setTargetRole(e.target.value)}>
              <option value="all">Everyone</option>
              <option value="teacher">Teachers only</option>
              <option value="learner">Learners only</option>
              <option value="parent">Parents only</option>
            </select>
          </div>
          <button onClick={send} disabled={sending || !title.trim() || !body.trim()} style={{ padding: '11px 24px', background: '#6D28D9', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit', width: 'fit-content', opacity: (!title.trim()||!body.trim()) ? 0.5 : 1 }}>
            {sending ? 'Publishing...' : 'Publish announcement'}
          </button>
        </div>
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>Past announcements</h3>
      {announcements.length === 0 ? <Empty text="No announcements yet." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {announcements.map(a => (
            <div key={a.id} style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{a.title}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', background: '#EDE9FE', color: '#5B21B6', textTransform: 'capitalize' }}>{a.target_role === 'all' ? 'Everyone' : a.target_role + 's'}</span>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button onClick={() => del(a.id)} style={{ padding: '5px 12px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', flexShrink: 0 }}>Delete</button>
              </div>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AuditTab({ logs, allUsers }) {
  const [f, setF] = useState({ search: '', actionType: 'all', dateFrom: '', dateTo: '' })
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserResults, setShowUserResults] = useState(false)

  const userResults = userSearch.trim().length > 1
    ? (allUsers || []).filter(u =>
        u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone?.toLowerCase().includes(userSearch.toLowerCase())
      ).slice(0, 8)
    : []

  const filtered = logs.filter(l => {
    if (selectedUser && l.target_id !== selectedUser.id) return false
    if (f.search && !l.action?.toLowerCase().includes(f.search.toLowerCase()) && !l.target_type?.toLowerCase().includes(f.search.toLowerCase()) && !l.admins?.full_name?.toLowerCase().includes(f.search.toLowerCase()) && !l.details?.toLowerCase().includes(f.search.toLowerCase())) return false
    if (f.actionType !== 'all') {
      const a = l.action?.toLowerCase() || ''
      const type = a.includes('approved')||a.includes('verified')||a.includes('paid')||a.includes('unblocked')||a.includes('restored') ? 'approved'
        : a.includes('declined')||a.includes('suspended')||a.includes('hidden') ? 'declined'
        : a.includes('deleted')||a.includes('removed') ? 'deleted'
        : a.includes('edited')||a.includes('updated')||a.includes('created') ? 'modified'
        : 'other'
      if (type !== f.actionType) return false
    }
    if (f.dateFrom && new Date(l.created_at) < new Date(f.dateFrom)) return false
    if (f.dateTo && new Date(l.created_at) > new Date(f.dateTo + 'T23:59:59')) return false
    return true
  })

  const actionColor = (action) => {
    const a = action?.toLowerCase() || ''
    if (a.includes('deleted')||a.includes('removed')) return { bg: '#FEE2E2', color: '#991B1B' }
    if (a.includes('suspended')||a.includes('hidden')||a.includes('declined')) return { bg: '#FEF9C3', color: '#854D0E' }
    if (a.includes('approved')||a.includes('verified')||a.includes('paid')||a.includes('unblocked')||a.includes('restored')) return { bg: '#DCFCE7', color: '#166534' }
    if (a.includes('edited')||a.includes('updated')||a.includes('created')) return { bg: '#EDE9FE', color: '#5B21B6' }
    return { bg: '#F1F5F9', color: '#64748B' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>🔍 Filter by affected user</h3>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>Search for a teacher, learner, or parent by name, email, or phone to see all admin actions on their account.</p>
        <div style={{ position: 'relative' }}>
          <input
            style={{ ...searchInp, paddingRight: selectedUser ? '80px' : '14px' }}
            placeholder="Type name, email or phone number..."
            value={userSearch}
            onChange={e => { setUserSearch(e.target.value); setShowUserResults(true); if (!e.target.value) setSelectedUser(null) }}
            onFocus={() => setShowUserResults(true)}
            onBlur={() => setTimeout(() => setShowUserResults(false), 150)}
          />
          {selectedUser && (
            <button onClick={() => { setSelectedUser(null); setUserSearch(''); setShowUserResults(false) }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#FEE2E2', border: 'none', color: '#991B1B', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '700' }}>
              Clear ×
            </button>
          )}
          {showUserResults && userResults.length > 0 && !selectedUser && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
              {userResults.map(u => (
                <div key={u.id} onMouseDown={() => { setSelectedUser(u); setUserSearch(u.full_name); setShowUserResults(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', background: '#fff' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <AdminAvatar name={u.full_name} url={u.avatar_url} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{u.full_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{u.email} · {u.phone || '—'}</div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', textTransform: 'capitalize', background: u.role === 'teacher' ? '#EDE9FE' : u.role === 'learner' ? '#DCFCE7' : '#F3E8FF', color: u.role === 'teacher' ? '#5B21B6' : u.role === 'learner' ? '#166534' : '#6B21A8', flexShrink: 0 }}>{u.role}</span>
                </div>
              ))}
            </div>
          )}
          {showUserResults && userSearch.trim().length > 1 && userResults.length === 0 && !selectedUser && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#64748B', zIndex: 50 }}>
              No users found matching "{userSearch}"
            </div>
          )}
        </div>

        {selectedUser && (
          <div style={{ marginTop: '12px', padding: '12px 14px', background: '#F5F3FF', borderRadius: '10px', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AdminAvatar name={selectedUser.full_name} url={selectedUser.avatar_url} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#5B21B6' }}>{selectedUser.full_name}</div>
              <div style={{ fontSize: '12px', color: '#6D28D9', opacity: 0.8 }}>{selectedUser.email} · {selectedUser.role} · {selectedUser.city}, {selectedUser.country}</div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#5B21B6' }}>{filtered.length} log{filtered.length !== 1 ? 's' : ''} found</span>
          </div>
        )}
      </div>

      <FilterBar filters={[
        { key: 'search', label: 'Search in logs', type: 'text', value: f.search, placeholder: 'Action, admin or details...', width: '200px' },
        { key: 'actionType', label: 'Action type', type: 'select', value: f.actionType, options: [{ value: 'all', label: 'All actions' },{ value: 'approved', label: '✅ Approved / verified' },{ value: 'declined', label: '⚠️ Declined / suspended' },{ value: 'deleted', label: '🗑 Deleted' },{ value: 'modified', label: '✏️ Edited / created' },{ value: 'other', label: 'Other' }] },
        { key: 'dateFrom', label: 'From', type: 'date', value: f.dateFrom },
        { key: 'dateTo', label: 'To', type: 'date', value: f.dateTo },
      ]} onChange={(key, val) => setF(prev => ({ ...prev, [key]: val }))} onClear={() => setF({ search: '', actionType: 'all', dateFrom: '', dateTo: '' })} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          {filtered.length} log{filtered.length !== 1 ? 's' : ''}{selectedUser ? ` on ${selectedUser.full_name}'s account` : ''}
        </span>
        <button onClick={() => exportCSV(filtered.map(l => ({ action: l.action, target_type: l.target_type, target_id: l.target_id, details: l.details, admin: l.admins?.full_name, timestamp: l.created_at })), 'audit_log.csv')} style={btnExport}>⬇ CSV</button>
      </div>

      {!selectedUser && (
        <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '12px 16px', border: '1px solid #FDE68A', fontSize: '13px', color: '#92400E' }}>
          💡 Search for a specific user above to see all admin actions on their account, or browse all logs below.
        </div>
      )}

      {filtered.length === 0 ? (
        <Empty text={selectedUser ? `No admin actions found on ${selectedUser.full_name}'s account.` : 'No audit logs found.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.map(l => {
            const { bg, color } = actionColor(l.action)
            return (
              <div key={l.id} style={{ background: '#fff', borderRadius: '10px', padding: '12px 16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '700', background: bg, color, flexShrink: 0, whiteSpace: 'nowrap', marginTop: '2px' }}>{l.action}</span>
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <div style={{ fontSize: '13px', color: '#374151' }}>
                    {l.target_type && <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{l.target_type}</span>}
                    {l.details && <span style={{ color: '#64748B' }}> · {l.details}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '13px', color: '#6D28D9', fontWeight: '600' }}>{l.admins?.full_name || 'Admin'}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{new Date(l.created_at).toLocaleString()}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: 'center', color: '#64748B', padding: '3rem', background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '14px' }}>
      {text}
    </div>
  )
}

const btnGreen  = { padding: '6px 12px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }
const btnRed    = { padding: '6px 12px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }
const btnYellow = { padding: '6px 12px', background: '#FEF9C3', color: '#854D0E', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }
const btnGhost  = { padding: '6px 12px', background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' }
const btnExport = { padding: '6px 14px', background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '700', fontFamily: 'inherit' }
const searchInp = { width: '100%', padding: '10px 14px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
const formLbl   = { fontSize: '12px', color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }
const formInp   = { width: '100%', padding: '10px 14px', background: '#fff', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', color: '#111', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }