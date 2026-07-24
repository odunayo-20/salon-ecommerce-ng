import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <Loader2 className="h-6 w-6 animate-spin text-gold" />
    </div>
  );
}
