import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Navbar from '@/components/Navbar';
import ProfileCard from '@/components/ProfileCard';
import DashboardWidgets from '@/components/DashboardWidgets';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  } 
  
  if (!session.user.isOnboarded) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ProfileCard user={session.user} />
        <DashboardWidgets user={session.user} />
      </main>
    </div>
  );
}