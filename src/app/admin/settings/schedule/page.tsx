import { getTempleSettings } from '@/actions/settings';
import BookingSettingsClient from './BookingSettingsClient';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function BookingSettingsPage() {
 const settings = await getTempleSettings();
 const session = await getSession();
 if (!session || !session.templeId) redirect('/login');
 
 return <BookingSettingsClient initialSettings={settings} templeId={session.templeId}/>
}

