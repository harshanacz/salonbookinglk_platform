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
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffResponse = await fetch('/api/salon-owner/staff');
        if (!staffResponse.ok) {
          throw new Error('Failed to fetch staff members');
        }
        const staffData = await staffResponse.json();
        setStaff(staffData);

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

  const handleAnyStaffSelect = () => {
    updateFormData({ staffAssigned: ['any'] });
    setShowValidation(false);
  };

  const handleStaffSelect = (id: string) => {
    const currentSelection = formData.staffAssigned || [];
    let newSelection: string[];

    if (currentSelection.includes(id)) {
      newSelection = currentSelection.filter((staffId: string) => staffId !== id);
    } else {
      newSelection = [...currentSelection, id];
    }

    updateFormData({ staffAssigned: newSelection });
    setShowValidation(false);
  };

  const isAnySelected = formData.staffAssigned?.includes('any');
  const hasStaffSelected = formData.staffAssigned?.some((id: string) => id !== 'any' && id !== '');

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
        <div className="w-full max-w-[300px] p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="notSpecial"
              checked={formData.staffAssigned?.includes('any')}
              onChange={handleAnyStaffSelect}
              className="accent-purple-600 scale-125"
            />
            <label htmlFor="notSpecial" className="font-bold">Not special</label>
          </div>
          <p className="text-sm text-gray-500 mb-2">Any staff member can perform this service</p>
          <p className="text-sm text-purple-600">
            You can add staff members in the <a href="/salon-owner/staff" className="underline">Staff</a> page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center md:items-start">
      <div className="w-full flex flex-col items-center md:items-start mb-4">
        <p className="text-sm text-gray-600 text-center md:text-left">Select who can perform this service.</p>
        <p className="text-sm text-red-500 mt-1">* Required - Please select at least one option to proceed</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full justify-items-center">
        <label className={`flex flex-col items-center gap-2 p-2 border rounded cursor-pointer w-full max-w-[150px] ${
          isAnySelected ? 'border-purple-600' : 'border-gray-200'
        } ${hasStaffSelected ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
            type="checkbox"
            checked={isAnySelected}
            onChange={handleAnyStaffSelect}
            disabled={hasStaffSelected}
            className="mt-2"
          />
          <span className="text-xs">Select</span>
        </label>

        {staff.map((person) => (
          <label key={person._id} className={`flex flex-col items-center gap-2 p-2 border rounded cursor-pointer w-full max-w-[150px] ${
            formData.staffAssigned?.includes(person._id) ? 'border-purple-600' : 'border-gray-200'
          } ${isAnySelected ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
              type="checkbox"
              checked={formData.staffAssigned?.includes(person._id)}
              onChange={() => handleStaffSelect(person._id)}
              disabled={isAnySelected}
              className="mt-2"
            />
            <span className="text-xs">Select</span>
          </label>
        ))}
      </div>
      {showValidation && (!formData.staffAssigned || formData.staffAssigned.length === 0) && (
        <p className="text-red-500 text-sm mt-2">Please select at least one option to proceed</p>
      )}
    </div>
  );
}
