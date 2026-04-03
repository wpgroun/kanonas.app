import { getTempleSettings } from '../../../actions';
import BookingSettingsClient from './BookingSettingsClient';

export default async function BookingSettingsPage() {
  const settings = await getTempleSettings();
  
  return <BookingSettingsClient initialSettings={settings} templeId="cm0testtempleid0000000001" />
}
