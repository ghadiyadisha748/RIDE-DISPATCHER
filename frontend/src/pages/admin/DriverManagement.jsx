import { useState } from 'react';
import { LayoutDashboard, Users, Car, DollarSign, MessageSquare, BarChart3, Activity, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
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

const GRADE_COLORS = { A:'text-success-500 bg-success-500/10 border-success-500/20', B:'text-brand-400 bg-brand-500/10 border-brand-500/20', C:'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', D:'text-accent-500 bg-accent-500/10 border-accent-500/20', F:'text-danger-500 bg-danger-500/10 border-danger-500/20' };

const MOCK_DRIVERS = [
  { id: 'd1', name: 'Ramesh Tadvi',   city: 'Surat',     rating: 4.8, rides: 76, completion: 97.4, grade: 'A', vehicle: 'Maruti Swift GJ-05-AB-1234',  status: 'verified', vehicle_type: 'cab'   },
  { id: 'd2', name: 'Suresh Baraiya', city: 'Surat',     rating: 4.5, rides: 52, completion: 92.3, grade: 'B', vehicle: 'Honda Activa GJ-05-CD-5678',  status: 'pending',  vehicle_type: 'bike'  },
  { id: 'd3', name: 'Pratik Gamit',   city: 'Ahmedabad', rating: 4.6, rides: 63, completion: 95.0, grade: 'A', vehicle: 'Bajaj RE GJ-01-EF-9012',       status: 'verified', vehicle_type: 'auto'  },
  { id: 'd4', name: 'Nilesh Vasava',  city: 'Vadodara',  rating: 3.9, rides: 28, completion: 85.7, grade: 'C', vehicle: 'Toyota Innova GJ-07-GH-3456', status: 'verified', vehicle_type: 'premium' },
];

export default function DriverManagement() {
  const [drivers, setDrivers] = useState(MOCK_DRIVERS);
  const [filter, setFilter]   = useState('all');
  const [modal, setModal]     = useState(null); // { driver, action }
  const [reason, setReason]   = useState('');

  const filtered = filter === 'all' ? drivers : drivers.filter(d => d.status === filter);

  const verify = async (driverId, action) => {
    try {
      await adminService.verifyDriver(driverId, { status: action === 'approve' ? 'verified' : 'rejected', reason });
      setDrivers(all => all.map(d => d.id === driverId ? { ...d, status: action === 'approve' ? 'verified' : 'rejected' } : d));
      toast.success(action === 'approve' ? 'Driver approved ✅' : 'Driver rejected');
      setModal(null); setReason('');
    } catch { toast.error('Action failed'); }
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold text-white">Driver Management</h1>
            <div className="flex gap-2">
              {['all','pending','verified','rejected'].map(f => (
                <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)}
                  className={`btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost border border-dark-border'} capitalize`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Pending queue */}
          {filter !== 'verified' && drivers.filter(d => d.status === 'pending').length > 0 && (
            <div className="card border-yellow-500/20 p-1">
              <div className="p-3 flex items-center gap-2 text-sm text-yellow-400 font-semibold">
                <Clock className="w-4 h-4" /> Pending Verification ({drivers.filter(d => d.status === 'pending').length})
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-border bg-dark-card">
                    {['Driver', 'City', 'Vehicle', 'Rating', 'Rides', 'Completion', 'AI Grade', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filtered.map(d => (
                    <tr key={d.id} className="hover:bg-dark-card transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">{d.name.charAt(0)}</div>
                          <span className="font-semibold text-white whitespace-nowrap">{d.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{d.city}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{d.vehicle}</td>
                      <td className="py-3 px-4"><span className="flex items-center gap-1 text-yellow-400 font-semibold"><Star className="w-3.5 h-3.5 fill-yellow-400" /> {d.rating}</span></td>
                      <td className="py-3 px-4 text-white font-semibold">{d.rides}</td>
                      <td className="py-3 px-4 text-gray-300">{d.completion}%</td>
                      <td className="py-3 px-4">
                        <span className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-sm ${GRADE_COLORS[d.grade]}`}>{d.grade}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${d.status === 'verified' ? 'badge-success' : d.status === 'pending' ? 'badge-warning' : 'badge-danger'} capitalize`}>{d.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        {d.status === 'pending' && (
                          <div className="flex gap-1">
                            <button id={`approve-${d.id}`} onClick={() => verify(d.id, 'approve')} className="p-1.5 rounded-lg bg-success-500/10 text-success-500 hover:bg-success-500/20"><CheckCircle className="w-4 h-4" /></button>
                            <button id={`reject-${d.id}`}  onClick={() => setModal({ driver: d, action: 'reject' })} className="p-1.5 rounded-lg bg-danger-500/10 text-danger-500 hover:bg-danger-500/20"><XCircle className="w-4 h-4" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Reject modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card p-6 w-full max-w-md animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-2">Reject Driver</h3>
            <p className="text-gray-400 text-sm mb-4">Provide a reason for rejecting <strong className="text-white">{modal.driver.name}</strong>:</p>
            <textarea className="input min-h-[80px] resize-none mb-4" placeholder="e.g. Incomplete documents…" value={reason} onChange={e => setReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setReason(''); }} className="flex-1 btn-ghost btn-md">Cancel</button>
              <button id="confirm-reject" onClick={() => verify(modal.driver.id, 'reject')} className="flex-1 btn-danger btn-md">Reject Driver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
