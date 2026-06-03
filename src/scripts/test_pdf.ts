import { generateAllBaptisiDocs, TokenData } from '../lib/pdfEngine';

async function main() {
  const dummyToken: TokenData = {
    id: "test-token-id",
    serviceType: "VAPTISI",
    customerName: "Γεώργιος Παπαδόπουλος",
    ceremonyDate: new Date(),
    assignedPriest: "π. Ιωάννης",
    assignedPsaltis: "Νικόλαος",
    protocolNumber: "123/2026",
    bookNumber: "Τόμος Α / 12",
    temple: {
      name: "Ιερός Ναός Αγίου Νικολάου",
      address: "Αθήνα",
      settings: JSON.stringify({
        metropolisName: "Ιερά Μητρόπολη Αθηνών"
      })
    },
    ceremonyMeta: {
      dataJson: JSON.stringify({
        childName: "Μαρία",
        anadoxosIsOrthodox: "yes"
      })
    },
    persons: [
      { role: "child", firstName: "Μαρία", lastName: "Παπαδοπούλου", fathersName: "Γεώργιος" },
      { role: "father", firstName: "Γεώργιος", lastName: "Παπαδόπουλος", fathersName: "Ιωάννης" },
      { role: "mother", firstName: "Ελένη", lastName: "Παπαδοπούλου", fathersName: "Δημήτριος" },
      { role: "godparent", firstName: "Κωνσταντίνος", lastName: "Γεωργίου", fathersName: "Βασίλειος" }
    ]
  };

  console.log("Generating baptism documents...");
  const docs = await generateAllBaptisiDocs(dummyToken);
  console.log(`Generated ${docs.length} documents successfully:`);
  for (const doc of docs) {
    console.log(`- ${doc.label} (${doc.filename}) - size: ${doc.buffer.length} bytes`);
  }
}

main().catch(e => console.error("Unhandled error:", e));
