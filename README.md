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

  ## ✅ Booking Flow
  Nirasha

 1. Select Service
Details: When selecting a service, it displays available services.
URL: service/[id]/available-services

2. Select Time Slot
Details:
Select professional
Select date
Select timeslot
URL: service/[id]/time

3. Confirm Booking
Details:
Select payment method
Confirm booking
URL: service/[id]/confirm

4. Payment Flow (if "Pay via Credit/Debit Card" is selected)
Navigate to Add or Select Payment Card
URL: user/payments/add-card/payment-card

5. After Confirmation
Redirect to User Appointments Page
URL: user/booking/user-appointments
