import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-bottom">
        <Link href="/" className="footer-wordmark">ZERO DEGREE<span>.</span></Link>
        <span>Creative studio / Production house<br />Mumbai, India</span>
        <div className="footer-links">
          <Link href="/work">Work</Link>
          <Link href="/about">Info</Link>
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <a className="footer-mail" href="mailto:hello@zerodegree.studio">Email ↗</a>
        <span>© {new Date().getFullYear()} Zero Degree</span>
      </div>
    </footer>
  );
}
