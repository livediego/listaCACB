const fs = require("fs");
const XLSX = require("xlsx");
const { PDFDocument, StandardFonts } = require("pdf-lib");

// ===== CONFIG =====
const ARQUIVO_EXCEL = "planilha.xlsx";
const ARQUIVO_PDF = "modelo.pdf";
const SAIDA = "pdf_preenchido.pdf";
const LINHAS_POR_PAGINA = 2;

// ===== LER EXCEL =====
const workbook = XLSX.readFile(ARQUIVO_EXCEL);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const dados = XLSX.utils.sheet_to_json(sheet);

// ===== NORMALIZAR CHAVES =====
function normalizarObjeto(obj) {
  const novo = {};
  Object.keys(obj).forEach((k) => {
    novo[k.trim()] = obj[k];
  });
  return novo;
}

function textoSeguro(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

// ===== MAPEAR COLUNAS (INTELIGENTE) =====
function mapearColunas(row) {
  const mapa = {};

  Object.keys(row).forEach((k) => {
    const key = k.toLowerCase();

    if (key.includes("nome completo")) mapa.nome = k;
    if (key.includes("cpf")) mapa.cpf = k;
    if (key.includes("nascimento")) mapa.nascimento = k;
    if (key.includes("cidade")) mapa.cidade = k;
    if (key.includes("celular")) mapa.celular = k;
    if (key.includes("mail")) mapa.email = k;
    if (key.includes("empresa")) mapa.empresa = k;
    if (key.includes("cnpj")) mapa.cnpj = k;
  });

  return mapa;
}

// ===== FUNÇÃO PRINCIPAL =====
async function gerarPDF() {
  if (!dados.length) {
    console.log("❌ Planilha vazia");
    return;
  }

  const pdfBaseBytes = fs.readFileSync(ARQUIVO_PDF);
  const pdfDoc = await PDFDocument.create();
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // normaliza primeira linha pra mapear colunas
  const primeiraLinha = normalizarObjeto(dados[0]);
  const mapa = mapearColunas(primeiraLinha);

  console.log("📌 Mapeamento detectado:", mapa);

  for (let i = 0; i < dados.length; i += LINHAS_POR_PAGINA) {
    const bloco = dados.slice(i, i + LINHAS_POR_PAGINA);

    const pdfBase = await PDFDocument.load(pdfBaseBytes);
    const [paginaBase] = await pdfDoc.copyPages(pdfBase, [0]);
    const page = pdfDoc.addPage(paginaBase);

    let y = 420;

    bloco.forEach((rowBruto, index) => {
      const row = normalizarObjeto(rowBruto);

      // DEBUG
      console.log(`🧾 Linha ${i + index + 1}:`, row[mapa.nome]);

      page.drawText(textoSeguro(row[mapa.nome]) || "", { x: 50, y: y, size: 10, font: fonte });
      page.drawText(textoSeguro(row[mapa.cpf]) || "", { x: 300, y: y, size: 10, font: fonte });

      page.drawText(textoSeguro(row[mapa.nascimento]) || "", { x: 50, y: y - 15, size: 10, font: fonte });
      page.drawText(textoSeguro(row[mapa.cidade]) || "", { x: 200, y: y - 15, size: 10, font: fonte });

      page.drawText(textoSeguro(row[mapa.celular]) || "", { x: 50, y: y - 30, size: 10, font: fonte });
      page.drawText(textoSeguro(row[mapa.email]) || "", { x: 200, y: y - 30, size: 10, font: fonte });

      page.drawText(textoSeguro(row[mapa.empresa]) || "", { x: 50, y: y - 45, size: 10, font: fonte });
      page.drawText(textoSeguro(row[mapa.cnpj]) || "", { x: 300, y: y - 45, size: 10, font: fonte });

      y -= 120;
    });
  }

  const pdfFinal = await pdfDoc.save();
  fs.writeFileSync(SAIDA, pdfFinal);

  console.log("✅ PDF gerado com sucesso:", SAIDA);
}

// ===== EXECUTAR =====
gerarPDF();