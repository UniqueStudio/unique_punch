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
let downloadData: null | Blob = null;

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
      allMap[weixinData.name].group = weixinData.group.filter(
        g => g !== "UniqueStudio"
      );
    }
  });

  const [r1, r2] = Object.entries(allMap).reduce(
    (p, [k, v]) => {
      if (
        !v.group ||
        v.group.findIndex((g: string) => /团队老人/.test(g)) >= 0
      ) {
        return p;
      } else {
        if (v.time < 30) {
          p[0].push({ ...v, name: k });
        } else {
          p[1].push({ ...v, name: k });
        }

        return p;
      }
    },
    [[] as any[], [] as any[]]
  );

  const redCount = r1.length;
  const greenCount = r2.length;

  r1.sort(($1, $2) => $1.time - $2.time);
  r2.sort(($1, $2) => $2.time - $1.time);

  const lineHeight = 60;
  const headHeight = 140;

  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = Math.max(greenCount, redCount) * lineHeight + headHeight + 80;

  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#272822";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillStyle = "#fff";
  ctx.font = "100px Consolas";
  ctx.fillText("打卡公开处刑", 20, 20);

  ctx.font = "50px Consolas";
  r1.forEach((p, i) => {
    const name = p.name.padEnd(10, "　");
    const group = (p.group.length > 0
      ? p.group.map((g: string) => g.replace(/UniqueStudio\//g, "")).join(",")
      : "???"
    ).padEnd(10, " ");
    const time = p.time
      .toFixed(1)
      .toString(10)
      .replace(/\.0$/, "")
      .padStart(10, " ");

    ctx.fillStyle = "#f92656";

    ctx.fillText(`${name}${group}${time}`, 20, i * lineHeight + headHeight);
  });

  r2.forEach((p, i) => {
    const name = p.name.padEnd(10, "　");
    const group = (p.group.length > 0
      ? p.group.map((g: string) => g.replace(/UniqueStudio\//g, "")).join(",")
      : "???"
    ).padEnd(10, " ");
    const time = p.time
      .toFixed(1)
      .toString(10)
      .replace(/\.0$/, "")
      .padStart(10, " ");

    ctx.fillStyle = "#a6dc26";

    ctx.fillText(
      `${name}${group}${time}`,
      1200 + 20,
      i * lineHeight + headHeight
    );
  });

  canvas.toBlob(b => {
    downloadData = b;
    document.getElementById("download")!.removeAttribute("disabled");
  });
}

document.getElementById("download")!.addEventListener("click", () => {
  if (downloadData) {
    saveData(downloadData, "公开处刑.png");
  }
});

const saveData = (function() {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.setAttribute("style", "display: none");
  return function(data: Blob, fileName: string) {
    const url = window.URL.createObjectURL(data);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();
