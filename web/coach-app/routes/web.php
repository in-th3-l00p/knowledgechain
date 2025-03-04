<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Coach\AvailabilityController;
use App\Http\Controllers\Coach\RequestController;
use App\Http\Controllers\CoachExploreController;
use App\Http\Controllers\ChatController;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    // Professional information route
    Route::get('/professional-information', \App\Http\Livewire\ProfessionalInformation::class)
        ->name('professional-information');

    // Coach exploration routes
    Route::get('/coaches', [CoachExploreController::class, 'index'])->name('coaches.explore');
    Route::get('/coaches/{coach}', [CoachExploreController::class, 'show'])->name('coaches.show');
    
    // Chat routes
    Route::get('/chats', [ChatController::class, 'index'])->name('chats');
    
    // Coach-specific routes
    Route::middleware(['auth:sanctum', 'verified', 'coach'])->prefix('coach')->name('coach.')->group(function () {
        // Availability routes
        Route::get('/availability', [AvailabilityController::class, 'index'])->name('availability.index');
        Route::post('/availability', [AvailabilityController::class, 'store'])->name('availability.store');
        Route::delete('/availability/{availability}', [AvailabilityController::class, 'destroy'])->name('availability.destroy');
        
        // Coaching requests routes
        Route::get('/requests', [RequestController::class, 'index'])->name('requests');
    });
});
