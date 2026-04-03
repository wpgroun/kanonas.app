import { getDiptychs, getTempleSettings } from '../../../actions'

export default async function DiptychPrintPage() {
  const diptychs = await getDiptychs();
  const settings = await getTempleSettings();
  
  const templeName = settings.templeName || 'Ιερός Ναός';
  const todayGr = new Date().toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' });

  const ygeias = diptychs.filter((d: any) => d.type === 'ygeias');
  const anapauseos = diptychs.filter((d: any) => d.type === 'anapauseos');

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A5; margin: 1cm; }
        body {
            font-family: 'Palatino Linotype', 'Book Antiqua', 'Palatino', Georgia, serif;
            font-size: 9.5pt;
            color: #1a1008;
            background: #fff;
            margin: 0; padding: 0;
        }
        .diptych-wrapper {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            min-height: 100vh;
        }
        .panel {
            padding: 0.8cm 0.6cm;
            border: 1px solid #bba070;
        }
        .panel-ygeias { border-right: none; }
        .panel-header {
            text-align: center;
            margin-bottom: 0.5cm;
            padding-bottom: 0.3cm;
            border-bottom: 2px solid currentColor;
        }
        .panel-ygeias .panel-header { color: #1a5c1a; border-color: #1a5c1a; }
        .panel-anapauseos .panel-header { color: #4a1a00; border-color: #4a1a00; }
        
        .panel-icon { font-size: 18pt; line-height: 1; margin-bottom: 4px; }
        .panel-title {
            font-size: 10.5pt;
            font-weight: bold;
            letter-spacing: 0.04em;
        }
        .panel-subtitle {
            font-size: 8pt;
            opacity: 0.7;
            font-style: italic;
            margin-top: 2px;
        }
        .name-list { list-style: none; padding: 0; margin: 0; }
        .name-list li {
            padding: 2.5px 0;
            font-size: 9.5pt;
            line-height: 1.4;
            display: flex;
            align-items: baseline;
            gap: 4px;
        }
        .name-list li::before {
            content: '†';
            font-size: 8pt;
            opacity: 0.5;
            flex-shrink: 0;
        }
        .name-list li:nth-child(odd) { background: rgba(0,0,0,0.025); padding-left: 3px; }
        .panel-footer {
            margin-top: 0.4cm;
            padding-top: 0.3cm;
            border-top: 1px dotted #bba070;
            font-size: 7.5pt;
            color: #888;
            text-align: center;
        }
      `}} />

      <div className="diptych-wrapper">
          {/* Υπέρ Υγείας */}
          <div className="panel panel-ygeias">
              <div className="panel-header">
                  <div className="panel-icon">🌿</div>
                  <div className="panel-title">ΥΠΕΡ ΥΓΕΙΑΣ</div>
                  <div className="panel-subtitle">τῶν εὐσεβῶν χριστιανῶν</div>
              </div>
              <ul className="name-list">
                  {ygeias.map((r: any) => (
                    <li key={r.id}>{r.name}</li>
                  ))}
                  {ygeias.length === 0 && (
                    <li style={{ color: '#aaa', fontStyle: 'italic' }}>— Δεν υπάρχουν ονόματα —</li>
                  )}
              </ul>
              <div className="panel-footer">
                  {templeName}<br/>
                  {todayGr} · {ygeias.length} ονόματα
              </div>
          </div>

          {/* Υπέρ Αναπαύσεως */}
          <div className="panel panel-anapauseos">
              <div className="panel-header">
                  <div className="panel-icon">☦</div>
                  <div className="panel-title">ΥΠΕΡ ΑΝΑΠΑΥΣΕΩΣ</div>
                  <div className="panel-subtitle">τῶν κεκοιμημένων δούλων τοῦ Θεοῦ</div>
              </div>
              <ul className="name-list">
                  {anapauseos.map((r: any) => (
                    <li key={r.id}>{r.name}</li>
                  ))}
                  {anapauseos.length === 0 && (
                    <li style={{ color: '#aaa', fontStyle: 'italic' }}>— Δεν υπάρχουν ονόματα —</li>
                  )}
              </ul>
              <div className="panel-footer">
                  {templeName}<br/>
                  {todayGr} · {anapauseos.length} ονόματα
              </div>
          </div>
      </div>
      
      {/* Auto-print script */}
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </>
  )
}
