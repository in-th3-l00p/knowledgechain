<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{id}', function ($user, $id) {
    $hasAccess = $user->conversations()->where('conversations.id', $id)->exists();
    \Log::info("Channel auth for conversation.{$id} - User:{$user->id} Access:" . ($hasAccess ? 'true' : 'false'));
    return $hasAccess;
});
