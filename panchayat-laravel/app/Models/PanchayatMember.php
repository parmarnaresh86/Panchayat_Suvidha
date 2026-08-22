<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PanchayatMember extends Model
{
    protected $fillable = [
        'village_id',
        'role',
        'name',
        'email',
        'mobile',
        'address',
        'description',
        'photo_url',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }
}
