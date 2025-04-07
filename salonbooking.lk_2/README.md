# Salon Booking Application

A modern web application for booking salon services, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 Beautiful and responsive UI
- 📱 Mobile-first design
- 🔍 Search and filter services
- 📅 Real-time booking system
- 💳 Integrated checkout process
- 👥 User profiles and reviews
- 🏪 Salon profiles with detailed information
- 👨‍💼 Staff management
- ⭐ Rating and review system

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **UI Components:** shadcn/ui
- **Icons:** Lucide Icons
- **Date Handling:** date-fns

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/salon-booking.git
cd salon-booking
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_API_URL=your_api_url
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
salon-booking/
├── app/                    # Next.js app directory
│   ├── service/           # Service-related pages
│   ├── salon/            # Salon-related pages
│   ├── checkout/         # Checkout process
│   └── admin/            # Admin dashboard
├── components/           # Reusable components
├── store/               # Zustand store
├── lib/                 # Utility functions
└── public/             # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 