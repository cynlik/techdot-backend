declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DBURL: string;
      PORT: number;
    }
  }
}
export {};
