/** Shared async request lifetime for the two host-owned local model adapters.
 * The deadline includes JSON body consumption. Cancellation is cooperative;
 * this cannot preempt synchronous code or forcibly stop a remote model.
 */
export async function requestLocalJson(url, {fetchImpl, options = {}, signal, timeoutMs, label}) {
  if (signal?.aborted) throw new Error('request cancelled');
  const controller = new AbortController();
  let stopped = null;
  let rejectStop;
  let timer;
  let completed = false;
  const interrupted = new Promise((_, reject) => { rejectStop = reject; });
  const stop = message => {
    if (stopped) return;
    stopped = new Error(message);
    // Settle the caller before cooperative transport cancellation can reject.
    rejectStop(stopped);
    controller.abort();
  };
  const abort = () => stop('request cancelled');
  const check = () => {
    if (!stopped && signal?.aborted) abort();
    if (stopped) throw stopped;
  };
  try {
    signal?.addEventListener('abort', abort, {once: true});
    timer = setTimeout(() => stop('request timed out'), timeoutMs);
    const consume = async () => {
      check();
      let response;
      try {
        response = await fetchImpl(url, {...options, signal: controller.signal});
      } catch {
        check();
        throw new Error('local provider unavailable');
      }
      check();
      if (!response?.ok) throw new Error(`${label} request failed`);
      let payload;
      try {
        payload = await response.json();
      } catch {
        check();
        throw new Error(`${label} response invalid`);
      }
      check();
      return payload;
    };
    // A transport/parser that ignores AbortSignal must not hold the caller open.
    const payload = await Promise.race([consume(), interrupted]);
    check();
    completed = true;
    return payload;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
    if (!completed) controller.abort();
  }
}
