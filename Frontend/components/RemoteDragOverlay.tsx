import { Card, Column } from "@/types/board";
import CardContent from "./CardContent";
import ColumnContent from "./ColumnContent";

export default function RemoteDragOverlay({ remoteDrags, cards, columns }: { remoteDrags: Map<string, { userName: string, x: number, y: number }>, cards: Card[], columns: Column[] }) {
    return (
        <>
            {Array.from(remoteDrags, ([drag, dragData]) => {
                const card = cards.find(i => i.id === drag);
                const column = columns.find(c => c.id === drag);

                return (
                    <div
                    key={drag}
                    className="absolute pointer-events-none"
                    style={{
                    transform: `translate(${dragData.x}px, ${dragData.y}px)`,
                    top: 0,
                    left: 0,
                    opacity: 0.6,
                    zIndex: 200,
                    transition: 'transform 50ms linear',
                    }}
                    >
                        {card && (
                            <div className="bg-slate-100 min-w-50 rounded-md my-2 p-2 border border-gray-300 shadow-md opacity-50">
                                <CardContent card={card} />
                                <div className='absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center bg-cyan-500 text-white text-sm font-medium'>
                                    {dragData.userName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}

                        {column && (
                            <div className="bg-slate-100 p-4 rounded-lg w-full min-h-110 shadow-md opacity-50 border">
                                <ColumnContent column={column}>
                                    {column.cards.map(card => (
                                    <div key={card.id} className="bg-gray-100 rounded-md my-2 p-2 border border-gray-300 shadow-md">
                                        <CardContent card={card} />
                                    </div>
                                    ))}
                                </ColumnContent>
                                <div className='absolute top-3 right-4 w-6 h-6 rounded-full flex items-center justify-center bg-cyan-500 text-white text-sm font-medium'>
                                    {dragData.userName.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
}