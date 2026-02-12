import { Column } from '@/types/board';

export default function ColumnContent({
  column,
  children
}: {
  column: Column;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='flex justify-start border-b border-gray-400 mb-4 pb-4'>
        <h2 className="font-semibold text-gray-700">{column.title}</h2>
      </div>
      {children}
    </>
  );
}