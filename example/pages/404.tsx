// 404.js
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1>404 - Page Not Found</h1>
      <Link href="/">
        <a>Go back home</a>
      </Link>
    </>
  );
}
