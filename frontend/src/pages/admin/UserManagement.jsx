import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Car, DollarSign, MessageSquare, BarChart3, Activity, Search, Ban, CheckCircle, Eye } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/admin' },
  { icon: Users,           label: 'Users',       path: '/admin/users' },
  { icon: Car,             label: 'Drivers',     path: '/admin/drivers' },
  { icon: Activity,        label: 'Rides',       path: '/admin/rides' },
  { icon: DollarSign,      label: 'Revenue',     path: '/admin/revenue' },
  { icon: MessageSquare,   label: 'Complaints',  path: '/admin/complaints' },
  { icon: BarChart3,       label: 'Demand AI',   path: '/admin/demand' },
];

const MOCK_USERS = [
  { id: '1', name: 'Arjun Mehta',   email: 'arjun@gmail.com',  phone: '9825000001', city: 'Surat',     role: 'user',   status: 'active',  joined: '2024-01-12', rides: 42 },
  { id: '2', name: 'Priya Shah',    email: 'priya@gmail.com',  phone: '9825000002', city: 'Surat',     role: 'user',   status: 'active',  joined: '2024-02-18', rides: 18 },
  { id: '3', name: 'Ramesh Tadvi',  email: 'ramesh@gmail.com', phone: '9825000003', city: 'Surat',     role: 'driver', status: 'active',  joined: '2024-01-05', rides: 76 },
  { id: '4', name: 'Kiran Joshi',   email: 'kiran@gmail.com',  phone: '9825000004', city: 'Ahmedabad', role: 'user',   status: 'inactive',joined: '2024-03-21', rides: 6 },
  { id: '5', name: 'Sonal Dave',    email: 'sonal@gmail.com',  phone: '9825000005', city: 'Vadodara',  role: 'user',   status: 'active',  joined: '2024-04-01', rides: 29 },
];

export default function UserManagement() {
  const [users, setUsers]   = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [role, setRole]     = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    adminService.getUsers({ search, role: role !== 'all' ? role : undefined, status: status !== 'all' ? status : undefined })
      .then(res => setUsers(res.data.data?.users || MOCK_USERS))
      .catch(() => {});
  }, [search, role, status]);

  const toggleStatus = async (u) => {
    const next = u.status === 'active' ? 'inactive' : 'active';
    try {
      await adminService.updateUserStatus(u.id, { status: next });
      setUsers(all => all.map(x => x.id === u.id ? { ...x, status: next } : x));
      toast.success(`User ${next === 'active' ? 'un' : ''}banned`);
    } catch { toast.error('Action failed'); }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = role === 'all'   || u.role   === role;
    const matchStatus = status === 'all' || u.status === status;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold text-white">User Management</h1>
            <span className="badge badge-brand">{filtered.length} users</span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input id="user-search" className="input pl-9 py-2.5" placeholder="Search name or email…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select id="filter-role"   className="input py-2.5 w-auto" value={role}   onChange={e => setRole(e.target.value)}>
              {['all','user','driver','admin'].map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>)}
            </select>
            <select id="filter-status" className="input py-2.5 w-auto" value={status} onChange={e => setStatus(e.target.value)}>
              {['all','active','inactive'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-border bg-dark-card">
                    {['Name', 'Email', 'Phone', 'City', 'Role', 'Rides', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-dark-card transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-white whitespace-nowrap">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{u.email}</td>
                      <td className="py-3 px-4 text-gray-400">{u.phone}</td>
                      <td className="py-3 px-4 text-gray-400">{u.city}</td>
                      <td className="py-3 px-4"><span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'driver' ? 'badge-brand' : 'badge-muted'} capitalize`}>{u.role}</span></td>
                      <td className="py-3 px-4 text-white font-semibold">{u.rides}</td>
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap">{u.joined}</td>
                      <td className="py-3 px-4"><span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button id={`view-user-${u.id}`} className="p-1.5 rounded-lg hover:bg-dark-muted text-gray-400 hover:text-white"><Eye className="w-4 h-4" /></button>
                          <button id={`toggle-user-${u.id}`} onClick={() => toggleStatus(u)} className="p-1.5 rounded-lg hover:bg-dark-muted text-gray-400 hover:text-danger-500">
                            {u.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
