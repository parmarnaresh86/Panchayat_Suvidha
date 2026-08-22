<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:6',
            'email' => 'nullable|email|max:255',
            'role' => 'nullable|string|in:user,admin',
            'adminSecret' => 'nullable|string',
        ]);

        $role = 'user';
        if ($request->role === 'admin') {
            if ($request->adminSecret !== env('ADMIN_REGISTRATION_SECRET', 'admin-secret')) {
                return response()->json(['message' => 'Invalid admin registration secret.'], 403);
            }
            $role = 'admin';
        }

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'email' => $request->email,
            'role' => $role,
        ]);

        return response()->json([
            'message' => ($role === 'admin' ? 'Admin' : 'User') . ' registered successfully'
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'role' => 'nullable|string|in:user,admin',
        ]);

        $adminUsername = env('ADMIN_USERNAME', 'admin');
        $adminPassword = env('ADMIN_PASSWORD', 'password');

        // Check env-based admin credentials first (matches Node.js backend behavior)
        if ($request->role === 'admin' &&
            $request->username === $adminUsername &&
            $request->password === $adminPassword) {
            return response()->json([
                'token' => 'admin-dummy-token',
                'role' => 'admin',
                'user' => ['username' => $adminUsername],
            ]);
        }

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Check if user exists to give a better error message
            if ($user) {
                return response()->json(['message' => 'Incorrect password.'], 401);
            }
            return response()->json(['message' => 'User not found. Please register first.'], 401);
        }

        if ($request->role === 'admin' && $user->role !== 'admin') {
            return response()->json(['message' => 'Invalid admin credentials.'], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'role' => $user->role,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
            ],
        ]);
    }

    public function legacyLogin(Request $request)
    {
        return $this->login($request);
    }
}
