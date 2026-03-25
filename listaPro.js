const fs = require("fs");
const XLSX = require("xlsx");
const { PDFDocument } = require("pdf-lib");

// ler excel
const workbook = XLSX.readFile("planilha.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const dados = XLSX.utils.sheet_to_json(sheet);

function getCampo(row, nomeParcial) {
    const chave = Object.keys(row).find(k =>
        k.toLowerCase().includes(nomeParcial.toLowerCase())
    );
    return chave ? String(row[chave]) : "";
}

async function gerar() {
    const pdfBytes = fs.readFileSync("modelo_formulario.pdf");

    for (let i = 0; i < dados.length; i++) {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();

        const row = dados[i];

        form.getTextField("nome").setText(getCampo(row, "nome completo"));
        form.getTextField("cpf").setText(getCampo(row, "cpf"));
        form.getTextField("email").setText(getCampo(row, "mail"));
        form.getTextField("telefone").setText(getCampo(row, "celular"));
        form.getTextField("empresa").setText(getCampo(row, "empresa"));
        form.getTextField("cnpj").setText(getCampo(row, "cnpj"));

        const pdfFinal = await pdfDoc.save();
        fs.writeFileSync(`saida_${i + 1}.pdf`, pdfFinal);
    }

    console.log("✅ PDFs gerados!");
}

gerar();