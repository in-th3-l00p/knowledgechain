<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'session_id',
        'student_id',
        'coach_id',
        'rating',
        'comment'
    ];
    
    public function session()
    {
        return $this->belongsTo(Session::class);
    }
    
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
    
    public function coach()
    {
        return $this->belongsTo(CoachProfile::class, 'coach_id');
    }
}
