import XLSX from "xlsx";

export default function handlePunchData(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets["考勤汇总表"];

  let lineNumber = 5;
  const result = [];
  while (
    sheet[`B${lineNumber}`] &&
    sheet[`J${lineNumber}`] &&
    sheet[`K${lineNumber}`]
  ) {
    result.push({
      name: sheet[`B${lineNumber}`].v as string,
      time: +sheet[`J${lineNumber}`].v + +sheet[`K${lineNumber}`].v
    });
    lineNumber++;
  }

  return result;
}
