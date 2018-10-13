import XLSX from "xlsx";
import { resolve } from "path";
import axios from "axios";
import { readFileSync, existsSync, statSync, writeFileSync } from "fs";

import handlePunchData from "./utils/processPunchData";

type PunchData = Array<{
  name: string;
  time: number;
}>;

type WeixinData = Array<{
  name: string;
  group: string[];
}>;

// let punchData: null | PunchData = null;
// let weixinData: null | WeixinData = null;
// let downloadData: null | Blob = null;

// const punchDataEle = document.getElementById("punch-data")!;
// punchDataEle.addEventListener("dragover", function(event) {
//   event.preventDefault();
// });

// punchDataEle.addEventListener(
//   "drop",
//   e => {
//     e.stopPropagation();
//     e.preventDefault();
//     if (punchData) {
//       return;
//     }
//     const files = e.dataTransfer.files;
//     const f = files[0];
//     const reader = new FileReader();

//     reader.readAsBinaryString(f);
//     reader.addEventListener("load", function(e) {
//       const data = (e as any).target.result;
//       const workbook = XLSX.read(data, { type: "binary" });

//       punchData = handlePunchData(workbook);
//       punchDataEle.setAttribute("style", "background-color: #73c991");

//       const statusNode = punchDataEle.querySelector("div")!;
//       statusNode.innerHTML = "✓";
//       if (weixinData) {
//         gen(punchData, weixinData);
//       }
//     });
//   },
//   false
// );

// const weixinDataEle = document.getElementById("weixin-data")!;
// weixinDataEle.addEventListener("dragover", function(event) {
//   event.preventDefault();
// });

// weixinDataEle.addEventListener(
//   "drop",
//   e => {
//     e.stopPropagation();
//     e.preventDefault();
//     if (weixinData) {
//       return;
//     }
//     const files = e.dataTransfer.files;
//     const f = files[0];
//     const reader = new FileReader();

//     reader.readAsBinaryString(f);
//     reader.addEventListener("load", function(e) {
//       const data = (e as any).target.result;
//       const workbook = XLSX.read(data, { type: "binary" });

//       weixinData = handleWeixinData(workbook);
//       weixinDataEle.setAttribute("style", "background-color: #73c991");

//       const statusNode = weixinDataEle.querySelector("div")!;
//       statusNode.innerHTML = "✓";
//       if (punchData) {
//         gen(punchData, weixinData);
//       }
//     });
//   },
//   false
// );

function gen(
  punchDatas: PunchData,
  weixinDatas: WeixinData,
  dateRange: string
) {
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
        g => g !== "联创团队"
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

  var Canvas = require("canvas"),
    canvas = new Canvas(200, 200),
    ctx = canvas.getContext("2d");
  // Canvas.registerFont(
  //   resolve(__dirname, "./assets/font.ttc"),
  //   "WenQuanYiZenHeiMono"
  // );

  canvas.width = 2400;
  canvas.height = Math.max(greenCount, redCount) * lineHeight + headHeight + 80;

  ctx.fillStyle = "#272822";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillStyle = "#fff";
  ctx.font = '100px "WenQuanYi Zen Hei Mono"';
  ctx.fillText(`打卡公开处刑 ${dateRange}`, 20, 20);

  ctx.font = '50px "WenQuanYi Zen Hei Mono"';
  r1.forEach((p, i) => {
    const name = p.name.padEnd(10, "　");
    const group = (p.group.length > 0
      ? p.group.map((g: string) => g.replace(/联创团队\//g, "")).join(",")
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
      ? p.group.map((g: string) => g.replace(/联创团队\//g, "")).join(",")
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

  const buf = canvas.toBuffer();
  writeFileSync(resolve(process.cwd(), "./公开处刑.png"), buf);
}

// document.getElementById("download")!.addEventListener("click", () => {
//   if (downloadData) {
//     saveData(downloadData, "公开处刑.png");
//   }
// });

// const saveData = (function() {
//   var a = document.createElement("a");
//   document.body.appendChild(a);
//   a.setAttribute("style", "display: none");
//   return function(data: Blob, fileName: string) {
//     const url = window.URL.createObjectURL(data);
//     a.href = url;
//     a.download = fileName;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };
// })();
(async function() {
  const corpid = "ww6879e683e04c1e57";
  const corpsecret = "Ux8WkjToajxemahheZkNfxw5jPIXsilEjtACHBNCxjE";
  const [, , p] = process.argv;
  const path = resolve(process.cwd(), p);
  if (!existsSync(path) || !statSync(path).isFile) {
    console.log("❌  File not exists!");
    process.exit(0);
  }
  const data = readFileSync(path, { encoding: "binary" });
  const dateRange = XLSX.read(data, { type: "binary" }).Props!.Comments;
  const punchData = handlePunchData(XLSX.read(data, { type: "binary" }));
  const accessToken = await axios
    .get(
      `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`
    )
    .then(
      ({ status, data }) =>
        new Promise((resolve, reject) => {
          if (status === 200) {
            const { access_token: accessToken } = data;
            return resolve(accessToken);
          } else {
            return reject(new Error("Fail to Get Access Token!"));
          }
        })
    );

  const department = await axios
    .get(
      `https://qyapi.weixin.qq.com/cgi-bin/department/list?access_token=${accessToken}`
    )
    .then<any[]>(
      ({ status, data }) =>
        new Promise((resolve, reject) => {
          if (status === 200) {
            const { department } = data;
            return resolve(
              department.reduce((p: any, d: any) => {
                return {
                  ...p,
                  [d.id]: d
                };
              }, {})
            );
          } else {
            return reject(new Error("Fail to Get Departments!"));
          }
        })
    );

  const rootId = department[1].id;

  const rawUser = await axios
    .get(
      `https://qyapi.weixin.qq.com/cgi-bin/user/list?access_token=${accessToken}&department_id=${rootId}&fetch_child=1`
    )
    .then<any[]>(
      ({ status, data }) =>
        new Promise((resolve, reject) => {
          if (status === 200) {
            const { userlist } = data;
            return resolve(userlist);
          } else {
            return reject(new Error("Fail to Get Users!"));
          }
        })
    );

  const weixinData = rawUser.map(
    ({ name, department: d }: { name: string; department: number[] }) => ({
      name,
      group: d.map(n => getDepartmentName(n))
    })
  );

  gen(punchData, weixinData, dateRange!);

  function getDepartmentName(id: number) {
    const departments = [];
    do {
      departments.unshift(department[id].name);
      id = department[id].parentid;
    } while (id);

    return departments.join("/");
  }
})();
