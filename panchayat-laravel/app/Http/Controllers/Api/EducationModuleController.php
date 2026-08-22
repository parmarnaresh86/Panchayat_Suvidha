<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EducationModule;
use App\Models\EducationRecord;
use App\Models\EducationAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EducationModuleController extends Controller
{
    public function show($moduleId)
    {
        $module = EducationModule::with(['records', 'announcements'])
            ->where('module_id', $moduleId)
            ->first();

        if (!$module) {
            return response()->json(['error' => 'Module not found'], 404);
        }

        return response()->json([
            'basicInfo' => $module->basic_info,
            'records' => $module->records->map(fn($r) => $r->record_data)->toArray(),
            'announcements' => $module->announcements->map(fn($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'date' => $a->date,
                'message' => $a->message,
            ])->toArray(),
            'map' => $module->map_info,
        ]);
    }

    public function update(Request $request, $moduleId)
    {
        $data = $request->input('data', $request->all());

        DB::transaction(function () use ($moduleId, $data) {
            $module = EducationModule::updateOrCreate(
                ['module_id' => $moduleId],
                [
                    'basic_info' => $data['basicInfo'] ?? [],
                    'map_info' => $data['map'] ?? [],
                ]
            );

            // Delete and re-insert records
            EducationRecord::where('module_id', $moduleId)->delete();
            if (isset($data['records']) && is_array($data['records'])) {
                foreach ($data['records'] as $record) {
                    EducationRecord::create([
                        'id' => $record['id'],
                        'module_id' => $moduleId,
                        'record_data' => $record,
                    ]);
                }
            }

            // Delete and re-insert announcements
            EducationAnnouncement::where('module_id', $moduleId)->delete();
            if (isset($data['announcements']) && is_array($data['announcements'])) {
                foreach ($data['announcements'] as $announcement) {
                    EducationAnnouncement::create([
                        'id' => $announcement['id'],
                        'module_id' => $moduleId,
                        'type' => $announcement['type'] ?? '',
                        'date' => $announcement['date'] ?? '',
                        'message' => $announcement['message'] ?? '',
                    ]);
                }
            }
        });

        return response()->json(['message' => 'Module updated successfully']);
    }

    public function uploadPhoto(Request $request, $moduleId)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'recordId' => 'nullable|string',
        ]);

        $path = $request->file('photo')->store('uploads', 'public');
        $photoUrl = url('storage/' . $path);

        return response()->json([
            'message' => 'Photo uploaded successfully',
            'moduleId' => $moduleId,
            'recordId' => $request->recordId,
            'photo_url' => $photoUrl,
        ]);
    }

    public function primarySchool()
    {
        $moduleData = $this->getModuleData('primary-school');
        
        if (!$moduleData) {
            return response()->json(['error' => 'Primary school data not found'], 404);
        }

        return response()->json([
            'basicInfo' => $moduleData['basicInfo'],
            'staff' => $moduleData['records'],
            'announcements' => $moduleData['announcements'],
            'map' => $moduleData['map'],
        ]);
    }

    public function updatePrimarySchool(Request $request)
    {
        $data = $request->input('data', $request->all());
        
        $moduleData = [
            'basicInfo' => $data['basicInfo'] ?? [],
            'records' => $data['staff'] ?? $data['records'] ?? [],
            'announcements' => $data['announcements'] ?? [],
            'map' => $data['map'] ?? [],
        ];

        $this->updateModuleData('primary-school', $moduleData);

        return response()->json(['message' => 'Primary school details updated successfully']);
    }

    public function uploadPrimarySchoolPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'teacherId' => 'nullable|string',
        ]);

        $path = $request->file('photo')->store('uploads', 'public');
        $photoUrl = url('storage/' . $path);

        return response()->json([
            'message' => 'Teacher photo uploaded successfully',
            'teacherId' => $request->teacherId,
            'photo_url' => $photoUrl,
        ]);
    }

    private function getModuleData($moduleId)
    {
        $module = EducationModule::with(['records', 'announcements'])
            ->where('module_id', $moduleId)
            ->first();

        if (!$module) {
            return null;
        }

        return [
            'basicInfo' => $module->basic_info,
            'records' => $module->records->map(fn($r) => $r->record_data)->toArray(),
            'announcements' => $module->announcements->map(fn($a) => [
                'id' => $a->id,
                'type' => $a->type,
                'date' => $a->date,
                'message' => $a->message,
            ])->toArray(),
            'map' => $module->map_info,
        ];
    }

    private function updateModuleData($moduleId, $data)
    {
        DB::transaction(function () use ($moduleId, $data) {
            $module = EducationModule::updateOrCreate(
                ['module_id' => $moduleId],
                [
                    'basic_info' => $data['basicInfo'] ?? [],
                    'map_info' => $data['map'] ?? [],
                ]
            );

            EducationRecord::where('module_id', $moduleId)->delete();
            if (isset($data['records']) && is_array($data['records'])) {
                foreach ($data['records'] as $record) {
                    EducationRecord::create([
                        'id' => $record['id'],
                        'module_id' => $moduleId,
                        'record_data' => $record,
                    ]);
                }
            }

            EducationAnnouncement::where('module_id', $moduleId)->delete();
            if (isset($data['announcements']) && is_array($data['announcements'])) {
                foreach ($data['announcements'] as $announcement) {
                    EducationAnnouncement::create([
                        'id' => $announcement['id'],
                        'module_id' => $moduleId,
                        'type' => $announcement['type'] ?? '',
                        'date' => $announcement['date'] ?? '',
                        'message' => $announcement['message'] ?? '',
                    ]);
                }
            }
        });
    }
}
