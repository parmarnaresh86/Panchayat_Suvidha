<?php

use Illuminate\Support\Facades\Route;

// Serve React app for all routes except /api
Route::get('/{any}', function () {
    $indexPath = public_path('app/index.html');
    
    if (file_exists($indexPath)) {
        return file_get_contents($indexPath);
    }
    
    return response()->json([
        'message' => 'React app not built yet. Run: cd frontend && npm run build'
    ], 404);
})->where('any', '^(?!api).*$');
