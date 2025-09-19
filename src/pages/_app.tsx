// src/pages/_app.tsx
import type { AppProps } from 'next/app';
// 正确路径：从 src/pages 到 src/styles
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
