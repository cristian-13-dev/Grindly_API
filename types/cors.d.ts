declare module 'cors' {
  import { RequestHandler } from 'express';

  interface CorsOptions {
    origin?: string | string[] | boolean | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  function cors(options?: CorsOptions): RequestHandler;

  export { CorsOptions };
  export default cors;
}
