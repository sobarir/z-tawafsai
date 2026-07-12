import { env } from '@/libs/env';

export {
  DEMO_ACCOUNTS,
  type DemoAccount,
  getDemoRoleByEmail,
} from './accounts';
export { default as DemoCredentials } from './demo-credentials';
export { signInWithDemoFallback } from './sign-in';

export const isDemoMode = env.NEXT_PUBLIC_DEMO_MODE;
