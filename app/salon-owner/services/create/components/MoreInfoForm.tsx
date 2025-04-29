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
    <div className="grid md:grid-cols-2 gap-8 mt-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <input
            id="onlineBooking"
            name="onlineBooking"
            type="checkbox"
            className="accent-purple-600 scale-125"
            checked={!!formData.onlineBooking}
            onChange={handleChange}
          />
          <label htmlFor="onlineBooking" className="block font-medium">Online Booking</label>
        </div>
        <p className="text-sm text-gray-500">
          Allow clients to book this service online via the SalonBooking.lk Marketplace, socials and your own custom booking links.
        </p>
        <div>
          <label htmlFor="availableFor" className="block font-medium">Available For</label>
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
        <div>
          <label htmlFor="clientInstructions" className="block font-medium">Instructions for Clients</label>
          <textarea
            id="clientInstructions"
            name="clientInstructions"
            className="w-full border p-2 rounded-md min-h-[100px]"
            value={formData.clientInstructions || ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        {/* Only show image preview, not upload */}
        {formData.images && formData.images.length > 0 && (
          <div>
            <label className="block font-medium mb-2">Service Images Preview</label>
            <div className="flex gap-2 flex-wrap">
              {formData.images.map((url: string, idx: number) => (
                <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden flex flex-col items-center">
                  <img src={url} alt={`Service Image ${idx + 1}`} className="object-cover w-full h-full" />
                  <span className="absolute top-0 left-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                    {idx === 0 ? "Header" : `Image ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">First image is used as the header image.</p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
