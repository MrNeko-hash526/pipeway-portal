export type Status = 'Active' | 'Pending' | 'Inactive' | 'Mitigated' | 'Open'

export interface Vendor {
  id: number
  name: string
  state: string
  email: string
  contact: string
  phone: string
  status: Status
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  phone?: string
  status: Status
}

export interface UserGroup {
  id: number
  name: string
  owners: number
  policies: number
  status: Status
}

export interface RiskItem {
  id: number
  title: string
  owner: string
  severity: 'Low' | 'Medium' | 'High'
  status: Status
}

export interface StandardItem {
  id: number
  standard: string
  citations: number
  reviews: number
  status: Status
}

export const vendors: Vendor[] = [
  { id: 1, name: 'Heavner, Beyers & Mihlar, LLC', state: 'IL - Illinois', email: 'heathermiller@hsbattys.com', contact: 'Heather Miller', phone: '2174221719', status: 'Active' },
  { id: 2, name: 'Lyons, Doughty & Veldhuis, P.C.', state: 'NJ - New Jersey', email: 'Paulv@dvlaw.com', contact: 'Paul van Twuyver', phone: '8883223922', status: 'Pending' },
  { id: 3, name: 'VELO Law Office', state: 'MI - Michigan', email: 'NJM@velo.law', contact: 'Neil J Mastellone', phone: '6163330707', status: 'Active' },
  { id: 4, name: 'Pollack & Rosen, PA', state: 'FL - Florida', email: 'Joseb@pollackrosen.com', contact: 'Joseph F Rosen', phone: '3054480006', status: 'Active' },
  { id: 5, name: 'Tsarouhis Law Group LLC', state: 'PA - Pennsylvania', email: 'dht@pacollections.com', contact: 'Demetri Tsarouhis', phone: '8338552808', status: 'Inactive' },
  { id: 6, name: 'Shermeta Law Group, PLLC', state: 'MI - Michigan', email: 'tmckinnon@shermeta.com', contact: 'Tricia N McKinnon', phone: '5868234113', status: 'Active' },
  { id: 7, name: 'Absolute Performance', state: 'CO - Colorado', email: 'ral@absolute-performance.com', contact: 'Rhett Lucero', phone: '7204912646', status: 'Pending' },
  { id: 8, name: 'ZM Consulting', state: 'FL - Florida', email: 'itsupport1@zmconsulting.us', contact: 'Chandrakant Zile', phone: '9511690146', status: 'Inactive' },
  { id: 9, name: 'VRC Companies LLC', state: 'TN - Tennessee', email: 'tclarke@vrcofoh.com', contact: 'Trinity Clarke', phone: '6142992122', status: 'Active' },
  { id: 10, name: 'Varment Guard Wildlife', state: 'OH - Ohio', email: '9lqIsvi2u5fek@clipboard-mailer.plunketts.net', contact: 'Troy Parkinson', phone: '6147948169', status: 'Inactive' },
]

export const users: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', phone: '555-1234', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'User', phone: '555-5678', status: 'Pending' },
  { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'User', phone: '555-8765', status: 'Active' },
  { id: 4, name: 'Dan Lee', email: 'dan@example.com', role: 'Reviewer', phone: '555-2345', status: 'Active' },
]

export const groups: UserGroup[] = [
  { id: 1, name: 'Administrators', owners: 2, policies: 5, status: 'Active' },
  { id: 2, name: 'Editors', owners: 1, policies: 3, status: 'Active' },
  { id: 3, name: 'External Reviewers', owners: 0, policies: 1, status: 'Inactive' },
]

export const risks: RiskItem[] = [
  { id: 1, title: 'Open Risk A', owner: 'Team A', severity: 'High', status: 'Open' },
  { id: 2, title: 'Open Risk B', owner: 'Team B', severity: 'Medium', status: 'Mitigated' },
]

export const standards: StandardItem[] = [
  { id: 1, standard: 'ISO 27001', citations: 12, reviews: 2, status: 'Active' },
  { id: 2, standard: 'NIST CSF', citations: 8, reviews: 1, status: 'Active' },
]

export function computeSnapshots() {
  const vendorCounts = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'Active').length,
    pending: vendors.filter(v => v.status === 'Pending').length,
    inactive: vendors.filter(v => v.status === 'Inactive').length,
  }

  const userCounts = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    pending: users.filter(u => u.status === 'Pending').length,
  }

  const groupCounts = {
    total: groups.length,
    withPolicies: groups.filter(g => g.policies > 0).length,
    noOwners: groups.filter(g => g.owners === 0).length,
  }

  const riskCounts = {
    open: risks.filter(r => r.status === 'Open').length,
    mitigated: risks.filter(r => r.status === 'Mitigated').length,
  }

  const standardsCounts = {
    total: standards.length,
    citations: standards.reduce((s, st) => s + st.citations, 0),
    reviews: standards.reduce((s, st) => s + st.reviews, 0),
  }

  return { vendorCounts, userCounts, groupCounts, riskCounts, standardsCounts }
}
