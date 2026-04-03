import { getDashboardStats } from './dashboardActions'
import DashboardClient from './DashboardClient'

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  
  return <DashboardClient stats={stats} />
}

