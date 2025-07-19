# 🧪 How to Test Your Redis View Tracking System

## ✅ What We've Confirmed So Far

1. **Redis Connection**: ✅ Working perfectly (test-redis-simple.js passed)
2. **All Code Components**: ✅ Implemented and in place
3. **Environment Variables**: ✅ Configured in .env.local

## 🚀 How to Verify It's Working

### Step 1: Start Your Development Server
```bash
npm run dev
```
Wait for the server to start (usually on http://localhost:3000)

### Step 2: Test the Complete Flow

#### Option A: Automatic Test (Recommended)
```bash
# Run after your dev server is running
node scripts/test-view-tracking.js
```

#### Option B: Manual Testing

1. **Visit a Service Page**
   - Go to any service detail page (e.g., `/service/[serviceId]`)
   - Each page view should increment the counter in Redis

2. **Check Real-time in Browser Console**
   ```javascript
   // Open browser dev tools and run:
   fetch('/api/services/metrics', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ serviceId: 'test-123', action: 'view' })
   }).then(r => r.json()).then(console.log)
   ```

3. **Check Salon Owner Dashboard**
   - Login as salon owner
   - Go to `/salon-owner/services`
   - Click "Sync Views" button to see updated counts
   - Views column should show real numbers instead of "N/A"

### Step 3: Verify Data Flow

#### ✅ Instant Clicks ➡️ Upstash Redis (Short-Term Memory)
- Every service view immediately increments Redis counter
- Test: Check browser network tab for POST to `/api/services/metrics`

#### ✅ Upstash Redis ➡️ Scheduled Update ➡️ MongoDB  
- Every hour, Redis data syncs to MongoDB
- Manual sync available via salon owner dashboard
- Test: Click "Sync Views" in salon owner services page

## 🔍 Debugging Commands

### Check Redis Directly
```bash
node scripts/test-redis-simple.js
```

### Check if Your API Routes Work
```bash
# After dev server is running:
node scripts/test-view-tracking.js
```

### Check MongoDB Connection
```bash
# In your project terminal:
npm run build  # This will validate MongoDB connections
```

## 📊 Expected Behavior

1. **Service Page Views**: Each visit increments Redis counter instantly
2. **Salon Owner Dashboard**: Shows "Views" column with sync button
3. **Scheduled Sync**: Runs every hour automatically
4. **Manual Sync**: Available via salon owner interface
5. **Fallback**: If Redis fails, writes directly to MongoDB

## 🎯 Success Indicators

- ✅ Service pages load without errors
- ✅ Redis test script shows "Redis is working perfectly!"
- ✅ Salon owner services page shows "Views" instead of "Impressions"
- ✅ Sync button responds and shows success messages
- ✅ View counts increase when services are visited

## 🚨 Common Issues & Solutions

### Issue: "Cannot connect to Redis"
**Solution**: Check your .env.local file has correct UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

### Issue: "API call failed"
**Solution**: Make sure development server is running with `npm run dev`

### Issue: "Sync requires authentication"
**Solution**: Login as salon owner before testing sync functionality

### Issue: Views not updating
**Solution**: 
1. Check browser console for JavaScript errors
2. Verify service IDs are valid in your database
3. Run Redis test script to confirm connection

## 🎉 Your System Architecture

```
User clicks service → 
  Next.js API (/api/services/metrics) → 
    Upstash Redis (instant storage) → 
      Scheduled task (hourly) → 
        MongoDB (persistent storage) → 
          Salon Owner Dashboard (display)
```

This is exactly the flow you described: **"Instant Clicks ➡️ Upstash Redis (Short-Term Memory) ➡️ Scheduled Update ➡️ MongoDB"** ✅
