export default function PricingForm() {
    return (
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium">Duration</label>
              <select className="w-full border p-2 rounded-md text-gray-500">
              <option>10 min</option>
                <option>15 min</option>
                <option>20 min</option>
                <option>30 min</option>
                <option>45 min</option>
                <option>1 hr</option>
              </select>
            </div>
  
            {/* <div className="flex-1">
              <label className="block font-medium">Price Type</label>
              <select className="w-full border p-2 rounded-md text-gray-500">
                <option>From</option>
                <option>Fixed</option>
              </select>
            </div> */}
  
            <div className="flex-1">
              <label className="block font-medium">Price</label>
              <input type="text" className="w-full border p-2 rounded-md" />
            </div>
          </div>
  
          <div className="mt-6">
            <p className="font-medium mb-2">Extra Time</p>
            <p className="text-sm text-gray-500 mb-2">
              Automatically add blocked time or processing time after each appointment.
            </p>
  
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-medium">Type</label>
                <select className="w-full border p-2 rounded-md text-gray-500">
                  <option>Processing time after</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block font-medium">Duration</label>
                <select className="w-full border p-2 rounded-md text-gray-500">
                <option>10 min</option>
                <option>15 min</option>
                <option>20 min</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  