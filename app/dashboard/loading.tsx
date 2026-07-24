export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="h-5 w-48 bg-cream rounded animate-pulse mb-2" />
        <div className="h-3.5 w-64 bg-cream rounded animate-pulse" />
      </div>
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="h-5 w-44 bg-cream rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-border/50 rounded-xl">
              <div className="h-12 w-12 rounded-full bg-cream animate-pulse shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-32 bg-cream rounded animate-pulse" />
                <div className="h-3 w-48 bg-cream rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
