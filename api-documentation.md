# API Documentation

This document provides documentation for the web application's API.

## User API

### GET /api/user/profile

- **Authentication**: Requires a logged-in user (using Clerk).
- **Functionality**: Fetches the profile of the currently logged-in user from the database.
- **Response (Success)**: A JSON object with `fullName`, `email`, `mobileNumber`, `gender`, `country`, and `profileImage`.
- **Response (Error)**:
    - `401 Unauthorized`: If the user is not logged in.
    - `404 Not Found`: If the user is not found in the database.
    - `500 Internal Server Error`: For any other errors.

### POST /api/user/profile

- **Authentication**: Requires a logged-in user (using Clerk).
- **Functionality**: Creates or updates the user's profile.
- **Request Body**: A JSON object with `fullName`, `mobileNumber`, `gender`, and `country`.
- **Response (Success)**: A JSON object with `success: true` and the user object.
- **Response (Error)**:
    - `401 Unauthorized`: If the user is not logged in.
    - `500 Internal Server Error`: For any other errors.

## Salons API

### GET /api/salons/{id}

- **Authentication**: None. This is a public endpoint.
- **Functionality**: Fetches the details of a specific salon by its ID. It can also fetch by `userId`.
- **Path Parameter**: `id` - The ID of the salon or the salon owner.
- **Response (Success)**: A JSON object with the salon's details: `id`, `businessName`, `description`, `profilePictureUrl`, `phoneNumber`, `reviewScore`, `numberOfReviewers`, `location`, and `isVerified`.
- **Response (Error)**:
    - `400 Bad Request`: If the provided ID is not a valid MongoDB ObjectId.
    - `404 Not Found`: If the salon is not found or the owner is deactivated.
    - `500 Internal Server Error`: For any other errors.

## Services API

### GET /api/services/{id}

- **Authentication**: None. This is a public endpoint.
- **Functionality**: Fetches the details of a specific service by its ID. It also fetches related services from the same salon and available staff members.
- **Path Parameter**: `id` - The ID of the service.
- **Response (Success)**: A JSON object containing:
    - `service`: Detailed information about the requested service, including salon details.
    - `relatedServices`: A list of other services offered by the same salon.
    - `staff`: A list of active staff members at the salon.
- **Response (Error)**:
    - `400 Bad Request`: If the provided ID is not a valid MongoDB ObjectId.
    - `404 Not Found`: If the service is not found or the salon owner is deactivated.
    - `500 Internal Server Error`: For any other errors.

## Appointments API

### GET /api/appointments

- **Authentication**: None.
- **Functionality**: Fetches a list of appointments. Can be filtered by `salonId`.
- **Query Parameter**: `salonId` (optional) - The ID of the salon to filter appointments by.
- **Response (Success)**: A JSON object with a list of appointments, with `client`, `service`, and `staff` details populated.

### POST /api/appointments

- **Authentication**: Requires a logged-in user (using Clerk).
- **Functionality**: Creates a new appointment.
- **Request Body**: A JSON object with `timeSlot`, `salonId`, `serviceId`, `staffId` (optional), `paymentMethod`, `note` (optional), `date`, `time`, `paymentIntentId`, `totalAmount`, and `paymentStatus`.
- **Response (Success)**: A JSON object with `success: true`, a message, and the created appointment.
- **Response (Error)**:
    - `400 Bad Request`: If required fields are missing or IDs are invalid.
    - `401 Unauthorized`: If the user is not logged in.
    - `404 Not Found`: If the salon or staff member is not found.
    - `500 Internal Server Error`: For any other errors.

### PUT /api/appointments

- **Authentication**: None.
- **Functionality**: Updates the status of an appointment.
- **Request Body**: A JSON object with `id` (the appointment ID) and `status`.
- **Response (Success)**: A JSON object with `success: true` and the updated appointment.
- **Response (Error)**:
    - `404 Not Found`: If the appointment is not found.

## Complaints API

### GET /api/complaints

- **Authentication**: Requires a logged-in user (using Clerk).
- **Functionality**: Fetches all complaints for the logged-in user.
- **Response (Success)**: A JSON array of complaint objects.
- **Response (Error)**:
    - `401 Unauthorized`: If the user is not logged in.
    - `404 Not Found`: If the user is not found in the database.
    - `500 Internal Server Error`: For any other errors.

### POST /api/complaints

- **Authentication**: Requires a logged-in user (using Clerk).
- **Functionality**: Creates a new complaint.
- **Request Body**: A JSON object with `appointmentId`, `category`, `subject`, and `description`.
- **Response (Success)**: A JSON object with the created complaint.
- **Response (Error)**:
    - `400 Bad Request`: If required fields are missing.
    - `401 Unauthorized`: If the user is not logged in.
    - `404 Not Found`: If the user is not found in the database.
    - `500 Internal Server Error`: For any other errors.

## Ratings API

### GET /api/ratings

- **Authentication**: Requires a logged-in user (using Clerk).
- **Functionality**: Fetches ratings for the logged-in user. Can be filtered by `serviceId` or `appointmentId`.
- **Query Parameters**:
    - `serviceId` (optional): Filter ratings by service.
    - `appointmentId` (optional): Filter ratings by appointment.
- **Response (Success)**: A JSON object with a list of ratings.
- **Response (Error)**:
    - `401 Unauthorized`: If the user is not logged in.
    - `404 Not Found`: If the user is not found in the database.
    - `500 Internal Server Error`: For any other errors.

### POST /api/ratings

- **Authentication**: Requires a logged-in user (using Clerk).
- **Functionality**: Creates or updates a rating for a service.
- **Request Body**: A JSON object with `appointmentId`, `serviceId`, `rating`, `comment` (optional), and `ratingId` (optional, for updates).
- **Response (Success)**: A JSON object with `success: true`, the saved rating, and updated service stats.
- **Response (Error)**:
    - `400 Bad Request`: If required fields are missing or data is invalid.
    - `401 Unauthorized`: If the user is not logged in.
    - `404 Not Found`: If the user, appointment, or service is not found.
    - `500 Internal Server Error`: For any other errors.
