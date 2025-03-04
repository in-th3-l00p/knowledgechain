<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCoach
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isCoach()) {
            return redirect()->route('dashboard')->with('error', 'You must be a coach to access this page.');
        }

        return $next($request);
    }
} 