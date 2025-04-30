import React from 'react';

interface PricingFormProps {
  formData: any; 
  updateFormData: (data: any) => void;
}

export default function PricingForm({ formData, updateFormData }: PricingFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: name === 'price' || name === 'duration' ? Number(value) : value });
  };

  return (
    <div className="w-full flex flex-col items-center md:items-start"> {/* Center items on mobile */}
      <div className="w-full flex flex-col gap-4 md:flex-row md:gap-8 mt-6">
        <div className="flex-1 w-full md:w-auto"> {/* Ensure full width on mobile */}
          <label htmlFor="duration" className="block font-bold">Duration (minutes)</label> {/* Added font-bold */}
          <select
            id="duration"
            name="duration"
            className="w-full border p-2 rounded-md text-gray-500"
            value={formData.duration || ''}
            onChange={handleChange}
          >
            <option value="">Select Duration</option>
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
            <option value={20}>20 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hr</option>
          </select>
        </div>
        <div className="flex-1 w-full md:w-auto"> {/* Ensure full width on mobile */}
          <label htmlFor="price" className="block font-bold">Price (LKR)</label> {/* Added font-bold */}
          <input
            id="price"
            name="price"
            type="number"
            className="w-full border p-2 rounded-md"
            value={formData.price || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="mt-6 w-full"> {/* Ensure full width on mobile */}
        <p className="font-bold mb-2 text-center md:text-left">Extra Time</p> {/* Added font-bold and centering */}
        <p className="text-sm text-gray-500 mb-2 text-center md:text-left"> {/* Center text on mobile */}
          Automatically add blocked time or processing time after each appointment.
        </p>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1 w-full md:w-auto"> {/* Ensure full width on mobile */}
            <label htmlFor="extraTimeType" className="block font-bold">Type</label> {/* Added font-bold */}
            <select
              id="extraTimeType"
              name="extraTimeType"
              className="w-full border p-2 rounded-md text-gray-500"
              value={formData.extraTimeType || ''}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="processing">Processing time after</option>
            </select>
          </div>
          <div className="flex-1 w-full md:w-auto"> {/* Ensure full width on mobile */}
            <label htmlFor="extraTimeDuration" className="block font-bold">Duration</label> {/* Added font-bold */}
            <select
              id="extraTimeDuration"
              name="extraTimeDuration"
              className="w-full border p-2 rounded-md text-gray-500"
              value={formData.extraTimeDuration || ''}
              onChange={handleChange}
            >
              <option value="">Select Duration</option>
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
