import re

with open('src/app/admin/calendar/CalendarClient.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

old1 = """  const [category, setCategory] = useState('ΣΥΝΕΔΡΙΟ');
  
  const categoryColors: Record<string, string> = {
  'ΛΕΙΤΟΥΡΓΙΑ': '#f43f5e', // rose-500
  'ΣΥΝΕΔΡΙΟ': '#8b5cf6', // violet-500
  'ΚΑΤΑΣΚΗΝΩΣΗ': '#10b981', // emerald-500
  'ΜΗΤΡΟΠΟΛΗ': '#f59e0b', // amber-500
  'ΑΛΛΟ': '#3b82f6' // blue-500
  };

  const handleAdd = async (e: any) => {
  e.preventDefault();
  setLoading(true);
  await addCentralEvent({
  title, description, startDate, endDate: endDate || startDate,
  category, color: categoryColors[category] || categoryColors['ΑΛΛΟ']
  });
  setLoading(false);
  setTitle(''); setDescription('');
  router.refresh();
  };"""

new1 = """  const [category, setCategory] = useState('ΣΥΝΕΔΡΙΟ');
 
  const categoryColors: Record<string, string> = {
  'ΛΕΙΤΟΥΡΓΙΑ': '#f43f5e',
  'ΣΥΝΕΔΡΙΟ': '#8b5cf6',
  'ΚΑΤΑΣΚΗΝΩΣΗ': '#10b981',
  'ΜΗΤΡΟΠΟΛΗ': '#f59e0b',
  'ΑΛΛΟ': '#3b82f6'
  };

  const [color, setColor] = useState(categoryColors['ΣΥΝΕΔΡΙΟ']);

  const handleCategoryChange = (e: any) => {
    const val = e.target.value;
    setCategory(val);
    setColor(categoryColors[val] || '#3b82f6');
  };

  const handleAdd = async (e: any) => {
  e.preventDefault();
  setLoading(true);
  await addCentralEvent({
  title, description, startDate, endDate: endDate || startDate,
  category, color
  });
  setLoading(false);
  setTitle(''); setDescription('');
  router.refresh();
  };"""

text = text.replace(old1, new1)

old_card = """<Card key={ev.id} className="shadow-lg border-0 overflow-hidden relative transition-transform hover:-translate-y-1 hover:shadow-xl">
  <div className="absolute left-0 top-0 bottom-0 w-3"style={{backgroundColor: ev.color || '#3b82f6'}} />
  <CardContent className="p-5 pl-8 flex justify-between items-center bg-[var(--surface)]">"""

new_card = """<Card key={ev.id} className="shadow-sm border relative transition-transform hover:-translate-y-1 hover:shadow-md" style={{ backgroundColor: (ev.color || '#3b82f6') + '15', borderColor: (ev.color || '#3b82f6') + '30' }}>
  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{backgroundColor: ev.color || '#3b82f6'}} />
  <CardContent className="p-5 pl-7 flex justify-between items-center bg-transparent">"""

text = text.replace(old_card, new_card)

old_form = """  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
  <h3 className="font-extrabold text-lg flex items-center gap-2"><MapPin className="w-5 h-5"/> Νέο Γεγονός</h3>
  <p className="text-blue-100 text-sm mt-1">Προσθήκη στο κεντρικό ημερολόγιο</p>
  </div>
  <form onSubmit={handleAdd} className="p-6 space-y-4">
  <div className="space-y-2">
  <Label className="font-bold">Τίτλος</Label>
  <Input required value={title} onChange={e=>setTitle(e.target.value)} className="h-11 rounded-xl bg-[var(--background)]"placeholder="Τίτλος..."/>
  </div>
  
  <div className="space-y-2">
  <Label className="font-bold">Κατηγορία Χρώματος</Label>
  <select required value={category} onChange={e=>setCategory(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)]">
  <option value="ΛΕΙΤΟΥΡΓΙΑ">Λειτουργία (Κόκκινο)</option>
  <option value="ΣΥΝΕΔΡΙΟ">Συνέδριο/Ομιλία (Μωβ)</option>
  <option value="ΚΑΤΑΣΚΗΝΩΣΗ">Κατασκήνωση (Πράσινο)</option>
  <option value="ΜΗΤΡΟΠΟΛΗ">Μητρόπολη/Συνάντηση (Κίτρινο)</option>
  <option value="ΑΛΛΟ">Άλλο (Μπλε)</option>
  </select>
  </div>"""

new_form = """  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
  <h3 className="font-extrabold text-lg flex items-center gap-2"><MapPin className="w-5 h-5"/> Νέο Γεγονός</h3>
  <p className="text-blue-100 text-sm mt-1">Προσθήκη στο Ημερολόγιο</p>
  </div>
  <form onSubmit={handleAdd} className="p-6 space-y-4">
  <div className="space-y-2">
  <Label className="font-bold">Τίτλος</Label>
  <Input required value={title} onChange={e=>setTitle(e.target.value)} className="h-11 rounded-xl text-[var(--foreground)] border border-[var(--border)] bg-[var(--background)]"placeholder="Τίτλος..."/>
  </div>
  
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-2">
      <Label className="font-bold">Κατηγορία</Label>
      <select required value={category} onChange={handleCategoryChange} className="w-full h-11 px-3 text-[var(--foreground)] rounded-xl border border-[var(--border)] bg-[var(--background)] cursor-pointer">
      <option value="ΛΕΙΤΟΥΡΓΙΑ">Λειτουργία</option>
      <option value="ΣΥΝΕΔΡΙΟ">Συνέδριο/Ομιλία</option>
      <option value="ΚΑΤΑΣΚΗΝΩΣΗ">Κατασκήνωση</option>
      <option value="ΜΗΤΡΟΠΟΛΗ">Μητρόπολη/Συνάντηση</option>
      <option value="ΑΛΛΟ">Άλλο</option>
      </select>
    </div>
    <div className="space-y-2">
      <Label className="font-bold">Χρώμα</Label>
      <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl bg-[var(--background)] px-2 h-11">
        <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-8 h-8 rounded shrink-0 cursor-pointer outline-none border-none bg-transparent" title="Επιλογή Χρώματος" />
        <span className="text-xs text-[var(--text-muted)] font-medium uppercase font-mono">{color}</span>
      </div>
    </div>
  </div>"""

text = text.replace(old_form, new_form)

with open('src/app/admin/calendar/CalendarClient.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
