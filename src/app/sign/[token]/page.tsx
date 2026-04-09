import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import SignForm from './SignForm'

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params
  const token = resolvedParams.token

  const req = await prisma.citizenRequest.findUnique({
    where: { signatureToken: token },
    include: { temple: true }
  })

  if (!req) return notFound()

  let docs = []
  if (req.generatedDocs) {
    try {
      docs = JSON.parse(req.generatedDocs).filter((d: any) => d.visibility === 'citizen')
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800">{req.temple.name}</h1>
          <p className="text-sm text-slate-500 mt-2">Ψηφιακή Υπογραφή Εγγράφων — Ψηφιακή Πύλη</p>
        </div>

        {req.signedAt ? (
          <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl p-6 text-center">
            <h2 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Επιτυχής Υπογραφή
            </h2>
            <p className="text-sm mb-4">Τα έγγραφά σας έχουν υπογραφεί ψηφιακά και εγκριθεί επιτυχώς.</p>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <p className="text-xs uppercase font-bold text-emerald-600 mb-1">Αριθμός Καταχώρησης</p>
              <p className="font-mono text-xs text-slate-700 break-all">{req.signatureToken}</p>
            </div>
            <p className="text-xs mt-4 text-emerald-700">Ημ/νία Υπογραφής: {req.signedAt.toLocaleString('el-GR')}</p>
          </div>
        ) : (
          <SignForm token={token} applicantName={req.applicantName} protocol={req.protocolNumber} docs={docs} />
        )}
      </div>
    </div>
  )
}
