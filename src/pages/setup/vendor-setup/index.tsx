import Link from '@/components/link'
import React from 'react'
import * as ExcelJS from 'exceljs' // npm install exceljs
import { DownloadCloud } from 'lucide-react'
import { vendors as initialVendors } from '@/lib/setup-data'

export default function VendorSetupPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState('All')

  // local, editable copy of vendors
  const [vendors, setVendors] = React.useState(() => [...initialVendors])

  // sort state: key === null means no sorting
  const [sort, setSort] = React.useState<{ key: string | null; dir: 'asc' | 'desc' | null }>( {
    key: null,
    dir: null,
  } )

  // editing drawer state
  const [editing, setEditing] = React.useState<any | null>(null)

  // simple toast system (confirm + info)
  const [toasts, setToasts] = React.useState<any[]>([])

  const addToast = (t: any) => setToasts(prev => [...prev, { id: String(Date.now()) + Math.random(), ...t }])
  const removeToast = (id: string) => setToasts(prev => prev.filter(x => x.id !== id))

  const columns: { key: string; label: string; sortable?: boolean }[] = [
    { key: 'idx', label: '#' },
    { key: 'name', label: 'Organization Name', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'contact', label: 'Contact', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ]

  // handle header click -> cycle: null -> asc -> desc -> null
  const toggleSort = (key: string) => {
    if (sort.key !== key) {
      setSort({ key, dir: 'asc' })
      return
    }
    if (sort.dir === 'asc') setSort({ key, dir: 'desc' })
    else setSort({ key: null, dir: null })
  }

  const filteredAndSorted = React.useMemo(() => {
    const filtered = vendors.filter(o => {
      const matchesQuery = !query || o.name.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'All' || o.status === status
      return matchesQuery && matchesStatus
    })

    // apply sorting if set
    if (!sort.key || !sort.dir) return filtered

    const key = sort.key
    const dirMul = sort.dir === 'asc' ? 1 : -1

    const sorted = [...filtered].sort((a: any, b: any) => {
      // special idx handling
      if (key === 'idx') return 0

      const va = String(a[key] ?? '')
      const vb = String(b[key] ?? '')

      // numeric compare if both are numbers
      const na = parseFloat(va)
      const nb = parseFloat(vb)
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * dirMul

      // compare status with stable ordering (Active, Pending, Inactive) if needed
      if (key === 'status') {
        const order: Record<string, number> = { Active: 0, Pending: 1, Inactive: 2 }
        const oa = order[va] ?? 99
        const ob = order[vb] ?? 99
        return (oa - ob) * dirMul
      }

      // fallback string compare
      return va.localeCompare(vb) * dirMul
    })

    return sorted
  }, [query, status, sort, vendors])

  // --- actions: edit, warn, delete ---
  const handleEditClick = (item: any) => {
    // Open the same Add Organization form but pass the id in the query
    // so the add page can detect edit mode and prefill fields.
    const id = encodeURIComponent(String(item.id))
    // if your app uses client-side routing, replace with router.push(...)
    window.location.href = `/setup/vendor-setup/add?id=${id}`
  }

  const handleWarn = (id: number) => {
    setVendors(prev => prev.map(v => (v.id === id ? { ...v, status: 'Pending' } : v)))
  }

  // show confirm toast, delete on confirm, then show success toast
  const handleDelete = (id: number, name?: string) => {
    const toastId = String(Date.now()) + Math.random()
    addToast({
      id: toastId,
      type: 'confirm',
      title: 'Delete organization?',
      message: `Delete "${name ?? ''}" permanently?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        setVendors(prev => prev.filter(v => v.id !== id))
        removeToast(toastId)
        // success toast
        const okId = String(Date.now()) + Math.random()
        addToast({
          id: okId,
          type: 'info',
          title: 'Deleted',
          message: `Organization "${name ?? ''}" deleted successfully.`,
          timeout: 3000,
        })
      },
    })
  }

  const handleSaveEdit = (updated: any) => {
    setVendors(prev => prev.map(v => (v.id === updated.id ? { ...v, ...updated } : v)))
    setEditing(null)
  }

  const handleCloseEdit = () => setEditing(null)

  // Export current filtered & sorted rows to .xlsx using exceljs
  const handleExport = async () => {
    try {
      const visibleCols = columns.filter(c => c.key !== 'idx')

      const workbook = new ExcelJS.Workbook()
      const ws = workbook.addWorksheet('Vendors')

      // build header row
      const headerRow = ['#', ...visibleCols.map(c => c.label)]
      ws.addRow(headerRow)

      // add data rows
      filteredAndSorted.forEach((r: any, i: number) => {
        const row = [i + 1, ...visibleCols.map(col => {
          const v = r[col.key]
          return v === undefined || v === null ? '' : v
        })]
        ws.addRow(row)
      })

      // simple styling: bold header + auto width
      const header = ws.getRow(1)
      header.font = { bold: true }
      ws.columns.forEach((col) => {
        const maxLength = (col.values || []).reduce((max: number, val: any) => {
          const l = val ? String(val).length : 0
          return Math.max(max, l)
        }, 10)
        // clamp width
        col.width = Math.min(Math.max(maxLength + 2, 12), 50)
      })

      // write to buffer and trigger download
      const buf = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vendors-${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export to Excel failed', err)
      addToast({ id: String(Date.now()), type: 'info', title: 'Export failed', message: String(err), timeout: 3000 })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* breadcrumb is rendered globally via shared component */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">List of Organizations</h1>
          <p className="text-sm text-muted-foreground">Search and manage organizations.</p>
        </div>

        <div>
          <Link href="/setup/vendor-setup/add" className="inline-flex items-center bg-sky-600 text-white px-4 py-2 rounded-md">
            Add Organization
          </Link>
        </div>
      </div>

      <div className="mt-4 bg-white/5 border rounded-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Search:</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Search by organization name"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Status:</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
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
              title="Export visible rows to Excel"
              aria-label="Export visible rows to Excel"
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
                const arrow = isSorted ? (sort.dir === 'asc' ? '▲' : '▼') : ''
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
                    <div className="inline-flex items-center gap-2">
                      <span>{col.label}</span>
                      {col.sortable && <span className="text-xs text-slate-400">{arrow}</span>}
                    </div>
                  </th>
                )
              })}
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((o, idx) => (
              <tr key={o.id} className="border-t even:bg-white/2">
                <td className="p-3 text-sm">{idx + 1}</td>
                <td className="p-3 text-sm">{o.name}</td>
                <td className="p-3 text-sm">{o.state}</td>
                <td className="p-3 text-sm">{o.email}</td>
                <td className="p-3 text-sm">{o.contact}</td>
                <td className="p-3 text-sm">{o.phone}</td>
                <td className="p-3 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      o.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Link href={`/setup/vendor-setup/edit?id=${encodeURIComponent(String(o.id))}`} className="text-sky-600 hover:underline">
                      Edit
                    </Link>
                    <button type="button" className="text-amber-600 cursor-pointer hover:underline" onClick={() => handleWarn(o.id)}>Warn</button>
                    <button type="button" className="text-red-600 cursor-pointer hover:underline" onClick={() => handleDelete(o.id, o.name)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="p-6 text-center text-sm text-slate-500">
                  No organizations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit drawer/modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="w-full md:w-2/5 bg-white dark:bg-slate-900 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Organization</h3>
              <button onClick={handleCloseEdit} className="text-sm px-2 py-1 border rounded">Close</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm block mb-1">Organization Name</label>
                <input className="w-full border rounded px-3 py-2" value={editing.name} onChange={e => setEditing((s:any)=>({ ...s, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm block mb-1">State</label>
                <input className="w-full border rounded px-3 py-2" value={editing.state} onChange={e => setEditing((s:any)=>({ ...s, state: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm block mb-1">Email</label>
                <input className="w-full border rounded px-3 py-2" value={editing.email} onChange={e => setEditing((s:any)=>({ ...s, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm block mb-1">Contact</label>
                <input className="w-full border rounded px-3 py-2" value={editing.contact} onChange={e => setEditing((s:any)=>({ ...s, contact: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm block mb-1">Phone</label>
                <input className="w-full border rounded px-3 py-2" value={editing.phone} onChange={e => setEditing((s:any)=>({ ...s, phone: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm block mb-1">Status</label>
                <select className="w-full border rounded px-3 py-2" value={editing.status} onChange={e => setEditing((s:any)=>({ ...s, status: e.target.value }))}>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button onClick={handleCloseEdit} className="px-3 py-2 border rounded">Cancel</button>
                <button onClick={() => handleSaveEdit(editing)} className="px-3 py-2 bg-sky-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
          {toasts.map((t: any) => (
            <div
              key={t.id}
              className="w-80 bg-white dark:bg-slate-800 border shadow p-3 rounded"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{t.title}</div>
                  {t.message && <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t.message}</div>}
                </div>
                <div className="ml-3 flex items-start gap-2">
                  {t.type === 'confirm' ? (
                    <>
                      <button
                        onClick={() => { t.onConfirm?.(); }}
                        className="px-3 py-1 text-sm bg-rose-600 text-white rounded"
                      >
                        {t.confirmLabel ?? 'Confirm'}
                      </button>
                      <button
                        onClick={() => removeToast(t.id)}
                        className="px-3 py-1 text-sm border rounded"
                      >
                        {t.cancelLabel ?? 'Cancel'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => removeToast(t.id)}
                      className="px-2 py-1 text-sm border rounded"
                    >
                      OK
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* auto-clear info toasts */}
      {toasts.map(t => {
        if (t.type === 'info' && t.timeout) {
          setTimeout(() => removeToast(t.id), t.timeout)
        }
        return null
      })}

      <div className="mt-6 text-center text-sm text-slate-500">© 2025 CAM powered by Goolean Technologies NA LLC</div>
    </div>
  )
}
