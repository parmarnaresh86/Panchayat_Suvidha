<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content_json',
        'status',
    ];

    protected $casts = [
        'content_json' => 'array',
    ];
}
