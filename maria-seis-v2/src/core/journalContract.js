/**
 * Journal v1 is synchronous. A Promise is not a commit acknowledgement.
 * Use the native Promise brand check before inspecting then, so genuine promises
 * (including cross-realm ones) cannot hide behind an overridden/missing method.
 * Never invoke a generic thenable: its then could start deferred I/O. This guard
 * cannot cancel started I/O, prove fsync, or contain arbitrary adapter code.
 * Legacy synchronous void-returning writers remain supported; false means failure.
 */
export function assertSynchronousJournalResult(result) {
  if (result !== null && (typeof result === 'object' || typeof result === 'function')) {
    let promise = false;
    try {
      Promise.prototype.then.call(result, undefined, () => {});
      promise = true;
    } catch { /* Not a genuine Promise, or an invalid Promise subclass. */ }
    if (promise || typeof result.then === 'function') throw new TypeError('journal-async-unsupported');
  }
  if (result === false) throw new Error('journal-acknowledgement-failed');
  return result;
}
