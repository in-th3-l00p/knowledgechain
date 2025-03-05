<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CoachExploreController;
use Illuminate\Support\Facades\Http;
use OpenAI\Laravel\Facades\OpenAI;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/conversations/{conversation}/messages', [ChatController::class, 'getMessages']);
Route::post('/coaches/ai-match', [CoachExploreController::class, 'aiMatch'])
    ->name('api.coaches.ai-match');
