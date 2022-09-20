import helmet from 'koa-helmet';

export default () => helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.youtube.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      frameSrc: ["'self'", 'unsafe-inline', 'https://www.youtube.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https://plex.tv',
        'https://*.plex.tv',
        'https://*.tmdb.org',
        'https://assets.fanart.tv',
        'https://secure.gravatar.com',
      ],
      connectSrc: ["'self'", 'https://plex.tv'],
    },
  });
