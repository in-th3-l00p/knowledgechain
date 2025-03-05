<!DOCTYPE html>
<html lang="ro">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="CoachConnect - Proiect demonstrativ pentru o platformă de coaching">
        
        <title>CoachConnect | Proiect Demonstrativ</title>

        <!-- Fonturi -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

        <!-- Stylesheets -->
        @vite(['resources/css/app.css'])
    </head>
    <body class="bg-gray-100 w-screen h-screen flex items-center justify-center">
        <div class="text-center">
            <h1 class="text-3xl font-semibold mb-6 text-gray-800">CoachConnect</h1>
            @auth
                <a href="{{ route('dashboard') }}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                    Accesează Dashboard
                </a>
            @else
                <a href="{{ route('login') }}" class="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                    Autentificare
                </a>
            @endauth
        </div>
        
    </body>
</html>
