import React, { useEffect, useState } from 'react';

interface StaffFormProps {
  formData: any; 
  updateFormData: (data: any) => void;
}

interface StaffMember {
  _id: string;
  name: string;
  role: string;
  profileImage: string;
}

interface SalonContext {
  profilePictureUrl: string;
}

export default function StaffForm({ formData, updateFormData }: StaffFormProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salonProfilePic, setSalonProfilePic] = useState<string>('/placeholder-user.jpg');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff members
        const staffResponse = await fetch('/api/salon-owner/staff');
        if (!staffResponse.ok) {
          throw new Error('Failed to fetch staff members');
        }
        const staffData = await staffResponse.json();
        setStaff(staffData);

        // Fetch salon context
        const salonResponse = await fetch('/api/salon-owner/salon-profile');
        if (!salonResponse.ok) {
          throw new Error('Failed to fetch salon context');
        }
        const salonData = await salonResponse.json();
        setSalonProfilePic(salonData.profilePictureUrl || '/placeholder-user.jpg');
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelect = (id: string) => {
    updateFormData({ staffAssigned: [id] });
  };

  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center md:items-start">
        <p className="mb-4 text-sm text-gray-600 text-center md:text-left">No staff members available. This service will be marked as "Not special".</p>
        <div className="w-full max-w-[150px] p-4 border border-gray-200 rounded text-center">
          <p className="font-bold">Not special</p>
          <p className="text-sm text-gray-500">Any staff member can perform this service</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center md:items-start">
      <p className="mb-4 text-sm text-gray-600 text-center md:text-left">Select who can perform this service.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full justify-items-center">
        {/* "Any" option */}
        <label className={`flex flex-col items-center gap-2 p-2 border rounded cursor-pointer w-full max-w-[150px] ${
          (!formData.staffAssigned || formData.staffAssigned.length === 0) ? 'border-purple-600' : 'border-gray-200'
        }`}>
          <img 
            src={salonProfilePic} 
            alt="Any Staff Member" 
            className="w-24 h-24 rounded-full object-cover" 
          />
          <div className="text-center">
            <p className="font-bold">Any</p>
            <p className="text-sm text-gray-500">Any staff member</p>
          </div>
          <input
            type="radio"
            name="staffSelection"
            checked={!formData.staffAssigned || formData.staffAssigned.length === 0}
            onChange={() => handleSelect('')}
            className="mt-2"
          />
          <span className="text-xs">Select</span>
        </label>

        {/* Staff members */}
        {staff.map((person) => (
          <label key={person._id} className={`flex flex-col items-center gap-2 p-2 border rounded cursor-pointer w-full max-w-[150px] ${
            formData.staffAssigned?.includes(person._id) ? 'border-purple-600' : 'border-gray-200'
          }`}>
            <img 
              src={person.profileImage || '/placeholder-user.jpg'} 
              alt={person.name} 
              className="w-24 h-24 rounded-full object-cover" 
            />
            <div className="text-center">
              <p className="font-bold">{person.name}</p>
              <p className="text-sm text-gray-500">{person.role}</p>
            </div>
            <input
              type="radio"
              name="staffSelection"
              checked={formData.staffAssigned?.includes(person._id)}
              onChange={() => handleSelect(person._id)}
              className="mt-2"
            />
            <span className="text-xs">Select</span>
          </label>
        ))}
      </div>
    </div>
  );
}
