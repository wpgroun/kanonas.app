import { getServiceSchedules } from '@/actions/schedule'
import { getTempleSettings } from '@/actions/settings'

export default async function PublicSchedulePage() {
  const schedules = await getServiceSchedules();
  const settings = await getTempleSettings();
  
  const templeName = settings.name || 'Ιερός Ναός';

  // Group by month
  const grouped: Record<string, any[]> = {};
  schedules.forEach((srv: any) => {
    const month = new Date(srv.date).toLocaleDateString('el-GR', { month: 'long', year: 'numeric' });
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(srv);
  });

  return (
    <div style={{ minHeight: '100vh', background: '#fcfbfa', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Hero Header */}
      <div style={{ background: '#2c1a0c', color: '#fff', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
         <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', opacity: 0.05, fontSize: '20rem', pointerEvents: 'none' }}>☦</div>
         <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>{templeName}</h1>
         <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#d4af37' }}>Μηνιαίο Πρόγραμμα Ιερών Ακολουθιών</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
        
        {Object.keys(grouped).length === 0 ? (
           <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
             Δεν έχουν αναρτηθεί ακολουθίες για αυτό το διάστημα.
           </div>
        ) : (
           Object.keys(grouped).map(month => (
             <div key={month} style={{ marginBottom: '4rem' }}>
                <h2 style={{ color: '#8b2e20', borderBottom: '2px solid #e5d9c5', paddingBottom: '0.5rem', marginBottom: '2rem', textTransform: 'capitalize' }}>
                  {month}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {grouped[month].map(srv => {
                    const dDate = new Date(srv.date);
                    return (
                      <div key={srv.id} style={{ display: 'flex', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: srv.isMajor ? '#fca5a5' : '#f0e9df' }}>
                        
                        <div style={{ background: srv.isMajor ? '#991b1b' : '#f8f4f0', color: srv.isMajor ? '#fff' : '#2c1a0c', minWidth: '100px', padding: '1.5rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                           <span style={{ fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase' }}>{dDate.toLocaleDateString('el-GR', { weekday: 'short' })}</span>
                           <span style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1, margin: '0.2rem 0' }}>{dDate.getDate()}</span>
                        </div>

                        <div style={{ padding: '1.5rem', flex: 1 }}>
                           <div style={{ color: srv.isMajor ? '#e11d48' : '#d4af37', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                             ⏱️ {dDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                           </div>
                           <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#1a1008' }}>
                             {srv.isMajor && <span style={{ color: '#991b1b', marginRight: '0.4rem' }}>☦</span>}
                             {srv.title}
                           </h3>
                           {srv.description && <p style={{ margin: '0.8rem 0 0', color: '#666', lineHeight: 1.5 }}>{srv.description}</p>}
                        </div>

                      </div>
                    )
                  })}
                </div>
             </div>
           ))
        )}

      </div>
    </div>
  )
}

