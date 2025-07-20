import React, { useEffect, useState } from 'react';
import { X, Check, Clock, Loader2 } from 'lucide-react';

// Define Service interface
interface Service {
  _id: string;
  title: string;
  price: number;
  duration: number;
  type: string;
  description?: string;
  images?: string[];
   salonContextId: string;  
  status: string;
}

interface ExtraServicesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  salonId: string;
  selectedExtraServices: Service[];
  onSelectExtraService: (service: Service) => void;
}

const ExtraServicesPopup: React.FC<ExtraServicesPopupProps> = ({
  isOpen,
  onClose,
  onContinue,
  salonId,
  selectedExtraServices,
  onSelectExtraService,
}) => {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      if (!salonId) {
        console.error('No salonId provided');
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching services for salon:', salonId);
        const response = await fetch(`/api/services/salon/${salonId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load services');
        }

        const services = data.services || [];
        console.log('Received services:', services);

        setAvailableServices(services);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen, salonId]);

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

        {/* Services List */}
        <div className="max-h-60 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Loading available services...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
            </div>
          ) : availableServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No additional services available</p>
            </div>
          ) : (
            <>
              <p className="font-medium text-gray-700 mb-2">Available Extra Services:</p>
              
              {availableServices.map((service) => {
                const isSelected = selectedExtraServices.some(s => s._id === service._id);

                return (
                  <div
                    key={service._id}
                    className={`p-4 rounded-lg border ${
                      isSelected
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-300 cursor-pointer"
                    }`}
                    onClick={() => !isSelected && onSelectExtraService(service)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{service.title}</p>
                        <div className="flex items-center mt-1">
                          <Clock size={14} className="text-gray-400 mr-1" />
                          <p className="text-sm text-gray-600 mr-3">{service.duration} mins</p>
                          <p className="text-sm font-semibold text-purple-700">
                            LKR {service.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50">
          <button
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            onClick={onContinue}
            disabled={loading}
          >
            {selectedExtraServices.length > 0
              ? `Continue with ${selectedExtraServices.length} Extra Services`
              : "Skip Extra Services"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtraServicesPopup;