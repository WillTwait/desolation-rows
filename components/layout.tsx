'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import Frame from './frame';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className=" min-h-screen  px-2.5 py-8 md:py-12 md:px-4  flex  justify-center overflow-x-hidden overflow-y-auto">
      <div className="relative w-full max-w-5xl">
        <div className="grid grid-cols-[1fr_minmax(auto,_90%)_1fr] md:grid-cols-[1fr_minmax(auto,_85%)_1fr] items-start">
          {/* Future Rabbit hole list */}
          <div className="pt-8">
            <div className="h-full" />
          </div>

          {/* Main Content Frame */}
          <div className={`relative 'h-[75vh]`}>
            <Frame title="Desolation Rows" titleSize="lg" minHeight="min-h-[75vh]">
              <div className={`py-8 px-2 md:p-8 'h-full overflow-hidden`}>{children}</div>
            </Frame>
            <div className="text-xs text-right font-mono tracking-tight mt-2">
              <Link className="border-b border-black hover:border-b-[2px]" href="https://twait.dev">
                Made by Will
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
