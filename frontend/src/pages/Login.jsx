import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const [role, setRole]   = useState('user');
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            </Card>
        </div>
    );
};

export default Login;
