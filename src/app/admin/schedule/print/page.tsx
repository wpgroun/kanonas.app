import { getServiceSchedules, getDocTemplates, getTempleSettings } from '../../../actions'

export default async function SchedulePrintPage() {
  const schedules = await getServiceSchedules();
  
  // We check if the Church has designed a custom SCHEDULE template!
  const templates = await getDocTemplates('SCHEDULE');
  const hasTemplate = templates && templates.length > 0;
  
  const settings = await getTempleSettings();
  const templeName = settings.templeName || 'Ιερός Ναός';

  // Build the schedules table HTML for replacement
  let scheduleHtml = `<table style="width:100%; border-collapse: collapse; margin-top: 1cm; font-size: 14pt;">`;
  scheduleHtml += `<thead><tr style="border-bottom:2px solid #bba070;"><th style="text-align:left; padding:10px;">ΗΜΕΡΟΜΗΝΙΑ</th><th style="text-align:left; padding:10px;">ΩΡΑ</th><th style="text-align:left; padding:10px;">ΑΚΟΛΟΥΘΙΑ</th></tr></thead>`;
  scheduleHtml += `<tbody>`;
  
  if (schedules.length === 0) {
     scheduleHtml += `<tr><td colspan="3" style="text-align:center; padding: 20px;">Δεν υπάρχουν προγραμματισμένες ακολουθίες.</td></tr>`;
  } else {
     schedules.forEach((srv: any) => {
        const rowColor = srv.isMajor ? '#991b1b' : '#1a1008';
        const dDate = new Date(srv.date);
        
        scheduleHtml += `<tr style="border-bottom:1px solid #eee; color: ${rowColor};">`;
        scheduleHtml += `<td style="padding: 10px; vertical-align: top;"><b>${dDate.toLocaleDateString('el-GR', { weekday: 'short', day: '2-digit', month: 'short' })}</b></td>`;
        scheduleHtml += `<td style="padding: 10px; vertical-align: top; color: #555;">${dDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}</td>`;
        scheduleHtml += `<td style="padding: 10px; vertical-align: top;">`;
        scheduleHtml += `<b>${srv.isMajor ? '☦ ' : ''}${srv.title}</b>`;
        if (srv.description) {
           scheduleHtml += `<br/><span style="font-size: 11pt; color: #666; font-style: italic;">${srv.description}</span>`;
        }
        scheduleHtml += `</td></tr>`;
     });
  }
  scheduleHtml += `</tbody></table>`;

  if (hasTemplate) {
    const rawHtml = templates[0].htmlContent ?? '';
    // Replace placeholders
    const finalHtml = rawHtml
      .replace(/\{TEMPLE_NAME\}/g, templeName)
      .replace(/\{SCHEDULE_TABLE\}/g, scheduleHtml);

    return (
      <>
        <style dangerouslySetInnerHTML={{__html: `
          @page { size: A4 portrait; margin: 1cm; }
          body { font-family: 'Georgia', serif; }
        `}} />
        <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
        <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
      </>
    );
  }

  // Fallback Premium UI if no template is defined
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A4 portrait; margin: 2cm; }
        body {
            font-family: 'Palatino Linotype', 'Book Antiqua', 'Palatino', Georgia, serif;
            color: #1a1008; background: #fff; margin: 0; padding: 0;
            line-height: 1.6;
        }
        .header { text-align: center; border-bottom: 2px solid #bba070; padding-bottom: 0.5cm; margin-bottom: 1cm; }
      `}} />

      <div className="header">
         <h2 style={{ margin: '0.2cm 0', fontSize: '18pt' }}>{templeName}</h2>
         <h1 style={{ fontSize: '24pt', color: '#8b2e20', letterSpacing: '0.05em' }}>ΠΡΟΓΡΑΜΜΑ ΙΕΡΩΝ ΑΚΟΛΟΥΘΙΩΝ</h1>
      </div>

      <div dangerouslySetInnerHTML={{ __html: scheduleHtml }} />
      
      <div style={{ marginTop: '2cm', textAlign: 'center', fontSize: '12pt', color: '#555' }}>
         (Για την ενημέρωση των πιστών)
      </div>

      {/* Auto-print */}
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />
    </>
  )
}

