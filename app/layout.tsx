import { GeistMono } from 'geist/font/mono';
import { Crimson_Text } from 'next/font/google';
import './globals.css';

const serif = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif',
});

export const metadata = {
  title: 'Desolation Rows',
  description: "An AI exploration of Bob Dylan's 'A Hard Rain's A-Gonna Fall'",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="bg-[#f4f1ea] text-gray-900 antialiased h-screen">
        <main className="h-full flex flex-col">
          <header className="py-8 text-center">
            <h1 className="font-serif text-4xl mb-2">Desolation Rows</h1>
            <p className="text-gray-600 italic">
              An AI exploration of Bob Dylan&apos;s &quot;A Hard Rain&apos;s A-Gonna Fall&quot;
            </p>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="py-4 text-center text-sm text-gray-600">
            <p>
              Inspired by Bob Dylan&apos;s quote: &quot;all of the lyrics were taken from the
              initial lines of songs that he thought he would never have time to write.&quot;
            </p>
          </footer>
        </main>
      </body>
    </html>
  );
}
