import { Metadata } from "next";
import NotificationHistory from "@/components/admin/notification-history";

export const metadata: Metadata = {
  title: "Notification History",
  description: "View all sent notifications",
};

export default function NotificationHistoryPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Notification History</h1>
        <p className="text-muted-foreground mt-2">
          View all notifications sent to salons and clients
        </p>
      </div>
      <NotificationHistory />
    </div>
  );
}
