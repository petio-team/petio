export type AuthConfig = {
  service: string;
  arguments: {
    source?: string;
    value?: string;
    extra?: string;
    identifier?: string;
    secret?: string;
  },
  options: { [key: string]: string },
  isPath: boolean;
};
