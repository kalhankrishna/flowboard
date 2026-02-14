export default function LoadingSpinner() {
  return (
    <div className="relative w-16 h-16">
      {/* Outer ring - subtle gray track */}
      <div className="absolute inset-0 rounded-full border-4 border-slate-200/30"></div>
      
      {/* Spinning cyan arc */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin"></div>
      
      {/* Optional: inner subtle pulse */}
      <div className="absolute inset-2 rounded-full bg-slate-100/50 animate-pulse"></div>
    </div>
  );
}