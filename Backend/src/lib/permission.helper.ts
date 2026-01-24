import { prisma } from "../lib/prisma";
import { BoardRole } from "@prisma/client";

const ROLE_HIERARCHY : Record<BoardRole, number> = {
    OWNER : 3,
    EDITOR: 2,
    VIEWER: 1
};

export async function getRoleByBoardId(boardId: string, userId: string): Promise<BoardRole | null> {
    const membership =  await prisma.boardAccess.findUnique({
        where: {
            boardId_userId: {
                boardId,
                userId
            }
        }
    });
    return membership ? membership.role : null;
};

export async function getRoleByColumnId(columnId: string, userId: string): Promise<BoardRole | null> {
    const membership =  await prisma.boardAccess.findFirst({
        where: {
            board: {
                columns: {
                    some: {
                        id: columnId
                    }
                }
            },
            userId: userId
        }
    });

    return membership ? membership.role : null;
};

export async function getRoleByCardId(cardId: string, userId: string): Promise<BoardRole | null> {
    const result = await prisma.card.findUnique({
        where: { id: cardId },
        include: {
            column: {
                include: {
                    board: {
                        include: {
                            sharedWith: {
                                where: { userId }
                            }
                        }
                    }
                }
            }
        }
    });

    return result?.column.board.sharedWith[0]?.role || null;
}

export function hasSufficientRole(userRole: BoardRole, minRole: BoardRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}