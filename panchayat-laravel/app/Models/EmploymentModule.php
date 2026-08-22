<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmploymentModule extends Model
{
    protected $primaryKey = 'module_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'module_id',
        'basic_info',
    ];

    protected $casts = [
        'basic_info' => 'array',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(EmploymentRecord::class, 'module_id', 'module_id');
    }
}
