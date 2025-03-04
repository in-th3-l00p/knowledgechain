<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('My Availability') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            @if (session('success'))
                <div class="mb-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline dark:text-white">{{ session('success') }}</span>
                </div>
            @endif

            @if (session('error'))
                <div class="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                    <span class="block sm:inline">{{ session('error') }}</span>
                </div>
            @endif

            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{{ __('Add Weekly Availability') }}</h3>
                
                <form method="POST" action="{{ route('coach.availability.store') }}" class="space-y-4">
                    @csrf
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <x-label for="day_of_week" value="{{ __('Day of Week') }}" />
                            <select id="day_of_week" name="day_of_week" class="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm" required>
                                <option value="">{{ __('Select day') }}</option>
                                <option value="0">{{ __('Sunday') }}</option>
                                <option value="1">{{ __('Monday') }}</option>
                                <option value="2">{{ __('Tuesday') }}</option>
                                <option value="3">{{ __('Wednesday') }}</option>
                                <option value="4">{{ __('Thursday') }}</option>
                                <option value="5">{{ __('Friday') }}</option>
                                <option value="6">{{ __('Saturday') }}</option>
                            </select>
                            <x-input-error for="day_of_week" class="mt-2" />
                        </div>
                        
                        <div>
                            <x-label for="start_time" value="{{ __('Start Time') }}" />
                            <x-input id="start_time" type="time" class="mt-1 block w-full" name="start_time" :value="old('start_time')" required />
                            <x-input-error for="start_time" class="mt-2" />
                        </div>
                        
                        <div>
                            <x-label for="end_time" value="{{ __('End Time') }}" />
                            <x-input id="end_time" type="time" class="mt-1 block w-full" name="end_time" :value="old('end_time')" required />
                            <x-input-error for="end_time" class="mt-2" />
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-end mt-6">
                        <x-button>
                            {{ __('Add Availability') }}
                        </x-button>
                    </div>
                </form>
            </div>
            
            <div class="mt-6 bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{{ __('Your Weekly Availability Schedule') }}</h3>
                
                @if($availabilities->isEmpty())
                    <p class="text-gray-500 dark:text-gray-400">{{ __('You have not set any availability slots yet.') }}</p>
                @else
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ __('Day') }}</th>
                                    <th class="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ __('Time') }}</th>
                                    <th class="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ __('Actions') }}</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                @foreach($availabilities as $availability)
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            @php
                                                $days = [
                                                    0 => 'Sunday',
                                                    1 => 'Monday',
                                                    2 => 'Tuesday',
                                                    3 => 'Wednesday',
                                                    4 => 'Thursday',
                                                    5 => 'Friday',
                                                    6 => 'Saturday'
                                                ];
                                            @endphp
                                            {{ $days[$availability->day_of_week] }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            {{ \Carbon\Carbon::parse($availability->start_time)->format('g:i A') }} - {{ \Carbon\Carbon::parse($availability->end_time)->format('g:i A') }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <form method="POST" action="{{ route('coach.availability.destroy', $availability) }}" class="inline">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" onclick="return confirm('Are you sure you want to delete this availability slot?')">
                                                    {{ __('Delete') }}
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>
        </div>
    </div>
</x-app-layout> 