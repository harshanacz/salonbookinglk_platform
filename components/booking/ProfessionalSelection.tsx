import { Card } from "@/components/ui/card";
import Image from "next/image";

// Define StaffMember interface
interface StaffMember {
  _id: string;
  name: string;
  profileImage?: string;
  role: string;
}

interface ProfessionalSelectionProps {
  staffMembers: StaffMember[];
  selectedStaff: string | null;
  selectedProfessionalName: string;
  onStaffSelect: (staffId: string) => void;
}

export default function ProfessionalSelection({
  staffMembers,
  selectedStaff,
  selectedProfessionalName,
  onStaffSelect
}: ProfessionalSelectionProps) {
  // Don't render if no staff members
  if (staffMembers.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-lg">Select Professional</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          Optional
        </span>
      </div>

      <div className="bg-gray-50 p-3 rounded-md mb-3">
        <p className="text-sm text-center mb-2">
          Currently selected: <span className="font-medium">{selectedProfessionalName}</span>
        </p>
        <div className="text-xs text-gray-600 border-t border-gray-200 pt-2">
          <p className="mb-1">• Choosing "Any Professional" lets the salon assign a staff member.</p>
          <p>• Selecting a specific staff member guarantees your appointment with them.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {staffMembers.map((staff) => (
          <div
            key={staff._id}
            onClick={() => onStaffSelect(staff._id)}
            className={`cursor-pointer rounded-md border p-2 text-center ${
              selectedStaff === staff._id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 mb-1">
                <Image
                  src={staff.profileImage || "/placeholder-user.jpg"}
                  alt={staff.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-sm font-medium truncate w-full">{staff.name}</p>
              <p className="text-xs text-gray-500 truncate w-full">{staff.role}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}