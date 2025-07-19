import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  totalRatings: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function RatingDisplay({ rating, totalRatings, size = "md", showText = true }: RatingDisplayProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3";
      case "md":
        return "h-4 w-4";
      case "lg":
        return "h-5 w-5";
      default:
        return "h-4 w-4";
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-sm";
      case "lg":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${getSizeClasses()} ${
              star <= Math.round(rating)
                ? "fill-yellow-400 stroke-yellow-400"
                : "fill-gray-200 stroke-gray-200"
            }`}
          />
        ))}
      </div>
      {showText && (
        <>
          <span className={`font-medium ${getTextSizeClasses()}`}>
            {totalRatings > 0 ? rating.toFixed(1) : "0"}
          </span>
          <span className={`text-gray-500 ${getTextSizeClasses()}`}>
            ({totalRatings})
          </span>
        </>
      )}
    </div>
  );
}
