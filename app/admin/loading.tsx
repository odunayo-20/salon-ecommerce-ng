export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-7 w-48 bg-cream rounded animate-pulse" />
      <div className="h-4 w-64 bg-cream rounded animate-pulse" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5">
            <div className="h-3 w-24 bg-cream rounded animate-pulse mb-2" />
            <div className="h-7 w-16 bg-cream rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-border rounded-xl p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-cream rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
