import React from 'react';

interface TitleProps {
  text: string;
}

export function Title({ text }: TitleProps) {
  return (
    <h1 className="text-3xl md:text-5xl font-bold text-center text-cyan-400 drop-shadow-lg">
      {text}
    </h1>
  );
}
