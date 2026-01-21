import bcrypt from 'bcrypt';
import jwt, {Secret, SignOptions} from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET : Secret = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const options = { expiresIn: JWT_EXPIRES_IN } as SignOptions;

//Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

//Compare plain and hashed passwords
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

//Generate JWT token
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, options);
}


//Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return payload;
  } catch (error) {
    return null;
  }
}