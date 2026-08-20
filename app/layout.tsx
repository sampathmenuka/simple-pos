import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NavWrapper } from '@/components/nav-wrapper'
import { Providers } from '@/components/providers'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SimplePOS',
  description: 'Simple Point of Sale System',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <NavWrapper />
          {children}
        </Providers>
      </body>
    </html>
  )
}