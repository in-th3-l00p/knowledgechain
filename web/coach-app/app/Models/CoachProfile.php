<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoachProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'years_of_experience',
        'hourly_rate',
        'education',
        'work_experience',
        'interests',
        'languages',
        'location',
        'expertise',
        'coaching_style',
        'industry',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'education' => 'array',
        'work_experience' => 'array',
        'interests' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'coach_skills', 'coach_id', 'skill_id')
                    ->withPivot('proficiency_level')
                    ->withTimestamps();
    }

    public function availabilities()
    {
        return $this->hasMany(Availability::class, 'coach_id');
    }

    public function sessions()
    {
        return $this->hasMany(Session::class, 'coach_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'coach_id');
    }

    public function recommendations()
    {
        return $this->hasMany(CoachRecommendation::class, 'coach_id');
    }
}
