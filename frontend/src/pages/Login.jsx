import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import axios from '../api/axios';
import { useVillage } from '../context/VillageContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const [role, setRole]   = useState('user');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { villageSlug, switchVillage } = useVillage();

    const [villages, setVillages] = useState(null);
    useEffect(() => {
        axios.get('/villages').then(res => setVillages(res.data)).catch(() => setVillages([]));
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const username = usernameRef.current?.value || '';
        const password = passwordRef.current?.value || '';

        try {
            const response = await axios.post('/auth/login', { username, password, role });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role || role);

            // Notify AuthContext (and anything else listening) in the same tab
            window.dispatchEvent(new Event('auth-change'));

            navigate('/');
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-primary-600">Login / Register</h1>

                {/* Village selector — which village site you're signing into */}
                <div className="mb-5">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="village-select">Village</label>
                    {villages === null ? (
                        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ) : (
                        <select
                            id="village-select"
                            value={villageSlug || ''}
                            onChange={(e) => switchVillage(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                        >
                            {!villages.some(v => v.slug === villageSlug) && villageSlug && (
                                <option value={villageSlug}>{villageSlug}</option>
                            )}
                            {villages.map(v => (
                                <option key={v.slug} value={v.slug}>
                                    {v.name}{v.district ? ` — ${v.district}` : ''}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Role toggle */}
                <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setRole('user')}
                        className={`flex-1 py-2 rounded-md transition-all ${role === 'user' ? 'bg-white shadow-sm text-primary-600 font-bold' : 'text-gray-500'}`}
                    >
                        User
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`flex-1 py-2 rounded-md transition-all ${role === 'admin' ? 'bg-white shadow-sm text-primary-600 font-bold' : 'text-gray-500'}`}
                    >
                        Admin
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                        <Input
                            ref={usernameRef}
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
                            defaultValue=""
                            autoComplete="username"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                        <Input
                            ref={passwordRef}
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            defaultValue=""
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <Button type="submit" className="bg-primary-500 hover:bg-primary-600">
                        Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Don't have an account?{' '}
                    <a href="/register" className="text-primary-600 font-semibold hover:underline">Register here</a>
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <Link to="/super-admin" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Platform Super Admin login
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Login;
