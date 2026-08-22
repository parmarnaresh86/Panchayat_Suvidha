<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    protected $fillable = [
        'page_name',
        'content_json',
    ];

    protected $casts = [
        'content_json' => 'array',
    ];
}
