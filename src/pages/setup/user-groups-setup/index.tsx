import Link from '@/components/link'
import React from 'react'
import * as ExcelJS from 'exceljs'
import { DownloadCloud } from 'lucide-react'

const API_BASE = typeof window !== 'undefined' 
  ? (window as any).__ENV__?.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
  : 'http://localhost:3000'

type UserGroup = {
  id: number
  group_name: string
  group_values: string[]
  status: string
  created_at: string
  updated_at: string
}

type Toast = {
  id: string
  type: 'success' | 'error' | 'info' | 'confirm'
  title: string
  message: string
  timeout?: number
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
}

export default function UserGroupsSetupPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState('All')
  const [groups, setGroups] = React.useState<UserGroup[]>([])
  const [loading, setLoading] = React.useState(false)

  // sorting state
  const [sortKey, setSortKey] = React.useState<'group_name' | 'group_values' | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')

  // toast system
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const addToast = (t: Omit<Toast, 'id'> & { id?: string }) => {
    const { id, ...rest } = t as any
    setToasts(prev => [...prev, { id: id ?? (String(Date.now()) + Math.random()), ...rest }])
  }
  const removeToast = (id: string) => setToasts(prev => prev.filter(x => x.id !== id))

  // Load groups from backend
  React.useEffect(() => {
    let mounted = true
    async function loadGroups() {
      setLoading(true)
      try {
        const url = `${API_BASE.replace(/\/$/, '')}/api/setup/user-group?limit=1000&status=${status === 'All' ? '' : status}&search=${encodeURIComponent(query)}`
        console.log('🔍 Fetching from:', url)
        
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        
        if (!mounted) return
        
        console.log('📊 API Response:', body)
        
        // Handle response structure
        const rows = Array.isArray(body.data) ? body.data : []
        console.log('📊 Loaded groups:', rows.length)
        setGroups(rows)
      } catch (err) {
        console.error('Failed to load groups:', err)
        if (mounted) {
          addToast({ 
            type: 'error', 
            title: 'Load failed', 
            message: String(err), 
            timeout: 4000 
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadGroups()
    return () => { mounted = false }
  }, [status, query])

  // Client-side filtering and sorting
  const filtered = React.useMemo(() => {
    return groups.filter(g => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      
      const matchesName = String(g.group_name || '').toLowerCase().includes(q)
      const matchesValues = g.group_values && Array.isArray(g.group_values) 
        ? g.group_values.some(v => String(v).toLowerCase().includes(q))
        : false
      
      return matchesName || matchesValues
    })
  }, [groups, query])

  // Sorting logic
  const sortedFiltered = React.useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      let aVal: string, bVal: string
      
      if (sortKey === 'group_values') {
        aVal = Array.isArray(a.group_values) ? a.group_values.join(', ') : ''
        bVal = Array.isArray(b.group_values) ? b.group_values.join(', ') : ''
      } else {
        aVal = String(a[sortKey] || '')
        bVal = String(b[sortKey] || '')
      }
      
      const cmp = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDirection])

  // Handle sort click
  const handleSort = (key: 'group_name' | 'group_values') => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  // Handle edit click
  const handleEditClick = (group: UserGroup) => {
    window.location.href = `/setup/user-groups-setup/add?id=${encodeURIComponent(String(group.id))}`
  }

  // Handle delete
  const handleDelete = async (id: number, name?: string) => {
    const toastId = String(Date.now()) + Math.random()
    addToast({
      id: toastId,
      type: 'confirm',
      title: 'Delete group?',
      message: `Delete "${name ?? ''}"? This will remove it from the list.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          const url = `${API_BASE.replace(/\/$/, '')}/api/setup/user-group/${id}`
          const res = await fetch(url, { method: 'DELETE' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          
          setGroups(prev => prev.filter(g => g.id !== id))
          removeToast(toastId)
          addToast({
            id: String(Date.now()) + Math.random(),
            type: 'success',
            title: 'Deleted',
            message: `Group "${name ?? ''}" has been deleted.`,
            timeout: 3000,
          })
        } catch (err) {
          console.error('Delete failed:', err)
          addToast({
            id: String(Date.now()) + Math.random(),
            type: 'error',
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
      const workbook = new ExcelJS.Workbook()
      const ws = workbook.addWorksheet('User Groups')

      ws.addRow(['#', 'Group Name', 'Group Values', 'Status', 'Created'])

      sortedFiltered.forEach((g, i) => {
        const values = Array.isArray(g.group_values) ? g.group_values.join(', ') : ''
        ws.addRow([
          i + 1, 
          g.group_name, 
          values, 
          g.status,
          new Date(g.created_at).toLocaleDateString()
        ])
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
      a.download = `user-groups-${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      addToast({ type: 'error', title: 'Export failed', message: String(err), timeout: 3000 })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">List of User Groups</h1>
          <p className="text-sm text-muted-foreground">Manage user group configurations.</p>
        </div>

        <div>
          <Link href="/setup/user-groups-setup/add" className="inline-flex items-center bg-sky-600 text-white px-4 py-2 rounded-md">
            Add Group
          </Link>
        </div>
      </div>

      <div className="bg-white/5 border rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Search:</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by group name or values"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Status:</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
              <option>All</option>
              <option>Active</option>
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

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm">
              <th className="p-3 text-left">#</th>
              <th 
                className="p-3 text-left cursor-pointer select-none" 
                onClick={() => handleSort('group_name')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSort('group_name')
                }}
              >
                <button className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                  <span className="flex-1 text-left">Group Name</span>
                  <span className="text-xs text-slate-400">
                    {sortKey === 'group_name' ? (sortDirection === 'asc' ? '▲' : '▼') : null}
                  </span>
                </button>
              </th>
              <th 
                className="p-3 text-left cursor-pointer select-none" 
                onClick={() => handleSort('group_values')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSort('group_values')
                }}
              >
                <button className="flex items-center justify-between gap-2 w-full cursor-pointer select-none">
                  <span className="flex-1 text-left">Group Values</span>
                  <span className="text-xs text-slate-400">
                    {sortKey === 'group_values' ? (sortDirection === 'asc' ? '▲' : '▼') : null}
                  </span>
                </button>
              </th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-slate-500">
                  Loading groups...
                </td>
              </tr>
            )}
            {!loading && sortedFiltered.map((g, idx) => (
              <tr key={g.id} className="border-t even:bg-white/2">
                <td className="p-3 text-sm w-12">{idx + 1}</td>
                <td className="p-3 text-sm font-medium">{g.group_name}</td>
                <td className="p-3 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(g.group_values) ? g.group_values.map((value, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-100 text-slate-700"
                      >
                        {value}
                      </span>
                    )) : (
                      <span className="text-slate-400">No values</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      g.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {g.status}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditClick(g)}
                      className="text-sky-600 cursor-pointer hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      className="text-red-600 cursor-pointer hover:underline" 
                      onClick={() => handleDelete(g.id, g.group_name)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && sortedFiltered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-slate-500">
                  No groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toast notifications */}
      {toasts.length > 0 && (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
          {toasts.map((t: Toast) => (
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
        if ((t.type === 'success' || t.type === 'error' || t.type === 'info') && t.timeout) {
          setTimeout(() => removeToast(t.id), t.timeout)
        }
        return null
      })}

      <div className="mt-6 text-center text-sm text-slate-500">© 2025 CAM powered by Goolean Technologies NA LLC</div>
    </div>
  )
}
