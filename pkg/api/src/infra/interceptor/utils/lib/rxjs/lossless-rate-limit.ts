import {
  concatMap,
  delay,
  MonoTypeOperatorFunction,
  of,
  pipe,
  scan,
} from "rxjs";

type Entry<T> = {
  delay: number;
  until: number;
  value: T;
};

/**
 * Applies Lossless Rate Limiting to given source observable.
 * @param count The maximum count of emissions per interval
 * @param interval The interval in Milliseconds. Defaults to 1 second.
 * @return A function that returns an Observable that performs the throttle
 * operation to limit the rate of emissions from the source.
 */
export function losslessRateLimit<T>(
  count: number,
  interval: number = 1000
): MonoTypeOperatorFunction<T> {
  return pipe(
    scan((queue, value) => {
      const now = Date.now();
      const since = now - interval;

      const activeQueue = queue.filter(record => record.until > since);
      const newEntry = generateEntry(now, count, interval, value, activeQueue);

      return [...activeQueue, newEntry];
    }, [] as Entry<T>[]),
    concatMap(queue => {
      const lastEntry = queue[queue.length - 1];
      const observable = of(lastEntry.value);

      return lastEntry.delay
        ? observable.pipe(delay(lastEntry.delay))
        : observable;
    })
  );
}

function generateEntry<T>(
  now: number,
  count: number,
  interval: number,
  value: T,
  queue: Entry<T>[]
) {
  if (queue.length < count) {
    return { delay: 0, until: now, value };
  }

  const firstEntry = queue[0];
  const lastEntry = queue[queue.length - 1];
  const until = firstEntry.until + interval * Math.floor(queue.length / count);

  return {
    delay: lastEntry.until < now ? until - now : until - lastEntry.until,
    until,
    value,
  };
}
