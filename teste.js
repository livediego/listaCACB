const fs = require("fs");
const { PDFDocument, StandardFonts } = require("pdf-lib");

async function teste() {
  const pdfBaseBytes = fs.readFileSync("modelo.pdf");

  const pdfBase = await PDFDocument.load(pdfBaseBytes);
  const pdfDoc = await PDFDocument.create();

  const [pagina] = await pdfDoc.copyPages(pdfBase, [0]);
  const page = pdfDoc.addPage(pagina);

  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);

for (let i = 0; i < 800; i += 10) {
  page.drawText(`y=${i}`, { x: 10, y: i, size: 8 });
}
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("teste.pdf", pdfBytes);
}

teste();