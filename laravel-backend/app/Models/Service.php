<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'title',
        'gu_title',
        'card_to',
        'display_order',
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ServiceItem::class, 'service_id', 'id');
    }
}
