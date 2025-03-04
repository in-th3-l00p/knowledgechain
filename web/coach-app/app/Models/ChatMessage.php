<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'conversation_id',
        'user_id',
        'message',
        'is_ai',
        'read_at'
    ];
    
    protected $casts = [
        'is_ai' => 'boolean',
        'read_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}
