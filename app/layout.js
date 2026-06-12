import Provider from './Provider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import './globals.css'

export const metadata = {
  title: 'Campus Dashboard',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <body>
        <Provider session={session}>
          {children}
        </Provider>
      </body>
    </html>
  )
}
