<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Conversations') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6">
                    @if($conversations->isEmpty())
                        <p class="text-gray-500 dark:text-gray-400">You don't have any conversations yet.</p>
                    @else
                        <div class="space-y-4">
                            @foreach($conversations as $conversation)
                                @php
                                    $otherParticipant = $conversation->participants->first();
                                    $latestMessage = $conversation->latestMessage;
                                @endphp
                                <a href="{{ route('chat.show', $conversation) }}" class="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <p class="font-medium text-gray-900 dark:text-gray-100">{{ $otherParticipant->name }}</p>
                                            @if($latestMessage)
                                                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {{ $latestMessage->message }}
                                                </p>
                                            @else
                                                <p class="text-sm text-gray-500 dark:text-gray-500">No messages yet</p>
                                            @endif
                                        </div>
                                        @if($latestMessage)
                                            <p class="text-xs text-gray-500 dark:text-gray-500">
                                                {{ $latestMessage->created_at->diffForHumans() }}
                                            </p>
                                        @endif
                                    </div>
                                </a>
                            @endforeach
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-app-layout> 