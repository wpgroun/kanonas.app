import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';
import { declineGreekName } from './greekDeclension';

export function generateDocxCertificate(
  tokenData: any,
  persons: any[],
  templateFileName: string
): Buffer {
  // We utilize the local server hosting for S3-less storage as requested
  const templatePath = path.resolve(process.cwd(), 'public', 'templates', templateFileName);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found at ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath, 'binary');
  const zip = new PizZip(content);
  
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Prepare dynamic dataset by associating persons to roles
  const groom = persons.find(p => p.role.toLowerCase() === 'groom' || p.role.toLowerCase() === 'husband');
  const bride = persons.find(p => p.role.toLowerCase() === 'bride' || p.role.toLowerCase() === 'wife');
  const child = persons.find(p => p.role.toLowerCase() === 'child');

  // Automatic Declension Engine - Converting Nominative to Genitive
  const groom_name_genitive = groom ? `${declineGreekName(groom.firstName, 'genitive', 'male')} ${declineGreekName(groom.lastName, 'genitive', 'male')}` : '';
  const bride_name_genitive = bride ? `${declineGreekName(bride.firstName, 'genitive', 'female')} ${declineGreekName(bride.lastName, 'genitive', 'female')}` : '';
  const child_name_genitive = child ? `${declineGreekName(child.firstName, 'genitive', 'unknown')} ${declineGreekName(child.lastName, 'genitive', 'unknown')}` : '';

  // Apply to Word Document Template tags
  doc.render({
    protocol_number: tokenData.protocolNumber || 'ΕΚΚΡΕΜΕΙ',
    ceremony_date: tokenData.ceremonyDate ? new Date(tokenData.ceremonyDate).toLocaleDateString('el-GR') : '',
    assigned_priest: tokenData.assignedPriest || '',
    
    // Core Names (Ονομαστική)
    groom_name: groom ? `${groom.firstName} ${groom.lastName}` : '',
    bride_name: bride ? `${bride.firstName} ${bride.lastName}` : '',
    child_name: child ? `${child.firstName} ${child.lastName}` : '',

    // Declined Names (Γενική) injected dynamically
    groom_name_genitive,
    bride_name_genitive,
    child_name_genitive,
  });

  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return buf;
}
