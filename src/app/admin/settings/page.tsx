import { getTempleSettings } from '@/actions/settings'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const settings = await getTempleSettings();
  
  return <SettingsClient initialSettings={settings} />
}

