export default function DashboardSkeleton() {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8">
          <div className="h-8 bg-white/50 rounded-lg w-3/4 mb-4" />
          <div className="h-4 bg-white/30 rounded w-1/2" />
        </div>
  
        {/* Stats cards skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
  
        {/* Chart section skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
                        <div className="h-3 bg-gray-100 rounded w-12" />
                      </div>
                    </div>
                    <div className="h-4 w-4 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Tables skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border">
              <div className="p-6 border-b">
                <div className="h-6 bg-gray-200 rounded w-32" />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <div key={j} className="flex items-center space-x-4">
                      <div className="h-8 w-8 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }