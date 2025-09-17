import Link from '@/components/link'
import React from 'react'

const sampleStandards = [
  { id: 1, standard: 'ISO 27001', citations: 12, reviews: 2, status: 'Active' },
  { id: 2, standard: 'NIST CSF', citations: 8, reviews: 1, status: 'Active' },
]

export default function StandardsPage() {
  const [query, setQuery] = React.useState('')
  const [status, setStatus] = React.useState('All')

  const filtered = sampleStandards.filter(u => {
    const matchesQuery = !query || u.standard.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'All' || u.status === status
    return matchesQuery && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <nav className="text-sm text-slate-600 mb-4">
        <Link href="/">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/setup">Setup</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-500">Standards & Citation Management</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Standards & Citation Management</h1>
          <p className="text-sm text-muted-foreground">Manage standards, citations, and reviews.</p>
        </div>

        <div>
          <button className="inline-flex items-center bg-sky-600 text-white px-4 py-2 rounded-md">Add Standard</button>
        </div>
      </div>

      <div className="mt-4 bg-white/5 border rounded-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Search:</label>
            <input value={query} onChange={e => setQuery(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Search" />
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
            <button className="border rounded px-3 py-2 text-sm">Export</button>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Standard</th>
              <th className="p-3 text-left">Citations</th>
              <th className="p-3 text-left">Reviews</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o, idx) => (
              <tr key={o.id} className="border-t even:bg-white/2">
                <td className="p-3 text-sm">{idx + 1}</td>
                <td className="p-3 text-sm">{o.standard}</td>
                <td className="p-3 text-sm">{o.citations}</td>
                <td className="p-3 text-sm">{o.reviews}</td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${o.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{o.status}</span>
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <button className="text-sky-600">Edit</button>
                    <button className="text-red-600">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">© 2025 CAM powered by Goolean Technologies NA LLC</div>
    </div>
  )
}
