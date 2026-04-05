import { getYouthPrograms, getParticipants } from '@/actions/youth'
import YouthClient from './YouthClient'

export const metadata = {
  title: 'Νεολαία & Κατασκηνώσεις - Kanonas'
}

export default async function YouthPage() {
   const programs = await getYouthPrograms()
   const participants = await getParticipants()

   return (
     <div className="container-fluid mt-6 animate-in fade-in duration-500">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Νεολαία & Κατασκηνώσεις
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Διαχείριση περιόδων κατασκήνωσης, κατηχητικού και μητρώο νέων.
          </p>
        </div>
        
        <YouthClient 
           initialPrograms={programs} 
           initialParticipants={participants} 
        />
     </div>
   )
}
