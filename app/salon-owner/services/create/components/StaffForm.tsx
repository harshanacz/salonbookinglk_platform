import React from 'react';

interface StaffFormProps {
  formData: any; 
  updateFormData: (data: any) => void;
}

//FETCH STAFF DATA - now hardcoded
const staff = [
  { id: 'staff1', name: 'Shamila', role: 'Hair Dresser', image: '/placeholder-user.jpg' },
  { id: 'staff2', name: 'Kamal', role: 'Beautician', image: '/placeholder-user.jpg' },
];

export default function StaffForm({ formData, updateFormData }: StaffFormProps) {
  const handleToggle = (id: string) => {
    const assigned = formData.staffAssigned || [];
    let updated: string[];
    if (assigned.includes(id)) {
      updated = assigned.filter((sid: string) => sid !== id);
    } else {
      updated = [...assigned, id];
    }
    updateFormData({ staffAssigned: updated });
  };

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-gray-600">Select the staff members who can perform this service.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {staff.map((person) => (
          <label key={person.id} className={`flex flex-col items-center gap-2 p-2 border rounded cursor-pointer ${
            (formData.staffAssigned || []).includes(person.id) ? 'border-purple-600' : 'border-gray-200'
          }`}>
            <img src={person.image} alt={person.name} className="w-24 h-24 rounded-full object-cover" />
            <div className="text-center">
              <p className="font-medium">{person.name}</p>
              <p className="text-sm text-gray-500">{person.role}</p>
            </div>
            <input
              type="checkbox"
              checked={(formData.staffAssigned || []).includes(person.id)}
              onChange={() => handleToggle(person.id)}
              className="mt-2"
            />
            <span className="text-xs">Select</span>
          </label>
        ))}
      </div>
    </div>
  );
}
