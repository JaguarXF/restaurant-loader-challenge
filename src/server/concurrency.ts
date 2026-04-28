type Success<T, R> = { item: T; result: R; error?: never };
type Failure<T> = { item: T; error: Error; result?: never };
export type Outcome<T, R> = Success<T, R> | Failure<T>;

/**
 * Processes `items` with `task`, keeping exactly `limit` requests in-flight at all times.
 * Yields each outcome (success or failure) as it settles.
 */
export async function* limitConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): AsyncGenerator<Outcome<T, R>> {
  type Tagged = Outcome<T, R> & { slotId: number };

  const slots = new Map<number, Promise<Tagged>>();
  let slotId = 0;
  let nextItem = 0;

  function launch(item: T): void {
    const id = slotId++;
    const p = task(item)
      .then((result): Tagged => ({ item, result, slotId: id }))
      .catch((err): Tagged => ({
        item,
        error: err instanceof Error ? err : new Error(String(err)),
        slotId: id,
      }));
    slots.set(id, p);
  }

  while (slots.size < limit && nextItem < items.length) {
    launch(items[nextItem++]);
  }

  while (slots.size > 0) {
    const { slotId: id, ...outcome } = await Promise.race(slots.values());
    slots.delete(id);
    if (nextItem < items.length) launch(items[nextItem++]);
    yield outcome as Outcome<T, R>;
  }
}
