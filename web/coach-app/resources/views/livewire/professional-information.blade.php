<div>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Professional Information') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg p-6">
                @if (session()->has('message'))
                    <div class="mb-4 font-medium text-sm text-green-600 dark:text-green-400">
                        {{ session('message') }}
                    </div>
                @endif

                <form wire:submit.prevent="save">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <!-- Basic Information -->
                        <div>
                            <x-label for="firstName" value="{{ __('First Name') }}" class="dark:text-gray-300" />
                            <x-input id="firstName" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="firstName" />
                            <x-input-error for="firstName" class="mt-2" />
                        </div>

                        <div>
                            <x-label for="lastName" value="{{ __('Last Name') }}" class="dark:text-gray-300" />
                            <x-input id="lastName" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="lastName" />
                            <x-input-error for="lastName" class="mt-2" />
                        </div>

                        <div class="md:col-span-2">
                            <x-label for="bio" value="{{ __('Bio') }}" class="dark:text-gray-300" />
                            <textarea id="bio" class="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring focus:ring-indigo-200 dark:focus:ring-indigo-600 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full" rows="4" wire:model.defer="bio"></textarea>
                            <x-input-error for="bio" class="mt-2" />
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Write a compelling bio that showcases your expertise and coaching approach.</p>
                        </div>

                        <div>
                            <x-label for="yearsOfExperience" value="{{ __('Years of Experience') }}" class="dark:text-gray-300" />
                            <x-input id="yearsOfExperience" type="number" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="yearsOfExperience" min="0" />
                            <x-input-error for="yearsOfExperience" class="mt-2" />
                        </div>

                        <div>
                            <x-label for="hourlyRate" value="{{ __('Hourly Rate (USD)') }}" class="dark:text-gray-300" />
                            <x-input id="hourlyRate" type="number" step="0.01" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="hourlyRate" min="0" />
                            <x-input-error for="hourlyRate" class="mt-2" />
                        </div>

                        <div>
                            <x-label for="location" value="{{ __('Location') }}" class="dark:text-gray-300" />
                            <x-input id="location" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="location" />
                            <x-input-error for="location" class="mt-2" />
                        </div>

                        <div>
                            <x-label for="languages" value="{{ __('Languages (comma separated)') }}" class="dark:text-gray-300" />
                            <x-input id="languages" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="languages" placeholder="English, Spanish, etc." />
                            <x-input-error for="languages" class="mt-2" />
                        </div>

                        <div>
                            <x-label for="industry" value="{{ __('Industry') }}" class="dark:text-gray-300" />
                            <x-input id="industry" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="industry" placeholder="Technology, Finance, Education, etc." />
                            <x-input-error for="industry" class="mt-2" />
                        </div>

                        <div>
                            <x-label for="expertise" value="{{ __('Primary Expertise') }}" class="dark:text-gray-300" />
                            <x-input id="expertise" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="expertise" placeholder="Career Development, Leadership, etc." />
                            <x-input-error for="expertise" class="mt-2" />
                        </div>

                        <div class="md:col-span-2">
                            <x-label for="coachingStyle" value="{{ __('Coaching Style') }}" class="dark:text-gray-300" />
                            <textarea id="coachingStyle" class="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring focus:ring-indigo-200 dark:focus:ring-indigo-600 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full" rows="3" wire:model.defer="coachingStyle"></textarea>
                            <x-input-error for="coachingStyle" class="mt-2" />
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Describe your coaching approach and methodology.</p>
                        </div>
                    </div>

                    <!-- Work Experience Section -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-200">{{ __('Work Experience') }}</h3>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Share your professional background to build credibility with potential students.</p>

                        @foreach($workExperience as $index => $experience)
                            <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div class="flex justify-between items-center mb-2">
                                    <h4 class="text-md font-medium dark:text-gray-200">Experience #{{ $index + 1 }}</h4>
                                    <button type="button" wire:click="removeWorkExperience({{ $index }})" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <x-label for="workExperience.{{ $index }}.company" value="{{ __('Company') }}" class="dark:text-gray-300" />
                                        <x-input id="workExperience.{{ $index }}.company" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="workExperience.{{ $index }}.company" />
                                        <x-input-error for="workExperience.{{ $index }}.company" class="mt-2" />
                                    </div>

                                    <div>
                                        <x-label for="workExperience.{{ $index }}.position" value="{{ __('Position') }}" class="dark:text-gray-300" />
                                        <x-input id="workExperience.{{ $index }}.position" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="workExperience.{{ $index }}.position" />
                                        <x-input-error for="workExperience.{{ $index }}.position" class="mt-2" />
                                    </div>

                                    <div>
                                        <x-label for="workExperience.{{ $index }}.startDate" value="{{ __('Start Date') }}" class="dark:text-gray-300" />
                                        <x-input id="workExperience.{{ $index }}.startDate" type="date" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="workExperience.{{ $index }}.startDate" />
                                        <x-input-error for="workExperience.{{ $index }}.startDate" class="mt-2" />
                                    </div>

                                    <div>
                                        <x-label for="workExperience.{{ $index }}.endDate" value="{{ __('End Date (leave empty if current)') }}" class="dark:text-gray-300" />
                                        <x-input id="workExperience.{{ $index }}.endDate" type="date" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="workExperience.{{ $index }}.endDate" />
                                        <x-input-error for="workExperience.{{ $index }}.endDate" class="mt-2" />
                                    </div>

                                    <div class="md:col-span-2">
                                        <x-label for="workExperience.{{ $index }}.description" value="{{ __('Description') }}" class="dark:text-gray-300" />
                                        <textarea id="workExperience.{{ $index }}.description" class="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-300 dark:focus:border-indigo-600 focus:ring focus:ring-indigo-200 dark:focus:ring-indigo-600 focus:ring-opacity-50 rounded-md shadow-sm mt-1 block w-full" rows="3" wire:model.defer="workExperience.{{ $index }}.description"></textarea>
                                        <x-input-error for="workExperience.{{ $index }}.description" class="mt-2" />
                                    </div>
                                </div>
                            </div>
                        @endforeach

                        <div class="mt-4">
                            <x-button type="button" wire:click="addWorkExperience" class="bg-green-500 hover:bg-green-700">
                                {{ __('Add Work Experience') }}
                            </x-button>
                        </div>
                    </div>

                    <!-- Education Section -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-200">{{ __('Education') }}</h3>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">List your academic background and qualifications.</p>

                        @foreach($education as $index => $edu)
                            <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div class="flex justify-between items-center mb-2">
                                    <h4 class="text-md font-medium dark:text-gray-200">Education #{{ $index + 1 }}</h4>
                                    <button type="button" wire:click="removeEducation({{ $index }})" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <x-label for="education.{{ $index }}.institution" value="{{ __('Institution') }}" class="dark:text-gray-300" />
                                        <x-input id="education.{{ $index }}.institution" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="education.{{ $index }}.institution" />
                                        <x-input-error for="education.{{ $index }}.institution" class="mt-2" />
                                    </div>

                                    <div>
                                        <x-label for="education.{{ $index }}.degree" value="{{ __('Degree') }}" class="dark:text-gray-300" />
                                        <x-input id="education.{{ $index }}.degree" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="education.{{ $index }}.degree" />
                                        <x-input-error for="education.{{ $index }}.degree" class="mt-2" />
                                    </div>

                                    <div>
                                        <x-label for="education.{{ $index }}.fieldOfStudy" value="{{ __('Field of Study') }}" class="dark:text-gray-300" />
                                        <x-input id="education.{{ $index }}.fieldOfStudy" type="text" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="education.{{ $index }}.fieldOfStudy" />
                                        <x-input-error for="education.{{ $index }}.fieldOfStudy" class="mt-2" />
                                    </div>

                                    <div>
                                        <x-label for="education.{{ $index }}.graduationYear" value="{{ __('Graduation Year') }}" class="dark:text-gray-300" />
                                        <x-input id="education.{{ $index }}.graduationYear" type="number" class="mt-1 block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="education.{{ $index }}.graduationYear" min="1900" max="{{ date('Y') + 10 }}" />
                                        <x-input-error for="education.{{ $index }}.graduationYear" class="mt-2" />
                                    </div>
                                </div>
                            </div>
                        @endforeach

                        <div class="mt-4">
                            <x-button type="button" wire:click="addEducation" class="bg-green-500 hover:bg-green-700">
                                {{ __('Add Education') }}
                            </x-button>
                        </div>
                    </div>

                    <!-- Skills Section -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-200">{{ __('Skills & Expertise') }}</h3>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Select skills that you specialize in and rate your proficiency level.</p>

                        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            @foreach($availableSkills as $skill)
                                <div class="p-3 border rounded-md dark:border-gray-600 dark:bg-gray-700">
                                    <div class="flex items-center mb-2">
                                        <input id="skill_{{ $skill['id'] }}" type="checkbox" value="{{ $skill['id'] }}" wire:model="selectedSkills" class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700">
                                        <label for="skill_{{ $skill['id'] }}" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ $skill['name'] }}</label>
                                    </div>
                                    
                                    @if(in_array($skill['id'], $selectedSkills))
                                        <div>
                                            <label for="skillProficiency_{{ $skill['id'] }}" class="text-xs text-gray-500 dark:text-gray-400">Proficiency (1-5)</label>
                                            <select id="skillProficiency_{{ $skill['id'] }}" wire:model="skillProficiency.{{ $skill['id'] }}" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                                                <option value="1">1 - Beginner</option>
                                                <option value="2">2 - Intermediate</option>
                                                <option value="3">3 - Advanced</option>
                                                <option value="4">4 - Expert</option>
                                                <option value="5">5 - Master</option>
                                            </select>
                                        </div>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                        <x-input-error for="selectedSkills" class="mt-2" />
                    </div>

                    <!-- Interests Section -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-200">{{ __('Areas of Coaching Interest') }}</h3>
                        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">What specific coaching areas are you most interested in?</p>

                        @foreach($interests as $index => $interest)
                            <div class="mt-2 flex items-center">
                                <x-input id="interests.{{ $index }}" type="text" class="block w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" wire:model.defer="interests.{{ $index }}" placeholder="e.g., Career transitions, Leadership development, etc." />
                                <button type="button" wire:click="removeInterest({{ $index }})" class="ml-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        @endforeach

                        <div class="mt-2">
                            <x-button type="button" wire:click="addInterest" class="bg-green-500 hover:bg-green-700">
                                {{ __('Add Interest Area') }}
                            </x-button>
                        </div>
                    </div>

                    <div class="flex items-center justify-end mt-6">
                        <x-action-message class="mr-3" on="saved">
                            {{ __('Saved.') }}
                        </x-action-message>

                        <x-button>
                            {{ __('Save Professional Information') }}
                        </x-button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div> 