<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContactController extends Controller
{
    public function info()
    {
        $contactData = [
            'phone' => '+91 12345 67890',
            'email' => 'support@panchayatsuvidha.in',
            'address' => 'Panchayat Office, Sayla',
            'hours' => '9:00 AM - 6:00 PM, Monday - Saturday'
        ];

        if (Storage::disk('local')->exists('contact-info.json')) {
            $contactData = json_decode(Storage::disk('local')->get('contact-info.json'), true);
        }

        return response()->json($contactData);
    }

    public function updateInfo(Request $request)
    {
        $request->validate([
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'hours' => 'nullable|string',
        ]);

        $contactData = [
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'hours' => $request->hours,
        ];

        Storage::disk('local')->put('contact-info.json', json_encode($contactData, JSON_PRETTY_PRINT));

        return response()->json([
            'message' => 'Contact info updated',
            'data' => $contactData,
        ]);
    }

    public function submitMessage(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'email' => 'required|email|max:200',
            'message' => 'required|string',
        ]);

        ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'message' => $request->message,
        ]);

        return response()->json(['message' => 'Message sent successfully']);
    }

    public function messages()
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')->get();

        return response()->json($messages);
    }

    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['is_read' => true]);

        return response()->json(['message' => 'Message marked as read']);
    }

    public function deleteMessage($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json(['message' => 'Message deleted']);
    }
}
