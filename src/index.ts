import XLSX from "xlsx";
import handlePunchData from "./utils/processPunchData";
import handleWeixinData from "./utils/processWeixin";

type PunchData = Array<{
  name: string;
  time: number;
}>;

type WeixinData = Array<{
  name: string;
  group: string[];
}>;

let punchData: null | PunchData = null;
let weixinData: null | WeixinData = null;

const punchDataEle = document.getElementById("punch-data")!;
punchDataEle.addEventListener("dragover", function(event) {
  event.preventDefault();
});

punchDataEle.addEventListener(
  "drop",
  e => {
    e.stopPropagation();
    e.preventDefault();
    if (punchData) {
      return;
    }
    const files = e.dataTransfer.files;
    const f = files[0];
    const reader = new FileReader();

    reader.readAsBinaryString(f);
    reader.addEventListener("load", function(e) {
      const data = (e as any).target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      punchData = handlePunchData(workbook);
      punchDataEle.setAttribute("style", "background-color: #73c991");

      const statusNode = punchDataEle.querySelector("div")!;
      statusNode.innerHTML = "✓";
      if (weixinData) {
        gen(punchData, weixinData);
      }
    });
  },
  false
);

const weixinDataEle = document.getElementById("weixin-data")!;
weixinDataEle.addEventListener("dragover", function(event) {
  event.preventDefault();
});

weixinDataEle.addEventListener(
  "drop",
  e => {
    e.stopPropagation();
    e.preventDefault();
    if (weixinData) {
      return;
    }
    const files = e.dataTransfer.files;
    const f = files[0];
    const reader = new FileReader();

    reader.readAsBinaryString(f);
    reader.addEventListener("load", function(e) {
      const data = (e as any).target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      weixinData = handleWeixinData(workbook);
      weixinDataEle.setAttribute("style", "background-color: #73c991");

      const statusNode = weixinDataEle.querySelector("div")!;
      statusNode.innerHTML = "✓";
      if (punchData) {
        gen(punchData, weixinData);
      }
    });
  },
  false
);

function gen(punchDatas: PunchData, weixinDatas: WeixinData) {
  document.getElementById("download")!.removeAttribute("disabled");
  const allMap: { [k: string]: any } = punchDatas.reduce((p, punchData) => {
    return {
      ...p,
      [punchData.name]: {
        time: punchData.time
      }
    };
  }, {});

  weixinDatas.forEach(weixinData => {
    if (allMap[weixinData.name]) {
      allMap[weixinData.name].group = weixinData.group;
    }
  });

  Object.keys(allMap).forEach(k => {
    if (!allMap[k].group) {
      delete allMap[k];
    }
  });

  console.log(allMap);
  return allMap;
}
