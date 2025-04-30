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
    <div className="grid md:grid-cols-2 gap-8 mt-6">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="duration" className="block font-medium">Duration (minutes)</label>
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
          <div className="flex-1">
            <label htmlFor="price" className="block font-medium">Price (LKR)</label>
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
        <div className="mt-6">
          <p className="font-medium mb-2">Extra Time</p>
          <p className="text-sm text-gray-500 mb-2">
            Automatically add blocked time or processing time after each appointment.
          </p>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="extraTimeType" className="block font-medium">Type</label>
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
            <div className="flex-1">
              <label htmlFor="extraTimeDuration" className="block font-medium">Duration</label>
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
    </div>
  );
}
