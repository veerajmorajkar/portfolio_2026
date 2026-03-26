# Turntable Portfolio

An interactive, retro-styled portfolio website featuring a vinyl turntable interface. Users can select different "records" to explore various sections of the portfolio, with smooth animations and audio playback.

## Features

- **Interactive Turntable Interface**: Click on vinyl records to play different sections
- **Smooth Animations**: Squash-and-stretch physics for disc movements
- **Audio Playback**: Each section has its own soundtrack with real-time audio visualization
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Retro Y2K Aesthetic**: Pixel-art fonts, glowing effects, and nostalgic UI elements
- **Accessibility**: Keyboard navigation and ARIA labels throughout

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast builds and development
- **Framer Motion** for smooth animations
- **Context API** for state management
- **Vitest** for testing with property-based tests

## Project Structure

```
src/
├── components/       # React components (Turntable, Disc, InfoPanel, etc.)
├── context/          # State management (TurntableContext, reducer)
├── data/             # Content data (sections, tokens)
├── services/         # Audio player service
├── styles/           # Global CSS with responsive breakpoints
├── types/            # TypeScript type definitions
└── __tests__/        # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm test
```

## Deployment

The project is production-ready and can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use the `gh-pages` branch
- **AWS S3**: Upload the `dist` folder to an S3 bucket

## Performance Optimizations

- Code splitting for React and Framer Motion
- Minified and compressed assets
- Optimized images with proper formats
- CSS custom properties for responsive scaling
- Lazy loading for modal components

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Private project - All rights reserved

## Author

Veeraj Morajkar
