const fs = require("fs");
const XLSX = require("xlsx");
const { PDFDocument, StandardFonts } = require("pdf-lib");

// ===== CONFIG =====
const ARQUIVO_EXCEL = "planilha.xlsx";
const ARQUIVO_PDF = "modelo.pdf";
const SAIDA = "pdf_preenchido.pdf";

// ===== 1. LER EXCEL =====
const workbook = XLSX.readFile(ARQUIVO_EXCEL);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const dados = XLSX.utils.sheet_to_json(sheet);

function getCampo(row, nomeParcial) {
  const chave = Object.keys(row).find(k =>
    k.toLowerCase().includes(nomeParcial.toLowerCase())
  );

  return chave ? row[chave] : "";
}

// ===== 2. FUNÇÃO PRINCIPAL =====
async function gerarPDF() {
  const pdfBaseBytes = fs.readFileSync(ARQUIVO_PDF);
  const pdfDoc = await PDFDocument.create();
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const linhasPorPagina = 2;

  for (let i = 0; i < dados.length; i += linhasPorPagina) {
    const bloco = dados.slice(i, i + linhasPorPagina);

    const pdfBase = await PDFDocument.load(pdfBaseBytes);
    const [paginaBase] = await pdfDoc.copyPages(pdfBase, [0]);
    const page = pdfDoc.addPage(paginaBase);

    let y = 420; // ajuste fino aquiconsole.log(JSON.stringify(row, null, 2));

    bloco.forEach((row) => {
      console.log(JSON.stringify(row, null, 2));
      page.drawText(getCampo(row, "nome completo")row["Nome completo do participante:"] || "", { x: 50, y: y, size: 10, font: fonte });

      page.drawText(row["CPF do participante:"] || "", { x: 300, y: y, size: 10, font: fonte });

      page.drawText(row["Data de Nascimento:"] || "", { x: 50, y: y - 15, size: 10, font: fonte });

      page.drawText(row["Cidade:"] || "", { x: 200, y: y - 15, size: 10, font: fonte });

      page.drawText(row["Celular com DDD (WhatsApp):"] || "", { x: 50, y: y - 30, size: 10, font: fonte });

      page.drawText(row["Melhor E-mail:"] || "", { x: 200, y: y - 30, size: 10, font: fonte });

      page.drawText(row["Nome da Empresa:"] || "", { x: 50, y: y - 45, size: 10, font: fonte });

      page.drawText(row["Número do CNPJ | MEI | CAF:"] || "", { x: 300, y: y - 45, size: 10, font: fonte });

      y -= 120;
    });
  }

  const pdfFinal = await pdfDoc.save();
  fs.writeFileSync(SAIDA, pdfFinal);

  console.log("✅ PDF gerado com sucesso!");
}

gerarPDF();