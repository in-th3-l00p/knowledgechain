<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function coaches()
    {
        return $this->belongsToMany(CoachProfile::class, 'coach_skills', 'skill_id', 'coach_id')
                    ->withPivot('proficiency_level')
                    ->withTimestamps();
    }
}
