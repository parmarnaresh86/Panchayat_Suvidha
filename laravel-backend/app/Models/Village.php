<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Village extends Model
{
    protected $fillable = [
        'name',
        'taluka',
        'district',
        'state',
        'area',
        'total_households',
        'description',
        'history_en',
        'history_gu',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(VillageImage::class);
    }

    public function census(): HasMany
    {
        return $this->hasMany(Census::class);
    }

    public function panchayatMembers(): HasMany
    {
        return $this->hasMany(PanchayatMember::class);
    }

    public function achievements(): HasMany
    {
        return $this->hasMany(Achievement::class);
    }

    public function specialPersonalities(): HasMany
    {
        return $this->hasMany(SpecialPersonality::class);
    }
}
