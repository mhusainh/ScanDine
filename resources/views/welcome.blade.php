<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>ScanDine - Menu</title>
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="antialiased bg-coffee-50">
        <div id="app">
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; color: #5D4037;">
                <h1>Loading Application...</h1>
            </div>
        </div>
    </body>
</html>
