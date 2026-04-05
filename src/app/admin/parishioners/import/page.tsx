import ImportWizard from '@/components/ImportWizard'

export const metadata = {
 title: 'Εισαγωγή Ενοριτών — Κανόνας',
 description: 'Μαζική εισαγωγή ενοριτών από αρχείο CSV',
}

export default function ImportPage() {
 return (
 <div className="admin-content">
 <ImportWizard />
 </div>
)
}
