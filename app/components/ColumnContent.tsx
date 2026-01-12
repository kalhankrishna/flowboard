export default function ColumnContent({column, children}: {column: {id: string; title: string; items: {id: string; title: string; description: string}[]}, children: React.ReactNode}) {
    return (
        <>
            <h2 className="font-semibold mb-4 text-black">{column.title}</h2>
            {children}
        </>
    );
}