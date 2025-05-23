import React from 'react';

interface MoreInfoFormProps {
  formData: any;
  updateFormData: (data: any) => void;
  children?: React.ReactNode;
}

export default function MoreInfoForm({ formData, updateFormData, children }: MoreInfoFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    updateFormData({ [name]: type === 'checkbox' ? checked : value });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-6 items-start">
      <div className="space-y-6 flex flex-col items-center md:items-start">
        <div className="flex items-center gap-2 w-full justify-center md:justify-start">
          <input
            id="onlineBooking"
            name="onlineBooking"
            type="checkbox"
            className="accent-purple-600 scale-125"
            checked={!!formData.onlineBooking}
            onChange={handleChange}
          />
          <label htmlFor="onlineBooking" className="block font-bold">Online Booking</label>
        </div>
        <p className="text-sm text-gray-500 text-center md:text-left">
          Allow clients to book this service online via the SalonBooking.lk Marketplace, socials and your own custom booking links.
        </p>
        <div className="w-full">
          <label htmlFor="availableFor" className="block font-bold mb-2">Available For</label>
          <select
            id="availableFor"
            name="availableFor"
            className="w-full border p-2 rounded-md text-gray-500"
            value={formData.availableFor || ''}
            onChange={handleChange}
          >
            <option value="">All genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div className="w-full">
          <label htmlFor="clientInstructions" className="block font-bold mb-2">Instructions for Clients</label>
          <textarea
            id="clientInstructions"
            name="clientInstructions"
            className="w-full border p-2 rounded-md min-h-[100px]"
            value={formData.clientInstructions || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex flex-col items-center md:items-start">
        {formData.images && formData.images.length > 0 && (
          <div className="w-full">
            <p className="text-xs text-gray-500 mt-1 text-center md:text-left">First image is used as the header image.</p>
          </div>
        )}
        <div className="w-full flex flex-col items-center md:items-start">
          {children}
        </div>
      </div>
    </div>
  );
}
