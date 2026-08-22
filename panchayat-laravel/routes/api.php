<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VillageController;
use App\Http\Controllers\Api\CensusController;
use App\Http\Controllers\Api\PanchayatController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\EducationModuleController;
use App\Http\Controllers\Api\EmploymentModuleController;
use App\Http\Controllers\Api\FacilitiesModuleController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PageContentController;
use App\Http\Controllers\Api\ContactController;
use Illuminate\Support\Facades\Route;

// Public routes - No authentication required
Route::get('/village', [VillageController::class, 'show']);
Route::get('/census', [CensusController::class, 'index']);
Route::get('/panchayat', [PanchayatController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);

// Education module routes (public)
Route::get('/education/modules/{moduleId}', [EducationModuleController::class, 'show']);
Route::get('/education/primary-school', [EducationModuleController::class, 'primarySchool']);

// Employment module routes (public)
Route::get('/employment/modules/{moduleId}', [EmploymentModuleController::class, 'show']);

// Facilities module routes (public)
Route::get('/facilities/modules/{moduleId}', [FacilitiesModuleController::class, 'show']);

// Page builder routes (public read)
Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{slug}', [PageController::class, 'show']);

// Page content routes (public read)
Route::get('/page-content/{pageName}', [PageContentController::class, 'show']);

// Contact routes (public)
Route::get('/contact/info', [ContactController::class, 'info']);
Route::post('/contact/message', [ContactController::class, 'submitMessage']);

// Authentication routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/login', [AuthController::class, 'legacyLogin']); // Legacy compatibility

// Protected routes - Require authentication with Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    // Admin-only routes
    Route::middleware('admin')->group(function () {
        
        // Village management
        Route::post('/village/update', [VillageController::class, 'update']);
        Route::post('/village/upload-image', [VillageController::class, 'uploadImage']);
        Route::delete('/village/image/{id}', [VillageController::class, 'deleteImage']);
        
        // Census management
        Route::post('/census/add', [CensusController::class, 'store']);
        Route::post('/census/update', [CensusController::class, 'update']);
        Route::delete('/census/{id}', [CensusController::class, 'destroy']);
        
        // Panchayat member management
        Route::post('/panchayat/member/add', [PanchayatController::class, 'addMember']);
        Route::post('/panchayat/member/update', [PanchayatController::class, 'updateMember']);
        Route::post('/panchayat/member/upload-photo', [PanchayatController::class, 'uploadPhoto']);
        
        // Services management
        Route::post('/services/update', [ServiceController::class, 'update']);
        
        // Education module management
        Route::post('/education/modules/{moduleId}/update', [EducationModuleController::class, 'update']);
        Route::post('/education/modules/{moduleId}/upload-photo', [EducationModuleController::class, 'uploadPhoto']);
        Route::post('/education/primary-school/update', [EducationModuleController::class, 'updatePrimarySchool']);
        Route::post('/education/primary-school/upload-photo', [EducationModuleController::class, 'uploadPrimarySchoolPhoto']);
        
        // Employment module management
        Route::post('/employment/modules/{moduleId}/update', [EmploymentModuleController::class, 'update']);
        Route::post('/employment/modules/{moduleId}/upload-file', [EmploymentModuleController::class, 'uploadFile']);
        
        // Facilities module management
        Route::post('/facilities/modules/{moduleId}/update', [FacilitiesModuleController::class, 'update']);
        
        // Page builder management
        Route::post('/pages', [PageController::class, 'store']);
        Route::put('/pages/{id}', [PageController::class, 'update']);
        Route::delete('/pages/{id}', [PageController::class, 'destroy']);
        
        // Page content management
        Route::put('/page-content/{pageName}', [PageContentController::class, 'update']);
        
        // Contact management
        Route::put('/contact/info', [ContactController::class, 'updateInfo']);
        Route::get('/contact/messages', [ContactController::class, 'messages']);
        Route::put('/contact/messages/{id}/read', [ContactController::class, 'markAsRead']);
        Route::delete('/contact/messages/{id}', [ContactController::class, 'deleteMessage']);
    });
});
