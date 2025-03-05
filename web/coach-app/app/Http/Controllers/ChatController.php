<?php

namespace App\Http\Controllers;

use App\Events\NewChatMessage;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function index()
    {
        $conversations = Auth::user()->conversations()
            ->with(['participants' => function($query) {
                $query->where('users.id', '!=', Auth::id());
            }, 'latestMessage'])
            ->get();
            
        return view('chat.index', compact('conversations'));
    }
    
    public function show(Conversation $conversation)
    {
        // Check if user is a participant
        if (!$conversation->participants()->where('users.id', Auth::id())->exists()) {
            abort(403);
        }
        
        // Get other participant
        $otherParticipant = $conversation->participants()
            ->where('users.id', '!=', Auth::id())
            ->first();
        
        // Mark unread messages as read
        $conversation->messages()
            ->where('user_id', '!=', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
            
        // Get messages for the conversation
        $messages = $conversation->messages()
            ->with('user')
            ->orderBy('created_at')
            ->get();
            
        return view('chat.show', compact('conversation', 'messages', 'otherParticipant'));
    }
    
    public function store(Request $request, Conversation $conversation)
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);
        
        // Check if user is a participant
        if (!$conversation->participants()->where('users.id', Auth::id())->exists()) {
            abort(403);
        }
        
        // Create new message
        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
        ]);
        
        // Broadcast the message
        broadcast(new NewChatMessage($message))->toOthers();
        
        return response()->json($message->load('user'));
    }
    
    public function create(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);
        
        $otherUser = User::findOrFail($request->user_id);
        
        // Check if conversation already exists
        $existingConversation = Auth::user()->conversations()
            ->whereHas('participants', function($query) use ($otherUser) {
                $query->where('users.id', $otherUser->id);
            })
            ->first();
            
        if ($existingConversation) {
            return redirect()->route('chat.show', $existingConversation);
        }
        
        // Create new conversation
        $conversation = Conversation::create([
            'title' => null, // Dynamic title based on participants
        ]);
        
        // Add participants
        $conversation->participants()->attach([Auth::id(), $otherUser->id]);
        
        return redirect()->route('chat.show', $conversation);
    }

    public function getMessages(Conversation $conversation, Request $request)
    {
        $query = $conversation->messages()->with('user')->orderBy('created_at');
        
        // If last_id is provided, only get messages newer than that
        if ($request->has('last_id') && is_numeric($request->last_id)) {
            $query->where('id', '>', $request->last_id);
        }
        
        $messages = $query->get();
        
        return response()->json($messages);
    }
} 