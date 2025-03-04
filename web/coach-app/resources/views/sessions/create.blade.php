<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Book a Session with {{ $coach->user->name }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6">
                    @if(count($availableSlots) > 0)
                        <form action="{{ route('sessions.store') }}" method="POST">
                            @csrf
                            <input type="hidden" name="coach_id" value="{{ $coach->id }}">
                            
                            <div class="mb-6">
                                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="time_slot">
                                    Select a Time Slot
                                </label>
                                <select name="time_slot" id="time_slot" class="shadow border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                                    <option value="">Select a time slot</option>
                                    @foreach($availableSlots as $slot)
                                        <option value="{{ $slot['start_datetime'] }}|{{ $slot['end_datetime'] }}">
                                            {{ $slot['day'] }}, {{ $slot['date'] }} - {{ $slot['start_time'] }} to {{ $slot['end_time'] }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            
                            <div class="flex items-center justify-end mt-4">
                                <button type="submit" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring focus:ring-indigo-300 disabled:opacity-25 transition">
                                    Book Session
                                </button>
                            </div>
                        </form>
                    @else
                        <div class="text-center py-8">
                            <p class="text-gray-700 dark:text-gray-300">No available time slots found for this coach.</p>
                            <p class="text-gray-600 dark:text-gray-400 mt-2">Please check back later or contact the coach directly.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.getElementById('time_slot').addEventListener('change', function() {
            const selectedValue = this.value;
            if (selectedValue) {
                const [startTime, endTime] = selectedValue.split('|');
                
                // Create hidden input fields for start_time and end_time
                let startInput = document.querySelector('input[name="start_time"]');
                let endInput = document.querySelector('input[name="end_time"]');
                
                if (!startInput) {
                    startInput = document.createElement('input');
                    startInput.type = 'hidden';
                    startInput.name = 'start_time';
                    this.parentNode.appendChild(startInput);
                }
                
                if (!endInput) {
                    endInput = document.createElement('input');
                    endInput.type = 'hidden';
                    endInput.name = 'end_time';
                    this.parentNode.appendChild(endInput);
                }
                
                startInput.value = startTime;
                endInput.value = endTime;
            }
        });
    </script>
</x-app-layout> 