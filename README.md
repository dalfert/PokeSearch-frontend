# PokeSearch

A Pokémon card collection tracker built with React and Supabase.

## Features

- User authentication with email/password and username login
- Search Pokémon cards powered by the PokéTrace API
- Add and remove cards from your personal collection
- Live portfolio value calculation
- Persistent collection stored in Supabase

## Tech Stack

- React (Vite)
- Supabase (auth + database)
- CSS Modules
- React Router

## Getting Started

1. Clone the repo
   git clone https://github.com/yourusername/poke-search.git
   cd poke-search

2. Install dependencies
   npm install

3. Create a `.env` file in the root:
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

4. Run the app
   npm run dev

## Notes

- Requires the [poke-search-server](https://github.com/yourusername/poke-search-server) backend to be running for card search
- By default the app expects the backend at `http://localhost:3001`