"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, DollarSign, ExternalLink } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  price: number;
  duration: number;
  type: string;
  description?: string;
  rating?: number;
  image?: string;
  onClick?: () => void;
}

const getServiceEmoji = (serviceType: string): string => {
  const emojiMap: { [key: string]: string } = {
    'HAIRCUT': '💇‍♀️',
    'COLORING': '🎨',
    'STYLING': '💫',
    'FACIAL': '✨',
    'MASSAGE': '💆‍♀️',
    'NAILS': '💅',
    'SKIN_CARE': '🧴',
    'OTHER': '🌟'
  };
  return emojiMap[serviceType] || '🌟';
};

export default function ServiceCard({
  title,
  price,
  duration,
  type,
  description,
  rating,
  image,
  onClick
}: ServiceCardProps) {
  const formattedPrice = price.toLocaleString();
  
  return (
    <Card 
      className="w-full hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-purple-300 bg-white hover:bg-purple-50/50 hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">{getServiceEmoji(type)}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {title}
              </h3>
              <Badge variant="outline" className="text-xs mt-1">
                {type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          {rating && (
            <div className="flex items-center gap-1 ml-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-purple-600">
            <DollarSign className="w-3 h-3" />
            <span className="font-bold text-sm">LKR {formattedPrice}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{duration} min</span>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-400 opacity-70" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
