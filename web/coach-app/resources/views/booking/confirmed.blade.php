<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Session Booked!
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6">
                    <div class="mb-4 text-center">
                        <svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <h3 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Your session has been booked!</h3>
                    </div>
                    
                    <div class="mt-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Session Details</h4>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Coach</p>
                                <p class="text-lg text-gray-900 dark:text-white">{{ $session->coach->user->name }}</p>
                            </div>
                            
                            <div>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Date</p>
                                <p class="text-lg text-gray-900 dark:text-white">{{ $session->start_time->format('l, F j, Y') }}</p>
                            </div>
                            
                            <div>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Time</p>
                                <p class="text-lg text-gray-900 dark:text-white">
                                    {{ $session->start_time->format('g:i A') }} - {{ $session->end_time->format('g:i A') }}
                                </p>
                            </div>
                            
                            <div>
                                <p class="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                                <p class="text-lg text-gray-900 dark:text-white">
                                    {{ $session->end_time->diffInMinutes($session->start_time) }} minutes
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-8 flex justify-center space-x-4">
                        <a href="{{ route('dashboard') }}" class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Go to Dashboard
                        </a>
                        
                        <a href="{{ route('coaches.show', $session->coach_id) }}" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Back to Coach Profile
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 