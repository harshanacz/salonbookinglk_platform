# Rating System Implementation

## Overview

I have successfully implemented a comprehensive rating system for past appointments in the SalonBooking.lk application. Here's what has been implemented:

## 🌟 Features Implemented

### 1. **Rating Model**
- Created `models/Rating.ts` with the following schema:
  - `userId`: Reference to the user giving the rating
  - `appointmentId`: Reference to the appointment being rated
  - `serviceId`: Reference to the service being rated
  - `salonId`: Reference to the salon
  - `rating`: Number (1-5 stars)
  - `comment`: Optional comment (max 500 characters)
  - Unique compound index to prevent duplicate ratings

### 2. **Rating API**
- Created `/api/ratings/route.ts` with:
  - **GET**: Retrieve ratings for a user or service
  - **POST**: Submit new ratings with validation
  - Automatic update of service `reviewCount` and `averageRating`

### 3. **UI Components**
- **StarRating Component** (`components/ui/star-rating.tsx`):
  - Interactive 5-star rating system
  - Hover effects and visual feedback
  - Read-only display version for showing existing ratings

- **RatingModal Component** (`components/ui/rating-modal.tsx`):
  - Beautiful modal interface for rating submission
  - Star rating selection
  - Optional comment textarea
  - Loading states and validation

### 4. **Updated Left Column**
- Modified `components/user-appointments/left-column.tsx`:
  - "Review" button for completed appointments
  - "Reviewed" state for already-rated appointments
  - Integration with rating modal
  - Local storage tracking of rated appointments

### 5. **Service Model Updates**
- Updated `models/Service.ts` to include:
  - `reviewCount`: Number of reviews (incremented automatically)
  - `averageRating`: Calculated average rating (updated automatically)

## 🚀 How to Test

### 1. **Add Sample Past Appointments**
Open the browser console on the user appointments page and run:
```javascript
// Copy the function from utils/addSampleData.js and run it
addSamplePastAppointments()
```

### 2. **Test Rating Flow**
1. Navigate to `/user/booking/user-appointments`
2. Look for "Review" buttons on completed past appointments
3. Click "Review" to open the rating modal
4. Select a star rating (1-5)
5. Optionally add a comment
6. Submit the rating
7. Notice the button changes to "Reviewed" (disabled state)

### 3. **Verify Database Updates**
After submitting a rating:
- Check the `ratings` collection in MongoDB for new rating documents
- Check the related `services` collection to see updated `reviewCount` and `averageRating`

## 📁 Files Created/Modified

### New Files:
- `models/Rating.ts` - Rating data model
- `app/api/ratings/route.ts` - Rating API endpoints
- `components/ui/star-rating.tsx` - Star rating components
- `components/ui/rating-modal.tsx` - Rating modal interface
- `utils/addSampleData.js` - Sample data for testing

### Modified Files:
- `components/user-appointments/left-column.tsx` - Added rating functionality
- `components/user-appointments/appointment-utils.tsx` - Updated interfaces
- `components/user-appointments/appointment-datamanager.tsx` - Updated appointment handling
- `app/user/booking/user-appointments/page.tsx` - Added salon ID support
- `models/Service.ts` - Already had rating fields
- `models/index.ts` - Added Rating model export

## 🎯 Key Features

1. **Prevent Duplicate Ratings**: Users can only rate each service once per appointment
2. **Real-time Updates**: Service ratings update immediately after submission
3. **Beautiful UI**: Intuitive star rating interface with hover effects
4. **Persistent State**: Tracks which appointments have been rated
5. **Validation**: Proper input validation on both client and server
6. **Error Handling**: Comprehensive error handling with user feedback

## 🔧 Technical Implementation

- **Database**: MongoDB with Mongoose schemas
- **API**: Next.js API routes with proper authentication
- **UI**: React components with TypeScript
- **State Management**: Local state with localStorage persistence
- **Styling**: Tailwind CSS with hover effects and animations

The rating system is now fully functional and ready for production use! Users can rate their past appointments, and these ratings will automatically update the service's average rating and review count in the database.
