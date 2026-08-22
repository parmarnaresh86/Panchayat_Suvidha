<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PanchayatMember;
use App\Models\Village;
use Illuminate\Http\Request;

class PanchayatController extends Controller
{
    public function index()
    {
        $village = Village::first();
        
        if (!$village) {
            return response()->json($this->getFallbackData());
        }

        $members = PanchayatMember::where('village_id', $village->id)->get();

        if ($members->isEmpty()) {
            return response()->json($this->getFallbackData());
        }

        return response()->json($members);
    }

    public function addMember(Request $request)
    {
        $request->validate([
            'role' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'photo_url' => 'nullable|string',
        ]);

        $village = Village::firstOrFail();

        // Enforce 3-member limit
        $count = PanchayatMember::where('village_id', $village->id)->count();
        if ($count >= 3) {
            return response()->json(['error' => 'Maximum 3 members allowed'], 400);
        }

        $member = PanchayatMember::create([
            'village_id' => $village->id,
            'role' => $request->role,
            'name' => $request->name,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'address' => $request->address,
            'description' => $request->description,
            'photo_url' => $request->photo_url,
        ]);

        return response()->json([
            'message' => 'Member added',
            'id' => $member->id,
        ]);
    }

    public function updateMember(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'role' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'photo_url' => 'nullable|string',
        ]);

        $member = PanchayatMember::findOrFail($request->id);
        $member->update($request->except('id'));

        return response()->json(['message' => 'Member updated successfully']);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'memberId' => 'required|integer',
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $member = PanchayatMember::findOrFail($request->memberId);

        $path = $request->file('photo')->store('uploads', 'public');
        $photoUrl = url('storage/' . $path);

        $member->update(['photo_url' => $photoUrl]);

        return response()->json([
            'message' => 'Member photo uploaded',
            'photo_url' => $photoUrl,
        ]);
    }

    private function getFallbackData()
    {
        return [
            [
                'id' => 1,
                'village_id' => 1,
                'role' => 'Sarpanch',
                'name' => 'John Doe',
                'email' => 'sarpanch@example.com',
                'mobile' => '1234567890',
                'address' => '123, Village Main Road',
                'description' => 'Elected Sarpanch of the village.',
                'photo_url' => ''
            ],
        ];
    }
}
