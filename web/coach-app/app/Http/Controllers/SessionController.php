<?php

namespace App\Http\Controllers;

use App\Models\CoachProfile;
use App\Models\CoachingSession;
use App\Models\Availability;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SessionController extends Controller
{
    public function create(CoachProfile $coach)
    {
        // Get coach's availabilities
        $availabilities = $coach->availabilities()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
        
        // Generate available time slots based on availabilities
        $availableSlots = $this->generateAvailableTimeSlots($coach, $availabilities);
        
        return view('sessions.create', [
            'coach' => $coach,
            'availableSlots' => $availableSlots
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'coach_id' => 'required|exists:coach_profiles,id',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
        ]);
        
        // Create a new coaching session
        $session = CoachingSession::create([
            'coach_id' => $validated['coach_id'],
            'student_id' => auth()->id(),
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => 'scheduled'
        ]);
        
        return redirect()->route('dashboard')
            ->with('success', 'Session booked successfully.');
    }
    
    private function generateAvailableTimeSlots(CoachProfile $coach, $availabilities)
    {
        $availableSlots = [];
        $today = Carbon::today();
        
        // Look ahead for 14 days
        for ($i = 0; $i < 14; $i++) {
            $date = $today->copy()->addDays($i);
            $dayOfWeek = $date->dayOfWeek;
            
            // Find availabilities for this day of week
            $dayAvailabilities = $availabilities->where('day_of_week', $dayOfWeek);
            
            foreach ($dayAvailabilities as $availability) {
                $startTime = Carbon::parse($date->format('Y-m-d') . ' ' . $availability->start_time);
                $endTime = Carbon::parse($date->format('Y-m-d') . ' ' . $availability->end_time);
                
                // Skip if the time is in the past
                if ($startTime->isPast()) {
                    continue;
                }
                
                // Check if coach already has sessions at this time
                $existingSessions = CoachingSession::where('coach_id', $coach->id)
                    ->where(function($query) use ($startTime, $endTime) {
                        $query->whereBetween('start_time', [$startTime, $endTime])
                            ->orWhereBetween('end_time', [$startTime, $endTime])
                            ->orWhere(function($q) use ($startTime, $endTime) {
                                $q->where('start_time', '<', $startTime)
                                  ->where('end_time', '>', $endTime);
                            });
                    })
                    ->where('status', '!=', 'canceled')
                    ->exists();
                    
                if (!$existingSessions) {
                    $availableSlots[] = [
                        'date' => $date->format('Y-m-d'),
                        'day' => $date->format('l'),
                        'start_time' => $startTime->format('H:i'),
                        'end_time' => $endTime->format('H:i'),
                        'start_datetime' => $startTime->format('Y-m-d H:i:s'),
                        'end_datetime' => $endTime->format('Y-m-d H:i:s'),
                    ];
                }
            }
        }
        
        return $availableSlots;
    }

    public function index()
    {
        $user = auth()->user();
        $upcomingSessions = [];
        $pastSessions = [];
        
        if ($user->isCoach()) {
            // Get sessions where user is the coach
            $coachId = $user->coachProfile->id;
            $upcomingSessions = CoachingSession::where('coach_id', $coachId)
                ->where('status', '!=', 'canceled')
                ->where('start_time', '>', now())
                ->orderBy('start_time')
                ->with(['student'])
                ->get();
                
            $pastSessions = CoachingSession::where('coach_id', $coachId)
                ->where('status', '!=', 'canceled')
                ->where('end_time', '<', now())
                ->orderBy('start_time', 'desc')
                ->with(['student'])
                ->limit(5)
                ->get();
        }
        
        // Get sessions where user is the student (for both coaches and regular users)
        $studentUpcomingSessions = CoachingSession::where('student_id', $user->id)
            ->where('status', '!=', 'canceled')
            ->where('start_time', '>', now())
            ->orderBy('start_time')
            ->with(['coach.user'])
            ->get();
            
        $studentPastSessions = CoachingSession::where('student_id', $user->id)
            ->where('status', '!=', 'canceled')
            ->where('end_time', '<', now())
            ->orderBy('start_time', 'desc')
            ->with(['coach.user'])
            ->limit(5)
            ->get();
        
        // Merge the collections if user is a coach
        if ($user->isCoach()) {
            $upcomingSessions = $upcomingSessions->concat($studentUpcomingSessions)->sortBy('start_time');
            $pastSessions = $pastSessions->concat($studentPastSessions)->sortByDesc('start_time')->take(5);
        } else {
            $upcomingSessions = $studentUpcomingSessions;
            $pastSessions = $studentPastSessions;
        }
        
        return view('sessions.index', compact('upcomingSessions', 'pastSessions'));
    }
} 