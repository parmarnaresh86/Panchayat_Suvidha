<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploymentModule;
use App\Models\EmploymentRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmploymentModuleController extends Controller
{
    public function show($moduleId)
    {
        $module = EmploymentModule::with('records')
            ->where('module_id', $moduleId)
            ->first();

        if (!$module) {
            return response()->json(['error' => 'Module not found'], 404);
        }

        $result = ['basicInfo' => $module->basic_info];

        // Group records by type
        foreach ($module->records as $record) {
            $type = $record->record_type;
            if (!isset($result[$type])) {
                $result[$type] = [];
            }
            $result[$type][] = $record->record_data;
        }

        // Handle special cases
        if ($moduleId === 'employment-board' && isset($module->basic_info['mgnrega'])) {
            $result['mgnrega'] = $module->basic_info['mgnrega'];
        }

        if ($moduleId === 'market-yard' && isset($module->basic_info['marketInfo'])) {
            $result['marketInfo'] = $module->basic_info['marketInfo'];
        }

        return response()->json($result);
    }

    public function update(Request $request, $moduleId)
    {
        $data = $request->input('data', $request->all());

        DB::transaction(function () use ($moduleId, $data) {
            $module = EmploymentModule::updateOrCreate(
                ['module_id' => $moduleId],
                ['basic_info' => $data['basicInfo'] ?? $data]
            );

            // Delete and re-insert records
            EmploymentRecord::where('module_id', $moduleId)->delete();

            // Insert records based on module type
            if ($moduleId === 'animal-husbandry-and-dairy' && isset($data['livestockDetails'])) {
                foreach ($data['livestockDetails'] as $record) {
                    EmploymentRecord::create([
                        'id' => $record['id'],
                        'module_id' => $moduleId,
                        'record_type' => 'livestockDetails',
                        'record_data' => $record,
                    ]);
                }
            }

            if ($moduleId === 'employment-board') {
                if (isset($data['jobListings'])) {
                    foreach ($data['jobListings'] as $record) {
                        EmploymentRecord::create([
                            'id' => $record['id'],
                            'module_id' => $moduleId,
                            'record_type' => 'jobListings',
                            'record_data' => $record,
                        ]);
                    }
                }
                if (isset($data['governmentJobs'])) {
                    foreach ($data['governmentJobs'] as $record) {
                        EmploymentRecord::create([
                            'id' => $record['id'],
                            'module_id' => $moduleId,
                            'record_type' => 'governmentJobs',
                            'record_data' => $record,
                        ]);
                    }
                }
            }

            if ($moduleId === 'market-yard') {
                $recordTypes = ['cropPrices', 'farmerListings', 'buyersTraders', 'transactions', 'governmentSchemes'];
                foreach ($recordTypes as $recordType) {
                    if (isset($data[$recordType]) && is_array($data[$recordType])) {
                        foreach ($data[$recordType] as $record) {
                            EmploymentRecord::create([
                                'id' => $record['id'],
                                'module_id' => $moduleId,
                                'record_type' => $recordType,
                                'record_data' => $record,
                            ]);
                        }
                    }
                }
            }
        });

        return response()->json(['message' => 'Module updated successfully']);
    }

    public function uploadFile(Request $request, $moduleId)
    {
        $request->validate([
            'file' => 'required|file|max:2048',
        ]);

        $path = $request->file('file')->store('uploads', 'public');
        $fileUrl = url('storage/' . $path);

        return response()->json([
            'message' => 'File uploaded successfully',
            'moduleId' => $moduleId,
            'file_url' => $fileUrl,
        ]);
    }
}
