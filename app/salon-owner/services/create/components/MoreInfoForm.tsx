export default function MoreInfoForm() {
    return (
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="block font-medium">Online Booking</label>
            <input type="checkbox" className="accent-purple-600 scale-125" defaultChecked />
          </div>
          <p className="text-sm text-gray-500">
            Allow clients to book this service online via the SalonBooking.lk Marketplace, socials and your own custom booking links.
          </p>
  
          <div>
            <label className="block font-medium">Available For</label>
            <select className="w-full border p-2 rounded-md text-gray-500">
              <option>All genders</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
  
          <div>
            <label className="block font-medium">Instructions for Clients</label>
            <textarea className="w-full border p-2 rounded-md min-h-[100px]" />
          </div>
        </div>
  
        {/* <div className="space-y-4">
          <p className="font-medium">Extra Services with Main Service</p>
  
          <div className="border p-4 rounded-md bg-white flex justify-between items-center">
            <div>
              <p className="font-medium">Head Massage</p>
              <p className="text-sm text-gray-500">15min</p>
            </div>
            <p className="text-sm font-medium">+ LKR 150</p>
          </div>
  
          <div className="border-2 border-dashed p-4 rounded-md text-center text-gray-400 cursor-pointer">
            + Add New Extra Service
          </div>
        </div> */}
      </div>
    );
  }
  