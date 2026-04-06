with open('src/app/admin/schedule/ScheduleClient.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace CardHeader
old_form = """ <Card className="shadow-sm border-border/50 sticky top-6">
 <CardHeader>
 <CardTitle>Νέα Ακολουθία</CardTitle>
 <CardDescription>Προσθήκη ακολουθίας στο ημερολόγιο</CardDescription>
 </CardHeader>
 <CardContent>"""
new_form = """ <Card className="shadow-xl border-0 overflow-hidden sticky top-6 rounded-2xl bg-[var(--surface)]">
 <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
 <h3 className="font-extrabold text-lg flex items-center gap-2"><Plus className="w-5 h-5"/> Νέα Ακολουθία</h3>
 <p className="text-white/80 text-sm mt-1">Προσθήκη ακολουθίας στο πρόγραμμα</p>
 </div>
 <div className="p-6">"""
text = text.replace(old_form, new_form)

text = text.replace(' </CardContent>\n </Card>', ' </div>\n </Card>')

text = text.replace(
    '<Input type="date"required value={date} onChange={e => setDate(e.target.value)} />',
    '<Input type="date"required value={date} onChange={e => setDate(e.target.value)} className="h-11 rounded-xl bg-[var(--background)] border border-[var(--border)]" />'
)
text = text.replace(
    '<Input type="time"required value={time} onChange={e => setTime(e.target.value)} />',
    '<Input type="time"required value={time} onChange={e => setTime(e.target.value)} className="h-11 rounded-xl bg-[var(--background)] border border-[var(--border)]" />'
)
text = text.replace(
    '<Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="π.χ. Όρθρος & Θεία Λειτουργία"/>',
    '<Input required value={title} onChange={e => setTitle(e.target.value)} className="h-11 rounded-xl bg-[var(--background)] border border-[var(--border)]" placeholder="π.χ. Όρθρος & Θεία Λειτουργία"/>'
)
text = text.replace(
    '<Textarea value={description} onChange={e => setDescription(e.target.value)} className="resize-y"placeholder="Αγίου Δημητρίου του Μυροβλύτου..."/>',
    '<Textarea value={description} onChange={e => setDescription(e.target.value)} className="resize-y rounded-xl bg-[var(--background)] border border-[var(--border)]" placeholder="Αγίου Δημητρίου του Μυροβλύτου..."/>'
)

text = text.replace(
    '<Button type="submit"disabled={loading} className="w-full mt-2">',
    '<Button type="submit"disabled={loading} className="w-full h-12 mt-4 rounded-xl font-bold bg-[var(--brand)] hover:bg-[var(--brand-dark)] shadow-indigo-600/30 shadow-lg text-md text-white">'
)

text = text.replace(
    '<Card className="shadow-sm border-dashed border-2 bg-transparent text-center py-16">',
    '<Card className="shadow-sm border-dashed border-2 border-[var(--border)] bg-[var(--background)] text-center py-16 rounded-2xl">'
)

old_list = """ <Card key={srv.id} className={`shadow-sm overflow-hidden flex border-l-4 ${srv.isMajor ? 'border-l-red-600 bg-red-50/30 ' : 'border-l-primary'}`}>
 
 {/* Date Box */}
 <div className={`p-4 min-w-[90px] flex flex-col items-center justify-center border-r border-border/50 ${srv.isMajor ? 'bg-red-600 text-white' : 'bg-muted/50 text-foreground'}`}>"""
new_list = """ <Card key={srv.id} className={`shadow-sm overflow-hidden flex border-l-4 rounded-2xl hover:shadow-md transition-shadow bg-[var(--surface)] ${srv.isMajor ? 'border-l-red-600 bg-red-50/50 ' : 'border-l-[var(--brand)]'}`}>
 
 {/* Date Box */}
 <div className={`p-4 min-w-[90px] flex flex-col items-center justify-center border-r ${srv.isMajor ? 'bg-red-600 text-white border-red-700' : 'bg-[var(--background)] text-[var(--foreground)] border-[var(--border)]'}`}>"""
text = text.replace(old_list, new_list)

old_actions = """ <Link href="/schedule"target="_blank">
 <Button variant="outline"className="shadow-sm">
 <ExternalLink className="w-4 h-4 mr-2"/> Δημόσια Προβολή
 </Button>
 </Link>
 <Link href="/admin/schedule/print"target="_blank">
 <Button className="shadow-sm">
 <Printer className="w-4 h-4 mr-2"/> Εκτύπωση Εβδομάδας
 </Button>
 </Link>
 <Button variant="secondary" onClick={handleBulkImport} disabled={importing} className="shadow-sm border-[var(--border)]">
 <DownloadCloud className="w-4 h-4 mr-2"/> {importing ? 'Γίνεται Εισαγωγή...' : 'Αυτόματο Εορτολόγιο'}
 </Button>"""

new_actions = """ <Link href="/schedule"target="_blank">
 <Button variant="outline"className="shadow-sm border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-xl">
 <ExternalLink className="w-4 h-4 mr-2"/> Δημόσια Προβολή
 </Button>
 </Link>
 <Link href="/admin/schedule/print"target="_blank">
 <Button className="shadow-sm hover:opacity-80 rounded-xl" style={{backgroundColor: 'var(--foreground)', color: 'var(--background)'}}>
 <Printer className="w-4 h-4 mr-2"/> Εκτύπωση Εβδομάδας
 </Button>
 </Link>
 <Button variant="secondary" onClick={handleBulkImport} disabled={importing} className="shadow-sm border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] rounded-xl">
 <DownloadCloud className="w-4 h-4 mr-2"/> {importing ? 'Γίνεται Εισαγωγή...' : 'Αυτόματο Εορτολόγιο'}
 </Button>"""
text = text.replace(old_actions, new_actions)

with open('src/app/admin/schedule/ScheduleClient.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
