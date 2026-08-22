<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Census;
use App\Models\Village;
use Illuminate\Http\Request;

class CensusController extends Controller
{
    public function index()
    {
        $village = Village::first();
        
        if (!$village) {
            return response()->json($this->getFallbackData());
        }

        $census = Census::where('village_id', $village->id)->get();

        if ($census->isEmpty()) {
            return response()->json($this->getFallbackData());
        }

        return response()->json($census);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required|string|max:255',
            'total' => 'required|integer',
            'male' => 'required|integer',
            'female' => 'required|integer',
        ]);

        $village = Village::firstOrFail();

        $census = Census::create([
            'village_id' => $village->id,
            'category' => $request->category,
            'total' => $request->total,
            'male' => $request->male,
            'female' => $request->female,
        ]);

        return response()->json([
            'message' => 'Census added successfully',
            'data' => $census,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'category' => 'required|string|max:255',
            'total' => 'required|integer',
            'male' => 'required|integer',
            'female' => 'required|integer',
        ]);

        $census = Census::findOrFail($request->id);
        $census->update($request->only(['category', 'total', 'male', 'female']));

        return response()->json(['message' => 'Census updated successfully']);
    }

    public function destroy($id)
    {
        $census = Census::findOrFail($id);
        $census->delete();

        return response()->json(['message' => 'Census deleted successfully']);
    }

    private function getFallbackData()
    {
        return [
            ['id' => 1, 'village_id' => 1, 'category' => 'Total Population', 'total' => 10000, 'male' => 5200, 'female' => 4800],
            ['id' => 2, 'village_id' => 1, 'category' => 'Literates', 'total' => 7000, 'male' => 4000, 'female' => 3000],
        ];
    }
}
