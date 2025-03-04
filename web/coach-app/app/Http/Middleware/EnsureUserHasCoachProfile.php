<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasCoachProfile
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->coachProfile) {
            return redirect()->route('dashboard')
                ->with('error', 'You must complete your coach profile to access this page.');
        }

        return $next($request);
    }
} 