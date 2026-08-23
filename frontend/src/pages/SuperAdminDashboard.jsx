import { useState, useEffect, useCallback } from 'react';
import { Plus, ExternalLink, Power, Trash2, Building2, ShieldCheck } from 'lucide-react';
import axios from '../api/axios';
import NewVillageWizard from '../components/superadmin/NewVillageWizard';

// Builds a link to a village's public site. In dev (no real subdomain
// support) this uses the ?village= query param the tenant resolver already
// understands; in a real deployment it swaps in the slug as the subdomain.
const villageUrl = (slug) => {
    const { protocol, hostname, port } = window.location;
    const parts = hostname.split('.');
    const isLocalHostLike = hostname === 'localhost' || hostname === '127.0.0.1' || parts[parts.length - 1] === 'localhost';
    if (isLocalHostLike) {
        return `${protocol}//${hostname}${port ? `:${port}` : ''}/?village=${slug}`;
    }
    const rootDomain = parts.length > 2 ? parts.slice(1).join('.') : hostname;
    return `${protocol}//${slug}.${rootDomain}`;
};

const SuperAdminLogin = ({ onLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/super-admin/login', { username, password });
            localStorage.setItem('superAdminToken', res.data.token);
            onLoggedIn(res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-sm space-y-4">
                <div className="text-center space-y-1">
                    <ShieldCheck className="w-8 h-8 text-primary-500 mx-auto" />
                    <h1 className="font-bold text-lg text-gray-900">Platform Super Admin</h1>
                    <p className="text-xs text-gray-400">Manage villages across the whole platform</p>
                </div>
                <input
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button disabled={loading} className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm">
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </div>
    );
};

const SuperAdminDashboard = () => {
    const [saToken, setSaToken] = useState(() => localStorage.getItem('superAdminToken'));
    const [villages, setVillages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);

    const authHeaders = { headers: { Authorization: `Bearer ${saToken}` } };

    const fetchVillages = useCallback(async () => {
        if (!saToken) return;
        setLoading(true);
        try {
            const res = await axios.get('/super-admin/villages', authHeaders);
            setVillages(res.data);
        } catch {
            // token likely invalid/expired
            localStorage.removeItem('superAdminToken');
            setSaToken(null);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saToken]);

    useEffect(() => { fetchVillages(); }, [fetchVillages]);

    const toggleActive = async (village) => {
        await axios.put(`/super-admin/villages/${village.id}`, {
            slug: village.slug, name: village.name, is_active: village.is_active ? 0 : 1
        }, authHeaders);
        fetchVillages();
    };

    const deleteVillage = async (village) => {
        if (!confirm(`Permanently delete "${village.name}" and all of its data? This cannot be undone.`)) return;
        await axios.delete(`/super-admin/villages/${village.id}`, authHeaders);
        fetchVillages();
    };

    const logout = () => {
        localStorage.removeItem('superAdminToken');
        setSaToken(null);
    };

    if (!saToken) return <SuperAdminLogin onLoggedIn={setSaToken} />;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary-500" /> Platform Villages
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Create and manage every village site on this platform</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowWizard(true)}
                            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-xl text-sm"
                        >
                            <Plus className="w-4 h-4" /> New Village
                        </button>
                        <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2">Log out</button>
                    </div>
                </div>

                {loading && <p className="text-sm text-gray-400">Loading…</p>}

                {!loading && villages.length === 0 && (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No villages yet</p>
                        <p className="text-sm mt-1">Create the first village site to get started</p>
                    </div>
                )}

                <div className="space-y-3">
                    {villages.map(village => (
                        <div key={village.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                <Building2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{village.name}</p>
                                    <p className="text-xs text-gray-400">{village.slug} · {[village.taluka, village.district].filter(Boolean).join(', ') || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${village.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {village.is_active ? 'active' : 'inactive'}
                                </span>
                                <button onClick={() => toggleActive(village)} title={village.is_active ? 'Deactivate' : 'Activate'} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                                    <Power className="w-4 h-4" />
                                </button>
                                <a href={villageUrl(village.slug)} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Visit site">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button onClick={() => deleteVillage(village)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showWizard && (
                <NewVillageWizard
                    saToken={saToken}
                    villageUrl={villageUrl}
                    onCreated={fetchVillages}
                    onClose={() => setShowWizard(false)}
                />
            )}
        </div>
    );
};

export default SuperAdminDashboard;
