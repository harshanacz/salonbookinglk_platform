export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Categories Loading */}
      <div className="border-b bg-white sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar Loading */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-4 max-w-3xl mx-auto">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 h-10 bg-gray-200 rounded-md animate-pulse" />
            <div className="w-32 h-10 bg-gray-200 rounded-md animate-pulse" />
            <div className="w-32 h-10 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>

      {/* Content Loading */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Salon List Loading */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-lg shadow animate-pulse"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Loading */}
          <div className="lg:sticky lg:top-32 h-[calc(100vh-8rem)]">
            <div className="w-full h-full bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
