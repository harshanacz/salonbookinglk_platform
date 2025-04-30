import React from 'react';

const categories = [
  { id: 1, name: "Hair Cuts", value: "HAIRCUT", icon: "✂️" },
  { id: 2, name: "Nail Arts", value: "NAIL_ARTS", icon: "💅" },
  { id: 3, name: "Skin Care", value: "SKIN_CARE", icon: "✨" },
  { id: 4, name: "Brows & Lashes", value: "BROWS_LASHES", icon: "👁️" },
  { id: 5, name: "Makeup", value: "MAKEUP", icon: "💄" },
];

interface BasicDetailsFormProps {
  formData: any; 
  updateFormData: (data: any) => void;
}

export default function BasicDetailsForm({ formData, updateFormData }: BasicDetailsFormProps) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleCategorySelect = (catValue: string) => {
    updateFormData({ type: catValue });
  };

  return (
    <div className="w-full flex flex-col items-center md:items-start"> {/* Center items on mobile */}
      <div className="w-full flex flex-col gap-4 md:flex-row md:gap-8 mt-6">
        <div className="flex-1 w-full md:w-auto"> {/* Ensure full width on mobile */}
          <label htmlFor="title" className="block font-bold">Service Card Title</label> {/* Added font-bold */}
          <input
            id="title"
            name="title"
            className="w-full border p-2 rounded-md"
            value={formData.title || ''}
            onChange={handleChange}
          />
          <p className="text-sm text-gray-500 mt-1 text-center md:text-left"> {/* Center text on mobile */}
            As your storefront title, include keywords buyers might search.
          </p>
        </div>
        <div className="flex-1 w-full md:w-auto"> {/* Ensure full width on mobile */}
          <label className="block font-bold mb-2">Service Category</label> {/* Added font-bold */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start"> {/* Center buttons on mobile */}
            {categories.map(cat => (
              <button
                type="button"
                key={cat.id}
                className={`px-3 py-2 rounded border ${formData.type === cat.value ? 'bg-purple-600 text-white' : 'bg-white text-black'}`}
                onClick={() => handleCategorySelect(cat.value)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 w-full"> {/* Ensure full width on mobile */}
        <label htmlFor="description" className="block font-bold">Description (Optional)</label> {/* Added font-bold */}
        <textarea
          id="description"
          name="description"
          className="w-full border p-2 rounded-md min-h-[100px]"
          value={formData.description || ''}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
