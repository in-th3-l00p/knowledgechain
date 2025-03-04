<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function index()
    {
        // You'll need to create a Chat or Message model to handle this properly
        $chats = auth()->user()->chats ?? collect([]);
        return view('chats.index', compact('chats'));
    }
} 