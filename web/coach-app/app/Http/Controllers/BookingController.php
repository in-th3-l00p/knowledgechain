<?php

namespace App\Http\Controllers;

use App\Models\CoachProfile;
use App\Models\CoachingSession;
use App\Models\Availability;
use Illuminate\Http\Request;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function create($coachId)
    {
        $coach = CoachProfile::with(['user', 'availabilities'])->findOrFail($coachId);
        
        // Check if user is trying to book themselves
        if (auth()->id() == $coach->user_id) {
            return redirect()->route('coaches.show', $coach->id)
                ->with('error', 'You cannot book a session with yourself.');
        }

        // Group availabilities by day of week
        $availabilitiesByDay = $coach->availabilities->groupBy('day_of_week');
        $daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        // Get existing sessions to check for conflicts
        $existingSessions = CoachingSession::where('coach_id', $coachId)
            ->where('status', '!=', 'canceled')
            ->where('start_time', '>', now())
            ->get();
            
        return view('booking.create', compact('coach', 'availabilitiesByDay', 'daysOfWeek', 'existingSessions'));
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'coach_id' => 'required|exists:coach_profiles,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required',
            'duration' => 'required|integer|min:30|max:180',
        ]);
        
        $coach = CoachProfile::findOrFail($validated['coach_id']);
        
        // Check if user is trying to book themselves
        if (auth()->id() == $coach->user_id) {
            return redirect()->route('coaches.show', $coach->id)
                ->with('error', 'You cannot book a session with yourself.');
        }
        
        // Create the start and end times
        $startTime = Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
        $endTime = $startTime->copy()->addMinutes($validated['duration']);
        
        // Remove availability check - allow any time to be selected
        
        // Check for conflicting sessions
        $conflictingSession = CoachingSession::where('coach_id', $coach->id)
            ->where('status', '!=', 'canceled')
            ->where(function($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function($q) use ($startTime, $endTime) {
                          $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                      });
            })
            ->exists();
            
        if ($conflictingSession) {
            return back()->with('error', 'The selected time slot is already booked.');
        }
        
        // Create the session
        $session = CoachingSession::create([
            'coach_id' => $coach->id,
            'student_id' => auth()->id(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => 'scheduled',
            'notes' => $request->notes,
        ]);
        
        return redirect()->route('booking.confirmed', $session->id)
            ->with('success', 'Your session has been booked successfully!');
    }
    
    public function confirmed($sessionId)
    {
        $session = CoachingSession::with(['coach.user', 'student'])
            ->where('student_id', auth()->id())
            ->findOrFail($sessionId);
            
        return view('booking.confirmed', compact('session'));
    }
} 