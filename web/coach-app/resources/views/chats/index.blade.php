<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Chats') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="flex h-screen-75">
                    <!-- Contacts list -->
                    <div class="w-1/3 border-r border-gray-200 dark:border-gray-700">
                        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h3>
                        </div>
                        <div class="overflow-y-auto h-full">
                            @if ($chats->isEmpty())
                                <div class="text-center py-12">
                                    <p class="text-gray-500 dark:text-gray-400">No conversations yet.</p>
                                </div>
                            @else
                                @foreach ($chats as $chat)
                                    <div class="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                        <!-- Replace with your actual chat data structure -->
                                        <div class="flex items-center">
                                            <div class="flex-shrink-0">
                                                <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                    <span class="text-gray-600 dark:text-gray-400">{{ substr($chat->participant_name ?? 'User', 0, 1) }}</span>
                                                </div>
                                            </div>
                                            <div class="ml-3">
                                                <p class="text-sm font-medium text-gray-900 dark:text-white">
                                                    {{ $chat->participant_name ?? 'Chat Participant' }}
                                                </p>
                                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {{ $chat->last_message ?? 'No messages yet' }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            @endif
                        </div>
                    </div>
                    
                    <!-- Chat window -->
                    <div class="w-2/3 flex flex-col">
                        <!-- If no chat is selected -->
                        <div class="flex items-center justify-center h-full">
                            <p class="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
                        </div>
                        
                        <!-- When a chat is selected (hidden initially) -->
                        <div class="hidden flex flex-col h-full">
                            <!-- Chat header -->
                            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">[Chat Participant Name]</h3>
                            </div>
                            
                            <!-- Chat messages -->
                            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                                <!-- Messages would be displayed here -->
                            </div>
                            
                            <!-- Message input -->
                            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                                <form class="flex">
                                    <input type="text" class="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Type your message...">
                                    <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 