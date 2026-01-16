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
      <h2 className="font-semibold mb-4 text-black">{column.title}</h2>
      {children}
    </>
  );
}