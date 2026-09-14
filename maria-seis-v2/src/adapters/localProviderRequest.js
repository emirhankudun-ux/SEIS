/** Shared async request lifetime for the two host-owned local model adapters.
 * The deadline includes bounded JSON body consumption. Cancellation is
 * cooperative; this cannot preempt synchronous code or forcibly stop a remote model.
 */
export const DEFAULT_LOCAL_RESPONSE_BYTES = 4 * 1024 * 1024;
export const MAX_LOCAL_RESPONSE_BYTES = 16 * 1024 * 1024;

export function validateResponseByteBudget(value) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > MAX_LOCAL_RESPONSE_BYTES) {
    throw new TypeError('invalid response byte budget');
  }
  return value;
}

const tooLarge = label => new Error(`${label} response too large`);

async function readBoundedJson(response, {maxResponseBytes, label, check, abortTransport}) {
  const declared = response?.headers?.get?.('content-length');
  if (typeof declared === 'string' && /^\d+$/.test(declared.trim())) {
    const length = Number(declared);
    if (Number.isSafeInteger(length) && length > maxResponseBytes) {
      abortTransport();
      throw tooLarge(label);
    }
  }

  let reader;
  try { reader = response?.body?.getReader?.(); }
  catch { check(); throw new Error(`${label} response invalid`); }
  if (reader) {
    const chunks = [];
    let total = 0;
    try {
      while (true) {
        check();
        let packet;
        try { packet = await reader.read(); }
        catch { check(); throw new Error(`${label} response invalid`); }
        const {done, value} = packet;
        check();
        if (done) break;
        if (!(value instanceof Uint8Array)) throw new Error(`${label} response invalid`);
        total += value.byteLength;
        if (total > maxResponseBytes) {
          try { Promise.resolve(reader.cancel()).catch(()=>{}); } catch {}
          abortTransport();
          throw tooLarge(label);
        }
        chunks.push(value);
      }
      const bytes = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      let text;
      try { text = new TextDecoder('utf-8', {fatal:true}).decode(bytes); }
      catch { throw new Error(`${label} response invalid`); }
      try { return JSON.parse(text); }
      catch { throw new Error(`${label} response invalid`); }
    } finally {
      try { reader.releaseLock?.(); } catch {}
    }
  }

  // Compatibility for trusted injected fetch implementations used by tests/hosts.
  // Real fetch Responses expose a byte stream and therefore take the bounded path.
  if (typeof response?.text === 'function') {
    let text;
    try { text = await response.text(); }
    catch { check(); throw new Error(`${label} response invalid`); }
    check();
    if (new TextEncoder().encode(text).byteLength > maxResponseBytes) {
      abortTransport();
      throw tooLarge(label);
    }
    try { return JSON.parse(text); }
    catch { throw new Error(`${label} response invalid`); }
  }

  if (typeof response?.json === 'function') {
    let payload;
    try { payload = await response.json(); }
    catch { check(); throw new Error(`${label} response invalid`); }
    check();
    return payload;
  }
  throw new Error(`${label} response invalid`);
}

export async function requestLocalJson(url, {
  fetchImpl, options = {}, signal, timeoutMs, label,
  maxResponseBytes = DEFAULT_LOCAL_RESPONSE_BYTES,
}) {
  validateResponseByteBudget(maxResponseBytes);
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
      return readBoundedJson(response, {
        maxResponseBytes,
        label,
        check,
        abortTransport: () => controller.abort(),
      });
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
