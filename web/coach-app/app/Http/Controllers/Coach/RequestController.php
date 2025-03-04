<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    public function index()
    {
        // You'll need to create a CoachingRequest model to handle this properly
        $requests = auth()->user()->coachProfile->coachingRequests ?? collect([]);
        return view('coach.requests.index', compact('requests'));
    }
} 