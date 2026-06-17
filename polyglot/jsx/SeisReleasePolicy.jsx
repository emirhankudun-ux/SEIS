import { useState, useEffect } from 'react';

const MOTION_DURATION = {
  cinematic: 800,
  balanced:  300,
  reduced:   0,
};

const STATUS_COLOR = {
  ready:   '#22c55e',
  blocked: '#ef4444',
  pending: '#f59e0b',
};

function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [prefersReduced, setPrefersReduced] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia(query).matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

function SeisReleasePolicy({ status = 'pending', motionMode = 'balanced' }) {
  const prefersReduced = useReducedMotion();
  const resolvedMode   = prefersReduced ? 'reduced' : motionMode;
  const duration       = MOTION_DURATION[resolvedMode] ?? 0;

  return (
    <div
      role="status"
      aria-label={`Release status: ${status}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        color: STATUS_COLOR[status] ?? '#6b7280',
        transition: `opacity ${duration}ms ease`,
        fontWeight: 600,
      }}
    >
      <span>{status}</span>
    </div>
  );
}

export { SeisReleasePolicy, MOTION_DURATION, STATUS_COLOR };
