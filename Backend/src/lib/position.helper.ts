import { Prisma } from "@prisma/client";

const positions = {
    'true-true': 'Between resources',
    'true-false': 'Last position',
    'false-true': 'First position',
    'false-false': 'No resources',
} as const;

type Resources = Array<{ id: string; position: Prisma.Decimal }>;

export function getNewPos(firstPos:Prisma.Decimal | undefined, secondPos: Prisma.Decimal | undefined): Prisma.Decimal {
    const newPos = positions[`${firstPos !== undefined}-${secondPos !== undefined}`];
    switch(newPos){
        case 'Between resources':
            return new Prisma.Decimal((firstPos!.plus(secondPos!)).div(2));
        case 'Last position':
            return new Prisma.Decimal(firstPos!.plus(1));
        case 'First position':
            return new Prisma.Decimal(secondPos!.div(2));
        case 'No resources':
            return new Prisma.Decimal(1.0);
    }
}

export function needsRebalancing(resources: Resources): boolean{
    for(let i = 0; i < resources.length-1; i++){
        if(resources[i+1].position.minus(resources[i].position).lt(0.0000000001)){
            return true;
        }
    }
    return false;
}

export function rebalance(resources: Resources): Resources{
    const rebalancedResources = resources.map((resource, index) => ({
        id: resource.id,
        position: new Prisma.Decimal((index + 1) * 1.0),
    }));
    return rebalancedResources;
}