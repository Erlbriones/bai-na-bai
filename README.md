# SPOTIBAI

A modern music streaming application built with React, Vite, and Supabase.

## Features

- 🎵 Stream and play music
- ❤️ Like and favorite songs
- 📝 Create and manage playlists
- 🔍 Search and discover music
- 📤 Upload your own music
- 📱 Responsive design
- ⚡ Optimized performance with caching

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context, TanStack Query
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun
- Supabase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Erlbriones/bai-na-bai.git
   cd bai-na-bai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser

## Database Setup

Run the SQL schema in `supabase_schema.sql` in your Supabase SQL editor to set up the required tables.

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist` directory.

## Performance Optimizations

This application includes comprehensive caching and performance optimizations:

- **Code Splitting**: Lazy-loaded routes for faster initial load
- **Data Caching**: TanStack Query for intelligent Supabase data caching
- **Asset Caching**: Hashed filenames with long-term browser caching
- **Service Worker**: PWA support for offline static assets
- **Image Optimization**: Lazy loading and async decoding
- **Audio Preloading**: Smart preloading of next song only

## License

MIT
