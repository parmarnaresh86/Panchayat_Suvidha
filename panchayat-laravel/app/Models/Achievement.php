<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Achievement extends Model
{
    protected $fillable = [
        'village_id',
        'title',
        'awarded_by',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }
}
