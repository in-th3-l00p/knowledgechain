<?php

use Illuminate\Support\Facades\Broadcast;

// Auth users can listen to their private channel for notifications
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Only conversation participants can access the conversation channel
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return $user->conversations()->where('conversations.id', $conversationId)->exists();
});
