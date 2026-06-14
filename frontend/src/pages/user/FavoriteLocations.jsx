import { useState, useEffect } from 'react';
import { LayoutDashboard, Car, History, Heart, User, Plus, Trash2, MapPin, Home, Briefcase } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import { userService } from '../../services/userService';
import { searchPlace } from '../../services/mapService';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Car,             label: 'Book Ride', path: '/book' },
  { icon: History,         label: 'My Rides',  path: '/rides' },
  { icon: Heart,           label: 'Favorites', path: '/favorites' },
  { icon: User,            label: 'Profile',   path: '/profile' },
];
const LABEL_ICONS = { home: '🏠', work: '💼', other: '📍' };

export default function FavoriteLocations() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState([]);
  const [newFav, setNewFav]       = useState({ label: 'other', name: '', address: '', lat: null, lng: null });
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const load = async () => {
      try { const res = await userService.getFavorites(); setFavorites(res.data.data || []); }
      catch { toast.error('Failed to load favorites'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const searchAddress = async q => {
    setQuery(q);
    if (q.length < 3) { setResults([]); return; }
    const res = await searchPlace(q + ' Surat Gujarat');
    setResults(res.slice(0, 5));
  };

  const selectPlace = p => {
    setNewFav(f => ({ ...f, address: p.name, lat: p.lat, lng: p.lng }));
    setQuery(p.name.split(',').slice(0, 2).join(','));
    setResults([]);
  };

  const saveFav = async () => {
    if (!newFav.address || !newFav.lat) { toast.error('Please select a valid address'); return; }
    setSaving(true);
    try {
      const res = await userService.addFavorite(newFav);
      setFavorites(f => [...f, res.data.data]);
      setShowAdd(false);
      setNewFav({ label: 'other', name: '', address: '', lat: null, lng: null });
      setQuery('');
      toast.success('Location saved!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const deleteFav = async id => {
    try {
      await userService.deleteFavorite(id);
      setFavorites(f => f.filter(fav => fav.id !== id));
      toast.success('Location removed');
    } catch { toast.error('Failed to remove'); }
  };

  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white">Saved Places</h1>
              <p className="text-gray-400 text-sm mt-1">Quick access to your frequent locations</p>
            </div>
            <button id="add-favorite-btn" onClick={() => setShowAdd(true)} className="btn-primary btn-md">
              <Plus className="w-4 h-4" /> Add Place
            </button>
          </div>

          {showAdd && (
            <div className="card p-6 border-brand-500/20 animate-scale-in">
              <h3 className="text-lg font-bold text-white mb-4">Add New Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Label</label>
                  <div className="flex gap-2">
                    {['home','work','other'].map(l => (
                      <button key={l} id={`label-${l}`} onClick={() => setNewFav(f => ({ ...f, label: l }))}
                        className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${newFav.label === l ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-dark-border text-gray-400'}`}>
                        {LABEL_ICONS[l]} {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <label className="label" htmlFor="fav-address">Address</label>
                  <input id="fav-address" className="input" placeholder="Search in Surat…"
                    value={query} onChange={e => searchAddress(e.target.value)} />
                  {results.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 card border border-dark-border overflow-hidden">
                      {results.map(r => (
                        <button key={r.id} onClick={() => selectPlace(r)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-card flex items-start gap-2 border-b border-dark-border last:border-0">
                          <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                          <span className="truncate">{r.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowAdd(false); setQuery(''); }} className="btn-ghost btn-md flex-1">Cancel</button>
                  <button id="save-favorite-btn" onClick={saveFav} disabled={saving} className="btn-primary btn-md flex-1">
                    {saving ? 'Saving…' : 'Save Location'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
            </div>
          ) : favorites.length === 0 ? (
            <div className="card p-12 text-center">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">No saved places</h3>
              <p className="text-gray-500 text-sm">Add your home, office, or frequent destinations for quick booking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map(f => (
                <div key={f.id} className="card-hover p-5 group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{LABEL_ICONS[f.label] || '📍'}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white capitalize">{f.label}</div>
                        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">{f.address}</div>
                      </div>
                    </div>
                    <button id={`delete-fav-${f.id}`} onClick={() => deleteFav(f.id)}
                      className="text-gray-600 hover:text-danger-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
