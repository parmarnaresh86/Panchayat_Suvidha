<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EducationRecord extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'module_id',
        'record_data',
    ];

    protected $casts = [
        'record_data' => 'array',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(EducationModule::class, 'module_id', 'module_id');
    }
}
