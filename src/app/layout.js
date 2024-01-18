import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ToastContainer } from 'react-toastify';
import getToken from '@/helpers/getToken';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'FitDose',
  description: 'Your daily logger!',
}

export default function RootLayout({ children }) {
  const token = getToken();
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className='flex flex-col h-screen'>
          <Navbar token={token} />
          <main className='flex-1'>{children}</main>
          <ToastContainer />
        </div>
      </body>
    </html>
  )
}
