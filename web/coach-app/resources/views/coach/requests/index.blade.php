<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Coaching Requests') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg p-6">
                @if ($requests->isEmpty())
                    <div class="text-center py-12">
                        <p class="text-gray-500 dark:text-gray-400">You have no coaching requests at this time.</p>
                    </div>
                @else
                    <div class="space-y-4">
                        @foreach ($requests as $request)
                            <div class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                <!-- Replace with your actual request data structure -->
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                                            {{ $request->student_name ?? 'Student Name' }}
                                        </h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-300">
                                            {{ $request->created_at ?? now()->format('M d, Y') }}
                                        </p>
                                        <p class="mt-2 text-gray-600 dark:text-gray-400">
                                            {{ $request->message ?? 'Request details would appear here.' }}
                                        </p>
                                    </div>
                                    <div class="flex space-x-2">
                                        <button class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                            Accept
                                        </button>
                                        <button class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout> 