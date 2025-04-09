export default function BasicDetailsForm() {
    return (
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div className="space-y-4">
          <div>
            <label className="block font-medium">Service Card Title</label>
            <input className="w-full border p-2 rounded-md" />
            <p className="text-sm text-gray-500 mt-1">
              As your storefront title, include keywords buyers might search.
            </p>
          </div>
  
          <div>
            <label className="block font-medium">Service Type</label>
            <select className="w-full border p-2 rounded-md text-gray-500">
              <option>Select Category</option>
            </select>
          </div>
  
          <div>
            <label className="block font-medium">Description (Optional)</label>
            <textarea className="w-full border p-2 rounded-md min-h-[100px]" />
          </div>
        </div>
  
        <div>
          <p className="font-medium mb-2">Images (up to 3)</p>
          <p className="text-sm text-gray-500 mb-4">
            Get noticed by the right buyers with visual examples.
          </p>
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-24 h-32 rounded-md border flex items-center justify-center text-gray-400 bg-purple-50"
              >
                ⬆
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  