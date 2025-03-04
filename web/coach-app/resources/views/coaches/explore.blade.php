<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Explore Coaches') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
</x-app-layout> 