# 挑战杯｜CP-202601未来能源产业研究决策平台

面向交通能源融合的轻质钙钛矿光伏未来产业潜力评估与示范培育决策平台。系统以读书铺服务区晶硅光储充工程为比较基准，连接技术代际、交通场景、单站经济性、云南地区产业推演和证据审计。

> 在线体验：Vercel生产网址将在首次部署完成后写入仓库Homepage。

## 七个决策页面

1. 战略总览
2. 读书铺基准
3. 技术与场景
4. 单站决策
5. 云南产业推演
6. 示范培育
7. 证据审计

平台支持Light/Dark主题、战略/研究视图，以及技术代际、目标年份、交通场景、发展情景和结果区间筛选。

## 技术架构

- Next.js 16、React 19、TypeScript strict
- ECharts、Framer Motion、Radix UI、Liquid Glass视觉系统
- 同源Next.js API返回脱敏后的页面投影
- Vercel Private Blob保存完整研究快照，GitHub不包含私有研究数据

## 本地运行

准备一份经过审核的V4快照及其SHA-256，然后设置：

```powershell
$env:PLATFORM_SNAPSHOT_PATH="D:\private\v4-snapshot.json"
$env:PLATFORM_SNAPSHOT_SHA256="<sha256>"
npm ci
npm run dev -- --port 3001
```

访问`http://127.0.0.1:3001/strategic`。

## 质量检查

```powershell
npm run audit:public
npm run typecheck
npm run lint
npm run build
```

部署后可执行：

```powershell
$env:PLAYWRIGHT_BASE_URL="https://<production-domain>"
npm run test:e2e
```

## 数据与科学边界

- 读书铺设备和月度能源汇总用于晶硅工程基准。
- PSC结果属于科学情景推演，不属于读书铺PSC现场实测。
- 2060年结果用于条件化情景比较，不是确定性市场预测。
- 前端不修改参数、不重新计算模型，也不生成私有快照中不存在的组合。

## 许可证

源代码采用MIT许可证。Logo、航拍图、项目专用素材和OSM数据适用不同权利边界，详见[NOTICE.md](NOTICE.md)。
