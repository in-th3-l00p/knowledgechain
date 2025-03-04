<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoachingSession extends Model
{
    use HasFactory;
    
    protected $table = 'coaching_sessions';
    
    protected $fillable = [
        'coach_id',
        'student_id',
        'start_time',
        'end_time',
        'status',
        'notes'
    ];
    
    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];
    
    public function coach()
    {
        return $this->belongsTo(CoachProfile::class, 'coach_id');
    }
    
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
    
    public function review()
    {
        return $this->hasOne(Review::class);
    }
    
    public function hasReview()
    {
        return $this->review()->exists();
    }
}
