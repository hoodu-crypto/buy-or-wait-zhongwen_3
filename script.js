
/* ==========================================
   BUY OR WAIT?
   Complete script.js
   Korean / Chinese / English
   Supabase Cloud Storage
========================================== */

const SUPABASE_URL =
  "https://swjypbofbgejuavxwxgo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_CfKI5T8tdDRsi9OywfHqvQ_mLwzaIqh";

const TABLE = "bow_want_items";
const BUCKET = "bow-want-photos";
const STORAGE_KEY = "buy-or-wait-finds-v1";
const LANGUAGE_KEY = "buy-or-wait-language";

const $ = (id) => document.getElementById(id);

let supabaseClient = null;
let currentUser = null;
let cloudReady = false;
let finds = [];
let filter = "all";
let currentLang = "ko";
let busy = false;
let photoPreviewURL = "";

const I18N = {
  ko: {
    announcement: "구매하기 전에 잠깐 생각해 봐요",
    navHome: "홈",
    navHow: "이용 방법",
    navFinds: "나의 발견",
    navRoom: "나의 방",
    lead: "너무 귀여워. 갖고 싶어.<br>그런데 <i>정말</i> 필요할까?",
    want: "♡ 갖고 싶어!",
    wishlist: "위시리스트 보기",
    ticker: "♡ 발견하기 ♡ 저장하기 ♡ 다시 생각하기 ♡ 가진 것 사랑하기",
    stepsKicker: "작은 사용 안내",
    stepsTitle: "<span class=\"steps-title-small\">지금은 좋아해도,</span><span class=\"steps-title-large\">결정은 나중에.</span>",
    stepsDesc: "“너무 귀여워!”에서 “샀어!”까지, 세 가지 작은 단계",
    stepNumber1: "01 / 발견하기",
    stepNumber2: "02 / 기다리기",
    stepNumber3: "03 / 결정하기",
    step1: "마음에 담기",
    step2: "함께 고민하기",
    step3: "결정하기",
    stepButton1: "물건 추가하기",
    stepButton2: "함께 고민하기",
    stepButton3: "나의 발견 보기",
    findsKicker: "♡ 나만의 작은 컬렉션",
    findsTitle: '나의 작은 발견<span class="sparkle">✳</span>',
    findsDesc: "마음에 쏙 들었던 귀여운 것들을 모아 보세요.",
    add: "＋ 물건 추가하기",
    all: "전체",
    waiting: "고민 중",
    bought: "이미 샀어요",
    roomKicker: "나만의 작은 공간",
    roomTitle: "좋아하는 것들을 위한<br><i>나만의 공간.</i>",
    roomDesc: "모아 둔 물건들을 작은 3D 방에서 다시 만나 보세요.",
    roomButton: "나의 방 들어가기",
    roomSmall: "3D 방은 다음 단계에서 연결할 예정이에요.",
    footer1: "귀여운 것을 좋아하는 친구를 위해 만들었어요.",
    footer2: "작은 물건, 신중한 선택. © 2026",
    drawerKicker: "♡ 잠깐의 기다림",
    drawerTitle: "나의 위시리스트",
    drawerMessage: "오늘은 사진만 저장해도 충분해요. 지금 사지 않아도 괜찮아요 ♡",
    waitingStat: "고민 중",
    boughtStat: "이미 샀어요",
    drawerUpload: "＋ 다른 물건 저장하기",
    drawerClose: "계속 둘러보기",
    uploadKicker: "새로운 마음에 드는 물건",
    uploadTitle: "갖고 싶어!",
    uploadDesc: "사진을 찍고 저장한 뒤 잠깐 생각해 보세요.",
    photoPrompt: "사진 촬영 또는 업로드",
    photoLimit: "JPG, PNG, WEBP • 최대 5MB",
    nameLabel: "어떤 점이 마음에 들었나요?",
    priceLabel: "가격",
    categoryLabel: "카테고리",
    save: "♡ 위시리스트에 저장하기",
    namePlaceholder: "",
    catPlushies: "인형",
    catKeychains: "키링",
    catStationery: "문구",
    catAccessories: "액세서리",
    catHome: "인테리어 소품",
    catOther: "기타 귀여운 물건",
    statusWaiting: "♡ 고민 중",
    statusBought: "✓ 이미 샀어요",
    markBought: "✓ 구매 완료",
    markWaiting: "↶ 다시 고민하기",
    remove: "삭제",
    emptyTitle: "아직 저장한 물건이 없어요!",
    emptyFiltered: "이 목록에는 아직 물건이 없어요",
    emptyDesc: "귀여운 물건을 발견했다면 사진으로 저장해 보세요.",
    emptyButton: "＋ 첫 발견 저장하기",
    drawerEmpty: "아직 저장한 물건이 없어요.",
    noPrice: "가격 미입력",
    confirmRemove: "이 물건을 삭제할까요?",
    needName: "물건 이름을 입력해 주세요.",
    imageInvalid: "5MB 이하의 JPG, PNG 또는 WEBP 이미지를 선택해 주세요.",
    imageError: "사진을 불러올 수 없어요.",
    saved: "♡ 위시리스트에 저장했어요!",
    removed: "물건을 삭제했어요.",
    markedBought: "구매 완료로 표시했어요.",
    markedWaiting: "다시 고민 중으로 변경했어요.",
    connected: "♡ 클라우드 연결 완료!",
    connectionError: "클라우드 연결 실패",
    saveError: "저장 실패",
    updateError: "수정 실패",
    deleteError: "삭제 실패",
    roomNotice: "♡ 3D 방은 다음 단계에서 연결할 예정이에요!",
    saving: "저장 중..."
  },

  zh: {
    announcement: "买下喜欢的东西之前，先想一想",
    navHome: "首页",
    navHow: "使用方法",
    navFinds: "我的发现",
    navRoom: "我的房间",
    lead: "太可爱了，好想拥有。<br>但是<i>真的</i>需要吗？",
    want: "♡ 好想拥有！",
    wishlist: "查看心愿清单",
    ticker: "♡ 发现它 ♡ 收藏它 ♡ 再想一想 ♡ 珍惜已拥有的",
    stepsKicker: "使用指南",
    stepsTitle: "<span class=\"steps-title-small\">现在喜欢，</span><span class=\"steps-title-large\">以后再决定。</span>",
    stepsDesc: "从发现心动，到等待考虑，再到已购收藏",
    stepNumber1: "01 / 发现心动",
    stepNumber2: "02 / 一起考虑",
    stepNumber3: "03 / 已购小物件",
    step1: "记录心动",
    step2: "一起考虑",
    step3: "已购小物件",
    stepButton1: "添加物品",
    stepButton2: "一起考虑",
    stepButton3: "查看已购小物",
    findsKicker: "♡ 我的小物记录",
    findsTitle: '我的心动小物<span class="sparkle">✳</span>',
    findsDesc: "把让你心动的小东西收藏在这里。",
    add: "＋ 添加物品",
    all: "全部",
    waiting: "考虑中",
    bought: "已购买",
    roomKicker: "属于你的小角落",
    roomTitle: "给喜欢的小物<br><i>留一个位置。</i>",
    roomDesc: "把收藏的物品放进可爱的 3D 房间，重新发现自己拥有的东西。",
    roomButton: "进入我的房间",
    roomSmall: "3D 房间将在下一步连接。",
    footer1: "为喜欢可爱小东西的朋友而制作。",
    footer2: "小小物品，认真选择。© 2026",
    drawerKicker: "♡ 先收藏，再决定",
    drawerTitle: "我的心愿清单",
    drawerMessage: "今天只保存照片就好，不一定要立刻买下来 ♡",
    waitingStat: "考虑中",
    boughtStat: "已购买",
    drawerUpload: "＋ 再收藏一件",
    drawerClose: "继续逛逛",
    uploadKicker: "新发现的心动小物",
    uploadTitle: "好想拥有！",
    uploadDesc: "拍下来、收藏起来，再给自己一点时间考虑。",
    photoPrompt: "拍照或上传照片",
    photoLimit: "JPG、PNG、WEBP • 最大 5MB",
    nameLabel: "你喜欢它的哪一点？",
    priceLabel: "价格",
    categoryLabel: "物品分类",
    save: "♡ 保存到心愿清单",
    namePlaceholder: "",
    catPlushies: "玩偶",
    catKeychains: "钥匙扣",
    catStationery: "文具",
    catAccessories: "配饰",
    catHome: "家居小物",
    catOther: "其他可爱物品",
    statusWaiting: "♡ 考虑中",
    statusBought: "✓ 已买过",
    markBought: "↶ 再想想",
    markWaiting: "↶ 再想想",
    remove: "删除",
    emptyTitle: "这里还没有收藏哦！",
    emptyFiltered: "这个分类暂时没有物品",
    emptyDesc: "看到喜欢的小东西，先拍照收藏，再决定买不买。",
    emptyButton: "＋ 添加第一件物品",
    drawerEmpty: "这里还没有收藏哦！",
    noPrice: "未填写价格",
    confirmRemove: "确定删除这件物品吗？",
    needName: "请先填写物品名称。",
    imageInvalid: "请选择不超过 5MB 的 JPG、PNG 或 WEBP 图片。",
    imageError: "照片读取失败。",
    saved: "♡ 已保存到心愿清单！",
    removed: "物品已删除。",
    markedBought: "已标记为“已购买”。",
    markedWaiting: "已改为考虑中。",
    connected: "♡ 云端连接成功！",
    connectionError: "云端连接失败",
    saveError: "保存失败",
    updateError: "修改失败",
    deleteError: "删除失败",
    roomNotice: "♡ 3D 房间将在下一步连接！",
    saving: "正在保存..."
  },

  en: {
    announcement: "A little pause before a little purchase",
    navHome: "HOME",
    navHow: "HOW IT WORKS",
    navFinds: "MY FINDS",
    navRoom: "MY ROOM",
    lead: "It's cute. You love it.<br>But do you <i>really</i> need it?",
    want: "♡ I WANT IT!",
    wishlist: "VIEW MY WISHLIST",
    ticker: "♡ SPOT IT ♡ SAVE IT ♡ THINK TWICE ♡ LOVE WHAT YOU HAVE",
    stepsKicker: "A LITTLE GUIDE",
    stepsTitle: "<span class=\"steps-title-small\">Love it now.</span><span class=\"steps-title-large\">Decide later.</span>",
    stepsDesc: "Three small steps between “so cute!” and “I bought it!”",
    stepNumber1: "01 / SPOT IT",
    stepNumber2: "02 / PAUSE IT",
    stepNumber3: "03 / KEEP IT",
    step1: "Catch the crush",
    step2: "Think together",
    step3: "Choose your ending",
    stepButton1: "ADD A FIND",
    stepButton2: "THINK TOGETHER",
    stepButton3: "MY LITTLE FINDS",
    findsKicker: "♡ YOUR VERY OWN COLLECTION",
    findsTitle: 'My little finds<span class="sparkle">✳</span>',
    findsDesc: 'All the things that made you stop and say “aww!”',
    add: "＋ ADD A FIND",
    all: "ALL FINDS",
    waiting: "STILL THINKING",
    bought: "ALREADY MINE",
    roomKicker: "YOUR LITTLE CORNER",
    roomTitle: "A room for<br><i>everything</i> you love.",
    roomDesc: "Your collected finds will eventually live in a tiny interactive 3D room.",
    roomButton: "ENTER MY ROOM",
    roomSmall: "3D room connection coming in the next step.",
    footer1: "Made for a friend who loves all things cute.",
    footer2: "Little things. Thoughtful choices. © 2026",
    drawerKicker: "♡ THE LITTLE PAUSE",
    drawerTitle: "My Wishlist",
    drawerMessage: "A photo is enough for today. You don't have to buy it now ♡",
    waitingStat: "Still thinking",
    boughtStat: "Already mine",
    drawerUpload: "＋ SAVE ANOTHER FIND",
    drawerClose: "CONTINUE EXPLORING",
    uploadKicker: "A NEW LITTLE CRUSH",
    uploadTitle: "I WANT IT!",
    uploadDesc: "Snap it, save it, and give yourself a moment to think.",
    photoPrompt: "Tap to take a photo or upload one",
    photoLimit: "JPG, PNG or WEBP • max 5 MB",
    nameLabel: "WHAT DO YOU LIKE ABOUT IT?",
    priceLabel: "PRICE",
    categoryLabel: "CATEGORY",
    save: "♡ SAVE TO WISHLIST",
    namePlaceholder: "",
    catPlushies: "Plushies",
    catKeychains: "Keychains",
    catStationery: "Stationery",
    catAccessories: "Accessories",
    catHome: "Home decor",
    catOther: "Other cute things",
    statusWaiting: "♡ Still thinking",
    statusBought: "✓ Already mine",
    markBought: "✓ BOUGHT",
    markWaiting: "↶ WAITING",
    remove: "REMOVE",
    emptyTitle: "Your little collection starts here!",
    emptyFiltered: "Nothing in this section yet",
    emptyDesc: "Spot something cute? Save a photo before you buy it.",
    emptyButton: "＋ ADD MY FIRST FIND",
    drawerEmpty: "Nothing here yet. Save your first cute find!",
    noPrice: "Price not added",
    confirmRemove: "Remove this find?",
    needName: "Give your find a name first.",
    imageInvalid: "Choose a JPG, PNG or WEBP image under 5 MB.",
    imageError: "Could not read this photo.",
    saved: "♡ Saved to your cloud wishlist!",
    removed: "Find removed.",
    markedBought: "Marked as bought.",
    markedWaiting: "Moved back to waiting.",
    connected: "♡ Your collection is connected!",
    connectionError: "Cloud connection failed",
    saveError: "Could not save",
    updateError: "Update failed",
    deleteError: "Delete failed",
    roomNotice: "♡ Your 3D room will be connected in the next step!",
    saving: "Saving..."
  }
};

const CATEGORY_KEYS = {
  "Plushies": "catPlushies",
  "Keychains": "catKeychains",
  "Stationery": "catStationery",
  "Accessories": "catAccessories",
  "Home decor": "catHome",
  "Other cute things": "catOther"
};

/* ==========================================
   PART 2 / 7
   LANGUAGE, DATA AND UI HELPERS
========================================== */

function t(key) {
  return (
    I18N[currentLang]?.[key] ||
    I18N.ko[key] ||
    key
  );
}

function getSavedLanguage() {
  // The website always starts in Korean.
  // Language buttons still switch between Korean, Chinese, and English.
  return "ko";
}

currentLang = getSavedLanguage();

function applyLanguage(language = currentLang) {
  if (!["ko", "zh", "en"].includes(language)) {
    language = "ko";
  }

  currentLang = language;

  try {
    localStorage.setItem(LANGUAGE_KEY, currentLang);
  } catch (error) {
    console.warn("Could not save language:", error);
  }

  document.documentElement.lang =
    currentLang === "zh" ? "zh-CN" : currentLang;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (key && I18N[currentLang]?.[key] !== undefined) {
      element.textContent = t(key);
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    const key = element.dataset.i18nHtml;

    if (key && I18N[currentLang]?.[key] !== undefined) {
      element.innerHTML = t(key);
    }
  });

  document
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach((element) => {
      const key = element.dataset.i18nPlaceholder;

      if (key) {
        element.placeholder = key === "namePlaceholder" || key === "notePlaceholder" ? "" : t(key);
      }
    });

  document
    .querySelectorAll("[data-lang]")
    .forEach((button) => {
      const active = button.dataset.lang === currentLang;

      button.classList.toggle("active", active);
      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

  if (typeof render === "function") {
    render();
  }

  if (typeof renderWaitModal === "function") {
    const modal = $("waitModal");

    if (
      modal &&
      !modal.hidden &&
      modal.classList.contains("open")
    ) {
      renderWaitModal();
    }
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function normalizeStatus(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (
    value === "bought" ||
    value === "purchased" ||
    value === "already_bought"
  ) {
    return "bought";
  }

  if (
    value === "thinking" ||
    value === "considering" ||
    value === "rethink"
  ) {
    return "thinking";
  }

  return "waiting";
}

function normalizeItem(row) {
  const status = normalizeStatus(row.status);
  const rawNote = String(row.note || "");
  const satisfactionMatch = rawNote.match(/\n?\[\[bow-satisfaction:(love|okay|regret)\]\]\s*$/);
  const note = satisfactionMatch
    ? rawNote.replace(/\n?\[\[bow-satisfaction:(love|okay|regret)\]\]\s*$/, "").trimEnd()
    : rawNote;

  return {
    id: row.id,
    user_id: row.user_id || null,

    name:
      row.item_name ||
      row.name ||
      "",

    category:
      row.category ||
      "Other cute things",

    price: safeNumber(row.price),

    currency:
      row.currency ||
      "KRW",

    note,
    satisfaction: satisfactionMatch?.[1] || "",

    photo_path:
      row.photo_path ||
      "",

    photo_url:
      row.photo_url ||
      row.image_url ||
      "",

    status,

    bought: status === "bought",

    purchased_at: row.purchased_at || null,
    updated_at: row.updated_at || null,
    created_at:
      row.created_at ||
      new Date().toISOString()
  };
}

// Exchange rates are fetched once per session. Prices are stored in their original
// currencies; changing the UI language never changes the stored amount.
let bowExchangeRates = null;
let bowExchangeLoading = false;
let bowExchangeFailed = false;
async function loadBowExchangeRates() {
  if (bowExchangeRates || bowExchangeLoading) return;
  bowExchangeLoading = true;
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/KRW");
    if (!response.ok) throw new Error("Exchange-rate service unavailable");
    const data = await response.json();
    if (data.result !== "success" || !data.rates?.KRW || !data.rates?.CNY || !data.rates?.USD) {
      throw new Error("Invalid exchange-rate response");
    }
    bowExchangeRates = data.rates;
    bowExchangeFailed = false;
  } catch (error) {
    bowExchangeFailed = true;
    console.warn("Unable to load exchange rates:", error);
  } finally {
    bowExchangeLoading = false;
    // Re-render the visible prices after the asynchronous exchange-rate lookup.
    if (typeof renderWaitModal === "function") renderWaitModal();
    if (typeof renderFinds === "function") renderFinds();
    if (typeof renderDrawerItems === "function") renderDrawerItems();
  }
}
function formatPrice(item) {
  const amount = safeNumber(item.price);
  if (amount <= 0) return t("noPrice");
  const source = String(item.currency || "KRW").toUpperCase();
  const target = currentLang === "zh" ? "CNY" : currentLang === "en" ? "USD" : "KRW";
  let converted = amount;
  if (source !== target) {
    if (!bowExchangeRates?.[source] || !bowExchangeRates?.[target]) {
      if (!bowExchangeLoading && !bowExchangeFailed) void loadBowExchangeRates();
      return currentLang === "zh" ? "汇率加载中…" : currentLang === "en" ? "Loading rate…" : "환율 불러오는 중…";
    }
    converted = amount / bowExchangeRates[source] * bowExchangeRates[target];
  }
  const locale = currentLang === "zh" ? "zh-CN" : currentLang === "en" ? "en-US" : "ko-KR";
  return new Intl.NumberFormat(locale, {
    style: "currency", currency: target,
    minimumFractionDigits: target === "KRW" ? 0 : 2,
    maximumFractionDigits: target === "KRW" ? 0 : 2
  }).format(converted);
}

function getCategoryLabel(category) {
  const key = CATEGORY_KEYS[category];

  return key
    ? t(key)
    : category || t("catOther");
}

function saveLocalBackup() {
  if (!currentUser) return;
  try {
    localStorage.setItem(
      STORAGE_KEY + ":" + currentUser.id,
      JSON.stringify(finds)
    );
  } catch (error) {
    console.warn(
      "Could not save local backup:",
      error
    );
  }
}

function loadLocalBackup() {
  try {
    const raw = currentUser ? localStorage.getItem(STORAGE_KEY + ":" + currentUser.id) : null;

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeItem);
  } catch (error) {
    console.warn(
      "Could not load local backup:",
      error
    );

    return [];
  }
}

/* ==========================================
   IMAGE URL HELPERS
========================================== */

function getPhotoURL(item) {
  if (!item) {
    return "";
  }

  const directURL =
    item.photo_url ||
    item.image_url ||
    "";

  if (directURL) {
    return directURL;
  }

  const path = item.photo_path || "";

  if (!path) {
    return "";
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  if (!supabaseClient) {
    return "";
  }

  try {
    const result = supabaseClient.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return result?.data?.publicUrl || "";
  } catch (error) {
    console.warn(
      "Could not create photo URL:",
      error
    );

    return "";
  }
}

function createPhotoHTML(item, className = "") {
  const photoURL = getPhotoURL(item);

  if (!photoURL) {
    return `
      <div class="${escapeHTML(className)} empty-photo">
        <span aria-hidden="true">♡</span>
      </div>
    `;
  }

  return `
    <img
      class="${escapeHTML(className)}"
      src="${escapeHTML(photoURL)}"
      alt="${escapeHTML(item.name || "")}"
      loading="lazy"
      onerror="this.style.display='none';"
    >
  `;
}

/* ==========================================
   NOTIFICATIONS
========================================== */

let notificationTimer = null;
let lastNotification = "";
let lastNotificationTime = 0;

function notify(message, duration = 2600) {
  if (!message) {
    return;
  }

  const now = Date.now();

  if (
    message === lastNotification &&
    now - lastNotificationTime < 2000
  ) {
    return;
  }

  lastNotification = message;
  lastNotificationTime = now;

  let toastElement =
    $("toast") ||
    document.querySelector(".toast");

  if (!toastElement) {
    toastElement = document.createElement("div");
    toastElement.id = "toast";
    toastElement.className = "toast";

    document.body.appendChild(toastElement);
  }

  toastElement.textContent = message;

  toastElement.classList.add("show");
  toastElement.classList.add("visible");

  toastElement.hidden = false;

  clearTimeout(notificationTimer);

  notificationTimer = setTimeout(() => {
    toastElement.classList.remove("show");
    toastElement.classList.remove("visible");

    setTimeout(() => {
      if (
        !toastElement.classList.contains("show") &&
        !toastElement.classList.contains("visible")
      ) {
        toastElement.hidden = true;
      }
    }, 250);
  }, duration);
}

function setBusy(value) {
  busy = Boolean(value);

  document
    .querySelectorAll("[data-busy-button]")
    .forEach((button) => {
      button.disabled = busy;
    });
}

/* ==========================================
   MODAL HELPERS
========================================== */

function showOverlay() {
  const overlay = $("overlay");

  if (overlay) {
    overlay.hidden = false;
    overlay.classList.add("open");
  }

  document.body.classList.add("modal-open");
}

function hideOverlayIfUnused() {
  const uploadDialog =
    $("uploadDialog") ||
    $("uploadModal");

  const wishlistDrawer =
    $("wishlistDrawer");

  const waitModal =
    $("waitModal");

  const uploadOpen =
    uploadDialog &&
    !uploadDialog.hidden &&
    uploadDialog.classList.contains("open");

  const drawerOpen =
    wishlistDrawer &&
    !wishlistDrawer.hidden &&
    wishlistDrawer.classList.contains("open");

  const waitOpen =
    waitModal &&
    !waitModal.hidden &&
    waitModal.classList.contains("open");

  if (!uploadOpen && !drawerOpen && !waitOpen) {
    const overlay = $("overlay");

    if (overlay) {
      overlay.classList.remove("open");
      overlay.hidden = true;
    }

    document.body.classList.remove("modal-open");
  }
}

/* ==========================================
   PART 3 / 7
   SUPABASE CONNECTION AND CLOUD DATA
========================================== */

let cloudConnectionPromise = null;


/* ==========================================
   SUPABASE CONFIGURATION
========================================== */

function getSupabaseConfiguration() {
  const config =
    window.SUPABASE_CONFIG ||
    window.supabaseConfig ||
    {};

  const url =
    (typeof SUPABASE_URL !== "undefined"
      ? SUPABASE_URL
      : null) ||
    config.url ||
    config.supabaseUrl ||
    window.SUPABASE_URL ||
    "";

  const key =
    (typeof SUPABASE_PUBLISHABLE_KEY !== "undefined"
      ? SUPABASE_PUBLISHABLE_KEY
      : null) ||
    (typeof SUPABASE_ANON_KEY !== "undefined"
      ? SUPABASE_ANON_KEY
      : null) ||
    config.publishableKey ||
    config.anonKey ||
    config.key ||
    window.SUPABASE_PUBLISHABLE_KEY ||
    window.SUPABASE_ANON_KEY ||
    "";

  return {
    url: String(url)
      .trim()
      .replace(/\/rest\/v1\/?$/, "")
      .replace(/\/$/, ""),

    key: String(key).trim()
  };
}

/* ==========================================
   INITIALIZE SUPABASE
========================================== */

async function initializeSupabase() {
  if (cloudReady && supabaseClient && currentUser) {
    return true;
  }

  if (cloudConnectionPromise) {
    return cloudConnectionPromise;
  }

  cloudConnectionPromise = (async () => {
    try {
      if (
        !window.supabase ||
        typeof window.supabase.createClient !== "function"
      ) {
        throw new Error(
          "Supabase JavaScript library is not loaded."
        );
      }

      const configuration = getSupabaseConfiguration();

      if (!configuration.url || !configuration.key) {
        throw new Error(
          "Supabase URL or publishable key is missing."
        );
      }

      if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(
          configuration.url,
          configuration.key,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: false
            }
          }
        );
      }

      const sessionResult =
        await supabaseClient.auth.getSession();

      if (sessionResult.error) {
        throw sessionResult.error;
      }

      let session = sessionResult.data.session;

      if (!session?.user || session.user.is_anonymous || !session.user.email) {
        currentUser = null;
        cloudReady = false;
        return false;
      }

      currentUser = session.user;

      await loadCloudFinds();

      cloudReady = true;
      document.body.classList.remove("bow-auth-pending");
      $("bowLogin").hidden = true;

      console.log(
        "Supabase connected successfully.",
        currentUser.id
      );

      // 不弹出“클라우드 연결 완료”提示，
      // 避免页面不断显示连接成功消息。

      return true;
    } catch (error) {
      console.error(
        "Supabase connection error:",
        error
      );

      cloudReady = false;

      finds = [];

      if (typeof render === "function") {
        render();
      }

      return false;
    }
  })();

  try {
    return await cloudConnectionPromise;
  } finally {
    cloudConnectionPromise = null;
  }
}

/* ==========================================
   ENSURE CLOUD CONNECTION
========================================== */

async function ensureCloudConnection() {
  if (
    cloudReady &&
    supabaseClient &&
    currentUser
  ) {
    return true;
  }

  return await initializeSupabase();
}

/* ==========================================
   LOAD CLOUD FINDS
========================================== */

async function loadCloudFinds() {
  if (!supabaseClient || !currentUser) {
    throw new Error(
      "Supabase client or user is unavailable."
    );
  }

  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(
      "Could not load cloud items:",
      error
    );

    throw error;
  }

  finds = (data || []).map(normalizeItem);

  saveLocalBackup();

  if (typeof render === "function") {
    render();
  }

  const waitModal = $("waitModal");

  if (
    waitModal &&
    !waitModal.hidden &&
    waitModal.classList.contains("open") &&
    typeof renderWaitModal === "function"
  ) {
    renderWaitModal();
  }

  return finds;
}

/* ==========================================
   REFRESH CLOUD FINDS
========================================== */

async function refreshCloudFinds() {
  const connected = await ensureCloudConnection();

  if (!connected) {
    return false;
  }

  try {
    await loadCloudFinds();

    return true;
  } catch (error) {
    console.error(
      "Cloud refresh failed:",
      error
    );

    return false;
  }
}

/* ==========================================
   UPLOAD PHOTO
========================================== */

async function uploadPhoto(file) {
  if (!file) {
    return "";
  }

  if (!await ensureCloudConnection()) {
    throw new Error(
      "Cloud connection is unavailable."
    );
  }

  const originalName = String(file.name || "");

  const extension =
    originalName.split(".").pop()?.toLowerCase() ||
    "jpg";

  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "webp"
  ];

  const safeExtension =
    allowedExtensions.includes(extension)
      ? extension
      : "jpg";

  const randomId =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

  const path =
    `${currentUser.id}/${randomId}.${safeExtension}`;

  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp"
  };

  const contentType =
    file.type ||
    mimeTypes[safeExtension] ||
    "image/jpeg";

  const { data, error } = await supabaseClient.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType,
      upsert: false
    });

  if (error) {
    console.error(
      "Photo upload failed:",
      error
    );

    throw error;
  }

  return data?.path || path;
}

/* ==========================================
   SAVE NEW ITEM
========================================== */

async function insertCloudItem(itemData) {
  if (!await ensureCloudConnection()) {
    throw new Error(
      "Cloud connection is unavailable."
    );
  }

  const payload = {
    user_id: currentUser.id,

    item_name:
      String(itemData.name || itemData.item_name || "")
        .trim(),

    category:
      itemData.category || "Other cute things",

    price: safeNumber(itemData.price),

    currency:
      itemData.currency || "KRW",

    note:
      itemData.note || "",

    photo_path:
      itemData.photo_path || "",

    status: "waiting"
  };

  if (!payload.item_name) {
    throw new Error(
      "Item name is required."
    );
  }

  const { data, error } = await supabaseClient
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(
      "Could not save item:",
      error
    );

    throw error;
  }

  await loadCloudFinds();

  return normalizeItem(data);
}

/* ==========================================
   UPDATE ITEM STATUS
========================================== */

async function updateCloudItemSatisfaction(itemId, satisfaction) {
  if (!["love", "okay", "regret"].includes(satisfaction)) {
    throw new Error(`Invalid purchase satisfaction: ${satisfaction}`);
  }
  if (!await ensureCloudConnection()) {
    throw new Error("Cloud connection is unavailable.");
  }
  const item = finds.find((entry) => String(entry.id) === String(itemId));
  if (!item) return;
  const note = [item.note, `[[bow-satisfaction:${satisfaction}]]`]
    .filter(Boolean)
    .join("\n");
  const { data, error } = await supabaseClient
    .from(TABLE)
    .update({ note })
    .eq("id", itemId)
    .eq("user_id", currentUser.id)
    .select()
    .single();
  if (error) {
    console.error("Purchase satisfaction update failed:", error);
    throw error;
  }
  await loadCloudFinds();
  return normalizeItem(data);
}

async function updateCloudItemStatus(itemId, status) {
  const allowedStatuses = [
    "waiting",
    "thinking",
    "bought"
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `Invalid item status: ${status}`
    );
  }

  if (!await ensureCloudConnection()) {
    throw new Error(
      "Cloud connection is unavailable."
    );
  }

  const previousItem = finds.find(entry => String(entry.id) === String(itemId));
  const statusUpdate = { status };
  if (status === "bought" && previousItem?.status !== "bought") {
    statusUpdate.purchased_at = new Date().toISOString();
  } else if (status !== "bought") {
    statusUpdate.purchased_at = null;
  }

  let result = await supabaseClient
    .from(TABLE)
    .update(statusUpdate)
    .eq("id", itemId)
    .eq("user_id", currentUser.id)
    .select()
    .single();

  // Older databases without purchased_at continue working. For accurate
  // purchase-month accounting across devices, apply the included SQL migration.
  if (result.error && /purchased_at/i.test(result.error.message || "")) {
    console.warn("purchased_at column missing; apply monthly_budget_migration.sql");
    result = await supabaseClient
      .from(TABLE)
      .update({ status })
      .eq("id", itemId)
      .eq("user_id", currentUser.id)
      .select()
      .single();
  }
  const { data, error } = result;
  if (error) {
    console.error(
      "Item status update failed:",
      error
    );

    throw error;
  }

  await loadCloudFinds();

  return normalizeItem(data);
}

/* ==========================================
   DELETE CLOUD ITEM
========================================== */

async function deleteCloudItem(itemId) {
  if (!await ensureCloudConnection()) {
    throw new Error(
      "Cloud connection is unavailable."
    );
  }

  const item = finds.find(
    (entry) => String(entry.id) === String(itemId)
  );

  const { error } = await supabaseClient
    .from(TABLE)
    .delete()
    .eq("id", itemId)
    .eq("user_id", currentUser.id);

  if (error) {
    console.error(
      "Could not delete item:",
      error
    );

    throw error;
  }

  if (item?.photo_path) {
    const { error: storageError } =
      await supabaseClient.storage
        .from(BUCKET)
        .remove([item.photo_path]);

    if (storageError) {
      console.warn(
        "Item deleted, but photo cleanup failed:",
        storageError
      );
    }
  }

  await loadCloudFinds();

  return true;
}

/* ==========================================
   ITEM STATUS HELPERS
========================================== */

function getItemsByStatus(status) {
  return finds.filter(
    (item) => normalizeStatus(item.status) === status
  );
}

function getStatusCounts() {
  return {
    waiting: getItemsByStatus("waiting").length,

    thinking: getItemsByStatus("thinking").length,

    bought: getItemsByStatus("bought").length,

    total: finds.length
  };
}

/* ==========================================
   PART 4 / 7
   HOME PRODUCT LIST AND FILTERS
========================================== */

/* ==========================================
   PRODUCT CARD TEXT
========================================== */

function getProductText(key) {
  const labels = {
    ko: {
      waiting: "기다리는 중",
      thinking: "다시 생각 중",
      bought: "이미 샀어요",
      rethink: "안 살래요",
      waitAgain: "다시 기다리기",
      boughtAction: "이미 샀어요",
      delete: "삭제"
    },

    zh: {
      waiting: "等待中",
      thinking: "重新考虑中",
      bought: "已经买了",
      rethink: "不买了",
      waitAgain: "重新等待",
      boughtAction: "已经买了",
      delete: "删除"
    },

    en: {
      waiting: "Waiting",
      thinking: "Thinking again",
      bought: "Already bought",
      rethink: "Not buying",
      waitAgain: "Wait again",
      boughtAction: "Already bought",
      delete: "Delete"
    }
  };

  return labels[currentLang]?.[key] ||
    labels.ko[key] ||
    key;
}

/* ==========================================
   PRODUCT STATUS
========================================== */

function getItemStatus(item) {
  return normalizeStatus(item.status);
}

function getItemStatusLabel(item) {
  return getProductText(getItemStatus(item));
}

/* ==========================================
   PRODUCT FILTER
========================================== */

function getFilteredFinds() {
  if (filter === "all") {
    return finds;
  }

  if (filter === "waiting") {
    return finds.filter((item) => {
      const status = getItemStatus(item);

      return (
        status === "waiting" ||
        status === "thinking"
      );
    });
  }

  if (filter === "bought") {
    return finds.filter(
      (item) => getItemStatus(item) === "bought"
    );
  }

  if (filter === "thinking") {
    return finds.filter(
      (item) => getItemStatus(item) === "thinking"
    );
  }

  return finds;
}

/* ==========================================
   PRODUCT PHOTO
========================================== */

function renderProductPhoto(item) {
  const photoURL = getPhotoURL(item);

  if (!photoURL) {
    return `
      <div class="find-photo-placeholder">
        <span aria-hidden="true">♡</span>
      </div>
    `;
  }

  return `
    <img
      src="${escapeHTML(photoURL)}"
      alt="${escapeHTML(item.name)}"
      class="find-photo-image"
      loading="lazy"
      onerror="
        this.style.display='none';
        this.parentElement.classList.add('photo-error');
      "
    >
  `;
}

/* ==========================================
   HOME PRODUCT CARD
========================================== */

function renderFindCard(item) {
  const status = getItemStatus(item);

  const statusClass =
    status === "bought"
      ? "is-bought"
      : status === "thinking"
        ? "is-thinking"
        : "is-waiting";

  return `
    <article
      class="find-card ${statusClass}"
      data-item-id="${escapeHTML(item.id)}"
    >
      <div class="find-photo">
        ${renderProductPhoto(item)}
      </div>

      <div class="find-card-content">
        <div class="find-card-top">
          <span class="find-category">
            ${escapeHTML(
              getCategoryLabel(item.category)
            )}
          </span>

          <span class="find-status">
            ${escapeHTML(
              getItemStatusLabel(item)
            )}
          </span>
        </div>

        <h3 class="find-name">
          ${escapeHTML(item.name)}
        </h3>

        <p class="find-price">
          ${escapeHTML(formatPrice(item))}
        </p>

        ${
          item.note
            ? `
              <p class="find-note">
                ${escapeHTML(item.note)}
              </p>
            `
            : ""
        }

        <div class="find-actions">
          <button
            type="button"
            class="find-action-button"
            data-item-action="open-wait"
            data-item-id="${escapeHTML(item.id)}"
          >
            ${escapeHTML(
              getProductText("waiting")
            )}
          </button>

          <button
            type="button"
            class="find-delete-button"
            data-item-action="delete"
            data-item-id="${escapeHTML(item.id)}"
          >
            ${escapeHTML(
              getProductText("delete")
            )}
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ==========================================
   EMPTY PRODUCT LIST
========================================== */

function renderEmptyFinds() {
  const emptyTitle =
    filter === "all"
      ? t("emptyTitle")
      : t("emptyFiltered");

  return `
    <div class="finds-empty">
      <div class="finds-empty-icon">
        ♡
      </div>

      <h3>${escapeHTML(emptyTitle)}</h3>

      <p>
        ${escapeHTML(t("emptyDesc"))}
      </p>

      <button
        type="button"
        class="btn btn-primary"
        data-open-upload
      >
        ${escapeHTML(t("emptyButton"))}
      </button>
    </div>
  `;
}

/* ==========================================
   RENDER HOME FINDS
========================================== */

function renderFinds() {
  const grid =
    $("findsGrid") ||
    document.querySelector(".finds-grid") ||
    document.querySelector("[data-finds-grid]");

  if (!grid) {
    return;
  }

  const items = getFilteredFinds();

  if (!items.length) {
    grid.innerHTML = renderEmptyFinds();
    return;
  }

  grid.innerHTML = items
    .map(renderFindCard)
    .join("");
}

/* ==========================================
   RENDER COUNTS
========================================== */

function renderCounts() {
  const counts = getStatusCounts();

  const waitingCount =
    counts.waiting + counts.thinking;

  const countTargets = {
    all: counts.total,
    waiting: waitingCount,
    thinking: counts.thinking,
    bought: counts.bought
  };

  document
    .querySelectorAll("[data-count]")
    .forEach((element) => {
      const type = element.dataset.count;

      if (countTargets[type] !== undefined) {
        element.textContent =
          String(countTargets[type]);
      }
    });

  const waitingStat =
    $("waitingCount") ||
    $("wishlistWaitingCount");

  const boughtStat =
    $("boughtCount") ||
    $("wishlistBoughtCount");

  if (waitingStat) {
    waitingStat.textContent =
      String(waitingCount);
  }

  if (boughtStat) {
    boughtStat.textContent =
      String(counts.bought);
  }
}

/* ==========================================
   FILTER BUTTONS
========================================== */

function renderFilterButtons() {
  document
    .querySelectorAll("[data-filter]")
    .forEach((button) => {
      const selected =
        button.dataset.filter === filter;

      button.classList.toggle(
        "active",
        selected
      );

      button.setAttribute(
        "aria-pressed",
        String(selected)
      );
    });
}

function setFindsFilter(nextFilter) {
  const allowedFilters = [
    "all",
    "waiting",
    "thinking",
    "bought"
  ];

  filter = allowedFilters.includes(nextFilter)
    ? nextFilter
    : "all";

  renderFinds();
  renderFilterButtons();
}

/* ==========================================
   MAIN RENDER
========================================== */

function render() {
  renderFinds();
  renderCounts();
  renderFilterButtons();

  const modal = $("waitModal");

  if (
    modal &&
    !modal.hidden &&
    modal.classList.contains("open") &&
    typeof renderWaitModal === "function"
  ) {
    renderWaitModal();
  }
}

/* ==========================================
   HOME PRODUCT BUTTON ACTIONS
========================================== */

async function handleHomeItemAction(event) {
  const button = event.target.closest(
    "[data-item-action]"
  );

  if (!button) {
    return;
  }

  const action = button.dataset.itemAction;
  const itemId = button.dataset.itemId;

  if (!itemId) {
    return;
  }

  const item = finds.find(
    (entry) =>
      String(entry.id) === String(itemId)
  );

  if (!item) {
    return;
  }

  if (action === "open-wait") {
    if (typeof openWaitModal === "function") {
      openWaitModal(getItemStatus(item));
    }

    return;
  }

  if (action === "delete") {
    const confirmed = window.confirm(
      t("confirmRemove")
    );

    if (!confirmed) {
      return;
    }

    if (busy) {
      return;
    }

    setBusy(true);

    try {
      await deleteCloudItem(itemId);

      notify(t("removed"));
    } catch (error) {
      console.error(
        "Delete action failed:",
        error
      );

      notify(
        `${t("deleteError")}: ${error.message}`
      );
    } finally {
      setBusy(false);
    }
  }
}

/* ==========================================
   PRODUCT EVENT LISTENERS
========================================== */

function initializeFindsEvents() {
  const grid =
    $("findsGrid") ||
    document.querySelector(".finds-grid") ||
    document.querySelector("[data-finds-grid]");

  if (grid && !grid.dataset.eventsReady) {
    grid.dataset.eventsReady = "true";

    grid.addEventListener(
      "click",
      handleHomeItemAction
    );
  }

  document
    .querySelectorAll("[data-filter]")
    .forEach((button) => {
      if (button.dataset.eventsReady) {
        return;
      }

      button.dataset.eventsReady = "true";

      button.addEventListener(
        "click",
        () => {
          setFindsFilter(
            button.dataset.filter
          );
        }
      );
    });
}

/* ==========================================
   PART 5 / 7
   WAITING MODAL
   Three tabs / Photo / Price / Status
========================================== */

const WAIT_MODAL_I18N = {
  ko: {
    title: "함께 고민하기",
    description:
      "오늘도 천천히 마음에 담아둔 물건을 살펴봐요.",
    waiting: "기다리는 중",
    thinking: "다시 생각 중",
    bought: "이미 샀어요",
    waitingTitle: "기다리고 있는 귀여운 것들",
    thinkingTitle: "다시 생각하고 있는 것들",
    boughtTitle: "이미 내 것이 된 귀여운 것들",
    rethink: "안 살래요",
    waitAgain: "다시 기다리기",
    boughtAction: "이미 샀어요",
    satisfactionAction: "구매 만족도 기록하기",
    satisfactionSaved: "기록한 만족도",
    satisfactionLove: "짱 좋아!",
    satisfactionOkay: "그냥 그래",
    satisfactionRegret: "괜히 샀어",
    empty: "아직 물건이 없어요.",
    close: "닫기",
    updating: "변경 중...",
    messagesLoading: "친구와 나눈 이야기를 불러오는 중...",
    messagesError: "메시지를 불러오지 못했어요. 잠시 후 다시 열어 주세요.",
    noMessages: "아직 메시지가 없어요. 먼저 이야기를 시작해 보세요.",
    messagePlaceholder: "친구에게 메시지 남기기...",
    messageSend: "보내기",
    messageMe: "나",
    messageFriend: "친구",
    messageSendError: "메시지를 보내지 못했어요. 다시 시도해 주세요.",
    voicePlay: "음성 재생",
    voicePause: "음성 일시정지",
    voiceStart: "음성 녹음 시작",
    voiceStop: "녹음 멈추고 보내기",
    voiceRecording: "녹음 중",
    voiceUploading: "음성을 보내는 중...",
    voiceUnsupported: "이 브라우저에서는 음성 녹음을 지원하지 않아요.",
    voicePermission: "마이크 권한을 허용해 주세요.",
    voiceEmpty: "1초 이상 녹음해 주세요.",
    voiceSendError: "음성 메시지를 보내지 못했어요.",
    voiceSaved: "음성 메시지를 저장했어요.",
    voicePlaybackError: "음성을 불러오지 못했어요. 페이지를 다시 열어 주세요.",
    voiceLoading: "음성을 불러오는 중..."
  },

  zh: {
    title: "一起考虑",
    description:
      "今天也慢慢看看收藏起来的心动小物吧。",
    waiting: "等待中",
    thinking: "重新考虑中",
    bought: "已经买了",
    waitingTitle: "正在等待的可爱小物",
    thinkingTitle: "正在重新考虑的小物",
    boughtTitle: "已经拥有的可爱小物",
    rethink: "不买了",
    waitAgain: "重新等待",
    boughtAction: "已经买了",
    satisfactionAction: "记录购买满意度",
    satisfactionSaved: "已记录",
    satisfactionLove: "太喜欢了",
    satisfactionOkay: "一般般",
    satisfactionRegret: "有点后悔",
    empty: "这里暂时没有物品。",
    close: "关闭",
    updating: "正在修改...",
    messagesLoading: "正在加载你和朋友的留言…",
    messagesError: "留言加载失败，请稍后重新打开。",
    noMessages: "还没有留言，先说点什么吧。",
    messagePlaceholder: "给朋友留一条消息…",
    messageSend: "发送",
    messageMe: "我",
    messageFriend: "朋友",
    messageSendError: "留言发送失败，请重试。",
    voicePlay: "播放语音",
    voicePause: "暂停语音",
    voiceStart: "开始录音",
    voiceStop: "停止并发送录音",
    voiceRecording: "正在录音",
    voiceUploading: "正在发送语音…",
    voiceUnsupported: "此浏览器不支持语音录音。",
    voicePermission: "请允许使用麦克风。",
    voiceEmpty: "请至少录音 1 秒。",
    voiceSendError: "语音留言发送失败。",
    voiceSaved: "语音已保存并发送。",
    voicePlaybackError: "语音加载失败，请重新打开页面。",
    voiceLoading: "正在准备语音…"
  },

  en: {
    title: "Think together",
    description:
      "Take another look at the little things you love.",
    waiting: "Waiting",
    thinking: "Thinking again",
    bought: "Already bought",
    waitingTitle: "Cute things worth waiting for",
    thinkingTitle: "Things I'm thinking about",
    boughtTitle: "Cute things I already own",
    rethink: "Not buying",
    waitAgain: "Wait again",
    boughtAction: "Already bought",
    satisfactionAction: "Rate my purchase",
    satisfactionSaved: "Saved",
    satisfactionLove: "Love it!",
    satisfactionOkay: "It’s okay.",
    satisfactionRegret: "Wish I hadn’t bought it.",
    empty: "Nothing here yet.",
    close: "Close",
    updating: "Updating...",
    messagesLoading: "Loading your conversation...",
    messagesError: "Could not load messages. Reopen this item in a moment.",
    noMessages: "No messages yet. Start the conversation.",
    messagePlaceholder: "Leave a message for your friend...",
    messageSend: "Send",
    messageMe: "Me",
    messageFriend: "Friend",
    messageSendError: "Message could not be sent. Please try again.",
    voicePlay: "Play voice message",
    voicePause: "Pause voice message",
    voiceStart: "Start voice recording",
    voiceStop: "Stop and send recording",
    voiceRecording: "Recording",
    voiceUploading: "Sending voice message…",
    voiceUnsupported: "Voice recording is not supported in this browser.",
    voicePermission: "Please allow microphone access.",
    voiceEmpty: "Record for at least one second.",
    voiceSendError: "Voice message could not be sent.",
    voiceSaved: "Voice message saved and sent.",
    voicePlaybackError: "Could not load audio. Reopen this page.",
    voiceLoading: "Preparing audio…"
  }
};

let waitModalTab = "waiting";
let discussionId = null;
let bowSharedItems = [];
let waitModalBusy = false;
let satisfactionOpenItemId = null;
let bowDiscussionMessages = [];
let bowDiscussionMessageItemId = "";
let bowDiscussionMessagesStatus = "idle";
let bowDiscussionMessagesErrorDetail = "";
let bowDiscussionMessageChannel = null;
let bowDiscussionDraft = "";
let bowDiscussionSendBusy = false;
const BOW_VOICE_BUCKET = "bow-item-voice";
let bowDiscussionRecorder = null;
let bowDiscussionRecordingStream = null;
let bowDiscussionAudioChunks = [];
let bowDiscussionRecordingStartedAt = 0;
let bowDiscussionRecordingTimer = null;
let bowDiscussionVoiceBusy = false;

function waitText(key) {
  return (
    WAIT_MODAL_I18N[currentLang]?.[key] ||
    WAIT_MODAL_I18N.ko[key] ||
    key
  );
}

function renderDiscussionMessages() {
  if (bowDiscussionMessagesStatus === "loading" && !bowDiscussionMessages.length) {
    return `<p class="bow-disc-message-state">${escapeHTML(waitText("messagesLoading"))}</p>`;
  }
  if (bowDiscussionMessagesStatus === "error" && !bowDiscussionMessages.length) {
    const detail = bowDiscussionMessagesErrorDetail
      ? `<small>${escapeHTML(bowDiscussionMessagesErrorDetail)}</small>`
      : "";
    return `<p class="bow-disc-message-state is-error">${escapeHTML(waitText("messagesError"))}${detail}</p>`;
  }
  if (!bowDiscussionMessages.length) {
    return `<p class="bow-disc-message-state">${escapeHTML(waitText("noMessages"))}</p>`;
  }

  const locale = currentLang === "zh" ? "zh-CN" : currentLang === "en" ? "en-US" : "ko-KR";
  return bowDiscussionMessages.map((message) => {
    const isMine = message.sender_id === currentUser?.id;
    const sender = isMine ? waitText("messageMe") : waitText("messageFriend");
    const time = message.created_at
      ? new Intl.DateTimeFormat(locale, { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(message.created_at))
      : "";
    const body = message.body ? `<p>${escapeHTML(message.body).replace(/\r?\n/g, "<br>")}</p>` : "";
    const voiceSeconds = Math.max(1, Math.ceil((message.voice_duration_ms || 1000) / 1000));
    const voiceWidth = Math.min(238, Math.max(92, 88 + Math.round(voiceSeconds * 2.4)));
    const voiceDuration = `${Math.floor(voiceSeconds / 60)}:${String(voiceSeconds % 60).padStart(2, "0")}`;
    const audio = message.voice_path
      ? (message.voice_url
        ? `<div class="bow-disc-voice-player"><button class="bow-disc-voice-note" type="button" data-discussion-play="${escapeHTML(message.id)}" style="--voice-note-width:${voiceWidth}px" aria-label="${escapeHTML(waitText("voicePlay"))}"><svg class="bow-disc-play-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.8c0-.8.9-1.3 1.6-.8l9.2 6.1a1.1 1.1 0 0 1 0 1.8l-9.2 6.1c-.7.5-1.6 0-1.6-.8z"/></svg><svg class="bow-disc-pause-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z"/></svg><span class="bow-disc-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="bow-disc-voice-duration">${voiceDuration}</span></button><audio class="bow-disc-audio" data-discussion-audio="${escapeHTML(message.id)}" preload="none" src="${escapeHTML(message.voice_url)}"></audio></div>`
        : `<small class="bow-disc-audio-pending">${escapeHTML(waitText(message.voice_url_error ? "voicePlaybackError" : "voiceLoading"))}</small>`)
      : "";
    return `<article class="bow-disc-message ${isMine ? "is-mine" : "is-friend"}${message.voice_path ? " has-voice" : ""}"><div class="bow-disc-message-meta"><strong>${escapeHTML(sender)}</strong><time datetime="${escapeHTML(message.created_at || "")}">${escapeHTML(time)}</time></div>${body}${audio}</article>`;
  }).join("");
}

async function resolveDiscussionVoiceURL(message) {
  if (!message?.voice_path || !supabaseClient) return;
  const itemKey = String(message.item_id);
  const messageKey = String(message.id);
  try {
    const { data, error } = await supabaseClient.storage
      .from(BOW_VOICE_BUCKET)
      .createSignedUrl(message.voice_path, 60 * 60);
    if (error) throw error;
    if (bowDiscussionMessageItemId !== itemKey) return;
    const storedMessage = bowDiscussionMessages.find((entry) => String(entry.id) === messageKey);
    if (!storedMessage) return;
    storedMessage.voice_url = data?.signedUrl || "";
    storedMessage.voice_url_error = !storedMessage.voice_url;
    storedMessage.voice_url_loading = false;
    renderDiscussionThread();
  } catch (error) {
    console.error("Could not create voice playback URL:", error);
    if (bowDiscussionMessageItemId !== itemKey) return;
    const storedMessage = bowDiscussionMessages.find((entry) => String(entry.id) === messageKey);
    if (!storedMessage) return;
    storedMessage.voice_url_error = true;
    storedMessage.voice_url_loading = false;
    renderDiscussionThread();
  }
}

function renderDiscussionThread() {
  const thread = $("bowDiscussionMessages");
  if (!thread) return;
  thread.innerHTML = renderDiscussionMessages();
  requestAnimationFrame(() => {
    if (thread.isConnected) thread.scrollTop = thread.scrollHeight;
  });
}

function addDiscussionMessage(message) {
  if (!message?.id || String(message.item_id) !== String(bowDiscussionMessageItemId)) return;
  if (bowDiscussionMessages.some((entry) => String(entry.id) === String(message.id))) return;
  bowDiscussionMessages.push(message);
  bowDiscussionMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  bowDiscussionMessagesStatus = "ready";
  bowDiscussionMessagesErrorDetail = "";
  renderDiscussionThread();
}

function clearDiscussionMessageChannel() {
  if (supabaseClient && bowDiscussionMessageChannel) {
    void supabaseClient.removeChannel(bowDiscussionMessageChannel);
  }
  bowDiscussionMessageChannel = null;
}

function clearDiscussionMessageContext() {
  cancelDiscussionVoiceRecording();
  clearDiscussionMessageChannel();
  bowDiscussionMessages = [];
  bowDiscussionMessageItemId = "";
  bowDiscussionMessagesStatus = "idle";
  bowDiscussionMessagesErrorDetail = "";
  bowDiscussionDraft = "";
  bowDiscussionSendBusy = false;
}

async function loadDiscussionMessages(itemId) {
  const itemKey = String(itemId);
  if (!await ensureCloudConnection()) {
    if (bowDiscussionMessageItemId === itemKey) {
      bowDiscussionMessagesStatus = "error";
      bowDiscussionMessagesErrorDetail = "Cloud connection unavailable.";
      renderDiscussionThread();
    }
    return;
  }

  if (bowDiscussionMessageItemId !== itemKey) return;

  clearDiscussionMessageChannel();
  bowDiscussionMessageChannel = supabaseClient
    .channel(`bow-item-messages:${itemKey}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "bow_item_messages",
      filter: `item_id=eq.${itemKey}`
    }, (payload) => {
      const incoming = { ...payload.new, voice_url_loading: Boolean(payload.new?.voice_path) };
      addDiscussionMessage(incoming);
      if (incoming.voice_path) void resolveDiscussionVoiceURL(incoming);
    })
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn("Discussion realtime subscription status:", status);
      }
    });

  try {
    const { data, error } = await supabaseClient
      .from("bow_item_messages")
      .select("id,item_id,sender_id,body,voice_path,voice_duration_ms,created_at")
      .eq("item_id", itemKey)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (bowDiscussionMessageItemId !== itemKey) return;

    const merged = new Map();
    for (const message of data || []) {
      merged.set(String(message.id), { ...message, voice_url_loading: Boolean(message.voice_path) });
    }
    for (const message of bowDiscussionMessages) merged.set(String(message.id), message);
    bowDiscussionMessages = [...merged.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    bowDiscussionMessagesStatus = "ready";
    bowDiscussionMessagesErrorDetail = "";
    renderWaitModal();
    for (const message of bowDiscussionMessages) {
      if (message.voice_path && !message.voice_url) void resolveDiscussionVoiceURL(message);
    }
  } catch (error) {
    console.error("Could not load discussion messages:", error);
    if (bowDiscussionMessageItemId === itemKey) {
      bowDiscussionMessagesStatus = "error";
      bowDiscussionMessagesErrorDetail = String(error?.message || error || "Unknown error").slice(0, 220);
      renderWaitModal();
    }
  }
}

function activateDiscussionMessages(itemId) {
  const itemKey = String(itemId);
  if (bowDiscussionMessageItemId === itemKey) return;
  clearDiscussionMessageContext();
  bowDiscussionMessageItemId = itemKey;
  bowDiscussionMessagesStatus = "loading";
  void loadDiscussionMessages(itemKey);
}

async function sendDiscussionMessage() {
  if (bowDiscussionSendBusy) return;
  const input = $("bowDiscussionInput");
  const body = String(input?.value ?? bowDiscussionDraft).trim();
  if (!body || !discussionId || !currentUser || String(discussionId) !== String(bowDiscussionMessageItemId)) return;
  if (body.length > 1000) {
    notify(waitText("messageSendError"));
    return;
  }
  bowDiscussionSendBusy = true;
  const sendButton = $("bowDiscussionSend");
  if (sendButton) sendButton.disabled = true;
  try {
    if (!await ensureCloudConnection()) throw new Error("Cloud connection unavailable.");
    const { data, error } = await supabaseClient
      .from("bow_item_messages")
      .insert({
        item_id: String(discussionId),
        sender_id: currentUser.id,
        body
      })
      .select("id,item_id,sender_id,body,created_at")
      .single();
    if (error) throw error;
    bowDiscussionDraft = "";
    addDiscussionMessage(data);
    renderWaitModal();
  } catch (error) {
    console.error("Could not send discussion message:", error);
    const detail = String(error?.message || "").slice(0, 180);
    notify(detail ? `${waitText("messageSendError")} (${detail})` : waitText("messageSendError"));
  } finally {
    bowDiscussionSendBusy = false;
    const inputAfterSend = $("bowDiscussionInput");
    const button = $("bowDiscussionSend");
    const canCompose = Boolean(currentUser) && Boolean(discussionId) && !bowDiscussionSendBusy;
    if (inputAfterSend) inputAfterSend.disabled = !canCompose;
    if (button) button.disabled = !canCompose;
  }
}

async function toggleDiscussionAudio(button) {
  const messageId = button?.dataset.discussionPlay;
  const audio = [...document.querySelectorAll("audio[data-discussion-audio]")]
    .find((element) => element.dataset.discussionAudio === messageId);
  if (!audio) return;

  if (!audio.paused) {
    audio.pause();
    return;
  }

  document.querySelectorAll("audio[data-discussion-audio]").forEach((otherAudio) => {
    if (otherAudio !== audio) otherAudio.pause();
  });
  document.querySelectorAll("[data-discussion-play]").forEach((playButton) => {
    playButton.classList.remove("is-playing");
    playButton.setAttribute("aria-label", waitText("voicePlay"));
  });

  audio.onplay = () => {
    button.classList.add("is-playing");
    button.setAttribute("aria-label", waitText("voicePause"));
  };
  audio.onpause = () => {
    button.classList.remove("is-playing");
    button.setAttribute("aria-label", waitText("voicePlay"));
  };
  audio.onended = () => {
    button.classList.remove("is-playing");
    button.setAttribute("aria-label", waitText("voicePlay"));
  };
  try {
    await audio.play();
  } catch (error) {
    console.error("Could not play discussion voice message:", error);
    notify(waitText("voicePlaybackError"));
  }
}

function stopDiscussionRecordingTracks() {
  if (bowDiscussionRecordingTimer) {
    clearInterval(bowDiscussionRecordingTimer);
    bowDiscussionRecordingTimer = null;
  }
  if (bowDiscussionRecordingStream) {
    for (const track of bowDiscussionRecordingStream.getTracks()) track.stop();
    bowDiscussionRecordingStream = null;
  }
}

function cancelDiscussionVoiceRecording() {
  const recorder = bowDiscussionRecorder;
  bowDiscussionRecorder = null;
  if (recorder && recorder.state !== "inactive") {
    recorder.onstop = null;
    try { recorder.stop(); } catch (_) {}
  }
  stopDiscussionRecordingTracks();
  bowDiscussionAudioChunks = [];
  bowDiscussionRecordingStartedAt = 0;
}

function updateDiscussionRecordingStatus() {
  const status = $("bowDiscussionVoiceStatus");
  if (!status) return;
  if (bowDiscussionVoiceBusy) {
    status.textContent = waitText("voiceUploading");
    return;
  }
  if (bowDiscussionRecorder?.state === "recording") {
    const seconds = Math.floor((Date.now() - bowDiscussionRecordingStartedAt) / 1000);
    status.textContent = `${waitText("voiceRecording")} ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    return;
  }
  status.textContent = "";
}

function chooseDiscussionAudioMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") return "";
  return ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"]
    .find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function discussionAudioExtension(mimeType) {
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

async function uploadDiscussionVoice(blob, durationMs, itemId) {
  if (!blob?.size || !currentUser) {
    notify(waitText("voiceEmpty"));
    return;
  }
  if (blob.size > 10 * 1024 * 1024) {
    notify(waitText("voiceSendError"));
    return;
  }
  bowDiscussionVoiceBusy = true;
  renderWaitModal();
  let uploadedPath = "";
  try {
    if (!await ensureCloudConnection()) throw new Error("Cloud connection unavailable.");
    const messageId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const mimeType = blob.type || "audio/webm";
    const path = `${itemId}/${currentUser.id}/${messageId}.${discussionAudioExtension(mimeType)}`;
    const { error: uploadError } = await supabaseClient.storage
      .from(BOW_VOICE_BUCKET)
      .upload(path, blob, { contentType: mimeType, upsert: false });
    if (uploadError) throw uploadError;
    uploadedPath = path;

    const { data, error } = await supabaseClient
      .from("bow_item_messages")
      .insert({
        item_id: String(itemId),
        sender_id: currentUser.id,
        body: null,
        voice_path: path,
        voice_duration_ms: durationMs
      })
      .select("id,item_id,sender_id,body,voice_path,voice_duration_ms,created_at")
      .single();
    if (error) throw error;
    // The object is now referenced by a saved database row; never delete it if
    // later UI rendering or playback-link creation fails.
    uploadedPath = "";
    const savedMessage = { ...data, voice_url_loading: true };
    addDiscussionMessage(savedMessage);
    void resolveDiscussionVoiceURL(savedMessage);
    notify(waitText("voiceSaved"));
  } catch (error) {
    console.error("Could not send discussion voice message:", error);
    if (uploadedPath && supabaseClient) {
      void supabaseClient.storage.from(BOW_VOICE_BUCKET).remove([uploadedPath]);
    }
    const detail = String(error?.message || "").slice(0, 180);
    notify(detail ? `${waitText("voiceSendError")} (${detail})` : waitText("voiceSendError"));
  } finally {
    bowDiscussionVoiceBusy = false;
    if (discussionId && String(discussionId) === String(itemId)) renderWaitModal();
  }
}

async function toggleDiscussionVoiceRecording() {
  if (bowDiscussionRecorder?.state === "recording") {
    bowDiscussionRecorder.stop();
    return;
  }
  if (bowDiscussionVoiceBusy || !discussionId || !currentUser) return;
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    notify(waitText("voiceUnsupported"));
    return;
  }

  const itemId = String(discussionId);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (String(discussionId) !== itemId || !$('waitModal')?.classList.contains('open')) {
      for (const track of stream.getTracks()) track.stop();
      return;
    }
    bowDiscussionRecordingStream = stream;
    bowDiscussionAudioChunks = [];
    const mimeType = chooseDiscussionAudioMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    bowDiscussionRecorder = recorder;
    bowDiscussionRecordingStartedAt = Date.now();
    recorder.ondataavailable = (event) => {
      if (event.data?.size) bowDiscussionAudioChunks.push(event.data);
    };
    recorder.onerror = (event) => {
      console.error("Discussion voice recorder error:", event.error || event);
      notify(waitText("voiceSendError"));
    };
    recorder.onstop = () => {
      const chunks = bowDiscussionAudioChunks;
      const durationMs = Math.max(500, Date.now() - bowDiscussionRecordingStartedAt);
      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
      bowDiscussionRecorder = null;
      bowDiscussionAudioChunks = [];
      bowDiscussionRecordingStartedAt = 0;
      stopDiscussionRecordingTracks();
      if (!blob.size) {
        notify(waitText("voiceEmpty"));
        renderWaitModal();
        return;
      }
      void uploadDiscussionVoice(blob, durationMs, itemId);
    };
    // Request periodic chunks so short recordings are still captured reliably.
    recorder.start(500);
    renderWaitModal();
    bowDiscussionRecordingTimer = setInterval(() => {
      updateDiscussionRecordingStatus();
      if (Date.now() - bowDiscussionRecordingStartedAt >= 60_000 && bowDiscussionRecorder?.state === "recording") {
        bowDiscussionRecorder.stop();
      }
    }, 500);
  } catch (error) {
    console.error("Could not start discussion voice recording:", error);
    notify(error?.name === "NotAllowedError" ? waitText("voicePermission") : waitText("voiceSendError"));
    stopDiscussionRecordingTracks();
    bowDiscussionRecorder = null;
    bowDiscussionAudioChunks = [];
  }
}

/* ==========================================
   CREATE WAIT MODAL
========================================== */

function createWaitModal() {
  let modal = $("waitModal");

  if (modal) {
    return modal;
  }

  modal = document.createElement("div");

  modal.id = "waitModal";
  modal.className = "wait-modal";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <div class="wait-modal-backdrop"
         data-wait-close></div>

    <section
      class="wait-modal-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitModalTitle"
    >
      <button
        type="button"
        class="wait-modal-close"
        data-wait-close
        aria-label="Close"
      >×</button>

      <header class="wait-modal-header">
        <h2 id="waitModalTitle"></h2>
        <p id="waitModalDescription"></p>
      </header>

      <div
        class="wait-modal-tabs"
        id="waitModalTabs"
      ></div>

      <h3
        class="wait-modal-section-title"
        id="waitModalSectionTitle"
      ></h3>

      <div
        class="wait-modal-grid"
        id="waitModalGrid"
      ></div>
    </section>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", async (event) => {
    const closeButton = event.target.closest(
      "[data-wait-close]"
    );

    if (closeButton) {
      closeWaitModal();
      return;
    }

    const playButton = event.target.closest("[data-discussion-play]");
    if (playButton) { void toggleDiscussionAudio(playButton); return; }

    const voiceButton = event.target.closest("[data-discussion-voice]");
    if (voiceButton) { void toggleDiscussionVoiceRecording(); return; }

    const detail = event.target.closest('[data-discussion-id]');
    if (detail) { discussionId = detail.dataset.discussionId; renderWaitModal(); return; }
    if (event.target.closest('[data-discussion-back]')) { discussionId = null; renderWaitModal(); return; }
    const tabButton = event.target.closest(
      "[data-wait-tab]"
    );

    if (tabButton) {
      discussionId = null;
      waitModalTab = tabButton.dataset.waitTab;
      renderWaitModal();
      return;
    }

    const actionButton = event.target.closest(
      "[data-wait-action]"
    );

    if (actionButton) {
      const itemId = actionButton.dataset.waitId;
      const nextStatus = actionButton.dataset.waitAction;

      if (nextStatus === "satisfaction") {
        satisfactionOpenItemId = satisfactionOpenItemId === String(itemId)
          ? null
          : String(itemId);
        renderWaitModal();
        return;
      }
      if (nextStatus === "set-satisfaction") {
        await updateWaitSatisfaction(itemId, actionButton.dataset.waitValue);
        return;
      }
      await updateWaitItem(itemId, nextStatus);
    }
  });

  modal.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-discussion-compose]");
    if (!form) return;
    event.preventDefault();
    await sendDiscussionMessage();
  });

  modal.addEventListener("input", (event) => {
    if (event.target.matches("[data-discussion-input]")) {
      bowDiscussionDraft = event.target.value;
    }
  });

  return modal;
}

/* ==========================================
   OPEN WAIT MODAL
========================================== */

function openWaitModal(tab = "waiting") {
  const modal = createWaitModal();

  discussionId = null;
  const allowedTabs = ["waiting", "bought"];
  waitModalTab = allowedTabs.includes(tab) ? tab : "waiting";

  modal.hidden = false;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  document.body.classList.add("locked");

  renderWaitModal();
  void bowRefreshShared();
}

/* ==========================================
   CLOSE WAIT MODAL
========================================== */

function closeWaitModal() {
  const modal = $("waitModal");

  if (!modal) {
    return;
  }

  modal.classList.remove("open");
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  clearDiscussionMessageContext();

  document.body.classList.remove("locked");

  // Discard the unfinished draft, including the preview and comparison.
  resetUploadForm();
  hideOverlayIfUnused();
}

/* ==========================================
   WAIT MODAL PHOTO
========================================== */

function renderWaitPhoto(item) {
  const photoURL = getPhotoURL(item);

  if (!photoURL) {
    return `
      <div class="wait-photo-empty">
        <span aria-hidden="true">♡</span>
      </div>
    `;
  }

  return `
    <img
      src="${escapeHTML(photoURL)}"
      alt="${escapeHTML(item.name)}"
      loading="lazy"
      class="wait-product-image"
      onerror="
        this.style.display='none';
        this.parentElement.classList.add('photo-error');
      "
    >
  `;
}

/* ==========================================
   WAIT MODAL ACTION BUTTONS
========================================== */

function renderWaitActions(item) {
  const status = getItemStatus(item);
  const id = escapeHTML(item.id);

  if (status === "waiting" || status === "thinking") {
    return `
      <button
        type="button"
        class="wait-action wait-action-thinking"
        data-wait-action="delete"
        data-wait-id="${id}"
      >
        ${escapeHTML(waitText("rethink"))}
      </button>

      <button
        type="button"
        class="wait-action wait-action-bought"
        data-wait-action="bought"
        data-wait-id="${id}"
      >
        ${escapeHTML(waitText("boughtAction"))}
      </button>
    `;
  }

  const currentRating = item.satisfaction
    ? `<small>${escapeHTML(waitText("satisfactionSaved"))}: ${escapeHTML(waitText(`satisfaction${item.satisfaction[0].toUpperCase()}${item.satisfaction.slice(1)}`))}</small>`
    : "";
  const ratingOptions = satisfactionOpenItemId === String(item.id)
    ? `<div class="wait-satisfaction-options" role="group" aria-label="${escapeHTML(waitText("satisfactionAction"))}">
        ${["love", "okay", "regret"].map((value) => `
          <button type="button" class="wait-satisfaction-choice ${item.satisfaction === value ? "selected" : ""}"
            data-wait-action="set-satisfaction" data-wait-id="${id}" data-wait-value="${value}"
            aria-pressed="${item.satisfaction === value}">
            ${escapeHTML(waitText(`satisfaction${value[0].toUpperCase()}${value.slice(1)}`))}
          </button>
        `).join("")}
      </div>`
    : "";

  return `
    <button type="button" class="wait-action wait-action-satisfaction"
      data-wait-action="satisfaction" data-wait-id="${id}"
      aria-expanded="${satisfactionOpenItemId === String(item.id)}">
      ${escapeHTML(waitText("satisfactionAction"))}${currentRating}
    </button>
    ${ratingOptions}
  `;
}

/* ==========================================
   WAIT PRODUCT CARD
========================================== */

function renderWaitProduct(item, index) {
  if (getItemStatus(item) !== "bought") return `<button type="button" class="bow-disc-card" data-discussion-id="${escapeHTML(item.id)}"><div class="wait-product-photo">${renderWaitPhoto(item)}</div><strong>${escapeHTML(formatPrice(item))}</strong><small>${escapeHTML(waitText("waiting"))}</small></button>`;
  const colors = [
    "#f8dce6",
    "#dcecf5",
    "#e9eedb",
    "#fbe7cd"
  ];

  const background =
    colors[index % colors.length];

  return `
    <article
      class="wait-product"
      style="background:${background}"
    >
      <div class="wait-product-photo">
        ${renderWaitPhoto(item)}
      </div>

      <div class="wait-product-price">
        ${escapeHTML(formatPrice(item))}
      </div>

      <div class="wait-product-actions">
        ${renderWaitActions(item)}
      </div>
    </article>
  `;
}

/* ==========================================
   RENDER WAIT MODAL
========================================== */

function renderWaitModal() {
  const modal = $("waitModal");

  if (!modal || modal.hidden) {
    return;
  }

  const title = $("waitModalTitle");
  const description = $("waitModalDescription");
  const tabs = $("waitModalTabs");
  const section = $("waitModalSectionTitle");
  const grid = $("waitModalGrid");

  if (
    !title ||
    !description ||
    !tabs ||
    !section ||
    !grid
  ) {
    return;
  }

  title.textContent = waitText("title");
  description.textContent =
    waitText("description");

  const counts = getStatusCounts();

  const statuses = ["waiting", "bought"];

  tabs.innerHTML = statuses
    .map((status) => {
      const active =
        waitModalTab === status;

      return `
        <button
          type="button"
          class="wait-tab ${active ? "active" : ""}"
          data-wait-tab="${status}"
          aria-pressed="${active}"
        >
          <span>
            ${escapeHTML(waitText(status))}
          </span>

          <strong>
            ${status === "waiting" ? counts.waiting + counts.thinking + bowSharedItems.length : counts.bought}
          </strong>
        </button>
      `;
    })
    .join("");

  const sectionTitles = {
    waiting: "waitingTitle",
    thinking: "thinkingTitle",
    bought: "boughtTitle"
  };

  section.textContent = waitText(
    sectionTitles[waitModalTab]
  );

  const visibleItems = waitModalTab === "waiting"
    ? [...finds, ...bowSharedItems].filter(item => ["waiting", "thinking"].includes(getItemStatus(item)))
    : getItemsByStatus("bought");

  const selected = waitModalTab === "waiting" && visibleItems.find(item => String(item.id) === discussionId);
  grid.classList.toggle('bow-disc-detail-grid', Boolean(selected));
  if (selected) {
    activateDiscussionMessages(selected.id);
    const count = finds.filter(x => getItemStatus(x)==='bought' && x.category===selected.category).length;
    const canCompose = Boolean(currentUser) && Boolean(discussionId) && !bowDiscussionSendBusy;
    const messages = renderDiscussionMessages();
    grid.innerHTML = `<section class="bow-disc-detail"><button type="button" class="bow-disc-back" data-discussion-back>${escapeHTML(currentLang === "zh" ? "返回列表" : currentLang === "en" ? "Back to list" : "목록으로")}</button><div class="bow-disc-summary"><div class="wait-product-photo">${renderWaitPhoto(selected)}</div><div><strong>${escapeHTML(formatPrice(selected))}</strong><p>${escapeHTML(t(CATEGORY_KEYS[selected.category] || 'catOther'))}</p><p>${escapeHTML(selected.name)}</p></div></div><p class="bow-disc-similar">${escapeHTML(currentLang === "zh" ? "同类已购买物品" : currentLang === "en" ? "Bought in this category" : "같은 카테고리의 구매한 소품")}: ${count}</p><h3>${escapeHTML(currentLang === "zh" ? "和朋友的留言" : currentLang === "en" ? "Conversation with your friend" : "친구와 나눈 이야기")}</h3><div class="bow-disc-messages" id="bowDiscussionMessages" aria-live="polite" aria-relevant="additions text">${messages}</div><form class="bow-disc-compose" data-discussion-compose><input id="bowDiscussionInput" data-discussion-input type="text" maxlength="1000" autocomplete="off" placeholder="${escapeHTML(waitText("messagePlaceholder"))}" value="${escapeHTML(bowDiscussionDraft)}" ${canCompose ? "" : "disabled"}><button class="bow-disc-voice${bowDiscussionRecorder?.state === "recording" ? " is-recording" : ""}" data-discussion-voice type="button" aria-pressed="${bowDiscussionRecorder?.state === "recording" ? "true" : "false"}" aria-label="${escapeHTML(waitText(bowDiscussionRecorder?.state === "recording" ? "voiceStop" : "voiceStart"))}" title="${escapeHTML(waitText(bowDiscussionRecorder?.state === "recording" ? "voiceStop" : "voiceStart"))}" ${canCompose && !bowDiscussionVoiceBusy ? "" : "disabled"}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg></button><span class="bow-disc-voice-status" id="bowDiscussionVoiceStatus">${bowDiscussionRecorder?.state === "recording" ? escapeHTML(waitText("voiceRecording")) : bowDiscussionVoiceBusy ? escapeHTML(waitText("voiceUploading")) : ""}</span><button id="bowDiscussionSend" class="bow-disc-send" type="submit" ${canCompose ? "" : "disabled"}>${escapeHTML(waitText("messageSend"))}</button></form><div class="bow-disc-actions">${selected.user_id === currentUser?.id ? renderWaitActions(selected) : ""}</div></section>`;
    renderDiscussionThread();
    return;
  }
  if (bowDiscussionMessageItemId) clearDiscussionMessageContext();
  discussionId = null;
  if (!visibleItems.length) {
    grid.innerHTML = `
      <p class="wait-modal-empty">
        ${escapeHTML(waitText("empty"))}
      </p>
    `;

    return;
  }

  grid.innerHTML = visibleItems
    .map(renderWaitProduct)
    .join("");
}

/* ==========================================
   UPDATE STATUS INSIDE WAIT MODAL
========================================== */

async function updateWaitSatisfaction(itemId, satisfaction) {
  if (waitModalBusy) return;
  waitModalBusy = true;
  const modal = $("waitModal");
  if (modal) modal.classList.add("updating");
  try {
    await updateCloudItemSatisfaction(itemId, satisfaction);
    satisfactionOpenItemId = null;
    renderWaitModal();
  } catch (error) {
    console.error("Purchase satisfaction update failed:", error);
    notify(`${t("updateError")}: ${error.message}`);
  } finally {
    waitModalBusy = false;
    if (modal) modal.classList.remove("updating");
  }
}

async function updateWaitItem(itemId, nextStatus) {
  if (waitModalBusy) {
    return;
  }

  const allowedStatuses = ["waiting", "bought", "delete"];

  if (!allowedStatuses.includes(nextStatus)) {
    console.error(
      "Invalid wait status:",
      nextStatus
    );

    return;
  }

  const item = finds.find(
    (entry) =>
      String(entry.id) === String(itemId)
  );

  if (!item) {
    return;
  }

  waitModalBusy = true;

  const modal = $("waitModal");

  if (modal) {
    modal.classList.add("updating");
  }

  try {
    if (nextStatus === "delete") {
      await recordNotBuyingAndRemove(itemId);
    } else {
      await updateCloudItemStatus(itemId, nextStatus);
    }

    // 状态更新成功后，商品会自动从当前分类
    // 移动到对应的 waiting / thinking / bought 分类。

    // 保持原来的弹窗打开，不跳转首页。
    renderWaitModal();

  } catch (error) {
    console.error(
      "Wait item update failed:",
      error
    );

    notify(
      `${t("updateError")}: ${error.message}`
    );
  } finally {
    waitModalBusy = false;

    if (modal) {
      modal.classList.remove("updating");
    }
  }
}

/* ==========================================
   WAIT MODAL KEYBOARD SUPPORT
========================================== */

function initializeWaitModalKeyboard() {
  if (document.body.dataset.waitKeyboardReady) {
    return;
  }

  document.body.dataset.waitKeyboardReady = "true";

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape") {
        return;
      }

      const modal = $("waitModal");

      if (
        modal &&
        !modal.hidden &&
        modal.classList.contains("open")
      ) {
        closeWaitModal();
      }
    }
  );
}

/* ==========================================
   PART 6 / 7
   UPLOAD MODAL AND PHOTO HANDLING
========================================== */

/* ==========================================
   UPLOAD FORM HELPERS
========================================== */

function getUploadDialog() {
  return $("uploadDialog");
}

function getUploadForm() {
  return $("uploadForm");
}

function getUploadPhotoInput() {
  return $("itemPhoto");
}

function getUploadSubmitButton() {
  return document.querySelector(
    '#uploadForm button[type="submit"]'
  );
}

/* ==========================================
   UPLOAD FORM ERROR
========================================== */

function formError(message = "") {
  const errorElement = $("formError");

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.hidden = !message;
  }

  if (message) {
    console.error(
      "[BUY OR WAIT?] Upload:",
      message
    );
  }
}

/* ==========================================
   OPEN UPLOAD MODAL
========================================== */

function openUpload() {
  const dialog = getUploadDialog();

  if (!dialog) {
    console.error(
      "Upload dialog #uploadDialog was not found."
    );

    return;
  }

  // Every new opening starts with a blank, unsaved item.
  resetUploadForm();

  if (typeof closeDrawer === "function") {
    closeDrawer();
  }

  if (typeof closeWaitModal === "function") {
    const waitModal = $("waitModal");

    if (waitModal && !waitModal.hidden) {
      closeWaitModal();
    }
  }

  if (typeof dialog.showModal === "function") {
    if (!dialog.open) {
      dialog.showModal();
    }
  } else {
    dialog.hidden = false;
    dialog.classList.add("open");
  }

  document.body.classList.add("locked");
}

/* ==========================================
   CLOSE UPLOAD MODAL
========================================== */

function closeUpload() {
  const dialog = getUploadDialog();

  if (!dialog) {
    return;
  }

  if (
    typeof dialog.close === "function" &&
    dialog.open
  ) {
    dialog.close();
  } else {
    dialog.classList.remove("open");
    dialog.hidden = true;
  }

  document.body.classList.remove("locked");

  hideOverlayIfUnused();
}

/* ==========================================
   IMAGE VALIDATION
========================================== */

function validateUploadImage(file) {
  if (!file) {
    return true;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(t("imageInvalid"));
  }

  const maximumSize = 5 * 1024 * 1024;

  if (file.size > maximumSize) {
    throw new Error(t("imageInvalid"));
  }

  return true;
}

/* ==========================================
   IMAGE COMPRESSION
========================================== */

function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    let objectURL = "";

    try {
      validateUploadImage(file);

      objectURL = URL.createObjectURL(file);

      const image = new Image();

      image.onload = () => {
        try {
          const maximumDimension = 1200;

          const scale = Math.min(
            1,
            maximumDimension /
              Math.max(image.width, image.height)
          );

          const width = Math.max(
            1,
            Math.round(image.width * scale)
          );

          const height = Math.max(
            1,
            Math.round(image.height * scale)
          );

          const canvas =
            document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error(
              "Image canvas is unavailable."
            );
          }

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectURL);

              if (!blob) {
                reject(
                  new Error(
                    "Image compression failed."
                  )
                );

                return;
              }

              const compressedFile = new File(
                [blob],
                "buy-or-wait-photo.jpg",
                {
                  type: "image/jpeg"
                }
              );

              resolve(compressedFile);
            },
            "image/jpeg",
            0.85
          );
        } catch (error) {
          URL.revokeObjectURL(objectURL);
          reject(error);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectURL);

        reject(
          new Error(t("imageError"))
        );
      };

      image.src = objectURL;
    } catch (error) {
      if (objectURL) {
        URL.revokeObjectURL(objectURL);
      }

      reject(error);
    }
  });
}

/* ==========================================
   PHOTO PREVIEW
========================================== */

function clearPhotoPreview() {
  if (photoPreviewURL) {
    URL.revokeObjectURL(photoPreviewURL);
    photoPreviewURL = "";
  }

  const preview = $("photoPreview");
  const prompt = $("photoPrompt");

  if (preview) {
    preview.hidden = true;
    preview.removeAttribute("src");
  }

  if (prompt) {
    prompt.hidden = false;
  }
}

async function handlePhotoPreview(event) {
  const input = event.target;
  const file = input.files?.[0];

  if (!file) {
    clearPhotoPreview();
    return;
  }

  try {
    validateUploadImage(file);

    const compressedFile =
      await shrinkImage(file);

    if (!compressedFile) {
      throw new Error(t("imageError"));
    }

    clearPhotoPreview();

    photoPreviewURL =
      URL.createObjectURL(compressedFile);

    const preview = $("photoPreview");
    const prompt = $("photoPrompt");

    if (preview) {
      preview.src = photoPreviewURL;
      preview.hidden = false;
    }

    if (prompt) {
      prompt.hidden = true;
    }

    formError("");
  } catch (error) {
    console.error(
      "Photo preview failed:",
      error
    );

    input.value = "";

    clearPhotoPreview();

    formError(
      error.message || t("imageError")
    );
  }
}

/* ==========================================
   UPLOAD FORM VALUES
========================================== */

function getUploadFormValues() {
  const name =
    $("itemName")?.value.trim() || "";

  const priceText =
    $("itemPrice")?.value.trim() || "";

  const category =
    $("itemCategory")?.value ||
    "Other cute things";

  const note =
    $("itemNote")?.value.trim() || "";

  if (!name) {
    throw new Error(t("needName"));
  }

  if (priceText === "") {
    throw new Error(
      currentLang === "ko"
        ? "가격을 입력해 주세요."
        : currentLang === "zh"
          ? "请填写价格。"
          : "Please enter a price."
    );
  }

  let price = 0;

  if (priceText !== "") {
    const normalizedPrice = priceText
      .replace(/,/g, "")
      .replace(/\s/g, "");

    price = Number(normalizedPrice);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        currentLang === "ko"
          ? "올바른 가격을 입력해 주세요."
          : currentLang === "zh"
            ? "请输入正确的价格。"
            : "Please enter a valid price."
      );
    }
  }

  return {
    name,
    price,
    category,
    note,
    currency: currentLang === "zh" ? "CNY" : currentLang === "en" ? "USD" : "KRW"
  };
}

/* ==========================================
   UPLOAD BUTTON LOADING STATE
========================================== */

function setUploadSavingState(isSaving) {
  const button = getUploadSubmitButton();

  if (!button) {
    return;
  }

  button.disabled = Boolean(isSaving);

  button.textContent = isSaving
    ? t("saving")
    : t("save");

  button.setAttribute(
    "aria-busy",
    String(Boolean(isSaving))
  );
}

/* ==========================================
   SAVE NEW FIND
========================================== */

async function saveNewFind(event) {
  event.preventDefault();

  if (busy) {
    return;
  }

  let uploadedPhotoPath = "";
  let itemSaved = false;

  try {
    const values = getUploadFormValues();

    const connected =
      await ensureCloudConnection();

    if (!connected) {
      throw new Error(t("connectionError"));
    }

    setBusy(true);
    setUploadSavingState(true);
    formError("");

    const photoInput = getUploadPhotoInput();
    const originalFile = photoInput?.files?.[0];

    if (originalFile) {
      validateUploadImage(originalFile);

      const compressedFile =
        await shrinkImage(originalFile);

      uploadedPhotoPath =
        await uploadPhoto(compressedFile);
    }

    const savedItem = await insertCloudItem({
      name: values.name,
      price: values.price,
      category: values.category,
      note: values.note,
      currency: values.currency,
      photo_path: uploadedPhotoPath,
      status: "waiting"
    });

    if (!savedItem) {
      throw new Error(t("saveError"));
    }

    itemSaved = true;

    const form = getUploadForm();

    if (form) {
      form.reset();
    }

    clearPhotoPreview();
    formError("");

    closeUpload();

    notify(t("saved"));

    // 保存成功后不强制跳转首页的商品区域。
    // 用户可以继续在原来的位置浏览网站。

  } catch (error) {
    console.error(
      "Save new find failed:",
      error
    );

    formError(
      `${t("saveError")}: ${error.message}`
    );

    if (
      uploadedPhotoPath &&
      !itemSaved &&
      supabaseClient
    ) {
      try {
        const { error: cleanupError } =
          await supabaseClient.storage
            .from(BUCKET)
            .remove([uploadedPhotoPath]);

        if (cleanupError) {
          console.warn(
            "Photo cleanup failed:",
            cleanupError
          );
        }
      } catch (cleanupError) {
        console.warn(
          "Photo cleanup failed:",
          cleanupError
        );
      }
    }
  } finally {
    setBusy(false);
    setUploadSavingState(false);
  }
}

/* ==========================================
   RESET UPLOAD FORM
========================================== */

function resetUploadForm() {
  const form = getUploadForm();

  if (form) {
    form.reset();
  }

  clearPhotoPreview();
  formError("");
  similarSaveApproved = false;

  const comparison = $("similarCompareArea");
  if (comparison) {
    comparison.hidden = true;
    comparison.innerHTML = "";
  }
}

/* ==========================================
   INITIALIZE UPLOAD EVENTS
========================================== */

function initializeUploadEvents() {
  const dialog = getUploadDialog();
  const form = getUploadForm();
  const photoInput = getUploadPhotoInput();

  if (
    form &&
    !form.dataset.uploadEventsReady
  ) {
    form.dataset.uploadEventsReady = "true";

    form.addEventListener(
      "submit",
      saveNewFind
    );
  }

  if (
    photoInput &&
    !photoInput.dataset.previewEventsReady
  ) {
    photoInput.dataset.previewEventsReady = "true";

    photoInput.addEventListener(
      "change",
      handlePhotoPreview
    );
  }

  if (
    dialog &&
    !dialog.dataset.dialogEventsReady
  ) {
    dialog.dataset.dialogEventsReady = "true";

    dialog.addEventListener(
      "click",
      (event) => {
        if (event.target === dialog) {
          closeUpload();
        }
      }
    );

    dialog.addEventListener(
      "close",
      () => {
        document.body.classList.remove("locked");
        resetUploadForm();
      }
    );
  }

  const closeButton = $("closeUpload");

  if (
    closeButton &&
    !closeButton.dataset.closeEventsReady
  ) {
    closeButton.dataset.closeEventsReady = "true";

    closeButton.addEventListener(
      "click",
      closeUpload
    );
  }
}

/* ==========================================
   END OF PART 6 / 7
========================================== */

/* ==========================================
   PART 7 / 7
   FINAL CONNECTIONS AND APPLICATION START
========================================== */

/* ==========================================
   LOAD SUPABASE LIBRARY
========================================== */

function loadSupabaseLibrary() {
  return new Promise((resolve, reject) => {
    if (
      window.supabase &&
      typeof window.supabase.createClient === "function"
    ) {
      resolve();
      return;
    }

    const existingScript =
      document.querySelector(
        'script[data-bow-supabase-library]'
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => resolve(),
        { once: true }
      );

      existingScript.addEventListener(
        "error",
        () => reject(
          new Error("Supabase library failed to load.")
        ),
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";

    script.dataset.bowSupabaseLibrary = "true";

    script.onload = () => {
      if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
      ) {
        resolve();
      } else {
        reject(
          new Error("Supabase library is unavailable.")
        );
      }
    };

    script.onerror = () => {
      reject(
        new Error("Supabase library failed to load.")
      );
    };

    document.head.appendChild(script);
  });
}

/* ==========================================
   PRIVATE STORAGE PHOTO SUPPORT
========================================== */

const originalCloudFindsLoader = loadCloudFinds;

loadCloudFinds = async function () {
  const items = await originalCloudFindsLoader();

  if (!supabaseClient || !currentUser) {
    return items;
  }

  await Promise.all(
    finds.map(async (item) => {
      const path = item.photo_path;

      if (!path) {
        return;
      }

      if (
        /^https?:\/\//i.test(path) ||
        path.startsWith("data:")
      ) {
        item.photo_url = path;
        return;
      }

      try {
        const { data, error } =
          await supabaseClient.storage
            .from(BUCKET)
            .createSignedUrl(
              path,
              60 * 60
            );

        if (!error && data?.signedUrl) {
          item.photo_url = data.signedUrl;
        } else {
          console.warn(
            "Signed photo URL unavailable:",
            path,
            error
          );
        }
      } catch (error) {
        console.warn(
          "Could not load photo:",
          path,
          error
        );
      }
    })
  );

  saveLocalBackup();
  render();

  const modal = $("waitModal");

  if (
    modal &&
    !modal.hidden &&
    modal.classList.contains("open")
  ) {
    renderWaitModal();
  }

  return finds;
};

/* ==========================================
   RESTORE ORIGINAL PAGE COUNTERS
========================================== */

function renderOriginalCounters() {
  const counts = getStatusCounts();

  const waitingTotal =
    counts.waiting + counts.thinking;

  const values = {
    wishlistCount: waitingTotal,
    drawerCount: waitingTotal,
    waitingTotal,
    boughtTotal: counts.bought
  };

  Object.entries(values).forEach(
    ([id, value]) => {
      const element = $(id);

      if (element) {
        element.textContent = String(value);
      }
    }
  );
}

/* ==========================================
   ORIGINAL WISHLIST DRAWER CONTENT
========================================== */

function renderDrawerItems() {
  const container = $("drawerItems");

  if (!container) {
    return;
  }

  if (!finds.length) {
    container.innerHTML = `
      <div class="drawer-empty">
        <div class="empty-icon">♡</div>
        <p>${escapeHTML(t("drawerEmpty"))}</p>
      </div>
    `;

    return;
  }

  container.innerHTML = finds.map((item) => {
    const image = getPhotoURL(item);

    return `
      <div class="drawer-item">
        ${
          image
            ? `
              <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(item.name)}"
                loading="lazy"
              >
            `
            : `
              <div class="drawer-placeholder">
                🎀
              </div>
            `
        }

        <div>
          <h3>${escapeHTML(item.name)}</h3>

          <small>
            ${escapeHTML(
              getCategoryLabel(item.category)
            )}
            ·
            ${escapeHTML(formatPrice(item))}
          </small>

          <div class="drawer-item-actions">
            <button
              type="button"
              data-bow-drawer-action="open"
              data-bow-drawer-id="${escapeHTML(item.id)}"
            >
              ${escapeHTML(
                getItemStatusLabel(item)
              )}
            </button>

            <button
              type="button"
              data-bow-drawer-action="delete"
              data-bow-drawer-id="${escapeHTML(item.id)}"
            >
              ${escapeHTML(t("remove"))}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ==========================================
   COMPATIBLE MAIN RENDER
========================================== */

const originalMainRender = render;

render = function () {
  originalMainRender();

  renderOriginalCounters();
  renderDrawerItems();
};

/* ==========================================
   DRAWER FUNCTIONS
========================================== */

function openDrawer() {
  const drawer = $("wishlistDrawer");

  if (!drawer) {
    openWaitModal("waiting");
    return;
  }

  renderDrawerItems();

  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");

  drawer.style.position = "fixed";
  drawer.style.left = "50%";
  drawer.style.top = "50%";
  drawer.style.right = "auto";
  drawer.style.bottom = "auto";
  drawer.style.width = "min(92vw, 720px)";
  drawer.style.maxWidth = "720px";
  drawer.style.maxHeight = "85vh";
  drawer.style.height = "auto";
  drawer.style.overflowY = "auto";
  drawer.style.transform = "translate(-50%, -50%)";
  drawer.style.borderRadius = "24px";
  drawer.style.zIndex = "1001";

  showOverlay();

  document.body.classList.add("locked");
}

function closeDrawer() {
  const drawer = $("wishlistDrawer");

  if (drawer) {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    drawer.style.transform = "";
  }

  const overlay = $("overlay");

  if (overlay) {
    overlay.hidden = true;
    overlay.classList.remove("open");
  }

  document.body.classList.remove("locked");

  hideOverlayIfUnused();
}

/* ==========================================
   WAIT MODAL CSS COMPATIBILITY
========================================== */

function installWaitModalStyles() {
  if ($("bowWaitModalCompatibilityStyles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "bowWaitModalCompatibilityStyles";

  style.textContent = `
    #waitModal.wait-modal {
      position: fixed !important;
      inset: 0 !important;
      z-index: 9999 !important;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 20px !important;
      border: 0 !important;
      background: transparent !important;
      box-sizing: border-box !important;
      overflow-y: auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transform: none !important;
    }

    #waitModal.wait-modal[hidden] {
      display: none !important;
    }

    #waitModal .wait-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(43, 38, 45, 0.48);
    }

    #waitModal .wait-modal-panel {
      position: relative;
      z-index: 1;
      width: min(100%, 820px);
      max-height: min(88vh, 900px);
      overflow-y: auto;
      padding: 36px 28px;
      background: #fffdf9;
      border: 2px solid #3c3335;
      border-radius: 26px;
      box-shadow: 8px 9px 0 rgba(45, 40, 45, 0.18);
      box-sizing: border-box;
    }

    #waitModal .wait-modal-close {
      position: absolute;
      top: 14px;
      right: 18px;
      width: 38px;
      height: 38px;
      border: 1px solid #4c4146;
      border-radius: 50%;
      background: #fff;
      color: #352d31;
      font-size: 26px;
      line-height: 1;
      cursor: pointer;
    }

    #waitModal .wait-modal-header {
      text-align: center;
      padding: 6px 28px 16px;
    }

    #waitModal .wait-modal-header h2 {
      margin: 0 0 10px;
      font-size: clamp(24px, 4vw, 34px);
      color: #3a3035;
    }

    #waitModal .wait-modal-header p {
      margin: 0;
      color: #766a6e;
      line-height: 1.6;
    }

    #waitModal .wait-modal-tabs {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      margin: 20px 0 26px;
    }

    #waitModal .wait-tab {
      min-width: 0;
      padding: 14px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border: 2px solid #4b4246;
      border-radius: 15px;
      background: #fff;
      color: #3b3337;
      font: inherit;
      cursor: pointer;
      transition: transform .15s, background .15s;
    }

    #waitModal .wait-tab.active {
      background: #fce5a5;
      transform: translateY(-2px);
      box-shadow: 2px 3px 0 #4b4246;
    }

    #waitModal .wait-tab strong {
      font-size: 21px;
    }

    #waitModal .wait-modal-section-title {
      margin: 0 0 18px;
      text-align: center;
      color: #44383d;
      font-size: 19px;
    }

    #waitModal .wait-modal-grid {
      display: grid;
      grid-template-columns: repeat(
        auto-fit,
        minmax(min(100%, 220px), 1fr)
      );
      gap: 18px;
    }

    #waitModal .wait-product {
      min-width: 0;
      padding: 16px;
      border: 2px solid #51484a;
      border-radius: 18px;
      box-shadow: 3px 4px 0 rgba(50, 45, 50, .12);
    }

    #waitModal .wait-product-photo {
      width: 100%;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 12px;
      background: rgba(255,255,255,.75);
    }

    #waitModal .wait-product-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    #waitModal .wait-photo-empty {
      font-size: 45px;
      color: #a68b95;
    }

    #waitModal .wait-product-price {
      padding: 14px 4px 12px;
      text-align: center;
      color: #383037;
      font-size: 20px;
      font-weight: 700;
    }

    #waitModal .wait-product-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    #waitModal .wait-action {
      flex: 1 1 90px;
      min-height: 43px;
      padding: 8px;
      border: 1.5px solid #51474a;
      border-radius: 11px;
      background: #fffdf8;
      color: #40363a;
      font: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    #waitModal .wait-action-bought {
      background: #fce4a3;
    }

    #waitModal .wait-action-thinking {
      background: #f9dce6;
    }

    #waitModal .wait-action-waiting {
      background: #dcecf5;
    }

    #waitModal .wait-action-satisfaction {
      flex-basis: 100%;
      background: #dcecf5;
    }

    #waitModal .wait-action-satisfaction small {
      display: block;
      margin-top: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    #waitModal .wait-satisfaction-options {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
      flex: 1 0 100%;
    }

    #waitModal .wait-satisfaction-choice {
      min-height: 39px;
      padding: 7px 10px;
      border: 1.5px solid #51474a;
      border-radius: 10px;
      background: #fffdf8;
      color: #40363a;
      font: inherit;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }

    #waitModal .wait-satisfaction-choice.selected {
      background: #fce4a3;
      box-shadow: inset 0 0 0 1px #51474a;
    }

    #waitModal .wait-modal-empty {
      grid-column: 1 / -1;
      padding: 45px 15px;
      text-align: center;
      color: #776a6e;
    }

    #waitModal.updating .wait-action {
      pointer-events: none;
      opacity: .6;
    }

    @media (max-width: 600px) {
      #waitModal.wait-modal {
        padding: 12px !important;
      }

      #waitModal .wait-modal-panel {
        padding: 38px 16px 22px;
        border-radius: 20px;
      }

      #waitModal .wait-modal-tabs {
        gap: 6px;
      }

      #waitModal .wait-tab {
        padding: 12px 4px;
        font-size: 12px;
      }

      #waitModal .wait-modal-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      #waitModal .wait-product {
        padding: 9px;
      }

      #waitModal .wait-product-price {
        font-size: 16px;
      }

      #waitModal .wait-action {
        font-size: 11px;
        min-height: 38px;
      }
    }
  `;

  document.head.appendChild(style);
}

/* ==========================================
   EVENT HELPER
========================================== */

function bindClick(id, handler) {
  const element = $(id);

  if (!element) {
    return;
  }

  const key = "bowBoundClick";

  if (element.dataset[key]) {
    return;
  }

  element.dataset[key] = "true";

  element.addEventListener("click", handler);
}

/* ==========================================
   HOMEPAGE BUTTONS
========================================== */

function initializeHomepageButtons() {

  // 第一张卡片：마음에 담기
  [
    "uploadTop",
    "heroUpload",
    "stepUpload",
    "findsUpload",
    "drawerUpload"
  ].forEach((id) => {
    bindClick(id, (event) => {
      event.preventDefault();
      openUpload();
    });
  });

  // 第二张卡片：함께 고민하기
  // 统一打开中央等待弹窗，不再打开侧边栏。
  [
    "openWishlist",
    "heroWishlist",
    "stepWishlist"
  ].forEach((id) => {
    bindClick(id, (event) => {
      event.preventDefault();
      openWaitModal("waiting");
    });
  });

  // 原有侧边栏关闭按钮
  [
    "closeWishlist",
    "drawerCloseBottom"
  ].forEach((id) => {
    bindClick(id, closeDrawer);
  });

  // 第三张卡片及 3D 房间按钮
  [
    "roomNav",
    "roomMobile",
    "roomButton"
  ].forEach((id) => {
    bindClick(id, (event) => {
      event.preventDefault();
      notify(t("roomNotice"));
    });
  });

  // 旧遮罩层
  bindClick("overlay", () => {
    closeDrawer();
  });
}

/* ==========================================
   LANGUAGE BUTTONS
========================================== */

function initializeLanguageEvents() {
  document
    .querySelectorAll(".language-switch button")
    .forEach((button) => {
      if (button.dataset.bowLanguageReady) {
        return;
      }

      button.dataset.bowLanguageReady = "true";

      button.addEventListener("click", () => {
        applyLanguage(button.dataset.lang);

        document
          .querySelectorAll(
            ".language-switch button"
          )
          .forEach((element) => {
            const active =
              element.dataset.lang === currentLang;

            element.classList.toggle(
              "selected",
              active
            );

            element.setAttribute(
              "aria-pressed",
              String(active)
            );
          });

        render();
      });
    });
}

/* ==========================================
   MOBILE NAVIGATION
========================================== */

function initializeMobileMenu() {
  const menuButton = $("menuButton");
  const mobileNav = $("mobileNav");

  if (!menuButton || !mobileNav) {
    return;
  }

  if (!menuButton.dataset.bowMenuReady) {
    menuButton.dataset.bowMenuReady = "true";

    menuButton.addEventListener("click", () => {
      mobileNav.hidden = !mobileNav.hidden;

      menuButton.setAttribute(
        "aria-expanded",
        String(!mobileNav.hidden)
      );
    });
  }

  mobileNav.querySelectorAll("a").forEach(
    (link) => {
      if (link.dataset.bowNavReady) {
        return;
      }

      link.dataset.bowNavReady = "true";

      link.addEventListener("click", () => {
        mobileNav.hidden = true;

        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );
      });
    }
  );
}

/* ==========================================
   DRAWER ITEM BUTTONS
========================================== */

function initializeDrawerEvents() {
  const container = $("drawerItems");

  if (!container || container.dataset.bowEventsReady) {
    return;
  }

  container.dataset.bowEventsReady = "true";

  container.addEventListener(
    "click",
    async (event) => {
      const button = event.target.closest(
        "[data-bow-drawer-action]"
      );

      if (!button) {
        return;
      }

      const action =
        button.dataset.bowDrawerAction;

      const itemId =
        button.dataset.bowDrawerId;

      const item = finds.find(
        (entry) => String(entry.id) === String(itemId)
      );

      if (!item) {
        return;
      }

      if (action === "open") {
        closeDrawer();
        openWaitModal(getItemStatus(item));
        return;
      }

      if (action === "delete") {
        if (!window.confirm(t("confirmRemove"))) {
          return;
        }

        try {
          await deleteCloudItem(itemId);
          notify(t("removed"));
        } catch (error) {
          notify(
            `${t("deleteError")}: ${error.message}`
          );
        }
      }
    }
  );
}

/* ==========================================
   EMPTY LIST UPLOAD BUTTON
========================================== */

function initializeEmptyListEvents() {
  const grid = $("findsGrid");

  if (!grid || grid.dataset.bowEmptyReady) {
    return;
  }

  grid.dataset.bowEmptyReady = "true";

  grid.addEventListener("click", (event) => {
    const button = event.target.closest(
      "[data-open-upload], #emptyUpload"
    );

    if (!button) {
      return;
    }

    event.preventDefault();
    openUpload();
  });
}

/* ==========================================
   FIX LANGUAGE PLACEHOLDERS
========================================== */

const originalLanguageFunction = applyLanguage;

applyLanguage = function (language) {
  originalLanguageFunction(language);

  const nameInput = $("itemName");
  const noteInput = $("itemNote");

  if (nameInput) {
    nameInput.placeholder = "";
    nameInput.removeAttribute("data-i18n-placeholder");
  }

  if (noteInput) {
    noteInput.placeholder = "";
  }

  document
    .querySelectorAll(".language-switch button")
    .forEach((button) => {
      button.classList.toggle(
        "selected",
        button.dataset.lang === currentLang
      );
    });

  const modal = $("waitModal");

  if (modal && !modal.hidden) {
    renderWaitModal();
  }
};

/* ==========================================
   INITIALIZE ALL EVENTS
========================================== */

function initializeEvents() {
  initializeHomepageButtons();

  initializeLanguageEvents();

  initializeMobileMenu();

  initializeFindsEvents();

  initializeDrawerEvents();

  initializeEmptyListEvents();

  initializeUploadEvents();

  initializeWaitModalKeyboard();
}

/* ==========================================
   APPLICATION START
========================================== */

let applicationStarted = false;

async function startApplication() {
  if (applicationStarted) {
    return;
  }

  applicationStarted = true;

  console.log(
    "[BUY OR WAIT?] Starting application..."
  );

  // 1. 恢复语言
  currentLang = getSavedLanguage();

  // 2. 先读取本地备份
  finds = [];

  // 3. 安装中央弹窗兼容样式
  installWaitModalStyles();

  // 4. 创建等待弹窗
  createWaitModal();

  // 5. 绑定所有按钮
  initializeEvents();

  // 6. 应用语言
  applyLanguage(currentLang);

  // 7. 显示已有商品
  render();

  // 8. 加载 Supabase
  try {
    await loadSupabaseLibrary();

    const connected =
      await initializeSupabase();

    if (!connected) {
      console.warn(
        "[BUY OR WAIT?] Running with local backup."
      );
    }
  } catch (error) {
    console.error(
      "[BUY OR WAIT?] Startup error:",
      error
    );

    notify(
      `${t("connectionError")}: ${error.message}`
    );
  }

  console.log(
    "[BUY OR WAIT?] Initialization finished."
  );
}

/* ==========================================
   DOM READY
========================================== */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startApplication,
    { once: true }
  );
} else {
  startApplication();
}

/* ==========================================
   END OF SCRIPT.JS
   BUY OR WAIT?
   PART 7 / 7
========================================== */

/* ==========================================
   SIMILAR ITEMS COMPARISON
   마음에 담기 - 비슷한 물건 알림
========================================== */

const SIMILAR_TEXT = {
  ko: {
    title: "앗! 비슷한 물건이 있어요!",
    count: n => `이미 담아둔 물건 중 비슷한 물건 ${n}개를 찾았어요.`,
    compare: "비슷한 물건 비교하기",
    newItem: "새로 발견한 물건",
    continue: "그래도 마음에 담기 ♡",
    back: "다시 생각하기",
    waiting: "기다리는 중",
    thinking: "다시 생각 중",
    bought: "이미 샀어요"
  },
  zh: {
    title: "咦！你已经收藏过类似的小物啦！",
    count: n => `发现 ${n} 件相似的小物，一起比较看看吧。`,
    compare: "看看相似的小物",
    newItem: "刚发现的物品",
    continue: "还是想收藏 ♡",
    back: "暂时不收藏",
    waiting: "等待中",
    thinking: "重新考虑中",
    bought: "已经购买"
  },
  en: {
    title: "Oh! You have something similar!",
    count: n => `Found ${n} similar saved item(s).`,
    compare: "Compare similar finds",
    newItem: "New find",
    continue: "Save it anyway ♡",
    back: "Think again",
    waiting: "Waiting",
    thinking: "Thinking again",
    bought: "Already bought"
  }
};

let similarSaveApproved = false;

// Compare only the six fixed categories; never use names, notes or keywords.
function findSimilarItems(name, category) {
  const selectedCategory = String(category || "").trim();
  if (!selectedCategory) return [];
  return finds.filter(item =>
    String(item.category || "").trim() === selectedCategory
  );
}

function similarStatusText(item, words) {
  const status = normalizeStatus(item.status);

  return words[status] || words.waiting;
}

function renderSimilarComparison(matches) {
  const area = $("similarCompareArea");

  if (!area) return;

  const words =
    SIMILAR_TEXT[currentLang] ||
    SIMILAR_TEXT.ko;

  const name = $("itemName")?.value || "";

  const price = Number($("itemPrice")?.value || 0);

  const newPhoto = $("photoPreview");
  const newPhotoSrc =
    newPhoto && !newPhoto.hidden
      ? newPhoto.src
      : "";

  const newItem = {
    name,
    price,
    currency: currentLang === "zh" ? "CNY" : currentLang === "en" ? "USD" : "KRW"
  };

  const card = (item, isNew = false) => {
    const photo = isNew
      ? newPhotoSrc
      : getPhotoURL(item);

    const status = isNew
      ? words.newItem
      : similarStatusText(item, words);

    return `
      <div class="similar-item-card">
        <div class="similar-item-image">
          ${
            photo
              ? `<img
                   src="${escapeHTML(photo)}"
                   alt="${escapeHTML(item.name)}"
                 >`
              : `<span>♡</span>`
          }
        </div>

        <div class="similar-item-name">
          ${escapeHTML(item.name)}
        </div>

        <div class="similar-item-price">
          ${escapeHTML(formatPrice(item))}
        </div>

        <span class="similar-item-status">
          ${escapeHTML(status)}
        </span>
      </div>
    `;
  };

  area.innerHTML = `
    <div class="similar-notice">
      <div class="similar-notice-icon">♡</div>

      <h3>${escapeHTML(words.title)}</h3>

      <p>${escapeHTML(words.count(matches.length))}</p>

      <div class="similar-comparison-heading">
        ${escapeHTML(words.compare)}
      </div>

      <div class="similar-items-grid">
        ${card(newItem, true)}
        ${matches.slice(0, 6).map(item =>
          card(item)
        ).join("")}
      </div>

      <div class="similar-comparison-actions">
        <button
          type="button"
          class="btn btn-outline"
          id="similarBackButton"
        >
          ${escapeHTML(words.back)}
        </button>

        <button
          type="button"
          class="btn btn-yellow"
          id="similarContinueButton"
        >
          ${escapeHTML(words.continue)}
        </button>
      </div>
    </div>
  `;

  area.hidden = false;

  // 다시 생각하기：不收藏，直接退出
  $("similarBackButton").addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      similarSaveApproved = false;

      area.hidden = true;
      area.innerHTML = "";

      closeUpload();
    }
  );


    $("similarContinueButton").addEventListener(
    "click",
    () => {
      if (busy) return;

      similarSaveApproved = true;

      const form = $("uploadForm");

      if (form) {
        form.requestSubmit();
      }
    }
  );

  area.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}


function initializeSimilarComparison() {
  const form = $("uploadForm");

  if (!form || form.dataset.similarReady) {
    return;
  }

  form.dataset.similarReady = "true";

  form.addEventListener(
    "submit",
    event => {
      if (similarSaveApproved) {
        similarSaveApproved = false;
        return;
      }

      const name = $("itemName")?.value.trim();

      const category =
        $("itemCategory")?.value || "";

      const matches = findSimilarItems(
        name,
        category
      );

      if (!matches.length) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      renderSimilarComparison(matches);
    },
    true
  );

  const clearComparison = () => {
    const area = $("similarCompareArea");

    if (area) {
      area.hidden = true;
      area.innerHTML = "";
    }
  };

  ["itemName", "itemCategory", "itemPrice", "itemPhoto"]
    .forEach(id => {
      const input = $(id);

      if (input) {
        input.addEventListener(
          "change",
          clearComparison
        );
      }
    });

  $("itemName")?.addEventListener(
    "input",
    clearComparison
  );
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeSimilarComparison
  );
} else {
  initializeSimilarComparison();
}

/* END SIMILAR ITEMS COMPARISON */


/* Keep the three main card buttons free of arrow emoji in every language. */
(function keepStepButtonsArrowFree() {
  const ids = ["stepUpload", "stepWishlist", "stepDecide"];
  const clean = (button) => {
    const before = button.textContent;
    const after = before.replace(/[↗↖↘↙➡⬈➚➜➝➞➤🔗]\uFE0F?/gu, "").trim();
    if (before !== after) button.textContent = after;
  };
  const init = () => {
    ids.forEach((id) => {
      const button = document.getElementById(id);
      if (!button) return;
      clean(button);
      new MutationObserver(() => clean(button)).observe(button, {
        childList: true,
        characterData: true,
        subtree: true
      });
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();


/* ==========================================================
   MONTHLY BUDGET REMINDER — fixed ₩300,000, reminder at ₩270,000
   All calculations use KRW and actual purchased month (Asia/Seoul).
   No changes to existing collection totals or purchase workflows.
========================================================== */
(() => {
  const MONTHLY_LIMIT_KRW = 300000;
  const REMINDER_THRESHOLD_KRW = 270000;
  const timezone = "Asia/Seoul";
  const shownLanguagesThisVisit = new Set();
  let checking = false;
  let recheckAfterCurrent = false;
  let lastSpent = null;
  let isVisible = false;
  const messages = {
    ko: {
      near: {title:"이번 달 예산이 얼마 남지 않았어요!", description:"이번 달 구매 금액이 예산의 90% 이상이에요. 다음 구매는 조금 더 생각해 볼까요?"},
      reached: {title:"이번 달 예산을 모두 사용했어요!", description:"이번 달 구매 금액이 예산의 100%에 도달했어요. 다음 구매는 조금 더 생각해 볼까요?"},
      exceeded: {title:"이번 달 예산을 초과했어요!", description:"이번 달 구매 금액이 예산의 100%를 넘었어요. 다음 구매는 조금 더 생각해 볼까요?"},
      spent:"이번 달 구매 금액", left:"남은 예산", over:"예산 초과", limit:"월 소비 한도", confirm:"확인했어요", estimate:"현재 환율 기준 추정 금액"
    },
    zh: {
      near: {title:"这个月的预算快用完了！", description:"本月已购金额已达到预算的90%以上，下次购买前再考虑一下吧。"},
      reached: {title:"本月预算已经用完了！", description:"本月已购金额已达到预算的100%，下次购买前再考虑一下吧。"},
      exceeded: {title:"本月消费已经超出预算！", description:"本月已购金额已超过预算的100%，下次购买前再考虑一下吧。"},
      spent:"本月已购金额", left:"剩余预算", over:"超出预算", limit:"每月固定限额", confirm:"知道了", estimate:"按当前汇率估算"
    },
    en: {
      near: {title:"You're getting close to your monthly budget!", description:"Your purchases have reached at least 90% of your monthly budget. Take a moment before your next purchase."},
      reached: {title:"You've reached your monthly budget!", description:"Your purchases have reached 100% of your monthly budget. Take a moment before your next purchase."},
      exceeded: {title:"You've exceeded your monthly budget!", description:"Your purchases have passed 100% of your monthly budget. Take a moment before your next purchase."},
      spent:"Spent this month", left:"Budget remaining", over:"Over budget", limit:"Fixed monthly limit", confirm:"Got it", estimate:"Estimated at current exchange rates"
    }
  };
  const lang = () => ["ko","zh","en"].includes(currentLang) ? currentLang : "ko";
  const currency = () => lang()==="zh" ? "CNY" : lang()==="en" ? "USD" : "KRW";
  const monthKey = date => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat("en-CA", {timeZone:timezone,year:"numeric",month:"2-digit"}).format(parsed);
  };
  const format = amountKRW => {
    const target=currency();
    const rate=target==="KRW"?1:bowExchangeRates?.[target];
    if (!rate) return new Intl.NumberFormat("ko-KR", {style:"currency",currency:"KRW",maximumFractionDigits:0}).format(amountKRW);
    return new Intl.NumberFormat(lang()==="ko"?"ko-KR":lang()==="zh"?"zh-CN":"en-US",{
      style:"currency",currency:target,maximumFractionDigits:target==="KRW"?0:2,minimumFractionDigits:target==="KRW"?0:2
    }).format(amountKRW*rate);
  };
  const amountInKRW = item => {
    const amount=Number(item.price);
    if (!Number.isFinite(amount) || amount<0) return null;
    const from=String(item.currency||"KRW").toUpperCase();
    if (from==="KRW") return amount;
    const rate=bowExchangeRates?.[from];
    return rate ? amount/rate : null;
  };
  function monthlySpent() {
    const currentMonth=monthKey(new Date());
    let total=0;
    for (const item of finds) {
      if (item.status!=="bought" && item.bought!==true) continue;
      // For legacy items lacking purchased_at, use updated_at if available,
      // otherwise created_at. The migration backfills purchased_at for old rows.
      const purchased=item.purchased_at || item.updated_at || item.created_at;
      if (monthKey(purchased)!==currentMonth) continue;
      const value=amountInKRW(item);
      if (value===null) return null; // Never show a misleading warning from partial totals.
      total+=value;
    }
    return total;
  }
  function ensureModal() {
    if (document.getElementById("bowBudgetOverlay")) return;
    const style=document.createElement("style");
    style.textContent=`
      #bowBudgetOverlay[hidden]{display:none!important}
      #bowBudgetOverlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(55,43,39,.45);box-sizing:border-box}
      #bowBudgetDialog{width:min(100%,390px);max-height:calc(100dvh - 40px);overflow:auto;background:#fff7e9;color:#684a3f;border:1px solid #ecd7c4;border-radius:25px;box-shadow:0 20px 65px rgba(50,34,30,.2);padding:27px 24px 24px;box-sizing:border-box;text-align:center;font-family:inherit}
      #bowBudgetDialog *{box-sizing:border-box}
      .bow-budget-icon{width:62px;height:62px;margin:0 auto 13px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#f8dfe8;color:#b76582;font-size:28px}
      #bowBudgetTitle{font-size:20px;font-weight:800;line-height:1.45;margin:0 0 10px}
      #bowBudgetDescription{font-size:14px;line-height:1.7;margin:0 0 20px;color:#8a7163}
      .bow-budget-progress{height:11px;border-radius:99px;background:#e8d7c8;overflow:hidden;margin:0 0 15px}
      #bowBudgetFill{height:100%;background:#dba77d;border-radius:99px;transition:width .25s}
      .bow-budget-rows{padding:13px 15px;background:#fff;border-radius:13px;margin-bottom:18px}
      .bow-budget-row{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:13px;line-height:2.2;text-align:left}
      .bow-budget-row strong{font-size:14px;text-align:right;white-space:nowrap}
      #bowBudgetConfirm{display:block;width:100%;border:0;border-radius:12px;background:#eabacb;color:#613e4b;font:inherit;font-size:15px;font-weight:750;cursor:pointer;padding:13px}
      #bowBudgetConfirm:hover{background:#e4a9be}
      #bowBudgetRateNote{display:block;font-size:11px;color:#a18c80;margin-top:11px}
    `;
    document.head.appendChild(style);
    const overlay=document.createElement("div");
    overlay.id="bowBudgetOverlay";
    overlay.hidden=true;
    overlay.innerHTML=`<section id="bowBudgetDialog" role="dialog" aria-modal="true" aria-labelledby="bowBudgetTitle" aria-describedby="bowBudgetDescription">
      <div class="bow-budget-icon" aria-hidden="true">♡</div>
      <h2 id="bowBudgetTitle"></h2><p id="bowBudgetDescription"></p>
      <div class="bow-budget-progress"><div id="bowBudgetFill"></div></div>
      <div class="bow-budget-rows">
        <div class="bow-budget-row"><span id="bowBudgetSpentLabel"></span><strong id="bowBudgetSpent"></strong></div>
        <div class="bow-budget-row"><span id="bowBudgetRemainingLabel"></span><strong id="bowBudgetRemaining"></strong></div>
        <div class="bow-budget-row"><span id="bowBudgetLimitLabel"></span><strong id="bowBudgetLimit"></strong></div>
      </div>
      <button type="button" id="bowBudgetConfirm"></button><small id="bowBudgetRateNote"></small>
    </section>`;
    document.body.appendChild(overlay);
    document.getElementById("bowBudgetConfirm").addEventListener("click",()=>{overlay.hidden=true;isVisible=false;});
    document.addEventListener("keydown",e=>{if(e.key==="Escape" && !overlay.hidden){overlay.hidden=true;isVisible=false;}});
  }
  function refreshModal() {
    if (!isVisible || lastSpent===null) return;
    const word=messages[lang()];
    const remaining=MONTHLY_LIMIT_KRW-lastSpent;
    // One reminder dialog, but its wording must match the actual spending level.
    const level=lastSpent>MONTHLY_LIMIT_KRW?"exceeded":lastSpent>=MONTHLY_LIMIT_KRW?"reached":"near";
    document.getElementById("bowBudgetTitle").textContent=word[level].title;
    document.getElementById("bowBudgetDescription").textContent=word[level].description;
    document.getElementById("bowBudgetSpentLabel").textContent=word.spent;
    document.getElementById("bowBudgetRemainingLabel").textContent=remaining>=0?word.left:word.over;
    document.getElementById("bowBudgetLimitLabel").textContent=word.limit;
    document.getElementById("bowBudgetSpent").textContent=format(lastSpent);
    document.getElementById("bowBudgetRemaining").textContent=format(Math.abs(remaining));
    document.getElementById("bowBudgetLimit").textContent=format(MONTHLY_LIMIT_KRW);
    document.getElementById("bowBudgetConfirm").textContent=word.confirm;
    document.getElementById("bowBudgetRateNote").textContent=bowExchangeRates ? word.estimate : (lang()==="zh" ? "汇率暂不可用，金额暂以韩元显示" : lang()==="en" ? "Exchange rate unavailable; amounts shown in KRW" : "환율을 불러올 수 없어 원화로 표시해요");
    document.getElementById("bowBudgetFill").style.width=Math.min(100,lastSpent/MONTHLY_LIMIT_KRW*100)+"%";
  }
  async function checkBudgetOnEntry() {
    if (shownLanguagesThisVisit.has(lang()) || !Array.isArray(finds)) return;
    if (checking) { recheckAfterCurrent = true; return; }
    checking=true;
    try {
      if (!bowExchangeRates && !bowExchangeFailed) await loadBowExchangeRates();
      const total=monthlySpent();
      if (total===null || total<REMINDER_THRESHOLD_KRW) return;
      shownLanguagesThisVisit.add(lang());
      lastSpent=total;
      ensureModal();
      isVisible=true;
      document.getElementById("bowBudgetOverlay").hidden=false;
      refreshModal();
    } finally {
      checking=false;
      if (recheckAfterCurrent) {
        recheckAfterCurrent=false;
        void checkBudgetOnEntry();
      }
    }
  }
  const originalLoader=loadCloudFinds;
  loadCloudFinds=async function(...args) {
    const result=await originalLoader(...args);
    // Wait until cloud records have arrived before checking the entry reminder.
    void checkBudgetOnEntry();
    return result;
  };
  const originalApplyLanguage=applyLanguage;
  applyLanguage=function(...args) {
    const result=originalApplyLanguage(...args);
    // Every newly selected language gets its own reminder once per visit.
    // The current modal is updated immediately if it is already open.
    if (isVisible) {
      refreshModal();
      shownLanguagesThisVisit.add(lang());
    } else {
      void checkBudgetOnEntry();
    }
    return result;
  };
  // Explicit language-button listener: reliable even when the page uses
  // another language-switching handler or the main UI rerenders.
  document.addEventListener("click", event => {
    const button=event.target.closest?.(".language-switch button[data-lang]");
    if (!button) return;
    const selected=button.dataset.lang;
    if (!["ko","zh","en"].includes(selected)) return;
    // The app's language click handler runs in the same event dispatch.
    // Check after it has updated currentLang and the visible UI.
    Promise.resolve().then(() => {
      if (currentLang!==selected) applyLanguage(selected);
      if (!shownLanguagesThisVisit.has(selected)) void checkBudgetOnEntry();
    });
  });
  // Offline fallback: if cloud login is unavailable, check local backup once
  // initialization finishes. Do not interrupt an in-progress cloud fetch.
  const originalStart=startApplication;
  startApplication=async function(...args) {
    const result=await originalStart(...args);
    if (!shownLanguagesThisVisit.has(lang())) void checkBudgetOnEntry();
    return result;
  };
})();


/* Record a decision and remove its wishlist item in one server transaction.
   Without the migration, the action fails safely and does not delete the item. */
async function recordNotBuyingAndRemove(itemId) {
  if (!await ensureCloudConnection()) throw new Error('Cloud connection unavailable.');
  const result=await supabaseClient.rpc('bow_record_no_buy',{p_item_id:String(itemId)});
  if(result.error) throw new Error(result.error.message+' (Run monthly_choices_phase1.sql in Supabase first.)');
  await loadCloudFinds();
}

async function bowRefreshShared() {
  if (!cloudReady || !currentUser) return;
  try {
    const uid = currentUser.id;
    const {data: links,error} = await supabaseClient.from('bow_friendships').select('user_id,friend_id').eq('status','accepted').or(`user_id.eq.${uid},friend_id.eq.${uid}`);
    if(error) throw error;
    const ids = [...new Set((links || []).map(x=>x.user_id===uid?x.friend_id:x.user_id))];
    bowSharedItems = [];
    if(ids.length){
      const result = await supabaseClient.from(TABLE).select('*').in('user_id',ids).in('status',['waiting','thinking']).order('created_at',{ascending:false});
      if(result.error) throw result.error;
      bowSharedItems = (result.data || []).map(normalizeItem);
      await Promise.all(bowSharedItems.map(async item=>{
        if(!item.photo_path) return;
        const {data} = await supabaseClient.storage.from(BUCKET).createSignedUrl(item.photo_path,3600);
        if(data?.signedUrl) item.photo_url=data.signedUrl;
      }));
    }
    if ($('waitModal')?.classList.contains('open')) renderWaitModal();
  } catch(error) { console.error(error); notify('공유 목록을 불러오지 못했어요.'); }
}
$('bowShowPassword').addEventListener('change', e=>{$('bowPassword').type=e.target.checked?'text':'password';});
$('bowLoginForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const button=$('bowLoginButton'); button.disabled=true; $('bowLoginError').textContent='';
  try {
    await loadSupabaseLibrary();
    await initializeSupabase();
    if(!supabaseClient) throw new Error('클라우드 연결 실패');
    const {error}=await supabaseClient.auth.signInWithPassword({email:$('bowEmail').value.trim(),password:$('bowPassword').value});
    if(error) throw error;
    $('bowPassword').value='';
    cloudReady=false; currentUser=null;
    if(!await initializeSupabase()) throw new Error('데이터 연결 실패');
  } catch(error){$('bowLoginError').textContent=error.message;} finally {button.disabled=false;}
});
$('bowLogout').addEventListener('click',async ()=>{
  if(!supabaseClient) return;
  const {error}=await supabaseClient.auth.signOut({scope:'local'});
  if(error){notify(error.message);return;}
  location.reload();
});
