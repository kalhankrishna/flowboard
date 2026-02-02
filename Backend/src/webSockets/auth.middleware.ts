import { Socket } from "socket.io";
import { verifyToken } from "../lib/auth";

export function authSocketMiddleware(socket: Socket, next: (err?: Error) => void) {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error("Authentication error: Token not provided"));
    }

    try{
        const payload = verifyToken(token);
        socket.data.userId = payload.userId;
        next();
    }
    catch (err) {
        return next(new Error("Authentication error: Invalid token"));
    }
}