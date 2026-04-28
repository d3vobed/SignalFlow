import './globals.css'

export const metadata = {
  title: 'SignalFlow - AI Trading Signals',
  description: 'AI-powered trading signal generator with SoSoValue integration',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        {children}
      </body>
    </html>
  )
}
