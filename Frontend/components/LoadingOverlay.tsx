import LoadingSpinner from '@/components/LoadingSpinner';

export default function LoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-400 pointer-events-auto">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner />
      </div>
    </div>
  );
}