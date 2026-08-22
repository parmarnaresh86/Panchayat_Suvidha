<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpecialPersonality extends Model
{
    protected $fillable = [
        'village_id',
        'name',
        'achievement',
        'role',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }
}
