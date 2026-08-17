import {
  BarChart3,
  BookOpen,
  FileSearch,
  FlaskConical,
  GitBranch,
  Map,
  Network,
  type LucideIcon,
} from "lucide-react";

export type PageSlug = "strategic" | "baseline" | "technology" | "station" | "yunnan" | "cultivation" | "evidence";

export interface NavigationItem {
  slug: PageSlug;
  label: string;
  icon: LucideIcon;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: "研究",
    items: [
      { slug: "strategic", label: "战略总览", icon: BarChart3 },
      { slug: "baseline", label: "读书铺基准", icon: BookOpen },
      { slug: "technology", label: "技术与场景", icon: FlaskConical },
    ],
  },
  {
    label: "模型",
    items: [
      { slug: "station", label: "单站决策", icon: Network },
      { slug: "yunnan", label: "云南产业推演", icon: Map },
    ],
  },
  {
    label: "路径与审计",
    items: [
      { slug: "cultivation", label: "示范培育", icon: GitBranch },
      { slug: "evidence", label: "证据审计", icon: FileSearch },
    ],
  },
];

export const pageHeaders: Record<PageSlug, { eyebrow: string; title: string; lead: string }> = {
  strategic: {
    eyebrow: "未来产业战略研判",
    title: "晶硅工程基准校准下的钙钛矿光伏未来情景研究",
    lead: "以读书铺单站为基准，联动技术门槛、交通场景与云南产业路径。",
  },
  baseline: {
    eyebrow: "真实工程约束层",
    title: "读书铺服务区晶硅光储充基准",
    lead: "设备台账、月度能源统计与场景容量共同锁定单站比较边界。",
  },
  technology: {
    eyebrow: "未来产业方向与场景适配",
    title: "技术代际、交通空间与政策条件",
    lead: "技术轴定义性能与准入，发展情景只改变市场、政策和开发条件。",
  },
  station: {
    eyebrow: "项目级决策底座",
    title: "读书铺单站技术经济桥接",
    lead: "统一比较发电、储能、经济与生命周期结果，并向地区模型传递审核指标。",
  },
  yunnan: {
    eyebrow: "云南省交通资产约束",
    title: "受约束存量—流量产业推演",
    lead: "在交通资产、技术门和供货约束下，比较2025—2060年三种发展路径。",
  },
  cultivation: {
    eyebrow: "可执行阶段门",
    title: "示范准入与产业培育路径",
    lead: "以阶段门明确目标、责任、交付与退出条件。",
  },
  evidence: {
    eyebrow: "发布与追溯",
    title: "证据审计与结果导出",
    lead: "核查来源、状态、质量与发布边界，导出可追溯结果。",
  },
};

export const validPageSlugs = new Set<PageSlug>(navigationGroups.flatMap((group) => group.items.map((item) => item.slug)));
