<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Census extends Model
{
    protected $table = 'census';

    protected $fillable = [
        'village_id',
        'category',
        'total',
        'male',
        'female',
    ];

    protected $casts = [
        'total' => 'integer',
        'male' => 'integer',
        'female' => 'integer',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }
}
