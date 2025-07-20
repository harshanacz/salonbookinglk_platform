import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  serviceName: string;
  salonName: string;
  loading?: boolean;
  existingRating?: {
    rating: number;
    comment: string;
  } | null;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  serviceName,
  salonName,
  loading = false,
  existingRating = null
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Load existing rating data when modal opens
  useEffect(() => {
    if (isOpen && existingRating) {
      setRating(existingRating.rating);
      setComment(existingRating.comment || '');
    } else if (isOpen && !existingRating) {
      setRating(0);
      setComment('');
    }
  }, [isOpen, existingRating]);

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit(rating, comment);
    // Reset form
    setRating(0);
    setComment('');
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = existingRating !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isEditing ? 'Edit Your Rating' : 'Rate Your Experience'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Service:</span> {serviceName}
          </p>
          <p className="text-gray-600 mb-4">
            <span className="font-medium">Salon:</span> {salonName}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex justify-center mb-2">
            <StarRating
              onRatingChange={setRating}
              initialRating={rating}
              size={32}
              disabled={loading}
            />
          </div>
          <p className="text-center text-sm text-gray-500">
            {rating === 0 && "Select a rating"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
            maxLength={500}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            disabled={loading || rating === 0}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};
