<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(ChatMessage $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('conversation.' . $this->message->conversation_id);
    }

    public function broadcastWith(): array
    {
        // Make sure the user relation is loaded
        if (!$this->message->relationLoaded('user')) {
            $this->message->load('user');
        }
        
        // Add a safe fallback if user is somehow still null
        $user = $this->message->user ?? null;
        
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'user_id' => $this->message->user_id,
            'message' => $this->message->message,
            'is_ai' => $this->message->is_ai,
            'created_at' => $this->message->created_at->toDateTimeString(),
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
            ] : null
        ];
    }
} 