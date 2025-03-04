<x-nav-link :href="route('chat.index')" :active="request()->routeIs('chat.*')">
    {{ __('Chat') }}
</x-nav-link> 