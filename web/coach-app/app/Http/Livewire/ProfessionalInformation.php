<?php

namespace App\Http\Livewire;

use App\Models\CoachProfile;
use App\Models\Skill;
use Illuminate\Support\Facades\Auth;
use Livewire\Component;
use Livewire\WithFileUploads;

class ProfessionalInformation extends Component
{
    use WithFileUploads;

    public $firstName;
    public $lastName;
    public $bio;
    public $workExperience = [];
    public $education = [];
    public $skills = [];
    public $interests = [];
    public $yearsOfExperience;
    public $industry;
    public $hourlyRate;
    public $languages;
    public $location;
    public $expertise;
    public $coachingStyle;
    public $availableSkills = [];
    public $selectedSkills = [];
    public $skillProficiency = [];

    protected $rules = [
        'firstName' => 'required|string|max:255',
        'lastName' => 'required|string|max:255',
        'bio' => 'required|string|max:1000',
        'workExperience' => 'array',
        'workExperience.*.company' => 'required|string|max:255',
        'workExperience.*.position' => 'required|string|max:255',
        'workExperience.*.startDate' => 'required|date',
        'workExperience.*.endDate' => 'nullable|date|after_or_equal:workExperience.*.startDate',
        'workExperience.*.description' => 'nullable|string|max:1000',
        'education' => 'array',
        'education.*.institution' => 'required|string|max:255',
        'education.*.degree' => 'required|string|max:255',
        'education.*.fieldOfStudy' => 'required|string|max:255',
        'education.*.graduationYear' => 'required|integer|min:1900|max:2050',
        'selectedSkills' => 'array',
        'selectedSkills.*' => 'exists:skills,id',
        'skillProficiency.*' => 'integer|min:1|max:5',
        'interests' => 'array',
        'yearsOfExperience' => 'required|integer|min:0|max:100',
        'hourlyRate' => 'required|numeric|min:0',
        'languages' => 'required|string|max:255',
        'location' => 'required|string|max:255',
        'expertise' => 'required|string|max:255',
        'coachingStyle' => 'required|string|max:500',
    ];

    public function mount()
    {
        $user = Auth::user();
        $this->firstName = explode(' ', $user->name)[0] ?? '';
        $this->lastName = explode(' ', $user->name)[1] ?? '';
        
        $profile = $user->coachProfile;
        if ($profile) {
            $this->bio = $profile->bio;
            $this->yearsOfExperience = $profile->years_of_experience;
            $this->hourlyRate = $profile->hourly_rate;
            $this->education = json_decode($profile->education, true) ?: [['institution' => '', 'degree' => '', 'fieldOfStudy' => '', 'graduationYear' => '']];
            $this->workExperience = json_decode($profile->work_experience, true) ?: [['company' => '', 'position' => '', 'startDate' => '', 'endDate' => '', 'description' => '']];
            $this->interests = json_decode($profile->interests, true) ?: [];
            $this->languages = $profile->languages;
            $this->location = $profile->location;
            $this->expertise = $profile->expertise;
            $this->coachingStyle = $profile->coaching_style;
            $this->industry = $profile->industry;
            
            // Load skills and proficiency levels
            $coachSkills = $profile->skills()->get();
            foreach ($coachSkills as $skill) {
                $this->selectedSkills[] = $skill->id;
                $this->skillProficiency[$skill->id] = $skill->pivot->proficiency_level;
            }
        } else {
            $this->workExperience = [['company' => '', 'position' => '', 'startDate' => '', 'endDate' => '', 'description' => '']];
            $this->education = [['institution' => '', 'degree' => '', 'fieldOfStudy' => '', 'graduationYear' => '']];
        }
        
        $this->availableSkills = Skill::all()->toArray();
    }

    public function render()
    {
        return view('livewire.professional-information')
            ->layout('layouts.app', ['header' => 'Professional Information']);
    }

    public function addWorkExperience()
    {
        $this->workExperience[] = ['company' => '', 'position' => '', 'startDate' => '', 'endDate' => '', 'description' => ''];
    }

    public function removeWorkExperience($index)
    {
        unset($this->workExperience[$index]);
        $this->workExperience = array_values($this->workExperience);
    }

    public function addEducation()
    {
        $this->education[] = ['institution' => '', 'degree' => '', 'fieldOfStudy' => '', 'graduationYear' => ''];
    }

    public function removeEducation($index)
    {
        unset($this->education[$index]);
        $this->education = array_values($this->education);
    }

    public function addInterest()
    {
        $this->interests[] = '';
    }

    public function removeInterest($index)
    {
        unset($this->interests[$index]);
        $this->interests = array_values($this->interests);
    }

    public function save()
    {
        $this->validate();

        $user = Auth::user();
        
        // Update user's name
        $user->name = $this->firstName . ' ' . $this->lastName;
        $user->save();
        
        // Update user type if not already set
        if ($user->user_type !== 'coach') {
            $user->user_type = 'coach';
            $user->save();
        }
        
        // Create or update coach profile
        $coachProfile = CoachProfile::firstOrNew(['user_id' => $user->id]);
        $coachProfile->bio = $this->bio;
        $coachProfile->years_of_experience = $this->yearsOfExperience;
        $coachProfile->hourly_rate = $this->hourlyRate;
        $coachProfile->education = json_encode($this->education);
        $coachProfile->work_experience = json_encode($this->workExperience);
        $coachProfile->interests = json_encode($this->interests);
        $coachProfile->languages = $this->languages;
        $coachProfile->location = $this->location;
        $coachProfile->expertise = $this->expertise;
        $coachProfile->coaching_style = $this->coachingStyle;
        $coachProfile->industry = $this->industry;
        $coachProfile->save();
        
        // Sync skills with proficiency
        $skillsWithProficiency = [];
        foreach ($this->selectedSkills as $skillId) {
            $proficiency = $this->skillProficiency[$skillId] ?? 3; // Default to 3 if not set
            $skillsWithProficiency[$skillId] = ['proficiency_level' => $proficiency];
        }
        
        $coachProfile->skills()->sync($skillsWithProficiency);
        
        session()->flash('message', 'Professional information saved successfully.');
    }
} 