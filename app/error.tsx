'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Route rendering failed', error);
  }, [error]);

  return (
    <div className="page-shell error-page" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="page-title">LET’S TRY<br />THAT AGAIN.</h1>
      <button className="text-link error-retry" onClick={reset}>Reload this page <span aria-hidden="true">↻</span></button>
    </div>
  );
}
