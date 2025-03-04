<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Coach\AvailabilityController;

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

    Route::middleware(['auth:sanctum', 'verified', 'coach'])->prefix('coach')->name('coach.')->group(function () {
        Route::get('/availability', [AvailabilityController::class, 'index'])->name('availability.index');
        Route::post('/availability', [AvailabilityController::class, 'store'])->name('availability.store');
        Route::delete('/availability/{availability}', [AvailabilityController::class, 'destroy'])->name('availability.destroy');
    });
});
