# Analog Vibes - Vinyl Collection Web App

A beautiful, modern web application for showcasing and managing your vinyl record collection with Discogs integration and Supabase backend.

## ✨ Features

- **Beautiful Collection Display** - Blue Note-inspired design with animated vinyl cards
- **Discogs Integration** - Sync your collection from Discogs automatically
- **Advanced Filtering** - Filter by genre, decade, artist, and search
- **Collection Insights** - View stats about your collection
- **Random Picker** - Get random album suggestions
- **Public Sharing** - Share your collection publicly (no login required)
- **Responsive Design** - Works perfectly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account
- Discogs account (for syncing)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/analog-vibes.git
   cd analog-vibes
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your credentials:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

   # Discogs API (for syncing)
   VITE_DISCOGS_PERSONAL_ACCESS_TOKEN=your_token
   VITE_DISCOGS_USERNAME=your_username
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `docs/database/public-schema.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 Documentation

Detailed setup and configuration guides are available in the `docs/` folder:

- **Setup Guides**
  - [Supabase Public Setup](docs/setup/supabase-public.md) - Simple public collection
  - [Supabase Auth Setup](docs/setup/supabase-auth.md) - Multi-user with authentication
  - [Discogs API Setup](docs/setup/discogs-api.md) - Connect to Discogs

- **Development**
  - [Development Guidelines](docs/development/guidelines.md)
  - [Code Improvement Plan](docs/code-improvement-plan.md)

- **Database**
  - SQL schema files for Supabase setup

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **External API**: Discogs API
- **Storage**: LocalForage (offline caching)
- **Testing**: Vitest + Testing Library

## 🏗️ Architecture

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── ui/             # Reusable UI components
│   └── VinylCard/      # Vinyl card component system
├── hooks/              # Custom React hooks
├── services/           # API and business logic
├── contexts/           # React contexts
├── utils/              # Utility functions
└── styles/             # Global styles
```

## 🧪 Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## 🚀 Deployment

This is a standard React web app that can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder after `npm run build`
- **GitHub Pages**: Use GitHub Actions for automated deployment

## 🎨 Customization

The app uses a Blue Note-inspired design system with carefully crafted color schemes and animations. You can customize:

- **Colors**: Edit `src/constants/colorSchemes.ts`
- **Animations**: Modify Framer Motion configs in components
- **Layout**: Adjust component layouts in `src/components/`

## 🔧 Configuration

Key configuration files:

- `vite.config.ts` - Build configuration with bundle optimization
- `tailwind.config.js` - Styling configuration
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Blue Note Records album artwork
- **UI Components**: Built with [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Photos**: [Unsplash](https://unsplash.com) contributors

---

**Made with ❤️ for vinyl enthusiasts**
