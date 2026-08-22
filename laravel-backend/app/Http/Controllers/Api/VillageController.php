<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Village;
use App\Models\VillageImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VillageController extends Controller
{
    public function show()
    {
        $village = Village::with([
            'images' => fn($q) => $q->orderBy('id'),
            'achievements',
            'specialPersonalities'
        ])->first();

        if (!$village) {
            return response()->json($this->getFallbackData());
        }

        return response()->json([
            'id' => $village->id,
            'name' => $village->name,
            'taluka' => $village->taluka,
            'district' => $village->district,
            'state' => $village->state,
            'area' => $village->area,
            'total_households' => $village->total_households,
            'description' => $village->description,
            'images' => $village->images->pluck('image_url')->toArray(),
            'villageImages' => $village->images->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->image_url
            ])->toArray(),
            'achievements' => $village->achievements,
            'special_persons' => $village->specialPersonalities,
            'history' => [
                'english' => $village->history_en,
                'gujarati' => $village->history_gu,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'taluka' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'area' => 'nullable|string|max:100',
            'total_households' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'history_en' => 'nullable|string',
            'history_gu' => 'nullable|string',
        ]);

        $village = Village::firstOrFail();
        $village->update($request->all());

        return response()->json(['message' => 'Village updated successfully']);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $village = Village::firstOrFail();

        $path = $request->file('image')->store('uploads', 'public');
        $imageUrl = url('storage/' . $path);

        $village->images()->create([
            'image_url' => $imageUrl,
        ]);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'imageUrl' => $imageUrl,
        ]);
    }

    public function deleteImage($id)
    {
        $image = VillageImage::findOrFail($id);
        
        // Extract filename from URL and delete from storage
        $filename = basename(parse_url($image->image_url, PHP_URL_PATH));
        Storage::disk('public')->delete('uploads/' . $filename);

        $image->delete();

        return response()->json(['message' => 'Image deleted successfully']);
    }

    private function getFallbackData()
    {
        return [
            'id' => 1,
            'name' => 'sayla',
            'taluka' => 'Sayla',
            'district' => 'Surendranagar',
            'state' => 'Gujarat',
            'area' => '658',
            'total_households' => '165',
            'description' => 'A historical and progressive village located in the Surendranagar district of Gujarat.',
            'images' => [],
            'villageImages' => [],
            'achievements' => [],
            'special_persons' => [],
            'history' => [
                'english' => 'Sayla has a rich history.',
                'gujarati' => 'સાયલા સમૃદ્ધ ઇતિહાસ ધરાવે છે.',
            ],
        ];
    }
}
