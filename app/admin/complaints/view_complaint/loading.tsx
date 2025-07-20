import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
