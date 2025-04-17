# Salon Booking LK

## ✅ User Flows

### Harshana AMK

### 1. Home Screen (Before and After Sign-In)

- **Before Sign-In**: General service listing (limited functionality)
- **After Sign-In**: Personalized recommendations + past bookings on top
- **URL**: `/`

---

### 2. Search Screen

- **Detail**: Type keywords or use filters → See relevant services + map
- **URL**: `/search?keyword=test`

---

### 3. Category Screen

- **Detail**: Select category → View available services
- **URL Examples**:  
  `/categories/hair-cuts`

---

### 4. Service Card View

- **Detail**: Click a card → View service info, price, reviews, book option
- **URL**: `/service/[id]`

---

### 5. Service Card Management (Create / Delete / Manage)

- **Create**: Add service (multi-step) → Submit for review
- **Delete**: Deactivation flow → Auto-delete after 7 days post last appointment
- **Manage**: Edit → Minor edits allow faster approval
- **URL**: `/salon-owner/services/create`

---

### 6. Service Management Tabs (Active / Deactivated / Pending)

- **Detail**: View categorized services by status. Fix and resubmit rejected ones.
- **URL**: `/salon-owner/services`

---

### 7. Admin Panel – Approve / Reject / Suspend Services

- **Detail**: Review all submitted services, take actions
- **URL**:  
  `/admin/service-cards`  
  `/admin/service-cards/[id]`

  ## ✅ User Flows

### Dineth Bandara

### 1. Login Screen and signup screens

- **Login URL**: /sign-in
- **SignUp URL**: /sign-up - two buttons - join as user / join as salon owner
- **Salon Owner SignUp URL**: /sign-up/salon-owner
- **SignUp URL**: /sign-up/user

### 1. Forgot password screen

- **URL**: /forgot-password - only include an email input
- **Reset Password**: /reset-password - include new password and confirm password inputs
-

---

### 3. Profile screen

**Detail**: User can click each field, update details and save

- **URL**: `/user/profile

---

### 4. user favorites screen

**Detail**: User can add or remove services.

- **URL**: `/user/favorites

---

### 4. user settings screen

**Detail**: User can change password or deactivate the account

- **URL**: `/user/settings

---

## ✅ Salon-owner Flows

### Dineth Bandara

### 2. salon-owner profile screen

- **URL**: `/salon-owner/profile

---

### 3. salon-owner settings screen

**Detail**: salon owner can edit salon details, business hours, closed days, verify salon and security settings

- **URL**: `/salon-owner/setttings

---

### 4. salon-owner change password screen

**Detail**: owner can change the password

- **URL**: `/salon-owner/settings/change-password

---

### 5. salon-owner deactivate account screen

**Detail**: owner can deactivate her account by providing email and password but the account can be deactivated only if the salon does not have any upcoming boookings and payments

- **URL**: `/salon-owner/settings/deactivate-account

---

### 7. Dashboard screen

- **URL**: `/salon-owner

## ✅ Admin Flows

### Dineth Bandara

### 1. View verification screen

- **Detail**: Admin can view submitted salon documents and verify or reject
- **URL**: /admin/verification

---

## ✅ Booking Flow

Nirasha

1. Select Time Slot
   Details:
   Select professional
   Select date
   Select timeslot
   URL: service/[id]/time

2. Confirm Booking
   Details:
   Select payment method
   Confirm booking
   URL: service/[id]/confirm

3. After Confirmation
   Redirect to User Appointments Page
   if pay at venue - URL: user/booking/user-appointments |
   if pay by card - URL: user/booking/payment-success

---

### Salon Owner Workflows(Janith)

### 1. Dashboard (Analytics Overview)

- **Detail**: Approved login redirects to the dashboard with an overview of analytics.
- **Includes**:
  - Total Appointments (Graph/Chart)
  - Sales & Revenue Trends
  - Peak Booking Hours
  - Popular Services Data
  - Staff Performance Summary
- **URL**: `/salon-owner`

---

### 2. Clients – View & Manage Clients

- **Detail**: Click on "Clients" in the menu to view a customer list sorted by the number of appointments.
- **Client Details**:
  - Name, Contact Info
  - Total Appointments
  - Booking History
  - Amount Spent
- **URL**: `/salon-owner/clients`

---

### 3. Reports – Generate Reports

- **Detail**: Click on "Reports" in the menu, apply filters (e.g., Date Range, Service, Staff) to generate reports.
- **Includes**:
  - Total Appointments
  - Total Revenue
  - Sales Breakdown
  - Staff Performance
- **Options**: Download as **PDF/CSV (optional)**
- **URL**: `/salon-owner/reports`

---

### 4. Staff Management – Add/Edit/Delete Staff

- **Detail**: Click "Staff Management" in the menu to manage staff members.
- **Features**:
  - **Add Staff**: Fill in details to add a new staff member (job assignments happen in service card creation).
  - **Edit Staff**: Modify staff details (name, contact, etc.).
  - **Delete Staff**:
    - If no ongoing bookings → Delete immediately.
    - If ongoing bookings → Cannot delete, but deactivate from new bookings.
    - Once bookings are completed, deletion is allowed.
- **URLs**:
  - `/salon-owner/staff` – Staff list
  - `/salon-owner/staff/create` - Create staff member
  - `/salon-owner/staff/update-attendance?id=1` - Update Attendance
  - `/salon-owner/staff/edit?id=1` - Edit Attendance

---

### 5. Staff Availability – Manage Working Hours

- **Detail**: Click "Status" on the staff table to update availability.
- **Availability Options**:
  - Full-day unavailability (days off)
  - Hour-based unavailability (break periods)
- **Logic**:
  - If a booking exists for the newly marked unavailable time, notify the owner.
  - Unavailable staff cannot be assigned to new bookings in those time slots.
- **URL**: `/salon-owner/staff/availability`

---

### 6. Admin – Manage Complaints

- **Detail**: Admin can view, respond to, and resolve complaints.
- **User Actions**:
  - **Enter Dashboard**: Admin lands on the dashboard, which shows complaint-related insights (e.g., pending complaints count).
  - **Go to Complaints**: Admin clicks on "Complaints" to view a list of complaints sorted by status (Pending, In Progress, Resolved).
  - **Check Complaint Details**: Clicking on a complaint opens details such as type, user info, description, priority level, and supporting documents.
  - **Respond to Complaint**: Admin provides a response and either warns or suspends the salon.
  - **Mark as Resolved**: Updates the complaint status to "Resolved" and notifies the complainant.
  - **Reject Complaint**: If invalid, the admin clicks "Reject," provides a reason, and notifies the complainant.
  - **Generate Complaint Reports**: Admin can generate reports showing complaint trends, resolved vs. pending complaints.
- **URLs**:
  - `/admin/complaints` – Displays list of complaints.
  - `/admin/complaints/[id]` – Opens specific complaint details.

---

### 7. Add Complaint (User Section)

- **Detail**: Users can submit complaints through the appointment section.
- **User Actions**:
  - Click "Add Complaint" button in the appointment.
  - Review the auto-filled appointment details.
  - Add description, attach files, and submit.
- **System Response**:
  - Complaint is sent to the admin, and the admin is notified.
- **URL**: `/user/add-complaint` – Form to submit a new complaint
