<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoachRecommendation extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id', 
        'coach_id',
        'relevance_score',
        'recommendation_reason'
    ];
    
    protected $casts = [
        'relevance_score' => 'float',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function coach()
    {
        return $this->belongsTo(CoachProfile::class, 'coach_id');
    }
}
