import Link from '@/components/link'
import React from 'react'

const initialGroups = [
  { id: 1, name: 'Class Type', values: 'AACA, Firm, Client' },
  { id: 2, name: 'Department', values: 'Accounting, Compliance, MIS-IT, MBS, Audit' },
  { id: 3, name: 'Third Group', values: 'First Value, Second Value' },
]

export default function UserGroupsSetupPage() {
  const [query, setQuery] = React.useState('')
  const [groups, setGroups] = React.useState(() => [...initialGroups])

  // sorting state
  const [sortKey, setSortKey] = React.useState<'name' | 'values' | null>(null)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')

  const filtered = groups.filter(g => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      String(g.name).toLowerCase().includes(q) ||
      String(g.values).toLowerCase().includes(q)
    )
  })

  // sorting logic
  const sortedFiltered = React.useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      const cmp = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDirection])

  // handle sort click
  const handleSort = (key: 'name' | 'values') => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">List of User Groups</h1>
        </div>

        <div>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition"
            onClick={() => {
              // navigate to add page or open modal — adjust as needed
              window.location.href = '/setup/user-groups-setup/add'
            }}
          >
            Add Group
          </button>
        </div>
      </div>

      <div className="bg-white/5 border rounded-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm text-slate-600 mb-1">Search:</label>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by group name or values"
              className="w-full md:w-64 border rounded px-3 py-2"
            />
          </div>

          <div className="md:col-span-1 flex items-center justify-end">
            {/* Export removed as requested - keep layout column empty */}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm">
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort('name')}>
                Group Name {sortKey === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort('values')}>
                Group Values {sortKey === 'values' && (sortDirection === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {sortedFiltered.map((g, idx) => (
              <tr key={g.id} className="border-t even:bg-white/2">
                <td className="p-3 text-sm w-12">{idx + 1}</td>
                <td className="p-3 text-sm">{g.name}</td>
                <td className="p-3 text-sm">{g.values}</td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-sky-600 hover:underline cursor-pointer"
                      onClick={() => {
                        window.location.href = `/setup/user-groups-setup/edit?id=${g.id}`
                      }}
                      aria-label={`Edit ${g.name}`}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-slate-500">
                  No groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">© 2025 CAM powered by Goolean Technologies NA LLC</div>
    </div>
  )
}
