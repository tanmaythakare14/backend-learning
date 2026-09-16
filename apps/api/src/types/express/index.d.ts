import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    /** Populated by JwtStrategy from the verified Auth0 access token — `sub` is the only guaranteed claim. */
    user?: {
      sub: string;
      [claim: string]: unknown;
    };
  }
}
