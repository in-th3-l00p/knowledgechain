<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Book a Session with {{ $coach->user->name }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6">
                    <div class="mb-6">
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ $coach->user->name }}</h3>
                        <p class="text-indigo-600 dark:text-indigo-400">{{ $coach->expertise }} • ${{ number_format($coach->hourly_rate, 2) }}/hour</p>
                    </div>
                    
                    @if(session('error'))
                        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {{ session('error') }}
                        </div>
                    @endif
                    
                    <form action="{{ route('booking.store') }}" method="POST">
                        @csrf
                        @if ($errors->any())
                            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                <ul class="list-disc pl-5">
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        <input type="hidden" name="coach_id" value="{{ $coach->id }}">
                        
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Date</h4>
                            <input type="date" name="date" id="date" 
                                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 @error('date') border-red-500 @enderror"
                                min="{{ date('Y-m-d') }}" value="{{ old('date') }}" required>
                            @error('date')
                                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Time</h4>
                            <div id="available-times" class="grid grid-cols-3 gap-2">
                                <p class="col-span-3 text-gray-500 dark:text-gray-400 italic">
                                    Please select a date first to see available times
                                </p>
                            </div>
                            <input type="hidden" name="start_time" id="selected_time" value="{{ old('start_time') }}" required>
                            @error('start_time')
                                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select Duration</h4>
                            <select name="duration" id="duration" required
                                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 @error('duration') border-red-500 @enderror">
                                <option value="30" {{ old('duration') == '30' ? 'selected' : '' }}>30 minutes</option>
                                <option value="60" {{ old('duration') == '60' || !old('duration') ? 'selected' : '' }}>1 hour</option>
                                <option value="90" {{ old('duration') == '90' ? 'selected' : '' }}>1 hour 30 minutes</option>
                                <option value="120" {{ old('duration') == '120' ? 'selected' : '' }}>2 hours</option>
                            </select>
                            @error('duration')
                                <p class="text-red-500 text-xs mt-1">{{ $message }}</p>
                            @enderror
                        </div>
                        
                        <div class="mb-6">
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes (Optional)</h4>
                            <textarea name="notes" id="notes" rows="3"
                                class="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="What would you like to discuss in this session?"></textarea>
                        </div>
                        
                        <div class="flex justify-between items-center mt-8">
                            <p class="text-xl font-bold text-gray-900 dark:text-white">
                                Total: $<span id="total-price">{{ number_format($coach->hourly_rate, 2) }}</span>
                            </p>
                            <button type="submit" 
                                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Book Session
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    
    @push('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const dateInput = document.getElementById('date');
            const availableTimesContainer = document.getElementById('available-times');
            const selectedTimeInput = document.getElementById('selected_time');
            const durationSelect = document.getElementById('duration');
            const totalPriceElement = document.getElementById('total-price');
            const hourlyRate = {{ $coach->hourly_rate }};
            
            // Store availability data from PHP
            const availabilityByDay = @json($availabilitiesByDay);
            const existingSessions = @json($existingSessions);
            
            // For debugging - add these lines
            console.log('Availability by day:', availabilityByDay);
            console.log('Existing sessions:', existingSessions);
            
            // Update total price based on duration
            durationSelect.addEventListener('change', function() {
                const duration = parseInt(this.value);
                const price = (hourlyRate * duration / 60).toFixed(2);
                totalPriceElement.textContent = price;
            });
            
            // Show available times when date is selected
            dateInput.addEventListener('change', function() {
                const selectedDate = new Date(this.value);
                const dayOfWeek = selectedDate.getDay();
                
                console.log('Selected day of week:', dayOfWeek);
                console.log('Available slots for this day:', availabilityByDay[dayOfWeek]);
                
                // Format selected date for comparison with existing sessions
                const formattedDate = this.value;
                
                // Clear previous times
                availableTimesContainer.innerHTML = '';
                
                // Check if we have any availability for this day
                if (!availabilityByDay[dayOfWeek] || !Array.isArray(availabilityByDay[dayOfWeek]) || availabilityByDay[dayOfWeek].length === 0) {
                    availableTimesContainer.innerHTML = '<p class="col-span-3 text-gray-500 dark:text-gray-400 italic">No availability for this day</p>';
                    return;
                }
                
                // Generate time slots in 30-minute increments within availability windows
                let slotsAdded = 0;
                availabilityByDay[dayOfWeek].forEach(slot => {
                    try {
                        if (!slot.start_time || !slot.end_time) {
                            console.error('Invalid slot data:', slot);
                            return;
                        }
                        
                        const startTime = new Date(`2000-01-01T${slot.start_time}`);
                        const endTime = new Date(`2000-01-01T${slot.end_time}`);
                        
                        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                            console.error('Invalid time format:', slot.start_time, slot.end_time);
                            return;
                        }
                        
                        // Create 30-minute slots
                        let currentTime = new Date(startTime);
                        while (currentTime < endTime) {
                            const hours = currentTime.getHours().toString().padStart(2, '0');
                            const minutes = currentTime.getMinutes().toString().padStart(2, '0');
                            const timeString = `${hours}:${minutes}`;
                            
                            // Check if this time slot conflicts with existing sessions
                            const isConflicting = existingSessions.some(session => {
                                if (!session.start_time) return false;
                                
                                let sessionDate, sessionTime;
                                
                                // Handle different possible formats
                                if (session.start_time.includes('T')) {
                                    [sessionDate, sessionTime] = session.start_time.split('T');
                                    sessionTime = sessionTime.substring(0, 5);
                                } else if (session.start_time.includes(' ')) {
                                    [sessionDate, sessionTime] = session.start_time.split(' ');
                                    sessionTime = sessionTime.substring(0, 5);
                                } else {
                                    return false;
                                }
                                
                                return sessionDate === formattedDate && sessionTime === timeString;
                            });
                            
                            if (!isConflicting) {
                                const button = document.createElement('button');
                                button.type = 'button';
                                button.className = 'py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none time-button';
                                button.textContent = formatTime(timeString);
                                button.dataset.time = timeString;
                                
                                button.addEventListener('click', function() {
                                    // Remove active class from all buttons
                                    document.querySelectorAll('.time-button').forEach(btn => {
                                        btn.classList.remove('ring-2', 'ring-indigo-500', 'border-indigo-500');
                                    });
                                    
                                    // Add active class to clicked button
                                    this.classList.add('ring-2', 'ring-indigo-500', 'border-indigo-500');
                                    selectedTimeInput.value = this.dataset.time;
                                });
                                
                                availableTimesContainer.appendChild(button);
                                slotsAdded++;
                            }
                            
                            // Add 30 minutes
                            currentTime.setMinutes(currentTime.getMinutes() + 30);
                        }
                    } catch (error) {
                        console.error('Error processing time slot:', error, slot);
                    }
                });
                
                // If no times were added
                if (slotsAdded === 0) {
                    availableTimesContainer.innerHTML = '<p class="col-span-3 text-gray-500 dark:text-gray-400 italic">No available times for this day</p>';
                }
            });
            
            // Helper function to format time
            function formatTime(timeString) {
                const [hours, minutes] = timeString.split(':');
                let hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12 || 12;
                return `${hour}:${minutes} ${ampm}`;
            }
            
            // Initialize with current date if set
            if (dateInput.value) {
                dateInput.dispatchEvent(new Event('change'));
            }
        });
    </script>
    @endpush
</x-app-layout> 