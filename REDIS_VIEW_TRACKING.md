# Redis View Tracking Implementation

This document explains the Redis-based view tracking system for service cards.

## Overview

The system uses Upstash Redis to track service card views in real-time and periodically syncs the data to MongoDB for persistence and reporting.

## Architecture

1. **Redis (Upstash)**: Real-time view counting
2. **MongoDB**: Persistent storage and reporting
3. **Scheduled Sync**: Automatic hourly synchronization
4. **Manual Sync**: On-demand synchronization via UI

## Components

### 1. Redis Client (`lib/redis.ts`)
- Initializes Upstash Redis connection
- Provides helper functions for view tracking
- Handles error fallbacks

### 2. Service Model Updates (`models/Service.ts`)
- Added `viewsCount` field to store Redis view counts in MongoDB
- Maintains existing `views` field for compatibility

### 3. Service Metrics API (`app/api/services/metrics/route.ts`)
- Handles view tracking requests from service cards
- Increments Redis counters
- Periodic sync to MongoDB (every 10 views)
- Fallback to MongoDB if Redis fails

### 4. Sync API (`app/api/salon-owner/services/sync-views/route.ts`)
- Manual sync endpoint for salon owners
- Syncs all service views from Redis to MongoDB
- Returns detailed sync results

### 5. Scheduled Tasks (`lib/scheduledTasks.ts`)
- Automatic hourly sync of all service views
- Runs alongside existing cleanup tasks

### 6. Salon Owner UI Updates (`app/salon-owner/services/page.tsx`)
- Displays view counts instead of impressions
- Includes manual sync button
- Real-time sync status

## Usage

### Environment Variables
```bash
UPSTASH_REDIS_REST_URL=your_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token_here
```

### Setup Upstash Redis
1. Sign up at https://console.upstash.com/
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add them to your `.env.local` file

### View Tracking Flow
1. User views a service card
2. `trackServiceView()` function is called
3. Request sent to `/api/services/metrics`
4. Redis counter incremented
5. Every 10 views, data synced to MongoDB
6. Hourly scheduled sync ensures consistency

### Manual Sync
Salon owners can manually sync views:
1. Go to Services page
2. Click "Sync Views" button
3. System syncs all Redis data to MongoDB
4. UI updates with latest counts

## Benefits

1. **Performance**: Redis provides fast, real-time counting
2. **Scalability**: Redis handles high-frequency view tracking
3. **Reliability**: Fallback to MongoDB if Redis fails
4. **Consistency**: Regular sync ensures data accuracy
5. **Monitoring**: Detailed sync reporting and error handling

## Error Handling

1. **Redis Unavailable**: Falls back to direct MongoDB updates
2. **Sync Failures**: Individual service sync errors don't affect others
3. **Network Issues**: Graceful degradation with retry logic
4. **Data Integrity**: Redis data is considered cache, MongoDB is source of truth

## Monitoring

- Scheduled task logs provide sync status
- Manual sync provides detailed results
- Error logs help identify issues
- UI shows sync status and progress

## Future Enhancements

1. **Advanced Analytics**: Click tracking, user sessions
2. **Caching**: Cache frequently accessed data
3. **Real-time Dashboard**: Live view count updates
4. **Geographic Tracking**: Location-based analytics
5. **A/B Testing**: Track different service card designs
