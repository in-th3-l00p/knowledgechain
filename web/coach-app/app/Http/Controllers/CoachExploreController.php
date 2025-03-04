<?php

namespace App\Http\Controllers;

use App\Models\CoachProfile;
use Illuminate\Http\Request;

class CoachExploreController extends Controller
{
    public function index(Request $request)
    {
        $coaches = CoachProfile::with('user')
            ->where('is_available', true)
            ->when(auth()->check(), function($query) {
                return $query->where('user_id', '!=', auth()->id());
            })
            ->when($request->has('expertise'), function($query) use ($request) {
                return $query->where('expertise', 'like', '%' . $request->expertise . '%');
            })
            ->when($request->has('industry'), function($query) use ($request) {
                return $query->where('industry', 'like', '%' . $request->industry . '%');
            })
            ->paginate(12);
            
        return view('coaches.explore', compact('coaches'));
    }
    
    public function show($id)
    {
        $coach = CoachProfile::with(['user', 'skills', 'reviews'])->findOrFail($id);
        return view('coaches.show', compact('coach'));
    }
} 