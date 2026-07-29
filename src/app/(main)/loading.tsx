import { Loader } from "@/components/ui/Loader/Loader";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader size="lg" />
      <p className="text-text/60 text-sm">Loading caddy dashboard...</p>
    </div>
  );
}