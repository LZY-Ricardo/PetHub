# Frontend Installation & Setup

The frontend is now created with React 18 + Vite + Ant Design 5.

## Installation

```bash
cd f:\myProjects\pet\frontend
npm install
```

## Development

```bash
npm run dev
```

The application will run on http://localhost:5173 with API proxy to http://localhost:3000.

## Design Features

### "Warm Editorial" Aesthetic
- **Typography**: Noto Serif SC (headings) + Noto Sans SC (body)
- **Color Palette**: Warm coral (#FF9F43), peach (#FFBE76), cream (#FFFDF7)
- **Animations**: Fade-in-up, slide-in, scale animations with stagger delays
- **Cards**: Rounded corners (16px), soft shadows, hover effects
- **Buttons**: Rounded pills (24px), gradient backgrounds, smooth transitions

### Pages Structure
- Home Page with hero section, stats, features, and featured pets
- Authentication (Login/Register) with warm, inviting design
- Pet List and Detail pages
- Adoption Application management
- Lost Pet listings
- Forum with posts, comments, likes
- Admin Dashboard

### Key Features
- Fully responsive design
- Smooth page transitions
- Custom Ant Design theme
- Protected routes with authentication
- Beautiful micro-interactions
- Editorial-style typography

## Notes

The frontend uses:
- React 18 with hooks
- React Router v6 for navigation
- Ant Design 5 with custom theme
- Axios for API calls (needs to be added)
- Context API for auth state
- Custom CSS animations and transitions

All components follow the "Warm Editorial" aesthetic with warm colors, playful animations, and professional polish.
