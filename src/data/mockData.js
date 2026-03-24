export const reviewStatusOptions = ["待审核", "已通过", "需修改"];

export const productOptions = [
  "TopTou",
  "SmartFlow",
  "LinkSphere",
  "DataPilot",
  "BrandCloud",
];
export const materialTypeOptions = ["图片", "静图", "动图"];

export const creators = [
  "Liam",
  "Emma",
  "Olivia",
  "Noah",
  "Ava",
  "Mason",
  "Sophia",
  "Ethan",
];

export const folderTree = [
  {
    id: "root-marketing",
    name: "市场部素材库",
    children: [
      {
        id: "brand-assets",
        name: "品牌主视觉",
        children: [
          { id: "spring-campaign", name: "春季营销活动", children: [] },
          { id: "summer-launch", name: "夏季新品发布", children: [] },
        ],
      },
      {
        id: "social-media",
        name: "社媒投放",
        children: [
          { id: "douyin", name: "抖音短视频", children: [] },
          { id: "xiaohongshu", name: "小红书图文", children: [] },
        ],
      },
    ],
  },
  {
    id: "root-product",
    name: "产品部素材库",
    children: [
      { id: "ui-spec", name: "UI 规范", children: [] },
      { id: "demo-video", name: "演示视频", children: [] },
      { id: "release-note", name: "版本说明", children: [] },
    ],
  },
  {
    id: "root-sales",
    name: "销售部素材库",
    children: [
      { id: "sales-deck", name: "销售演示文档", children: [] },
      { id: "case-study", name: "客户案例", children: [] },
    ],
  },
];

const rawAssets = [
  ["A001", "TopTou 品牌海报 A", "brand-assets", "TopTou", "已通过", "Emma", "2026-03-02", 14.5, ["品牌", "海报"]],
  ["A002", "TopTou 品牌海报 B", "brand-assets", "TopTou", "待审核", "Liam", "2026-03-03", 13.2, ["品牌", "KV"]],
  ["A003", "春季主视觉 Banner 01", "spring-campaign", "BrandCloud", "已通过", "Sophia", "2026-03-04", 8.1, ["春季", "banner"]],
  ["A004", "春季主视觉 Banner 02", "spring-campaign", "BrandCloud", "需修改", "Noah", "2026-03-05", 9.6, ["春季", "投放"]],
  ["A005", "春季活动落地页头图", "spring-campaign", "SmartFlow", "待审核", "Ava", "2026-03-08", 6.8, ["落地页", "活动"]],
  ["A006", "夏季新品 KV 主图", "summer-launch", "LinkSphere", "已通过", "Ethan", "2026-03-10", 11.4, ["新品", "KV"]],
  ["A007", "夏季新品短视频封面", "summer-launch", "LinkSphere", "待审核", "Emma", "2026-03-11", 4.9, ["视频", "封面"]],
  ["A008", "抖音短视频脚本 v1", "douyin", "TopTou", "需修改", "Mason", "2026-03-06", 1.2, ["抖音", "脚本"]],
  ["A009", "抖音短视频脚本 v2", "douyin", "TopTou", "已通过", "Mason", "2026-03-09", 1.6, ["抖音", "优化"]],
  ["A010", "抖音视频素材包-人物", "douyin", "DataPilot", "待审核", "Olivia", "2026-03-13", 63.0, ["抖音", "人物"]],
  ["A011", "小红书图文排版模板 A", "xiaohongshu", "SmartFlow", "已通过", "Sophia", "2026-03-03", 3.8, ["模板", "图文"]],
  ["A012", "小红书种草文案合集", "xiaohongshu", "SmartFlow", "待审核", "Noah", "2026-03-07", 0.9, ["文案", "种草"]],
  ["A013", "设计系统色板", "ui-spec", "LinkSphere", "已通过", "Emma", "2026-03-01", 2.1, ["UI", "设计系统"]],
  ["A014", "组件规范文档", "ui-spec", "LinkSphere", "已通过", "Liam", "2026-03-05", 1.9, ["组件", "规范"]],
  ["A015", "图标资产包", "ui-spec", "BrandCloud", "待审核", "Ava", "2026-03-12", 10.7, ["icon", "资产"]],
  ["A016", "产品功能 Demo 01", "demo-video", "TopTou", "已通过", "Ethan", "2026-03-14", 120.4, ["演示", "产品"]],
  ["A017", "产品功能 Demo 02", "demo-video", "TopTou", "待审核", "Ethan", "2026-03-16", 98.3, ["演示", "讲解"]],
  ["A018", "版本更新亮点图", "release-note", "DataPilot", "已通过", "Olivia", "2026-03-15", 7.3, ["版本", "更新"]],
  ["A019", "版本发布说明 PDF", "release-note", "DataPilot", "待审核", "Noah", "2026-03-18", 2.8, ["发布", "说明"]],
  ["A020", "销售演示 PPT-金融", "sales-deck", "SmartFlow", "已通过", "Liam", "2026-03-02", 24.1, ["销售", "PPT"]],
  ["A021", "销售演示 PPT-制造业", "sales-deck", "SmartFlow", "待审核", "Emma", "2026-03-08", 27.5, ["销售", "行业"]],
  ["A022", "客户案例-零售行业", "case-study", "BrandCloud", "已通过", "Sophia", "2026-03-11", 12.8, ["案例", "零售"]],
  ["A023", "客户案例-医疗行业", "case-study", "BrandCloud", "待审核", "Ava", "2026-03-17", 14.2, ["案例", "医疗"]],
  ["A024", "客户案例-教育行业", "case-study", "BrandCloud", "需修改", "Mason", "2026-03-19", 13.6, ["案例", "教育"]],
  ["A025", "品牌规范手册", "brand-assets", "TopTou", "已通过", "Olivia", "2026-03-20", 16.4, ["规范", "品牌"]],
  ["A026", "春季营销海报套装", "spring-campaign", "BrandCloud", "已通过", "Emma", "2026-03-21", 18.7, ["春季", "海报"]],
  ["A027", "社媒封面样机合集", "social-media", "LinkSphere", "待审核", "Noah", "2026-03-22", 22.0, ["社媒", "样机"]],
  ["A028", "短视频字幕模板", "douyin", "DataPilot", "已通过", "Sophia", "2026-03-22", 2.2, ["字幕", "模板"]],
  ["A029", "产品卖点一页图", "release-note", "TopTou", "待审核", "Liam", "2026-03-23", 5.1, ["卖点", "一页图"]],
  ["A030", "案例封面图合集", "case-study", "BrandCloud", "已通过", "Emma", "2026-03-24", 9.9, ["封面", "案例"]],
];

export const assets = rawAssets.map(
  ([id, title, folderId, productName, reviewStatus, creator, createdAt, sizeMB, tags], index) => {
    const kind = index % 4 === 0 ? "video" : index % 3 === 0 ? "document" : "image";
    const materialType =
      kind === "video" ? "动图" : index % 2 === 0 ? "静图" : "图片";
    return {
      id,
      title,
      folderId,
      productName,
      reviewStatus,
      creator,
      createdAt,
      sizeMB,
      tags: [...tags, materialType],
      kind,
      materialType,
    };
  },
);

export const quickViews = {
  departmentFavorites: ["A001", "A006", "A016", "A020", "A022", "A030"],
  personalFavorites: ["A003", "A014", "A018", "A024", "A029"],
};
