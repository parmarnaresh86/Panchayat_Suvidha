<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VillageImage extends Model
{
    protected $fillable = [
        'village_id',
        'image_url',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }
}
