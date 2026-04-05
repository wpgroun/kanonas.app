const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Inject BookingSlot before DocTemplate
const bookingSlotDef = `
// =======================
// BOOKING SLOTS (CALENDLY STYLE)
// =======================
model BookingSlot {
  id       String @id @default(cuid())
  templeId String
  temple   Temple @relation(fields: [templeId], references: [id], onDelete: Cascade)

  // e.g. "GAMOS", "BAPTISM"
  serviceType String 
  
  // The start time of the slot
  startTime DateTime
  // The estimated end time
  endTime   DateTime?

  // Optionally specify which priest is handling it
  priestId String?

  // Is it booked? If booked, tokenStr points to the connect Request
  isBooked Boolean @default(false)
  tokenStr String? @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// =======================
// TEMPLATES
`;

if (!schema.includes('model BookingSlot')) {
  schema = schema.replace(
    '// =======================\n// TEMPLATES',
    bookingSlotDef
  );
}

// 2. Add conditionRules to DocTemplate
if (!schema.includes('conditionRules')) {
  schema = schema.replace(
    '  context     String?',
    '  context     String?\n  conditionRules String? // JSON logic mapping IF variables THEN render'
  );
}

fs.writeFileSync('prisma/schema.prisma', schema, 'utf8');
console.log('Successfully added BookingSlot to Prisma.');
