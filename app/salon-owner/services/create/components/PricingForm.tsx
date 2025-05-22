import React from 'react';

interface PricingFormProps {
  formData: any; 
  updateFormData: (data: any) => void;
}

export default function PricingForm({ formData, updateFormData }: PricingFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: name === 'price' ? Number(value) : value });
  };

  return (
    <div className="w-full flex flex-col items-center md:items-start">
      <div className="w-full flex flex-col gap-4 md:flex-row md:gap-8 mt-6">
        <div className="flex-1 w-full md:w-auto">
          <label htmlFor="duration" className="block font-bold mb-2">Duration</label>
          <select
            id="duration"
            name="duration"
            className="w-full border p-2 rounded-md text-gray-500"
            value={formData.duration || ''}
            onChange={handleChange}
          >
            <option value="">Select Duration</option>
            <option value={30}>30 min</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.30 hour</option>
          </select>
        </div>
        <div className="flex-1 w-full md:w-auto">
          <label htmlFor="price" className="block font-bold mb-2">Price (LKR)</label>
          <input
            id="price"
            name="price"
            type="number"
            className="w-full border p-2 rounded-md"
            value={formData.price || ''}
            onChange={handleChange}
            placeholder="Enter price"
          />
        </div>
      </div>
    </div>
  );
}
