<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Explore Coaches') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- AI Coach Matching Section -->
            <div class="bg-indigo-50 dark:bg-indigo-900 overflow-hidden shadow-xl sm:rounded-lg p-6 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {{ __('AI Coach Matching') }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Describe your coaching needs, goals, and preferences in detail. Our AI will match you with the most suitable coaches.
                </p>
                
                <form id="ai-match-form">
                    @csrf
                    <div class="mb-4">
                        <label for="prompt" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Coaching Needs</label>
                        <textarea name="prompt" id="prompt" rows="4" 
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                                placeholder="Example: I'm looking for a career coach who specializes in tech industry transitions. I have 5 years of experience in marketing and want to move into a product management role. I prefer someone who offers practical exercises and homework between sessions."></textarea>
                    </div>
                    <div class="flex justify-end">
                        <button type="submit" id="ai-match-button" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span>Find My Perfect Coach</span>
                            <span id="ai-loader" class="hidden ml-2">
                                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        </button>
                    </div>
                </form>
                
                <div id="ai-results" class="mt-6 hidden">
                    <h4 class="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">AI Recommended Coaches</h4>
                    <div id="ai-coaches-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- AI results will be inserted here -->
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg p-6">
                <!-- Search and filtering options -->
                <div class="mb-6">
                    <form action="{{ route('coaches.explore') }}" method="GET" class="flex flex-wrap gap-4">
                        <div>
                            <label for="expertise" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Expertise</label>
                            <input type="text" name="expertise" id="expertise" value="{{ request('expertise') }}" 
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div>
                            <label for="industry" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                            <input type="text" name="industry" id="industry" value="{{ request('industry') }}"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                        </div>
                        <div class="self-end">
                            <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Coaches grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    @forelse ($coaches as $coach)
                        <div class="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                            <div class="p-4">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                    {{ $coach->user->name }}
                                </h3>
                                <p class="text-sm text-gray-500 dark:text-gray-300">
                                    {{ $coach->expertise }}
                                </p>
                                <p class="text-sm text-gray-500 dark:text-gray-300">
                                    {{ $coach->industry }}
                                </p>
                                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                    {{ $coach->bio }}
                                </p>
                                <div class="mt-4">
                                    <span class="text-indigo-600 dark:text-indigo-400 font-medium">${{ number_format($coach->hourly_rate, 2) }}/hour</span>
                                </div>
                                <a href="{{ route('coaches.show', $coach->id) }}" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    View Profile
                                </a>
                            </div>
                        </div>
                    @empty
                        <div class="col-span-full text-center py-12">
                            <p class="text-gray-500 dark:text-gray-400">No coaches found matching your criteria.</p>
                        </div>
                    @endforelse
                </div>

                <!-- Pagination -->
                <div class="mt-6">
                    {{ $coaches->links() }}
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const aiMatchForm = document.getElementById('ai-match-form');
            const aiMatchButton = document.getElementById('ai-match-button');
            const aiLoader = document.getElementById('ai-loader');
            const aiResults = document.getElementById('ai-results');
            const aiCoachesContainer = document.getElementById('ai-coaches-container');

            aiMatchForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Show loading state
                aiMatchButton.disabled = true;
                aiLoader.classList.remove('hidden');
                
                const formData = new FormData(aiMatchForm);
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                
                try {
                    const response = await fetch('/api/coaches/ai-match', {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({
                            prompt: formData.get('prompt')
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Server error: ' + response.status);
                    }
                    
                    const data = await response.json();
                    
                    // Clear previous results
                    aiCoachesContainer.innerHTML = '';
                    
                    if (data.coaches && data.coaches.length > 0) {
                        // Create and append coach cards
                        data.coaches.forEach(coach => {
                            const coachCard = document.createElement('div');
                            coachCard.className = 'bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden';
                            coachCard.innerHTML = `
                                <div class="p-4">
                                    <div class="flex items-center mb-2">
                                        <span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">AI Match</span>
                                        <span class="text-sm text-gray-500">Match score: ${Math.round(coach.match_score * 100)}%</span>
                                    </div>
                                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                        ${coach.user.name}
                                    </h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-300">
                                        ${coach.expertise}
                                    </p>
                                    <p class="text-sm text-gray-500 dark:text-gray-300">
                                        ${coach.industry}
                                    </p>
                                    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                        ${coach.bio}
                                    </p>
                                    <div class="mt-4">
                                        <span class="text-indigo-600 dark:text-indigo-400 font-medium">$${parseFloat(coach.hourly_rate).toFixed(2)}/hour</span>
                                    </div>
                                    <a href="/coaches/${coach.id}" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        View Profile
                                    </a>
                                </div>
                            `;
                            aiCoachesContainer.appendChild(coachCard);
                        });
                        
                        // Show results section
                        aiResults.classList.remove('hidden');
                        
                        // Scroll to results
                        aiResults.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        // Show no results message
                        aiCoachesContainer.innerHTML = `
                            <div class="col-span-full text-center py-6">
                                <p class="text-gray-500 dark:text-gray-400">No matching coaches found. Try refining your prompt with more specific details.</p>
                            </div>
                        `;
                        aiResults.classList.remove('hidden');
                    }
                    
                } catch (error) {
                    console.error('Error:', error);
                    aiCoachesContainer.innerHTML = `
                        <div class="col-span-full text-center py-6">
                            <p class="text-red-500">An error occurred while processing your request. Please try again.</p>
                        </div>
                    `;
                    aiResults.classList.remove('hidden');
                } finally {
                    // Reset button state
                    aiMatchButton.disabled = false;
                    aiLoader.classList.add('hidden');
                }
            });
        });
    </script>
    @endpush
</x-app-layout> 