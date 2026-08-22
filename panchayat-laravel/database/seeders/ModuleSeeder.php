<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EducationModule;
use App\Models\EmploymentModule;
use App\Models\FacilitiesModule;

class ModuleSeeder extends Seeder
{
    public function run(): void
    {
        $educationModules = ['primary-school', 'anganwadi', 'library'];
        foreach ($educationModules as $id) {
            EducationModule::firstOrCreate(
                ['module_id' => $id],
                ['basic_info' => ['name' => $id], 'map_info' => []]
            );
        }

        $employmentModules = ['animal-husbandry-and-dairy', 'employment-board', 'market-yard'];
        foreach ($employmentModules as $id) {
            EmploymentModule::firstOrCreate(
                ['module_id' => $id],
                ['basic_info' => ['name' => $id]]
            );
        }

        $facilitiesModules = ['pgvcl-electric-service', 'st-bus-timetable', 'water-supply', 'health-center'];
        foreach ($facilitiesModules as $id) {
            FacilitiesModule::firstOrCreate(
                ['module_id' => $id],
                ['basic_info' => ['name' => $id]]
            );
        }

        $this->command->info('All modules seeded.');
    }
}
