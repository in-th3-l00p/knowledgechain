<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'coach_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];
    
    protected $casts = [
        // No need for date casting as we use day_of_week instead
    ];
    
    public function coachProfile()
    {
        return $this->belongsTo(CoachProfile::class, 'coach_id');
    }
}
