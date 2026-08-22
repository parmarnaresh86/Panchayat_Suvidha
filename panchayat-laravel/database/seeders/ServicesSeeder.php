<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing data
        DB::table('service_items')->delete();
        DB::table('services')->delete();

        $services = [
            [
                'id' => 'admin',
                'title' => 'Admin',
                'gu_title' => 'વહીવટ',
                'card_to' => '/services/admin',
                'display_order' => 0,
                'items' => [
                    ['id' => 'gram-panchayat-detail', 'label' => 'ગ્રામપંચાયત વિગત', 'to' => '/panchayat', 'department' => 'પંચાયત વિભાગ', 'description' => 'ગ્રામપંચાયત સંબંધિત માહિતી માટે.'],
                    ['id' => 'sarpanch-gps', 'label' => 'સરપંચ (GPS)', 'to' => '/services/admin/sarpanch-gps', 'department' => 'પંચાયત વિભાગ'],
                    ['id' => 'form-download-center', 'label' => 'ફોર્મ ડાઉનલોડ સેન્ટર', 'to' => '/services/admin/form-download-center', 'department' => 'પંચાયત વિભાગ'],
                    ['id' => 'staff-attendance', 'label' => 'સ્ટાફ હાજરી', 'to' => '/services/admin/staff-attendance', 'department' => 'પંચાયત વિભાગ', 'description' => 'દૈનિક સ્ટાફ હાજરી ટ્રેક કરો (સરપંચ, સેક્રેટરી, મોડી પ્રવેશ, રિપોર્ટ).']
                ]
            ],
            [
                'id' => 'employment',
                'title' => 'Employment',
                'gu_title' => 'રોજગાર',
                'card_to' => '/services/employment',
                'display_order' => 1,
                'items' => [
                    ['id' => 'animal-husbandry-and-dairy', 'label' => 'પશુપાલન અને ડેરી', 'to' => '/services/employment/animal-husbandry-and-dairy', 'department' => 'પશુપાલન અને ડેરી વિભાગ'],
                    ['id' => 'employment-board', 'label' => 'રોજગાર બોર્ડ', 'to' => '/services/employment/employment-board', 'department' => 'રોજગાર વિભાગ'],
                    ['id' => 'market-yard', 'label' => 'માર્કેટ યર્ડ', 'to' => '/services/employment/market-yard', 'department' => 'કૃષિ બજાર/માર્કેટ યાર્ડ']
                ]
            ],
            [
                'id' => 'facilities',
                'title' => 'Facilities',
                'gu_title' => 'સુવિધાઓ',
                'card_to' => '/services/facilities',
                'display_order' => 2,
                'items' => [
                    ['id' => 'pgvcl-electric-service', 'label' => 'PGVCL વીજ સેવા', 'to' => '/services/facilities/pgvcl-electric-service', 'department' => 'વિજળી વિભાગ (PGVCL)'],
                    ['id' => 'st-bus-timetable', 'label' => 'એસ.ટી. બસ સમયપત્રક', 'to' => '/services/facilities/st-bus-timetable', 'department' => 'એસ.ટી. વિભાગ'],
                    ['id' => 'water-supply', 'label' => 'પાણી પુરવઠો', 'to' => '/services/facilities/water-supply', 'department' => 'પાણી પુરવઠો વિભાગ'],
                    ['id' => 'health-center', 'label' => 'આરોગ્ય કેન્દ્ર', 'to' => '/services/facilities/health-center', 'department' => 'આરોગ્ય વિભાગ']
                ]
            ],
            [
                'id' => 'education',
                'title' => 'Education',
                'gu_title' => 'શિક્ષણ',
                'card_to' => '/services/education',
                'display_order' => 3,
                'items' => [
                    ['id' => 'primary-school', 'label' => 'પ્રાથમિક શાળા', 'to' => '/services/education/primary-school', 'department' => 'શિક્ષણ વિભાગ'],
                    ['id' => 'anganwadi', 'label' => 'આંગણવાડી', 'to' => '/services/education/anganwadi', 'department' => 'આંગણવાડી વિભાગ'],
                    ['id' => 'library', 'label' => 'લાઇબ્રેરી', 'to' => '/services/education/library', 'department' => 'લાઇબ્રેરી/શિક્ષણ વિભાગ']
                ]
            ]
        ];

        foreach ($services as $service) {
            DB::table('services')->insert([
                'id' => $service['id'],
                'title' => $service['title'],
                'gu_title' => $service['gu_title'],
                'card_to' => $service['card_to'],
                'display_order' => $service['display_order'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($service['items'] as $index => $item) {
                DB::table('service_items')->insert([
                    'id' => $item['id'],
                    'service_id' => $service['id'],
                    'label' => $item['label'],
                    'to_path' => $item['to'],
                    'department' => $item['department'],
                    'eligibility' => $item['eligibility'] ?? '',
                    'description' => $item['description'] ?? '',
                    'documents' => json_encode([]),
                    'procedure' => $item['procedure'] ?? '',
                    'fees' => $item['fees'] ?? '',
                    'contact' => $item['contact'] ?? '',
                    'helpline' => $item['helpline'] ?? '',
                    'official_link' => $item['officialLink'] ?? '',
                    'display_order' => $index,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Services seeded successfully!');
    }
}
