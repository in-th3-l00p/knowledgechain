<?php

namespace App\Http\Controllers\Coach;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AvailabilityController extends Controller
{
    public function index()
    {
        // Get the coach profile for the current user
        $coachProfile = auth()->user()->coachProfile;
        
        if (!$coachProfile) {
            return redirect()->route('dashboard')
                ->with('error', 'You need to complete your coach profile first.');
        }
        
        // Get availabilities through the coach profile
        $availabilities = $coachProfile->availabilities()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
        
        return view('coach.availability.index', [
            'availabilities' => $availabilities,
        ]);
    }

    public function store(Request $request)
    {
        $coachProfile = auth()->user()->coachProfile;
        
        if (!$coachProfile) {
            return redirect()->route('dashboard')
                ->with('error', 'You need to complete your coach profile first.');
        }
        
        $validated = $request->validate([
            'day_of_week' => 'required|integer|between:0,6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $coachProfile->availabilities()->create([
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
        ]);

        return redirect()->route('coach.availability.index')
            ->with('success', 'Availability slot added successfully.');
    }

    public function destroy(Availability $availability)
    {
        // Check if the availability belongs to the authenticated coach
        if ($availability->coach_id !== auth()->user()->coachProfile->id) {
            return redirect()->route('coach.availability.index')
                ->with('error', 'You are not authorized to delete this availability slot.');
        }

        $availability->delete();

        return redirect()->route('coach.availability.index')
            ->with('success', 'Availability slot removed successfully.');
    }
} 