# 联创团队公开处刑生成器

## 这是什么？

联创团队始终坚持队员每周 40h 制度。为了贯彻落实这个制度，这个工具作为基础设施应运而生。

由于团队打卡设备和一些历史遗留问题，该工具暂时的工作模式为：

1. 从“考勤报表.xls”读取考勤数据
2. 从企业微信 API 读取成员信息
3. 将以上两个表 join 获得打卡数据
4. 将打卡数据生成图片

## 如何使用？

为了适应变化以及拥抱 Docker，此工具完美支持 Docker，而且推荐使用 Docker 运行、部署：

首先构建 docker 镜像：

```
cd unique_punch
docker build -t unique_punch:latest .
```

将“考勤报表.xls”文件拷贝到任意目录，然后在这个目录运行：

```bash
docker run --rm \
  -v $(pwd):/data/unique_punch \
  -e CORPID="联创团队企业微信中能够获取通讯录列表的应用的应用ID" \
  -e CORPSECRET="相应的SECRET" \
  unique_punch
```

之后，你会发现一个名为“公开处刑.png”的图片出现在当前目录。

## 我不想使用 Docker 运行

如果你不想使用 docker 运行，请切换到 cli 分支，运行：

```
yarn
yarn start /Volumes/FARAWAY/考勤报表.xls
```

其中，/Volumes/FARAWAY/考勤报表.xls 为“考勤报表.xls” 的文件路径。

（你可能需要自行处理因为操作系统没有相应字体而引起的问题）
