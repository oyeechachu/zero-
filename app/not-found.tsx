import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-shell not-found-page">
      <p className="eyebrow">404 / Frame not found</p>
      <h1 className="page-title">THIS ISN’T<br />THE FRAME.</h1>
      <p>The page may have moved. The work is still here.</p>
      <Link href="/work" className="text-link">Back to selected work <span aria-hidden="true">↗</span></Link>
    </div>
  );
}
