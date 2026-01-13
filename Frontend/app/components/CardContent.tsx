export default function CardContent({card}: {card: {id: string; title: string; description: string}}) {
    return (
      <div>
        <h3 className="text-black">{card.title}</h3>
        {card.description && (
          <p className="text-gray-700">{card.description}</p>
        )}
      </div>
    );
}