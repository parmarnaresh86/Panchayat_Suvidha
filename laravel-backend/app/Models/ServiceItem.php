<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceItem extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'service_id',
        'label',
        'to_path',
        'department',
        'eligibility',
        'description',
        'documents',
        'procedure',
        'fees',
        'contact',
        'helpline',
        'official_link',
        'display_order',
    ];

    protected $casts = [
        'documents' => 'array',
        'display_order' => 'integer',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id', 'id');
    }
}
