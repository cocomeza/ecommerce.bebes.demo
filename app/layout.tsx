import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Baby Store – Ropa para bebés y niños',
  description: 'Ropa de calidad para tu bebé y niños. Ventas al por menor y mayor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
