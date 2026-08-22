<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FacilitiesModule;
use App\Models\FacilitiesRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FacilitiesModuleController extends Controller
{
    public function show($moduleId)
    {
        $module = FacilitiesModule::with('records')
            ->where('module_id', $moduleId)
            ->first();

        if (!$module) {
            return response()->json(['error' => 'Module not found'], 404);
        }

        $result = (array) $module->basic_info;

        // Group records by type
        foreach ($module->records as $record) {
            $type = $record->record_type;
            if (!isset($result[$type])) {
                $result[$type] = [];
            }
            $result[$type][] = $record->record_data;
        }

        return response()->json($result);
    }

    public function update(Request $request, $moduleId)
    {
        $data = $request->input('data', $request->all());

        DB::transaction(function () use ($moduleId, $data) {
            $module = FacilitiesModule::updateOrCreate(
                ['module_id' => $moduleId],
                ['basic_info' => $data]
            );

            // Delete and re-insert records
            FacilitiesRecord::where('module_id', $moduleId)->delete();

            // Insert records based on module type
            if ($moduleId === 'st-bus-timetable' && isset($data['busRoutes'])) {
                foreach ($data['busRoutes'] as $record) {
                    FacilitiesRecord::create([
                        'id' => $record['id'],
                        'module_id' => $moduleId,
                        'record_type' => 'busRoutes',
                        'record_data' => $record,
                    ]);
                }
            }

            if ($moduleId === 'water-supply' && isset($data['supplySchedule'])) {
                foreach ($data['supplySchedule'] as $record) {
                    FacilitiesRecord::create([
                        'id' => $record['id'],
                        'module_id' => $moduleId,
                        'record_type' => 'supplySchedule',
                        'record_data' => $record,
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Module updated successfully']);
    }
}
