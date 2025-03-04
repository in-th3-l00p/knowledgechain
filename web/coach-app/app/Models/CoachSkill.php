<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class CoachSkill extends Pivot
{
    use HasFactory;
    
    protected $table = 'coach_skills';
    
    protected $fillable = [
        'coach_id',
        'skill_id',
        'proficiency_level'
    ];
    
    public function coach()
    {
        return $this->belongsTo(CoachProfile::class, 'coach_id');
    }
    
    public function skill()
    {
        return $this->belongsTo(Skill::class);
    }
}
