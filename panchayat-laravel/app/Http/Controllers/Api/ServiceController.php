<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::with('items')->orderBy('display_order')->get();

        $result = $services->map(function ($service) {
            return [
                'id' => $service->id,
                'title' => $service->title,
                'guTitle' => $service->gu_title,
                'cardTo' => $service->card_to,
                'items' => $service->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'label' => $item->label,
                        'to' => $item->to_path,
                        'department' => $item->department,
                        'eligibility' => $item->eligibility,
                        'description' => $item->description,
                        'documents' => $item->documents ?? [],
                        'procedure' => $item->procedure,
                        'fees' => $item->fees,
                        'contact' => $item->contact,
                        'helpline' => $item->helpline,
                        'officialLink' => $item->official_link,
                    ];
                })->toArray(),
            ];
        });

        return response()->json($result);
    }

    public function update(Request $request)
    {
        $services = $request->input('services', $request->all());
        
        if (!is_array($services)) {
            return response()->json(['error' => 'Invalid services data'], 400);
        }

        DB::transaction(function () use ($services) {
            // Delete all existing services and items
            Service::query()->delete();

            // Insert new services and items
            foreach ($services as $index => $service) {
                $newService = Service::create([
                    'id' => $service['id'],
                    'title' => $service['title'],
                    'gu_title' => $service['guTitle'] ?? '',
                    'card_to' => $service['cardTo'] ?? '',
                    'display_order' => $index,
                ]);

                if (isset($service['items']) && is_array($service['items'])) {
                    foreach ($service['items'] as $itemIndex => $item) {
                        ServiceItem::create([
                            'id' => $item['id'],
                            'service_id' => $newService->id,
                            'label' => $item['label'] ?? '',
                            'to_path' => $item['to'] ?? '',
                            'department' => $item['department'] ?? '',
                            'eligibility' => $item['eligibility'] ?? '',
                            'description' => $item['description'] ?? '',
                            'documents' => $item['documents'] ?? [],
                            'procedure' => $item['procedure'] ?? '',
                            'fees' => $item['fees'] ?? '',
                            'contact' => $item['contact'] ?? '',
                            'helpline' => $item['helpline'] ?? '',
                            'official_link' => $item['officialLink'] ?? '',
                            'display_order' => $itemIndex,
                        ]);
                    }
                }
            }
        });

        return response()->json(['message' => 'Services updated successfully']);
    }
}
