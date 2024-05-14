function getFilename(path) {
  return path.replace(/^.*[\\/]/, '');
}

function noBodyOrIndex(status, body, path, index) {
  return (
    !body ||
    status !== 200 ||
    (index &&
      body.path &&
      getFilename(body.path) === index &&
      getFilename(body.path) !== getFilename(path))
  );
}

function missingSlash(path) {
  return path.slice(-1) !== '/';
}

function getPath(original, querystring) {
  if (querystring.length) {
    return original.slice(0, -querystring.length - 1);
  }

  return original;
}

export function addTrailingSlashes(options?: {
  defer?: any;
  index?: any;
  chained?: any;
}) {
  const opts = options || {};

  if (opts.defer !== false) {
    opts.defer = opts.defer || true;
  }

  if (opts.index !== false) {
    opts.index = opts.index || 'index.html';
  }

  if (opts.chained !== false) {
    opts.chained = opts.chained || true;
  }

  return async function cb(ctx, next) {
    if (opts.defer) {
      await next();
    }

    let path;

    // We have already done a redirect and we will continue if we are in chained mode
    if (opts.chained && ctx.status === 301) {
      path = getPath(ctx.response.get('Location'), ctx.querystring);
    } else if (ctx.status !== 301) {
      path = getPath(ctx.originalUrl, ctx.querystring);
    }

    if (
      path &&
      noBodyOrIndex(ctx.status, ctx.body, path, opts.index) &&
      missingSlash(path)
    ) {
      const query = ctx.querystring.length ? `?${ctx.querystring}` : '';

      ctx.status = 301;
      ctx.redirect(`${path}/${query}`);
    }

    if (!opts.defer) {
      await next();
    }
  };
}
