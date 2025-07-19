// Middleware utilities for admin activity tracking
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logAdminActivity, AdminActionType } from "@/lib/adminActivityLogger";

export interface AdminInfo {
  adminId: string;
  adminName: string;
  adminEmail: string;
  isAdmin: boolean;
}

// Get admin information from the current session
export async function getAdminInfo(): Promise<AdminInfo | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    await dbConnect();
    const user = await User.findOne({ clerkUserId: userId });

    if (!user || user.type !== "ADMIN") {
      return null;
    }

    return {
      adminId: user._id.toString(),
      adminName: user.userName || 'Unknown Admin',
      adminEmail: user.email || 'unknown@admin.com',
      isAdmin: true
    };
  } catch (error) {
    console.error('[GET_ADMIN_INFO_ERROR]', error);
    return null;
  }
}

// Helper function to log admin activity with request context
export async function logAdminActivityWithContext(
  action: AdminActionType,
  details: string,
  target?: string,
  metadata?: Record<string, any>
) {
  try {
    const adminInfo = await getAdminInfo();
    if (!adminInfo) return;

    logAdminActivity({
      adminId: adminInfo.adminId,
      adminName: adminInfo.adminName,
      adminEmail: adminInfo.adminEmail,
      action,
      target: target || 'system',
      details,
      metadata
    });
  } catch (error) {
    console.error('[LOG_ADMIN_ACTIVITY_WITH_CONTEXT_ERROR]', error);
  }
}

// Admin activity decorator for API routes
export function withAdminActivityLogging(
  action: AdminActionType,
  getDetails: (req?: NextRequest, res?: any) => string,
  getTarget?: (req?: NextRequest, res?: any) => string,
  getMetadata?: (req?: NextRequest, res?: any) => Record<string, any>
) {
  return function (originalFunction: Function) {
    return async function (request: NextRequest, ...args: any[]) {
      const result = await originalFunction(request, ...args);
      
      // Log the activity after successful execution
      if (result && result.status !== 401 && result.status !== 403 && result.status < 400) {
        try {
          const details = getDetails(request, result);
          const target = getTarget ? getTarget(request, result) : undefined;
          const metadata = getMetadata ? getMetadata(request, result) : undefined;
          
          await logAdminActivityWithContext(action, details, target, metadata);
        } catch (error) {
          console.error('[ADMIN_ACTIVITY_DECORATOR_ERROR]', error);
        }
      }
      
      return result;
    };
  };
}
