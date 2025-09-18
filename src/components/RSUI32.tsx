import React from 'react';
import { OracleGlobe } from './OracleGlobe';
import { StarfieldCanvas } from './StarfieldCanvas';
import { Title } from './Title';

export default function RSUI32() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <StarfieldCanvas className="absolute inset-0 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-8">
        <Title text="RStoken 全球私募 · RSUI 3.2" />
        <OracleGlobe className="w-full max-w-4xl mx-auto" height={320} />
      </div>
    </div>
  );
}
