import React, { useState } from 'react';
import api from '../api/axios';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [adminSecret, setAdminSecret] = useState('');
    const [registering, setRegistering] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        try {
            await api.post('/auth/register', {
                username,
                password,
                email,
                role,
                adminSecret: role === 'admin' ? adminSecret : undefined
            });
            alert(`${role === 'admin' ? 'Admin' : 'User'} registration successful! Please login.`);
            navigate('/login');
        } catch (error) {
            console.error('Registration error:', error);
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Registration failed.';
            const detail = error.response?.data?.error;
            alert(detail ? `${msg}\n\nDetails: ${detail}` : msg);
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-orange-600">User Registration</h1>
                <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setRole('user')}
                        className={`flex-1 py-2 rounded-md transition-all ${role === 'user' ? 'bg-white shadow-sm text-orange-600 font-bold' : 'text-gray-500'}`}
                        type="button"
                    >
                        User
                    </button>
                    <button 
                        onClick={() => setRole('admin')}
                        className={`flex-1 py-2 rounded-md transition-all ${role === 'admin' ? 'bg-white shadow-sm text-orange-600 font-bold' : 'text-gray-500'}`}
                        type="button"
                    >
                        Admin
                    </button>
                </div>
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {role === 'admin' && (
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="adminSecret">
                                Admin Secret (server set)
                            </label>
                            <Input
                                id="adminSecret"
                                type="password"
                                placeholder="Enter admin registration code"
                                value={adminSecret}
                                onChange={(e) => setAdminSecret(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <Button type="submit" disabled={registering} className="bg-orange-500 hover:bg-orange-600">
                        {registering ? 'Registering...' : 'Register'}
                    </Button>
                </form>
                <p className="mt-6 text-center text-gray-600">
                    Already have an account? <a href="/login" className="text-orange-600 font-semibold hover:underline">Login</a>
                </p>
            </Card>
        </div>
    );
};

export default Register;
