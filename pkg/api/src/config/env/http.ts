type HttpConfig = {
  corsDomains: string[];
};

const domains = process.env.CORS_DOMAINS ?
  process.env.CORS_DOMAINS.toLocaleLowerCase()
  .split(",")
  .map((domain) => domain.trim()) : [];

const httpConfig: HttpConfig = {
  corsDomains: domains,
}

export default httpConfig;
