const requiredEnvVars = ['DATABASE_URL', 'PORT', 'JWT_SECRET', 'JWT_EXPIRES_IN'] as const;

export function validateEnv(): void {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file'
    );
  }
  
  console.log('✓ Environment variables validated');
}