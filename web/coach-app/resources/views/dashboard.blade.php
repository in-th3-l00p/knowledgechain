<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- Welcome Card -->
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg mb-6">
                <div class="p-6 sm:px-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center">
                        <div class="mr-4">
                            <div class="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <svg class="h-8 w-8 text-indigo-600 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome, {{ Auth::user()->name }}!</h1>
                            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                @if(Auth::user()->isCoach())
                                    You are logged in as a Coach
                                @else
                                    You are logged in as a Student
                                @endif
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Upcoming Sessions Card -->
                <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">Upcoming Sessions</h2>
                            <a href="{{ route('sessions.index') }}" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">View All</a>
                        </div>
                        
                        <div class="space-y-4">
                            @php
                                // Get upcoming sessions for the user
                                $upcomingSessions = [];
                                $user = Auth::user();
                                
                                if ($user->isCoach()) {
                                    $coachId = $user->coachProfile->id;
                                    $upcomingSessions = \App\Models\CoachingSession::where('coach_id', $coachId)
                                        ->where('status', '!=', 'canceled')
                                        ->where('start_time', '>', now())
                                        ->orderBy('start_time')
                                        ->with(['student'])
                                        ->limit(3)
                                        ->get();
                                }
                                
                                // For both coach and student users
                                $studentUpcomingSessions = \App\Models\CoachingSession::where('student_id', $user->id)
                                    ->where('status', '!=', 'canceled')
                                    ->where('start_time', '>', now())
                                    ->orderBy('start_time')
                                    ->with(['coach.user'])
                                    ->limit(3)
                                    ->get();
                                
                                if ($user->isCoach()) {
                                    $upcomingSessions = $upcomingSessions->concat($studentUpcomingSessions)
                                        ->sortBy('start_time')
                                        ->take(3);
                                } else {
                                    $upcomingSessions = $studentUpcomingSessions;
                                }
                            @endphp
                            
                            @forelse($upcomingSessions as $session)
                                <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div class="flex justify-between">
                                        <div>
                                            <p class="font-medium text-gray-900 dark:text-gray-100">
                                                {{ $session->start_time->format('M d, Y') }}
                                            </p>
                                            <p class="text-sm text-gray-600 dark:text-gray-400">
                                                {{ $session->start_time->format('g:i A') }} - {{ $session->end_time->format('g:i A') }}
                                            </p>
                                        </div>
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                                            {{ ucfirst($session->status) }}
                                        </span>
                                    </div>
                                    <div class="mt-2">
                                        <p class="text-sm text-gray-600 dark:text-gray-400">
                                            @if(Auth::user()->isCoach() && $session->student_id == Auth::id())
                                                With: {{ $session->coach->user->name }} (Coach)
                                            @elseif(Auth::user()->isCoach() && $session->coach_id == Auth::user()->coachProfile->id)
                                                With: {{ $session->student->name }} (Student)
                                            @else
                                                With: {{ $session->coach->user->name }}
                                            @endif
                                        </p>
                                    </div>
                                </div>
                            @empty
                                <p class="text-gray-500 dark:text-gray-400">You don't have any upcoming sessions.</p>
                                <a href="{{ route('coaches.explore') }}" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 mt-2">
                                    Find a Coach
                                </a>
                            @endforelse
                        </div>
                    </div>
                </div>

                <!-- Profile Stats Card -->
                <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                    <div class="p-6">
                        <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{{ Auth::user()->isCoach() ? 'Coach Profile' : 'Student Profile' }}</h2>
                        
                        @if(Auth::user()->isCoach())
                            @php
                                $coachProfile = Auth::user()->coachProfile;
                                $totalSessions = \App\Models\CoachingSession::where('coach_id', $coachProfile->id)
                                    ->where('status', 'completed')
                                    ->count();
                            @endphp
                            
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</p>
                                    <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ $totalSessions }}</p>
                                </div>
                                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Experience</p>
                                    <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ $coachProfile->years_of_experience }} Years</p>
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Hourly Rate</p>
                                <p class="text-lg font-medium text-gray-900 dark:text-gray-100">${{ $coachProfile->hourly_rate }}/hour</p>
                            </div>
                            
                            <div>
                                <p class="text-sm text-gray-600 dark:text-gray-400">Expertise</p>
                                <p class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ $coachProfile->expertise ?: 'Not specified' }}</p>
                            </div>
                            
                            <div class="mt-4">
                                <a href="#" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                    Edit Coach Profile
                                </a>
                            </div>
                        @else
                            @php
                                $completedSessions = \App\Models\CoachingSession::where('student_id', Auth::id())
                                    ->where('status', 'completed')
                                    ->count();
                            @endphp
                            
                            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center mb-4">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</p>
                                <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ $completedSessions }}</p>
                            </div>
                            
                            <p class="text-gray-600 dark:text-gray-400 mb-4">
                                Looking for personalized coaching? Browse our talented coaches and find the perfect match for your goals.
                            </p>
                            
                            <div class="mt-4">
                                <a href="#" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                    Find a Coach
                                </a>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
