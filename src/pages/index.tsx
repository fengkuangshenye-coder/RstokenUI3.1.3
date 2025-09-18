import dynamic from 'next/dynamic';

// 从 src/pages/ 相对到 src/components/
const RSUI32 = dynamic(() => import('../components/RSUI32'), { ssr: false });

export default function Home() {
  return <RSUI32 />;
}

