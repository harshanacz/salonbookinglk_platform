import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceRating {
  serviceName: string;
  rating: number;
  reviewCount: number;
}

interface SalonStatisticsProps {
  overallRating: number;
  totalReviews: number;
  serviceRatings: ServiceRating[];
  className?: string;
}

export default function SalonStatistics({ 
  overallRating, 
  totalReviews, 
  serviceRatings,
  className = "" 
}: SalonStatisticsProps) {
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = serviceRatings.reduce((acc, service) => {
      const serviceRatingFloor = Math.floor(service.rating);
      return serviceRatingFloor === rating ? acc + service.reviewCount : acc;
    }, 0);
    return { rating, count, percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Rating Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {overallRating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-6 h-6 ${
                  index < Math.floor(overallRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div>
          <h4 className="font-semibold mb-3">Rating Distribution</h4>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm w-6">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Ratings */}
        {serviceRatings.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Service Ratings</h4>
            <div className="space-y-3">
              {serviceRatings.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{service.serviceName}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`w-3 h-3 ${
                            starIndex < Math.floor(service.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        ({service.reviewCount})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">
                      {service.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
