/* =========================
   KickMart - Static Shop Demo
   - search / filter / sort
   - cart with localStorage
========================= */

const PRODUCTS = [
  {
    id: "p1",
    title: "Mercury Sprint FG",
    subtitle: "速度型足球鞋（示例）",
    category: "boots",
    price: 899,
    rating: 4.8,
    isNew: true,
    featured: true,
    icon: "⚡",
    tags: ["Speed", "FG", "Lightweight"],
  },
  {
    id: "p2",
    title: "Predator Control TF",
    subtitle: "控制型碎钉（示例）",
    category: "boots",
    price: 699,
    rating: 4.6,
    isNew: false,
    featured: true,
    icon: "🎯",
    tags: ["Control", "TF", "Grip"],
  },
  {
    id: "p3",
    title: "Pro Match Jersey 24/25",
    subtitle: "比赛球衣（示例）",
    category: "kits",
    price: 399,
    rating: 4.7,
    isNew: true,
    featured: true,
    icon: "👕",
    tags: ["Jersey", "Breathable"],
  },
  {
    id: "p4",
    title: "Compression Base Layer",
    subtitle: "紧身训练服（示例）",
    category: "kits",
    price: 219,
    rating: 4.5,
    isNew: false,
    featured: false,
    icon: "🧊",
    tags: ["Training", "Fit"],
  },
  {
    id: "p5",
    title: "Shield Shin Guards",
    subtitle: "护腿板（示例）",
    category: "gear",
    price: 129,
    rating: 4.4,
    isNew: false,
    featured: false,
    icon: "🛡️",
    tags: ["Protection", "Light"],
  },
  {
    id: "p6",
    title: "Grip Goalkeeper Gloves",
    subtitle: "守门员手套（示例）",
    category: "goalkeeper",
    price: 259,
    rating: 4.6,
    isNew: true,
    featured: false,
    icon: "🧤",
    tags: ["GK", "Grip"],
  },
  {
    id: "p7",
    title: "Agility Cones Set",
    subtitle: "敏捷训练锥桶（示例）",
    category: "training",
    price: 89,
    rating: 4.3,
    isNew: false,
    featured: false,
    icon: "🟧",
    tags: ["Agility", "Drills"],
  },
  {
    id: "p8",
    title: "Mini Rebounder Net",
    subtitle: "回弹训练网（示例）",
    category: "training",
    price: 329,
    rating: 4.5,
    isNew: true,
    featured: true,
    icon: "🕸️",
    tags: ["Passing", "First touch"],
  },
];

const NEW_ITEMS = [
  { icon: "🎨", title: "新赛季配色", desc: "速度型球鞋新配色已上架（示例）" },
  { icon: "🧪", title: "轻量护具", desc: "更贴合、更轻的护腿板（示例）" },
  { icon: "📦", title: "训练小物", desc: "敏捷与触球训练组合（示例）" },
];

const el = (id) => document.getElementById(id);

const productGrid = el("productGrid");
const newGrid = el("newGrid");
const searchRow = el("searchRow");
const searchInput = el("searchInput");
const btnToggleSearch = el("btnToggleSearch");
const btnClearSearch = el("btnClearSearch");
const sortSelect = el("sortSelect");
const resultHint = el("resultHint");

const cartCount = el("cartCount");
const cartDrawer = el("cartDrawer");
const drawerBackdrop = el("drawerBackdrop");
const btnCart = el("btnCart");
const btnCloseDrawer = el("btnCloseDrawer");
const cartItems = el("cartItems");
const cartTotal = el("cartTotal");
const btnClearCart = el("btnClearCart");

const toast = el("toast");
el("year").textContent = String(new Date().getFullYear());

let state = {
  category: "all",
  query: "",
  sort: "featured",
};

function formatCNY(n) {
  return "¥ " + n.toLocaleString("zh-CN");
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("is-show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("is-show"), 1600);
}

/* ============ Cart ============ */
const CART_KEY = "kickmart_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartQuantity(cart) {
  return Object.values(cart).reduce((sum, v) => sum + v, 0);
}

function cartTotalPrice(cart) {
  let total = 0;
  for (const [pid, qty] of Object.entries(cart)) {
    const p = PRODUCTS.find((x) => x.id === pid);
    if (p) total += p.price * qty;
  }
  return total;
}

function addToCart(pid, qty = 1) {
  const cart = loadCart();
  cart[pid] = (cart[pid] || 0) + qty;
  if (cart[pid] <= 0) delete cart[pid];
  saveCart(cart);
  renderCart();
  showToast("已加入购物车");
}

function setCartQty(pid, qty) {
  const cart = loadCart();
  if (qty <= 0) delete cart[pid];
  else cart[pid] = qty;
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart({});
  renderCart();
  showToast("购物车已清空");
}

function openDrawer() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function renderCart() {
  const cart = loadCart();
  cartCount.textContent = String(cartQuantity(cart));
  cartTotal.textContent = formatCNY(cartTotalPrice(cart));

  const entries = Object.entries(cart);
  if (entries.length === 0) {
    cartItems.innerHTML = `<div class="muted">购物车还是空的，去挑点装备吧～</div>`;
    return;
  }

  cartItems.innerHTML = entries
    .map(([pid, qty]) => {
      const p = PRODUCTS.find((x) => x.id === pid);
      if (!p) return "";
      return `
        <div class="cartitem">
          <div>
            <div class="cartitem__title">${p.title}</div>
            <div class="cartitem__meta">${p.subtitle} · ${formatCNY(p.price)} / 件</div>
          </div>
          <div class="cartitem__actions">
            <button class="qtybtn" data-action="dec" data-id="${pid}">−</button>
            <span class="qty">${qty}</span>
            <button class="qtybtn" data-action="inc" data-id="${pid}">＋</button>
          </div>
        </div>
      `;
    })
    .join("");

  // Bind qty buttons (event delegation)
  cartItems.querySelectorAll(".qtybtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.id;
      const action = btn.dataset.action;
      const cartNow = loadCart();
      const cur = cartNow[pid] || 0;
      const next = action === "inc" ? cur + 1 : cur - 1;
      setCartQty(pid, next);
    });
  });
}

/* ============ Catalog ============ */
function applyFilters(products) {
  let items = [...products];

  // category
  if (state.category !== "all") {
    items = items.filter((p) => p.category === state.category);
  }

  // query
  const q = state.query.trim().toLowerCase();
  if (q) {
    items = items.filter((p) => {
      const hay = `${p.title} ${p.subtitle} ${p.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // sort
  switch (state.sort) {
    case "priceAsc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "ratingDesc":
      items.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      items.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    case "featured":
    default:
      items.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
  }

  return items;
}

function productCard(p) {
  const flags = [
    p.isNew ? `<span class="pill">NEW</span>` : "",
    p.featured ? `<span class="pill">推荐</span>` : "",
    `<span class="pill">⭐ ${p.rating.toFixed(1)}</span>`,
  ].join("");

  const tags = p.tags.slice(0, 2).map((t) => `<span class="pill">${t}</span>`).join("");

  return `
    <article class="product">
      <div class="product__media" aria-hidden="true">${p.icon}</div>
      <div class="product__body">
        <div class="product__top">
          <div>
            <div class="product__title">${p.title}</div>
            <div class="product__subtitle">${p.subtitle}</div>
          </div>
          <div class="product__price">${formatCNY(p.price)}</div>
        </div>

        <div class="product__meta">
          ${flags}
          ${tags}
        </div>

        <div class="product__actions">
          <button class="ghostbtn" data-action="view" data-id="${p.id}">详情</button>
          <button class="primarybtn" data-action="add" data-id="${p.id}">加入购物车</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  const items = applyFilters(PRODUCTS);
  resultHint.textContent = `展示 ${items.length} 件商品`;

  productGrid.innerHTML = items.map(productCard).join("");

  // Bind actions
  productGrid.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      const pid = btn.dataset.id;
      const p = PRODUCTS.find((x) => x.id === pid);

      if (!p) return;

      if (action === "add") {
        addToCart(pid, 1);
      } else if (action === "view") {
        showToast(`示例：这里可跳转到商品详情页（${p.title}）`);
      }
    });
  });
}

function renderNew() {
  newGrid.innerHTML = NEW_ITEMS.map(
    (x) => `
      <div class="newitem">
        <div class="newitem__icon" aria-hidden="true">${x.icon}</div>
        <div>
          <p class="newitem__title">${x.title}</p>
          <p class="newitem__desc">${x.desc}</p>
        </div>
      </div>
    `
  ).join("");
}

/* ============ Events ============ */
document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    state.category = chip.dataset.category;
    renderProducts();
  });
});

sortSelect.addEventListener("change", () => {
  state.sort = sortSelect.value;
  renderProducts();
});

btnToggleSearch.addEventListener("click", () => {
  searchRow.classList.toggle("is-open");
  if (searchRow.classList.contains("is-open")) {
    searchInput.focus();
  }
});

btnClearSearch.addEventListener("click", () => {
  state.query = "";
  searchInput.value = "";
  renderProducts();
});

searchInput.addEventListener("input", (e) => {
  state.query = e.target.value || "";
  renderProducts();
});

btnCart.addEventListener("click", openDrawer);
btnCloseDrawer.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

btnClearCart.addEventListener("click", clearCart);

el("jumpToBoots").addEventListener("click", (e) => {
  // set category to boots
  state.category = "boots";
  document.querySelectorAll(".chip").forEach((c) => {
    c.classList.toggle("is-active", c.dataset.category === "boots");
  });
  renderProducts();
});

el("addBundle").addEventListener("click", () => {
  // Bundle: p1 + p3 + p5
  addToCart("p1", 1);
  addToCart("p3", 1);
  addToCart("p5", 1);
  showToast("礼包已加入购物车");
});

el("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("已订阅（示例）");
  e.target.reset();
});

// Keyboard: ESC closes drawer
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

/* ============ Init ============ */
renderNew();
renderProducts();
renderCart();