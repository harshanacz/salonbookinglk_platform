
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
   git clone https://github.com/your-repo/salonbooking.lk.git
   ```

2. Navigate to the project directory:
   ```bash
   cd salonbooking.lk
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables by creating a `.env` file in the root directory. Refer to `.env.example` for required variables.

5. Start the development server:
   ```bash
   npm run dev
   ```

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

## Contributing

...

## License

<!-- This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. -->
