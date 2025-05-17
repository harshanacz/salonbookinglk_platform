"use client";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  serviceName: string;
}

const RateDialog = ({ open, onClose, onSubmit, serviceName }: Props) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Rate: {serviceName}</h2>
        <div className="flex items-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-3xl focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <span
                style={{
                  color: star <= (hovered || rating) ? "#facc15" : "#d1d5db",
                  transition: "color 0.2s",
                  cursor: "pointer",
                }}
              >
                ★
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 p-2 bg-purple-500 text-white rounded-lg"
            onClick={() => {
              if (rating > 0) {
                onSubmit(rating);
                setRating(0);
              }
            }}
            disabled={rating === 0}
          >
            Submit
          </button>
          <button
            className="flex-1 p-2 bg-gray-200 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateDialog;