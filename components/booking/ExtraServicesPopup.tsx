import React from 'react';
import { X, Check, Clock } from 'lucide-react';

// Define Service interface
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  timeSlot?: string;
  professional?: string;
}

interface ExtraServicesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  extraServices: Service[];
  selectedExtraServices: Service[];
  onSelectExtraService: (service: Service) => void;
}

const ExtraServicesPopup: React.FC<ExtraServicesPopupProps> = ({
  isOpen,
  onClose,
  onContinue,
  extraServices,
  selectedExtraServices,
  onSelectExtraService,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-purple-50 border-b border-purple-100 p-4">
          <h3 className="text-lg font-semibold text-purple-800">Add Extra Services</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-gray-500 hover:text-gray-800 flex items-center justify-center border border-gray-200 transition-colors"
            aria-label="Close popup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Section */}
        <div className="p-4 border-b">
          <div className="flex items-start mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mr-3">
              <Check size={18} />
            </div>
            <div>
              <p className="text-gray-800 font-medium mb-1">Almost Done!</p>
              <p className="text-sm text-gray-600">
                Would you like to add any extra services to your booking? This is optional.
              </p>
            </div>
          </div>

          {/* Selected Services Summary */}
          {selectedExtraServices.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <p className="text-sm text-green-800 font-medium mb-1">
                {selectedExtraServices.length} extra service{selectedExtraServices.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-green-700">
                Total additional: {selectedExtraServices.reduce((sum, service) => sum + service.price, 0).toLocaleString()} LKR
              </p>
            </div>
          )}
        </div>

        {/* Services List */}
        <div className="max-h-60 overflow-y-auto p-4 space-y-3">
          <p className="font-medium text-gray-700 mb-2">Available Extra Services:</p>

          {extraServices.map((service) => {
            const isAlreadySelected = selectedExtraServices.some(s => s.id === service.id);

            return (
              <div
                key={service.id}
                className={`p-4 rounded-lg border ${
                  isAlreadySelected
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-300 cursor-pointer"
                } transition-colors`}
                onClick={() => !isAlreadySelected && onSelectExtraService(service)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <div className="flex items-center mt-1">
                      <Clock size={14} className="text-gray-400 mr-1" />
                      <p className="text-sm text-gray-600 mr-3">{service.duration} mins</p>
                      <p className="text-sm font-semibold text-purple-700">
                        LKR {service.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {isAlreadySelected ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex flex-col space-y-3">
            <button
              className="w-full bg-purple-600 text-white py-3 rounded-lg text-base font-medium hover:bg-purple-700 transition-colors"
              onClick={onContinue}
            >
              {selectedExtraServices.length > 0
                ? "Continue with Selected Extra Services"
                : "Skip Extra Services"
              }
            </button>
            <button
              className="text-gray-600 text-sm hover:underline"
              onClick={onClose}
            >
              Go back to time selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtraServicesPopup;