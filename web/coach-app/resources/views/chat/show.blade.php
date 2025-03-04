<x-app-layout>
    <x-slot name="header">
        <div class="flex justify-between items-center">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ $otherParticipant->name }}
            </h2>
            <a href="{{ route('chat.index') }}" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                &larr; Back to conversations
            </a>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6 flex flex-col h-[600px]">
                    <div id="messages-container" class="flex-1 overflow-y-auto mb-4 space-y-4">
                        @foreach($messages as $message)
                            <div class="flex {{ $message->user_id === Auth::id() ? 'justify-end' : 'justify-start' }}">
                                <div class="max-w-3/4 px-4 py-2 rounded-lg {{ $message->user_id === Auth::id() ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' }}">
                                    <p>{{ $message->message }}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">
                                        {{ $message->created_at->format('g:i A') }}
                                    </p>
                                </div>
                            </div>
                        @endforeach
                    </div>
                    
                    <form id="message-form" class="mt-auto">
                        @csrf
                        <div class="flex">
                            <input type="text" id="message-input" name="message" class="flex-1 rounded-l-md border-0 py-2.5 dark:bg-gray-700 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Type your message...">
                            <button type="submit" class="rounded-r-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const messagesContainer = document.getElementById('messages-container');
            const messageForm = document.getElementById('message-form');
            const messageInput = document.getElementById('message-input');
            const conversationId = {{ $conversation->id }};
            
            // Scroll to bottom of messages
            function scrollToBottom() {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
            // Initial scroll
            scrollToBottom();
            
            // Add new message to the chat
            function addMessage(message, isCurrentUser) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`;
                
                const messageContent = document.createElement('div');
                messageContent.className = `max-w-3/4 px-4 py-2 rounded-lg ${isCurrentUser ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`;
                
                const messageText = document.createElement('p');
                messageText.textContent = message.message;
                
                const messageTime = document.createElement('p');
                messageTime.className = 'text-xs text-gray-500 dark:text-gray-400 text-right mt-1';
                
                // Format the time
                const date = new Date(message.created_at);
                messageTime.textContent = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                
                messageContent.appendChild(messageText);
                messageContent.appendChild(messageTime);
                messageDiv.appendChild(messageContent);
                messagesContainer.appendChild(messageDiv);
                
                scrollToBottom();
            }
            
            // Send message
            messageForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const message = messageInput.value.trim();
                if (!message) return;
                
                try {
                    const response = await fetch(`/chat/${conversationId}/messages`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        },
                        body: JSON.stringify({ message }),
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        addMessage(data, true);
                        messageInput.value = '';
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            });
            
            // Listen for new messages with Laravel Echo
            window.Echo.private(`conversation.${conversationId}`)
                .listen('NewChatMessage', (e) => {
                    const currentUserId = {{ Auth::id() }};
                    const isCurrentUser = e.message.user_id === currentUserId;
                    
                    addMessage(e.message, isCurrentUser);
                });
        });
    </script>
    @endpush
</x-app-layout> 