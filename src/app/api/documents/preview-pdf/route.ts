import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Locate the soffice executable (LibreOffice)
function findSoffice(): string | null {
  const candidates = [
    'soffice',
    'libreoffice',
    '/usr/bin/soffice',
    '/usr/bin/libreoffice',
    '/usr/local/bin/soffice',
    '/opt/libreoffice/program/soffice',
    '/opt/libreoffice7.6/program/soffice',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ]
  for (const cmd of candidates) {
    try {
      execSync(`"${cmd}" --version`, { timeout: 5000, stdio: 'ignore' })
      return cmd
    } catch {}
  }
  return null
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.templeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const soffice = findSoffice()
  if (!soffice) {
    return NextResponse.json({ error: 'LibreOffice not available on this server.' }, { status: 503 })
  }

  const { base64 } = await req.json()
  if (!base64) {
    return NextResponse.json({ error: 'Missing base64 DOCX' }, { status: 400 })
  }

  const tmpDir = os.tmpdir()
  const uid = `preview_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const tmpDocx = path.join(tmpDir, `${uid}.docx`)
  const tmpPdf = path.join(tmpDir, `${uid}.pdf`)

  try {
    fs.writeFileSync(tmpDocx, Buffer.from(base64, 'base64'))

    execSync(
      `"${soffice}" --headless --convert-to pdf --outdir "${tmpDir}" "${tmpDocx}"`,
      { timeout: 30_000 }
    )

    const pdfBuffer = fs.readFileSync(tmpPdf)
    const pdfBase64 = pdfBuffer.toString('base64')

    return NextResponse.json({ pdf: pdfBase64 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Conversion failed: ' + err.message }, { status: 500 })
  } finally {
    try { fs.unlinkSync(tmpDocx) } catch {}
    try { fs.unlinkSync(tmpPdf) } catch {}
  }
}
