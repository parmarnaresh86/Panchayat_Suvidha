<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EducationModule extends Model
{
    protected $primaryKey = 'module_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'module_id',
        'basic_info',
        'map_info',
    ];

    protected $casts = [
        'basic_info' => 'array',
        'map_info' => 'array',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(EducationRecord::class, 'module_id', 'module_id');
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(EducationAnnouncement::class, 'module_id', 'module_id');
    }
}
