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
- **SignUp URL**: /sign-up

---

### 2. Forgot password screen
- **Detail**: user clicks forgot password
- **URL**: `/user/forgot-password

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

### 1. Login Screen and signup screens
- **Login URL**: /salon-owner/sign-in
- **SignUp URL**: /salon-owner/sign-up

---

### 2. salon-owner profile screen
- **URL**: `/salon-owner/profile

---

### 3. salon-owner settings screen 
**Detail**: salon owner can edit salon details, business hours, closed days, verify salon and security settings
- **URL**: `/salon-owner/setttings

---

### 4. salon-owner change password screen
**Detail**: owner can change the password
- **URL**: `/salon-owner/settings/changePassword

---

### 5. salon-owner deactivate account screen
**Detail**: owner can deactivate her account by providing email and password but the account can be deactivated only if the salon does not have any upcoming boookings and payments
- **URL**: `/salon-owner/settings/deactivateAccount

---

### 6. Forgot password screen
- **Detail**: salon owner clicks forgot password
- **URL**: `/salon-owner/forgot-password
  
---

### 7. Dashboard screen
- **URL**: `/salon-owner


## ✅ Admin Flows


### Dineth Bandara

### 1. View verification screen
- **Detail**: Admin can view submitted salon documents and verify or reject
- **URL**: /admin/verification

---


