import XLSX from "xlsx";

export default function handleWeixinData(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets["成员列表"];

  let lineNumber = 8;
  const result = [];
  while (sheet[`A${lineNumber}`] && sheet[`E${lineNumber}`]) {
    result.push({
      name: sheet[`A${lineNumber}`].v as string,
      group: sheet[`E${lineNumber}`].v.split(";") as string[]
    });
    lineNumber++;
  }

  return result;
}

// √
