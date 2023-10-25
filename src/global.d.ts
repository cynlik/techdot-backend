declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SECRET: string;
      DBURL: string;
      PORT: number;
    }
  }
}
export {};
