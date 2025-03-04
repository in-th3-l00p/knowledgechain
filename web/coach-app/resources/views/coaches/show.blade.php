<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ $coach->user->name }} - Coach Profile
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6">
                    <div class="flex flex-col md:flex-row">
                        <!-- Coach information -->
                        <div class="md:w-2/3 pr-6">
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $coach->user->name }}</h3>
                            <p class="text-indigo-600 dark:text-indigo-400 text-lg">{{ $coach->expertise }}</p>
                            <p class="mt-2 text-gray-600 dark:text-gray-400">{{ $coach->bio }}</p>
                            
                            <div class="mt-6">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Experience</h4>
                                <p class="text-gray-600 dark:text-gray-400">{{ $coach->years_of_experience }} years</p>
                            </div>
                            
                            <div class="mt-6">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Industry</h4>
                                <p class="text-gray-600 dark:text-gray-400">{{ $coach->industry }}</p>
                            </div>
                            
                            <div class="mt-6">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Coaching Style</h4>
                                <p class="text-gray-600 dark:text-gray-400">{{ $coach->coaching_style }}</p>
                            </div>
                            
                            <div class="mt-6">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Languages</h4>
                                <p class="text-gray-600 dark:text-gray-400">{{ $coach->languages }}</p>
                            </div>
                        </div>
                        
                        <!-- Sidebar with pricing and action buttons -->
                        <div class="md:w-1/3 mt-6 md:mt-0">
                            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h4>
                                <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${{ number_format($coach->hourly_rate, 2) }}/hour</p>
                                
                                <div class="mt-4">
                                    <a href="{{ route('sessions.create', ['coach' => $coach->id]) }}" class="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Book a Session
                                    </a>
                                </div>
                                
                                <div class="mt-2">
                                    <form action="{{ route('chat.create') }}" method="POST">
                                        @csrf
                                        <input type="hidden" name="user_id" value="{{ $coach->user->id }}">
                                        <button type="submit" class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 