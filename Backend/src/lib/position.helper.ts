import { prisma } from "./prisma";
import { Card, Prisma } from "@prisma/client";

const positions = {
    'true-true': 'Between cards',
    'true-false': 'Bottom position',
    'false-true': 'Top position',
    'false-false': 'No Cards',
} as const;

type Cards = Array<{ id: string; position: Prisma.Decimal }>;

export function getNewPos(firstCardPos:Prisma.Decimal | undefined, secondCardPos: Prisma.Decimal | undefined): Prisma.Decimal {
    const newPos = positions[`${firstCardPos !== undefined}-${secondCardPos !== undefined}`];
    switch(newPos){
        case 'Between cards':
            return new Prisma.Decimal((firstCardPos!.plus(secondCardPos!)).div(2));
        case 'Bottom position':
            return new Prisma.Decimal(firstCardPos!.plus(1));
        case 'Top position':
            return new Prisma.Decimal(secondCardPos!.div(2));
        case 'No Cards':
            return new Prisma.Decimal(1.0);
    }
}

export function needsRebalancing(cards: Cards): boolean{
    for(let i = 0; i < cards.length-1; i++){
        if(cards[i+1].position.minus(cards[i].position).lt(0.0000000001)){
            return true;
        }
    }
    return false;
}

export function rebalance(cards: Cards): Cards{
    const rebalancedCards = cards.map((card, index) => ({
        id: card.id,
        position: new Prisma.Decimal((index + 1) * 1.0),
    }));
    return rebalancedCards;
}