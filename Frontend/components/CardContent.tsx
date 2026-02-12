import { Card } from "@/types/board";

export default function CardContent({card}: {card: Card}) {
    return (
      <>
        <h3 className="text-gray-700">{card.title}</h3>
        {card.description && (
          <p className="text-gray-400 text-sm">{card.description}</p>
        )}
      </>
    );
}