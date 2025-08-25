
# SalonBooking.lk

SalonBooking.lk is a comprehensive salon management platform designed to streamline operations for salon owners, enhance user experience for customers, and provide administrative tools for super admins. This project is built using modern web technologies and follows a modular structure for scalability and maintainability.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

### For Salon Owners
- Manage services, staff, and appointments.
- Create and edit service details with images.
- View reports and manage payments.

### For Customers
- Book appointments with salons.
- View and favorite salons.
- Manage profiles and payments.

### For Super Admins
- Manage salons, staff, and complaints.
- View activity logs and generate reports.
- Send notifications to users.

## Project Structure

The project follows a modular structure with separate directories for each feature and role. Below is an overview of the main directories:

- **app/**: Contains the main application pages and layouts.
  - `admin/`: Admin-specific pages like appointments, clients, and reports.
  - `salon-owner/`: Salon owner-specific pages like services, staff, and reports.
  - `user/`: User-specific pages like booking, profile, and notifications.
- **components/**: Reusable UI components like buttons, forms, and navigation.
- **hooks/**: Custom React hooks for shared functionality.
- **lib/**: Utility libraries for database connections, scheduled tasks, and more.
- **models/**: Mongoose models for MongoDB collections.
- **public/**: Static assets like images and JSON files.
- **store/**: State management using Zustand.
- **styles/**: Global and component-specific styles.
- **utils/**: Utility functions for email sending, data formatting, etc.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/salonbooking.lk.git
   ```

2. Navigate to the project directory:
   ```bash
   cd salonbooking.lk
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables by creating a `.env.local` file in the root directory. Copy the contents from `.env.example` and fill in your actual values:
   ```bash
   cp .env.example .env.local
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Setup

Before running the application, you need to set up the following services:

1. **MongoDB Database** - Create a MongoDB Atlas cluster or local MongoDB instance
2. **Clerk Authentication** - Set up a Clerk account for user authentication
3. **Upstash Redis** - Create a Redis database for caching and session management
4. **Stripe** - Set up Stripe for payment processing
5. **Google Maps API** - Get a Google Maps API key for location services
6. **SMTP Email** - Configure email service for notifications

## Usage

### Development
Run the development server and access the application at `http://localhost:3000`.

### Production
Build the application for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Security

- All sensitive data is stored in environment variables
- Never commit `.env` files to version control
- Use strong passwords and API keys
- Enable 2FA on all service accounts
- Regularly rotate API keys and secrets

## Contributing

...

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
