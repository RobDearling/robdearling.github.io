import type { AppProps } from 'next/app';
import '../studio.css';

export default function StudioApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps}/>;
}
