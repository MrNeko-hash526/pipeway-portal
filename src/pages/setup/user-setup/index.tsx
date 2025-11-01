import Link from '@/components/link'
import React from 'react'
import * as ExcelJS from 'exceljs'
import { DownloadCloud } from 'lucide-react'

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

export default function UserSetupPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState('All')
  const [userTypeFilter, setUserTypeFilter] = React.useState('All')
  const [loading, setLoading] = React.useState(false)

  // Load from backend instead of static data
  const [users, setUsers] = React.useState<any[]>([])

  // sort state
  const [sort, setSort] = React.useState<{ key: string | null; dir: 'asc' | 'desc' | null }>({
    key: null,
    dir: null,
  })

  // toast system
  const [toasts, setToasts] = React.useState<any[]>([])
  const addToast = (t: any) => setToasts(prev => [...prev, { id: String(Date.now()) + Math.random(), ...t }])
  const removeToast = (id: string) => setToasts(prev => prev.filter(x => x.id !== id))

  // Load users from backend on mount
  React.useEffect(() => {
    let mounted = true
    async function loadUsers() {
      setLoading(true)
      try {
        const url = `${API_BASE.replace(/\/$/, '')}/api/setup/user?limit=1000`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        
        if (!mounted) return
        
        // Map backend data to frontend format
        const rows = Array.isArray(body.data) ? body.data : []
        const mapped = rows.map((r: any) => ({
          id: r.id,
          first_name: r.first_name || '',           // snake_case
          last_name: r.last_name || '',             // snake_case  
          email: r.email || '',
          company: r.user_type === 'Organization' 
            ? r.organization_display || `Organization ID: ${r.organization_id || 'N/A'}`
            : r.company_name || 'N/A',
          role: r.user_role || '',                  // snake_case
          phone: '', 
          status: r.status || 'Active',
          type: r.user_type || 'Organization',      // snake_case
          organization_id: r.organization_id,       // snake_case
          company_name: r.company_name,             // snake_case
          full_name: r.full_name || `${r.first_name} ${r.last_name}`,
          created_at: r.created_at,                 // snake_case
          updated_at: r.updated_at                  // snake_case
        }))
        
        console.log('📊 Loaded users:', mapped.length)
        setUsers(mapped)
      } catch (err) {
        console.error('Failed to load users:', err)
        if (mounted) {
          addToast({ 
            id: String(Date.now()), 
            type: 'info', 
            title: 'Load failed', 
            message: String(err), 
            timeout: 4000 
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadUsers()
    return () => { mounted = false }
  }, [])

  const columns: { key: string; label: string; sortable?: boolean }[] = [
    { key: 'idx', label: '#' },
    { key: 'first_name', label: 'First Name', sortable: true },
    { key: 'last_name', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'company', label: 'Company/Organization', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ]

  // toggle sort
  const toggleSort = (key: string) => {
    if (sort.key !== key) return setSort({ key, dir: 'asc' })
    if (sort.dir === 'asc') setSort({ key, dir: 'desc' })
    else setSort({ key: null, dir: null })
  }

  const filteredAndSorted = React.useMemo(() => {
    const filtered = users.filter(o => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        String(o.first_name ?? '').toLowerCase().includes(q) ||    // snake_case
        String(o.last_name ?? '').toLowerCase().includes(q) ||     // snake_case
        String(o.email ?? '').toLowerCase().includes(q) ||
        String(o.company ?? '').toLowerCase().includes(q) ||
        String(o.role ?? '').toLowerCase().includes(q)
      const matchesStatus = status === 'All' || o.status === status
      const matchesType = userTypeFilter === 'All' || o.type === userTypeFilter
      return matchesQuery && matchesStatus && matchesType
    })

    if (!sort.key || !sort.dir) return filtered
    const dirMul = sort.dir === 'asc' ? 1 : -1

    const sorted = [...filtered].sort((a: any, b: any) => {
      const key = sort.key as string
      if (key === 'idx') return 0
      const va = String(a[key] ?? '')
      const vb = String(b[key] ?? '')

      // status order
      if (key === 'status') {
        const order: Record<string, number> = { Active: 0, Pending: 1, Inactive: 2 }
        return ((order[va] ?? 99) - (order[vb] ?? 99)) * dirMul
      }

      return va.localeCompare(vb) * dirMul
    })

    return sorted
  }, [query, status, userTypeFilter, sort, users])

  // actions
  const handleEditClick = (user: any) => {
    window.location.href = `/setup/user-setup/add?id=${encodeURIComponent(String(user.id))}`
  }
  
  const handleWarn = async (id: number) => {
    try {
      const url = `${API_BASE.replace(/\/$/, '')}/api/setup/user/${id}`
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Pending' }),
      })
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      // Update local state only after successful DB update
      setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: 'Pending' } : u)))
      
      addToast({
        id: String(Date.now()) + Math.random(),
        type: 'info',
        title: 'Warning issued',
        message: 'User status changed to Pending.',
        timeout: 3000,
      })
    } catch (err) {
      console.error('Warn failed:', err)
      addToast({
        id: String(Date.now()) + Math.random(),
        type: 'info',
        title: 'Warning failed',
        message: String(err),
        timeout: 4000,
      })
    }
  }
  
  const handleDelete = async (id: number, name?: string) => {
    const toastId = String(Date.now()) + Math.random()
    addToast({
      id: toastId,
      type: 'confirm',
      title: 'Delete user?',
      message: `Delete "${name ?? ''}" permanently?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          const url = `${API_BASE.replace(/\/$/, '')}/api/setup/user/${id}`
          const res = await fetch(url, { method: 'DELETE' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          
          // Update local state only after successful DB deletion
          setUsers(prev => prev.filter(u => u.id !== id))
          removeToast(toastId)
          addToast({
            id: String(Date.now()) + Math.random(),
            type: 'info',
            title: 'Deleted',
            message: `User "${name ?? ''}" deleted successfully.`,
            timeout: 3000,
          })
        } catch (err) {
          console.error('Delete failed:', err)
          removeToast(toastId)
          addToast({
            id: String(Date.now()) + Math.random(),
            type: 'info',
            title: 'Delete failed',
            message: String(err),
            timeout: 4000,
          })
        }
      },
    })
  }

  // Export to Excel
  const handleExport = async () => {
    try {
      const visibleCols = columns.filter(c => c.key !== 'idx')
      const workbook = new ExcelJS.Workbook()
      const ws = workbook.addWorksheet('Users')

      ws.addRow(['#', ...visibleCols.map(c => c.label)])

      filteredAndSorted.forEach((r: any, i: number) => {
        ws.addRow([i + 1, ...visibleCols.map(col => r[col.key] ?? '')])
      })

      ws.getRow(1).font = { bold: true }
      ws.columns.forEach(col => {
        const max = (col.values || []).reduce((acc: number, val: any) => Math.max(acc, String(val ?? '').length), 10)
        col.width = Math.min(Math.max(max + 2, 12), 50)
      })

      const buf = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      addToast({ id: String(Date.now()), type: 'info', title: 'Export failed', message: String(err), timeout: 3000 })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">List of Users</h1>
          <p className="text-sm text-muted-foreground">Manage application users.</p>
        </div>

        <div>
          <Link href="/setup/user-setup/add" className="inline-flex items-center bg-sky-600 text-white px-4 py-2 rounded-md">
            Add User
          </Link>
        </div>
      </div>

      <div className="mt-4 bg-white/5 border rounded-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Search:</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Search by first/last name, email or company"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">User Type:</label>
            <select value={userTypeFilter} onChange={e => setUserTypeFilter(e.target.value)} className="w-full border rounded px-3 py-2">
              <option>All</option>
              <option>Organization</option>
              <option>Company</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Status:</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
              <option>All</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="md:col-span-1 flex items-center justify-end">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-md hover:from-sky-700 hover:to-sky-600 transition-colors"
            >
              <DownloadCloud className="w-4 h-4" /> <span className="font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm">
              {columns.map(col => {
                const isSorted = sort.key === col.key && !!sort.dir
                const arrow = isSorted ? (sort.dir === 'asc' ? '▲' : '▼') : null
                return (
                  <th
                    key={col.key}
                    className={`p-3 text-left ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                    onClick={() => col.sortable && toggleSort(col.key)}
                    role={col.sortable ? 'button' : undefined}
                    tabIndex={col.sortable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (col.sortable && (e.key === 'Enter' || e.key === ' ')) toggleSort(col.key)
                    }}
                  >
                    {col.sortable ? (
                      <button className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                        <span className="flex-1 text-left">{col.label}</span>
                        <span className="text-xs text-slate-400">{arrow}</span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                )
              })}
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center text-sm text-slate-500">
                  Loading users...
                </td>
              </tr>
            )}
            {!loading && filteredAndSorted.map((o, idx) => (
              <tr key={o.id} className="border-t even:bg-white/2">
                <td className="p-3 text-sm">{idx + 1}</td>
                <td className="p-3 text-sm font-medium">{o.first_name}</td>
                <td className="p-3 text-sm font-medium">{o.last_name}</td>
                <td className="p-3 text-sm">{o.email}</td>
                <td className="p-3 text-sm">{o.company}</td>
                <td className="p-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      o.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : o.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEditClick(o)} className="text-sky-600 cursor-pointer hover:underline">
                      Edit
                    </button>
                    <button type="button" className="text-amber-600 cursor-pointer hover:underline" onClick={() => handleWarn(o.id)}>Warn</button>
                    <button type="button" className="text-red-600 cursor-pointer hover:underline" onClick={() => handleDelete(o.id, `${o.firstName} ${o.lastName}`)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center text-sm text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
          {toasts.map((t: any) => (
            <div key={t.id} className="w-80 bg-white dark:bg-slate-800 border shadow p-3 rounded">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{t.title}</div>
                  {t.message && <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t.message}</div>}
                </div>
                <div className="ml-3 flex items-start gap-2">
                  {t.type === 'confirm' ? (
                    <>
                      <button onClick={() => { t.onConfirm?.(); }} className="px-3 py-1 text-sm bg-rose-600 text-white rounded">
                        {t.confirmLabel ?? 'Confirm'}
                      </button>
                      <button onClick={() => removeToast(t.id)} className="px-3 py-1 text-sm border rounded">
                        {t.cancelLabel ?? 'Cancel'}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => removeToast(t.id)} className="px-2 py-1 text-sm border rounded">
                      OK
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {toasts.map(t => {
        if (t.type === 'info' && t.timeout) setTimeout(() => removeToast(t.id), t.timeout)
        return null
      })}

      <div className="mt-6 text-center text-sm text-slate-500">
        © 2025 CAM powered by Goolean Technologies NA LLC
      </div>
    </div>
  )
}
