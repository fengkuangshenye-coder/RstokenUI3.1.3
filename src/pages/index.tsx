import "@/styles/globals.css";
import Head from "next/head";
import RSUI32 from "@/components/RSUI32";
export default function Home() {
  return (
    <>
      <Head><title>RStoken UI</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <RSUI32 />
    </>
  );
}
