import { getTokens } from '@/actions/sacraments'
import NewRequestButtons from './NewRequestButtons'
import RequestsKanban from './RequestsKanban'

export const metadata = { title: 'Μυστήρια & Αιτήματα - Kanonas' }

export default async function RequestsPage() {
 const tokens = await getTokens();

 return (
 <div className="container-fluid mt-6 space-y-6">
 
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
 Μυστήρια & Αιτήματα
 </h1>
 <p className="text-muted-foreground mt-1 text-sm">
 Διαχείριση μυστηρίων (Kanban View), ερωτηματολόγια ζευγαριών και αυτόματη έκδοση πιστοποιητικών.
 </p>
 </div>
 </div>

 <NewRequestButtons />

 <RequestsKanban tokens={tokens} />
 </div>
)
}
