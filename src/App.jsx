import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  ChevronDown,
  ChevronRight,
  CopyCheck,
  Eye,
  File,
  FileText,
  Folder,
  FolderCog,
  FolderPlus,
  Grid2x2,
  Image,
  Search,
  SlidersHorizontal,
  Star,
  LoaderCircle,
  Upload,
  Video,
  X,
} from "lucide-react";
import {
  assets as initialAssets,
  creators,
  folderTree,
  materialTypeOptions,
  productOptions,
  quickViews,
  reviewStatusOptions,
} from "./data/mockData";

const brandGreen = "#2563EB";
const mediaPlatforms = [
  { key: "Meta", logo: "M" },
  { key: "TikTok", logo: "T" },
  { key: "Google", logo: "G" },
  { key: "Huawei", logo: "H" },
  { key: "Kwai", logo: "K" },
  { key: "Snapchat", logo: "S" },
];

const mediaAccountMap = {
  Meta: {
    account: ["Meta_Acct_1001", "Meta_Acct_1002", "Meta_Acct_China"],
    bm: ["Meta_BM_East", "Meta_BM_Global"],
  },
  TikTok: {
    account: ["TikTok_Store_01", "TikTok_Store_02"],
    bm: ["TikTok_BM_Core"],
  },
  Google: {
    account: ["Google_Ads_CN", "Google_Ads_APAC"],
    bm: [],
  },
  Huawei: {
    account: ["Huawei_AppGallery_01"],
    bm: [],
  },
  Kwai: {
    account: ["Kwai_Account_01", "Kwai_Account_02"],
    bm: ["Kwai_BM_Main"],
  },
  Snapchat: {
    account: [],
    bm: [],
  },
};

function badgeColor(status) {
  if (status === "已通过") return "bg-blue-100 text-blue-700";
  if (status === "需修改") return "bg-indigo-100 text-indigo-700";
  return "bg-sky-100 text-sky-700";
}

function kindIcon(kind) {
  if (kind === "video") return <Video size={18} className="text-indigo-500" />;
  if (kind === "document") return <FileText size={18} className="text-sky-500" />;
  return <Image size={18} className="text-blue-500" />;
}

function flattenTree(nodes, parentId = null, depth = 0, list = []) {
  nodes.forEach((node) => {
    list.push({ ...node, parentId, depth });
    if (node.children?.length) flattenTree(node.children, node.id, depth + 1, list);
  });
  return list;
}

function findPathById(nodes, id, currentPath = []) {
  for (const node of nodes) {
    const path = [...currentPath, node];
    if (node.id === id) return path;
    if (node.children?.length) {
      const found = findPathById(node.children, id, path);
      if (found) return found;
    }
  }
  return [];
}

function App() {
  const [allAssets, setAllAssets] = useState(initialAssets);
  const [allFolders, setAllFolders] = useState(folderTree);
  const [selectedFolderId, setSelectedFolderId] = useState("brand-assets");
  const [expandedFolderIds, setExpandedFolderIds] = useState(
    new Set(["root-marketing", "brand-assets", "social-media", "root-product", "root-sales"]),
  );
  const [activeQuickView, setActiveQuickView] = useState("");
  const [folderKeyword, setFolderKeyword] = useState("");
  const [searchMode, setSearchMode] = useState("conditional");
  const [conditionProduct, setConditionProduct] = useState("");
  const [conditionMaterialType, setConditionMaterialType] = useState("");
  const [conditionDate, setConditionDate] = useState("");
  const [fuzzyQuery, setFuzzyQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [batchMenuOpen, setBatchMenuOpen] = useState(false);
  const [operationNotice, setOperationNotice] = useState("");
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaPlatform, setMediaPlatform] = useState("Meta");
  const [syncType, setSyncType] = useState("account");
  const [accountOptions, setAccountOptions] = useState([]);
  const [accountLoading, setAccountLoading] = useState(false);
  const [selectedAdAccount, setSelectedAdAccount] = useState("");
  const [accountError, setAccountError] = useState("");
  const [scheduleUpload, setScheduleUpload] = useState(false);
  const [scheduleDatetime, setScheduleDatetime] = useState("");
  const [mediaSubmitting, setMediaSubmitting] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadProduct, setUploadProduct] = useState("");
  const [uploadStatus, setUploadStatus] = useState("待审核");
  const [newFolderName, setNewFolderName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const folderUploadRef = useRef(null);
  const fileUploadRef = useRef(null);

  const flatFolders = useMemo(() => flattenTree(allFolders), [allFolders]);

  useEffect(() => {
    if (folderUploadRef.current) {
      folderUploadRef.current.setAttribute("webkitdirectory", "");
      folderUploadRef.current.setAttribute("directory", "");
    }
  }, []);

  const currentPath = useMemo(() => findPathById(allFolders, selectedFolderId), [allFolders, selectedFolderId]);
  const childFolders = useMemo(
    () => flatFolders.filter((folder) => folder.parentId === selectedFolderId),
    [flatFolders, selectedFolderId],
  );
  const currentAssets = useMemo(
    () => allAssets.filter((item) => item.folderId === selectedFolderId),
    [allAssets, selectedFolderId],
  );
  const selectionEnabled = childFolders.length === 0;
  const totalQuotaMB = 10240;

  function getMinDatetime() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  const filteredAssets = useMemo(() => {
    let list = [...currentAssets];
    if (activeQuickView) {
      const favoriteIds = quickViews[activeQuickView];
      list = list.filter((item) => favoriteIds.includes(item.id));
    }
    if (searchMode === "conditional") {
      if (conditionProduct) list = list.filter((item) => item.productName === conditionProduct);
      if (conditionMaterialType) {
        list = list.filter((item) => item.materialType === conditionMaterialType);
      }
      if (conditionDate) list = list.filter((item) => item.createdAt === conditionDate);
    } else if (fuzzyQuery) {
      const keyword = fuzzyQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          item.tags.join(" ").toLowerCase().includes(keyword),
      );
    }
    list.sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title, "zh-CN");
      if (sortBy === "size") return b.sizeMB - a.sizeMB;
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [
    activeQuickView,
    conditionDate,
    conditionMaterialType,
    conditionProduct,
    currentAssets,
    fuzzyQuery,
    searchMode,
    sortBy,
  ]);

  const mergedItems = useMemo(() => {
    const folders = childFolders.map((folder) => ({
      id: folder.id,
      type: "folder",
      name: folder.name,
      createdAt: "",
      owner: "-",
    }));
    const files = filteredAssets.map((asset) => ({
      id: asset.id,
      type: "asset",
      ...asset,
    }));
    return [...folders, ...files];
  }, [childFolders, filteredAssets]);

  const visibleFoldersInSidebar = useMemo(() => {
    if (!folderKeyword) return flatFolders;
    return flatFolders.filter((folder) =>
      folder.name.toLowerCase().includes(folderKeyword.toLowerCase()),
    );
  }, [flatFolders, folderKeyword]);

  const visibleFolderIdSet = useMemo(
    () => new Set(visibleFoldersInSidebar.map((folder) => folder.id)),
    [visibleFoldersInSidebar],
  );
  const currentPageAssetIds = useMemo(
    () => filteredAssets.map((asset) => asset.id),
    [filteredAssets],
  );
  const allPageAssetsSelected =
    selectionEnabled &&
    currentPageAssetIds.length > 0 &&
    currentPageAssetIds.every((id) => selectedAssetIds.includes(id));
  const selectedAssets = useMemo(
    () => filteredAssets.filter((asset) => selectedAssetIds.includes(asset.id)),
    [filteredAssets, selectedAssetIds],
  );
  const selectedAssetIdsOnPage = useMemo(
    () => selectedAssets.map((asset) => asset.id),
    [selectedAssets],
  );
  const selectedCount = selectedAssetIdsOnPage.length;
  const selectedTotalSizeMB = selectedAssets.reduce((sum, asset) => sum + asset.sizeMB, 0);

  useEffect(() => {
    if (!operationNotice) return;
    const timer = setTimeout(() => setOperationNotice(""), 2200);
    return () => clearTimeout(timer);
  }, [operationNotice]);

  function toggleFolderExpand(folderId) {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }

  function toggleSelect(id) {
    if (!selectionEnabled) return;
    setSelectedAssetIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (!selectionEnabled || currentPageAssetIds.length === 0) return;
    if (allPageAssetsSelected) {
      setSelectedAssetIds([]);
      return;
    }
    setSelectedAssetIds(currentPageAssetIds);
  }

  function clearSelection() {
    setSelectedAssetIds((prev) => prev.filter((id) => !currentPageAssetIds.includes(id)));
    setBatchMenuOpen(false);
  }

  function handleBatchAction(action) {
    setBatchMenuOpen(false);
    if (selectedCount === 0) return;
    if (action === "delete") {
      setAllAssets((prev) => prev.filter((asset) => !selectedAssetIdsOnPage.includes(asset.id)));
      setOperationNotice(`已删除 ${selectedCount} 项`);
      clearSelection();
      return;
    }
    if (action === "favorite") {
      setOperationNotice(`已收藏 ${selectedCount} 项`);
      return;
    }
    if (action === "move") {
      setOperationNotice(`已发起 ${selectedCount} 项移动（Demo模拟）`);
      return;
    }
    if (action === "download") {
      setOperationNotice(`已发起 ${selectedCount} 项下载（Demo模拟）`);
      return;
    }
    if (action === "product") {
      setOperationNotice(`已进入“修改产品归属”流程（Demo模拟）`);
    }
  }

  function loadAccountOptions(platform, nextSyncType) {
    setAccountLoading(true);
    setSelectedAdAccount("");
    setAccountError("");
    setTimeout(() => {
      const nextOptions = mediaAccountMap[platform][nextSyncType] || [];
      setAccountOptions(nextOptions);
      setAccountLoading(false);
    }, 650);
  }

  function handlePlatformChange(nextPlatform) {
    setMediaPlatform(nextPlatform);
    loadAccountOptions(nextPlatform, syncType);
  }

  function handleSyncTypeChange(nextType) {
    setSyncType(nextType);
    loadAccountOptions(mediaPlatform, nextType);
  }

  function openMediaUploadModal() {
    if (selectedCount === 0) {
      setOperationNotice("请选择需要同步的素材");
      return;
    }
    setMediaModalOpen(true);
    setMediaPlatform("Meta");
    setSyncType("account");
    setScheduleUpload(false);
    setScheduleDatetime("");
    setSelectedAdAccount("");
    setAccountError("");
    loadAccountOptions("Meta", "account");
  }

  function handleMediaConfirm() {
    if (!selectedAdAccount) {
      setAccountError("请选择选择广告账户");
      return;
    }
    setMediaSubmitting(true);
    setTimeout(() => {
      setMediaSubmitting(false);
      setMediaModalOpen(false);
      setOperationNotice(
        `已提交 ${selectedCount} 项素材到 ${mediaPlatform}（${syncType === "account" ? "账户" : "BM"}）`,
      );
    }, 1200);
  }

  function openUploadModal() {
    setUploadModalOpen(true);
    setUploadFiles([]);
    setUploadProduct("");
    setUploadStatus("待审核");
  }

  function addDroppedFiles(fileList) {
    const next = Array.from(fileList).map((file, idx) => ({
      id: `${file.name}-${Date.now()}-${idx}`,
      name: file.name,
      sizeMB: Number((file.size / 1024 / 1024).toFixed(1)),
      type: file.type,
    }));
    setUploadFiles((prev) => [...prev, ...next]);
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      children: [],
    };
    function appendFolder(nodes) {
      return nodes.map((node) => {
        if (node.id === selectedFolderId) {
          return { ...node, children: [...node.children, newFolder] };
        }
        if (node.children?.length) {
          return { ...node, children: appendFolder(node.children) };
        }
        return node;
      });
    }
    setAllFolders((prev) => appendFolder(prev));
    setExpandedFolderIds((prev) => new Set(prev).add(selectedFolderId));
    setNewFolderName("");
  }

  function handleConfirmUpload() {
    if (!uploadFiles.length || !uploadProduct) return;
    const creator = creators[Math.floor(Math.random() * creators.length)];
    const today = new Date().toISOString().split("T")[0];
    const newAssets = uploadFiles.map((file, idx) => {
      const kind = file.type?.startsWith("video")
        ? "video"
        : file.type?.includes("pdf") || file.type?.includes("text")
          ? "document"
          : "image";
      const materialType = file.type?.includes("gif")
        ? "动图"
        : file.type?.startsWith("video")
          ? "动图"
          : file.type?.startsWith("image")
            ? "静图"
            : "图片";
      return {
        id: `U${Date.now()}${idx}`,
        title: file.name,
        folderId: selectedFolderId,
        productName: uploadProduct,
        reviewStatus: uploadStatus,
        creator,
        createdAt: today,
        sizeMB: file.sizeMB || Number((Math.random() * 20 + 1).toFixed(1)),
        tags: [uploadProduct, "上传", materialType],
        kind,
        materialType,
      };
    });
    setAllAssets((prev) => [...newAssets, ...prev]);
    setUploadModalOpen(false);
  }

  function renderTree(nodes, depth = 0) {
    return nodes.map((node) => {
      if (!visibleFolderIdSet.has(node.id) && folderKeyword) return null;
      const isExpanded = expandedFolderIds.has(node.id);
      const hasChildren = node.children?.length > 0;
      const isSelected = selectedFolderId === node.id;
      return (
        <div key={node.id}>
          <button
            type="button"
            onClick={() => {
              setActiveQuickView("");
              setSelectedFolderId(node.id);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
              isSelected ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-100"
            }`}
            style={{ paddingLeft: `${depth * 14 + 8}px` }}
          >
            {hasChildren ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFolderExpand(node.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleFolderExpand(node.id);
                  }
                }}
                className="rounded p-0.5 hover:bg-slate-200"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            ) : (
              <span className="w-[18px]" />
            )}
            <Folder size={16} className="text-blue-500" />
            <span className="truncate">{node.name}</span>
          </button>
          {hasChildren && isExpanded && renderTree(node.children, depth + 1)}
        </div>
      );
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-4 px-6 py-4">
          <div className="flex min-w-[220px] items-center gap-2">
            <FolderCog className="text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">素材管理后台系统</p>
              <p className="text-xs text-slate-500">Material Management Interface</p>
            </div>
          </div>
          <div className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-slate-50 p-2">
            <div className="mb-2 flex gap-2">
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-sm ${
                  searchMode === "conditional"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
                onClick={() => setSearchMode("conditional")}
              >
                条件搜索
              </button>
              <button
                type="button"
                className={`rounded-md px-3 py-1 text-sm ${
                  searchMode === "fuzzy"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
                onClick={() => setSearchMode("fuzzy")}
              >
                Query搜索
              </button>
            </div>
            {searchMode === "conditional" ? (
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={conditionProduct}
                  onChange={(event) => setConditionProduct(event.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">产品名称（全部）</option>
                  {productOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-500">
                  <CalendarDays size={14} />
                  <input
                    type="date"
                    value={conditionDate}
                    onChange={(event) => setConditionDate(event.target.value)}
                    className="w-full bg-transparent text-slate-700 outline-none"
                  />
                </label>
                <select
                  value={conditionMaterialType}
                  onChange={(event) => setConditionMaterialType(event.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">素材类型（全部）</option>
                  {materialTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input
                  value={fuzzyQuery}
                  onChange={(event) => setFuzzyQuery(event.target.value)}
                  placeholder="搜索标题或标签..."
                  className="w-full text-sm text-slate-700 outline-none"
                />
              </label>
            )}
          </div>
          <div className="flex min-w-[290px] items-center justify-end gap-3">
            <button
              type="button"
              onClick={openUploadModal}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Upload size={16} />
              上传素材
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
              <div className="h-8 w-8 rounded-full bg-slate-200" />
              <div>
                <p className="text-xs font-medium text-slate-700">Hugo</p>
                <p className="text-[11px] text-slate-500">UI/UX Designer</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1500px] flex-1 overflow-hidden p-6 pt-5">
        <aside className="h-[calc(100vh-132px)] w-[300px] shrink-0 rounded-2xl border border-slate-200 bg-white p-4">
          <label className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={folderKeyword}
              onChange={(event) => setFolderKeyword(event.target.value)}
              className="w-full text-sm text-slate-700 outline-none"
              placeholder="搜索文件夹..."
            />
          </label>

          <div className="mb-4 space-y-2">
            <button
              type="button"
              onClick={() => setActiveQuickView("departmentFavorites")}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                activeQuickView === "departmentFavorites"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CopyCheck size={16} />
              部门收藏
            </button>
            <button
              type="button"
              onClick={() => setActiveQuickView("personalFavorites")}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                activeQuickView === "personalFavorites"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Star size={16} />
              个人收藏
            </button>
          </div>

          <div className="h-[calc(100%-145px)] overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-2">
            {flatFolders.length ? renderTree(allFolders) : null}
          </div>
        </aside>

        <main className="ml-4 flex-1 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-4 border-b border-slate-200 pb-4">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {currentPath.map((segment, idx) => (
                <div key={segment.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFolderId(segment.id)}
                    className="hover:text-blue-600"
                  >
                    {segment.name}
                  </button>
                  {idx < currentPath.length - 1 ? <ChevronRight size={14} /> : null}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5">
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FolderPlus size={15} />
                  新建文件夹
                </button>
                <input
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  placeholder="输入名称"
                  className="w-36 rounded border border-slate-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button
                type="button"
                onClick={openMediaUploadModal}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
              >
                <Upload size={15} />
                上传素材到媒体库
              </button>

              <label
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  selectionEnabled
                    ? "border-slate-200 text-slate-700"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={allPageAssetsSelected}
                  onChange={toggleSelectAll}
                  disabled={!selectionEnabled || currentPageAssetIds.length === 0}
                  className="h-4 w-4 accent-blue-500"
                />
                全选当页
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBatchMenuOpen((prev) => !prev)}
                  disabled={!selectionEnabled || selectedCount === 0}
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${
                    !selectionEnabled || selectedCount === 0
                      ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <CheckCircle2 size={15} />
                  批量操作
                  <ChevronDown size={14} />
                </button>
                {batchMenuOpen ? (
                  <div className="absolute left-0 top-[110%] z-10 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-md">
                    <button type="button" onClick={() => handleBatchAction("move")} className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">移动</button>
                    <button type="button" onClick={() => handleBatchAction("delete")} className="w-full rounded-md px-3 py-2 text-left text-sm text-blue-700 hover:bg-blue-50">删除</button>
                    <button type="button" onClick={() => handleBatchAction("download")} className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">下载</button>
                    <button type="button" onClick={() => handleBatchAction("product")} className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">修改产品归属</button>
                    <button type="button" onClick={() => handleBatchAction("favorite")} className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100">收藏</button>
                  </div>
                ) : null}
              </div>

              <label className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <SlidersHorizontal size={15} />
                排序
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="bg-transparent text-sm outline-none"
                >
                  <option value="createdAt">按时间</option>
                  <option value="name">按名称</option>
                  <option value="size">按大小</option>
                </select>
              </label>

              <div className="ml-auto flex items-center gap-3">
                {selectedCount > 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                    <span>已选 {selectedCount} 项</span>
                    <button type="button" onClick={clearSelection} className="font-medium underline-offset-2 hover:underline">
                      取消选择
                    </button>
                    <span className="inline-flex items-center gap-1 text-blue-800" title="系统总配额为 10 GB">
                      {selectedTotalSizeMB.toFixed(1)} MB / {(totalQuotaMB / 1024).toFixed(0)} GB
                      <CircleHelp size={14} />
                    </span>
                  </div>
                ) : null}
                {!selectionEnabled ? (
                  <span className="text-xs text-slate-400">当前目录含子文件夹，仅末级素材文件夹可全选当页</span>
                ) : null}
                <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`rounded-md px-2 py-1 ${viewMode === "list" ? "bg-blue-100 text-blue-700" : "text-slate-500"}`}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-md px-2 py-1 ${viewMode === "grid" ? "bg-blue-100 text-blue-700" : "text-slate-500"}`}
                  >
                    <Grid2x2 size={16} />
                  </button>
                </div>
              </div>
            </div>
            {operationNotice ? (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                {operationNotice}
              </div>
            ) : null}
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {mergedItems.map((item) => (
                <div
                  key={item.id}
                  role={item.type === "folder" ? "button" : undefined}
                  tabIndex={item.type === "folder" ? 0 : undefined}
                  onClick={() => {
                    if (item.type === "folder") setSelectedFolderId(item.id);
                  }}
                  onKeyDown={(event) => {
                    if (item.type !== "folder") return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedFolderId(item.id);
                    }
                  }}
                  className={`rounded-xl border bg-slate-50 p-3 transition ${
                    item.type === "asset" && selectedAssetIdsOnPage.includes(item.id)
                      ? "border-blue-400 ring-2 ring-blue-100"
                      : item.type === "folder"
                        ? "cursor-pointer border-slate-200 hover:border-blue-400 hover:bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    {item.type === "asset" ? (
                      <label className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          checked={selectedAssetIdsOnPage.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          disabled={!selectionEnabled}
                          className="h-4 w-4 accent-blue-500"
                        />
                        选择
                      </label>
                    ) : (
                      <span className="text-xs text-slate-400">文件夹</span>
                    )}
                    {item.type === "asset" ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs ${badgeColor(item.reviewStatus)}`}>
                        {item.reviewStatus}
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                        文件夹
                      </span>
                    )}
                  </div>
                  <div className="mb-2 flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
                    {item.type === "folder" ? (
                      <Folder className="text-blue-500" size={28} />
                    ) : (
                      kindIcon(item.kind)
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.type === "folder" ? item.name : item.title}
                  </p>
                  {item.type === "asset" ? (
                    <>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-600">
                          {item.materialType}
                        </span>
                        <span className="text-xs text-slate-400">
                          {item.productName} | {item.creator}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.createdAt} | {item.sizeMB} MB
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">子目录数量：{item.children?.length || 0}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-2">选择</th>
                    <th className="px-3 py-2">名称</th>
                    <th className="px-3 py-2">素材类型</th>
                    <th className="px-3 py-2">产品</th>
                    <th className="px-3 py-2">审核状态</th>
                    <th className="px-3 py-2">创建者</th>
                    <th className="px-3 py-2">日期</th>
                    <th className="px-3 py-2">大小</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-t border-slate-100 text-sm text-slate-700 ${
                        item.type === "folder" ? "cursor-pointer hover:bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        if (item.type === "folder") setSelectedFolderId(item.id);
                      }}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedAssetIdsOnPage.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          disabled={item.type !== "asset" || !selectionEnabled}
                          className="h-4 w-4 accent-blue-500 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {item.type === "folder" ? <Folder size={16} className="text-blue-500" /> : kindIcon(item.kind)}
                          <span>{item.type === "folder" ? item.name : item.title}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {item.type === "asset" ? (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-600">
                            {item.materialType}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2">{item.productName || "-"}</td>
                      <td className="px-3 py-2">
                        {item.type === "asset" ? (
                          <span className={`rounded-full px-2 py-0.5 text-xs ${badgeColor(item.reviewStatus)}`}>
                            {item.reviewStatus}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2">{item.creator || "-"}</td>
                      <td className="px-3 py-2">{item.createdAt || "-"}</td>
                      <td className="px-3 py-2">{item.sizeMB ? `${item.sizeMB} MB` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!mergedItems.length ? (
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              当前目录无匹配内容，请调整搜索条件或上传素材。
            </div>
          ) : null}
        </main>
      </div>

      {mediaModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-800">上传素材到媒体</h3>
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-[140px_1fr] items-start gap-y-2">
                <label className="pt-2 text-right text-sm text-slate-700">
                  选择媒体平台 <span className="text-blue-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
                  {mediaPlatforms.map((platform) => (
                    <button
                      key={platform.key}
                      type="button"
                      onClick={() => handlePlatformChange(platform.key)}
                      className={`inline-flex items-center justify-center gap-1 rounded border px-2 py-2 text-sm transition ${
                        mediaPlatform === platform.key
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-[#DCDFE6] text-slate-600 hover:border-blue-400"
                      }`}
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
                        {platform.logo}
                      </span>
                      {platform.key}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-center gap-y-2">
                <label className="text-right text-sm text-slate-700">
                  同步类型 <span className="text-blue-600">*</span>
                </label>
                <div className="flex items-center gap-6 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="syncType"
                      value="account"
                      checked={syncType === "account"}
                      onChange={(event) => handleSyncTypeChange(event.target.value)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className={syncType === "account" ? "text-blue-700" : "text-slate-600"}>
                      账户
                    </span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="syncType"
                      value="bm"
                      checked={syncType === "bm"}
                      onChange={(event) => handleSyncTypeChange(event.target.value)}
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span className={syncType === "bm" ? "text-blue-700" : "text-slate-600"}>BM</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-start gap-y-2">
                <label className="pt-2 text-right text-sm text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    选择广告账户 <span className="text-blue-600">*</span>
                    <CircleHelp size={14} className="text-slate-400" title="选择用于接收素材的广告账户" />
                  </span>
                </label>
                <div>
                  <div className="relative">
                    <select
                      value={selectedAdAccount}
                      onChange={(event) => {
                        setSelectedAdAccount(event.target.value);
                        setAccountError("");
                      }}
                      disabled={accountLoading}
                      className={`w-full rounded border px-3 py-2 text-sm outline-none ${
                        accountError
                          ? "border-blue-500 focus:ring-2 focus:ring-blue-100"
                          : "border-[#DCDFE6] focus:ring-2 focus:ring-blue-100"
                      } ${accountLoading ? "bg-slate-50 text-slate-400" : "bg-white text-slate-700"}`}
                    >
                      <option value="">
                        {accountLoading ? "加载中..." : "请选择广告账户"}
                      </option>
                      {!accountLoading && accountOptions.length === 0 ? (
                        <option value="" disabled>
                          暂无数据
                        </option>
                      ) : null}
                      {!accountLoading
                        ? accountOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))
                        : null}
                    </select>
                    {accountLoading ? (
                      <LoaderCircle className="pointer-events-none absolute right-3 top-2.5 animate-spin text-slate-400" size={16} />
                    ) : null}
                  </div>
                  {accountError ? (
                    <p className="mt-1 text-xs text-blue-600">{accountError}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-[140px_1fr] items-start gap-y-2">
                <label className="pt-1 text-right text-sm text-slate-700">定时上传</label>
                <div>
                  <button
                    type="button"
                    onClick={() => setScheduleUpload((prev) => !prev)}
                    className={`relative h-6 w-12 rounded-full transition ${
                      scheduleUpload ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                        scheduleUpload ? "left-6" : "left-0.5"
                      }`}
                    />
                  </button>
                  {scheduleUpload ? (
                    <div className="mt-3">
                      <input
                        type="datetime-local"
                        min={getMinDatetime()}
                        value={scheduleDatetime}
                        onChange={(event) => setScheduleDatetime(event.target.value)}
                        className="rounded border border-[#DCDFE6] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setMediaModalOpen(false)}
                className="rounded border border-[#DCDFE6] px-4 py-2 text-sm text-slate-800 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleMediaConfirm}
                disabled={mediaSubmitting}
                className="inline-flex min-w-20 items-center justify-center gap-1 rounded px-4 py-2 text-sm text-white disabled:cursor-not-allowed"
                style={{ backgroundColor: brandGreen }}
              >
                {mediaSubmitting ? <LoaderCircle size={14} className="animate-spin" /> : null}
                {mediaSubmitting ? "提交中" : "确认"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {uploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">上传素材</h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">上传区域</p>
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => folderUploadRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <Folder size={15} />
                    选择文件夹上传
                  </button>
                  <button
                    type="button"
                    onClick={() => fileUploadRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <File size={15} />
                    选择文件上传
                  </button>
                </div>
                <input
                  ref={folderUploadRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => addDroppedFiles(event.target.files || [])}
                />
                <input
                  ref={fileUploadRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => addDroppedFiles(event.target.files || [])}
                />

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    addDroppedFiles(event.dataTransfer.files);
                  }}
                  className={`mt-3 rounded-xl border-2 border-dashed p-4 text-center text-sm ${
                    isDragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"
                  }`}
                >
                  拖动单个/多个素材到此处上传
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">标签配置</p>
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <label className="block text-sm text-slate-600">
                    产品名称 <span className="text-red-500">*</span>
                    <select
                      value={uploadProduct}
                      onChange={(event) => setUploadProduct(event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">请选择产品</option>
                      {productOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm text-slate-600">
                    素材审核状态
                    <select
                      value={uploadStatus}
                      onChange={(event) => setUploadStatus(event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {reviewStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="rounded-lg bg-white p-2 text-xs text-slate-500">
                    已选文件：{uploadFiles.length} 个
                  </div>
                </div>
              </div>
            </div>

            {uploadFiles.length ? (
              <div className="mt-4 max-h-36 overflow-auto rounded-xl border border-slate-200">
                {uploadFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-b-0">
                    <span className="truncate text-slate-700">{file.name}</span>
                    <span className="text-xs text-slate-500">{file.sizeMB || "-"} MB</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!uploadFiles.length || !uploadProduct}
              >
                确认上传
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
