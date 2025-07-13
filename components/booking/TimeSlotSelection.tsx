import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format, parse } from "date-fns";

// Define TimeSlot interface
interface TimeSlot {
  slot_id: string;
  start_time: Date;
  appointmentId: string | null;
  period: number;
  available: boolean;
}

interface TimeSlotSelectionProps {
  selectedDate: Date;
  availableTimeSlots: TimeSlot[];
  selectedTimeSlot: string | null;
  loading: boolean;
  onTimeSlotSelect: (slotId: string) => void;
}

export default function TimeSlotSelection({
  selectedDate,
  availableTimeSlots,
  selectedTimeSlot,
  loading,
  onTimeSlotSelect
}: TimeSlotSelectionProps) {
  
  // Function to group time slots by hour for better display
  const groupTimeSlotsByHour = () => {
    const grouped: { [hour: string]: TimeSlot[] } = {};

    availableTimeSlots.forEach((slot) => {
      const slotDate = new Date(slot.start_time);
      const hour = format(slotDate, 'h a');
      if (!grouped[hour]) {
        grouped[hour] = [];
      }
      grouped[hour].push(slot);
    });

    return Object.entries(grouped).sort(([hourA], [hourB]) => {
      const dateA = parse(hourA, 'h a', new Date());
      const dateB = parse(hourB, 'h a', new Date());
      return dateA.getTime() - dateB.getTime();
    });
  };

  return (
    <Card className="p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="font-medium text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2 text-purple-600" />
          Available Time Slots
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Please select a time for your appointment on <span className="font-medium">{format(selectedDate, "EEEE, MMMM d")}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
          <p className="ml-3 text-sm text-gray-500">Loading time slots...</p>
        </div>
      ) : availableTimeSlots.length === 0 ? (
        <div className="text-center py-4 px-4 bg-gray-50 rounded-md border border-gray-200">
          <p className="mb-1 text-gray-700 font-medium">No available time slots</p>
          <p className="text-xs text-gray-500">Please select another date or try a different professional</p>
        </div>
      ) : (
        <>
          {selectedTimeSlot && (
            <div className="bg-green-50 rounded-md p-2 mb-3 border border-green-200 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-green-600 mr-2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span className="text-sm text-green-800">
                Time selected: {availableTimeSlots.find(s => s.slot_id === selectedTimeSlot) ?
                  format(new Date(availableTimeSlots.find(s => s.slot_id === selectedTimeSlot)!.start_time), "h:mm a") :
                  ""}
              </span>
            </div>
          )}

          <div className="overflow-y-auto max-h-[400px] pr-1">
            {groupTimeSlotsByHour().map(([hour, slots]) => (
              <div key={hour}>
                <h4 className="text-sm font-medium text-gray-700 mb-1.5 mt-3">{hour}</h4>
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map((slot) => (
                    <button
                      key={slot.slot_id}
                      onClick={() => slot.available ? onTimeSlotSelect(slot.slot_id) : null}
                      disabled={!slot.available}
                      className={`
                        text-center py-1.5 rounded text-sm 
                        ${!slot.available 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : selectedTimeSlot === slot.slot_id
                            ? 'bg-purple-600 text-white' 
                            : 'bg-white border border-gray-200 hover:border-purple-400'
                        }
                      `}
                    >
                      {format(new Date(slot.start_time), "h:mm a")}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}