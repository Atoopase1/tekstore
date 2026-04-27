/* Tekstore — App Logic */
const SUPABASE_URL = 'https://fczncemdlmvzlyhdhmvm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eXk85cm5LtLKMiWwACE0yw_vOHMHi9U';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const PAYSTACK_PUBLIC_KEY = 'pk_live_e3e8efc8e741d22c41ce05e297b5260daa34183a';
let isAdmin = false, deleteTargetId = null, currentFilter = 'all', products = [], currentUser = null, paystackTargetProduct = null;
let cart = JSON.parse(localStorage.getItem('technoid_cart') || '[]');

/* ── Icon System ── */
const ICONS = {
    info: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    check: '<svg class="icon icon-md" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    package: '<svg class="icon" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    trash: '<svg class="icon icon-md" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    user: '<svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    edit: '<svg class="icon icon-md" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    cartEmpty: '<svg class="icon icon-xl" viewBox="0 0 24 24" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    remove: '<svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    whatsapp: '<svg class="icon" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    momoObj: '<svg class="icon" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    phone: '<svg class="icon" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    laptop: '<svg class="icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
    tablet: '<svg class="icon" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    accessory: '<svg class="icon" viewBox="0 0 24 24"><path d="M11 20.53A4 4 0 1 0 19.5 12h-9m0 0a4 4 0 1 0 8.53 8.53"/><path d="M5 4h5"/><path d="M7 2v4"/></svg>',
    audio: '<svg class="icon" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4z"/><path d="M3 19a2 2 0 0 0 2 2h1v-6H3v4z"/></svg>',
    gadget: '<svg class="icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    receipt: '<svg class="icon icon-md" viewBox="0 0 24 24" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    messageCircle: '<svg class="icon icon-md" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
};

/* ── Category Taxonomy ── */
const CATEGORIES = [
    {
        id: 'electronics', label: 'Electronics',
        subs: [
            { label: 'Phones', key: 'phone' },
            { label: 'Laptops', key: 'laptop' },
            { label: 'Chargers', key: 'charger' },
            { label: 'Power Banks', key: 'powerbank' },
            { label: 'Earphones / Headphones', key: 'audio' },
            { label: 'Smart Watches', key: 'smartwatch' },
            { label: 'Speakers', key: 'speaker' },
            { label: 'Computer Accessories', key: 'accessory' },
            { label: 'Tablets', key: 'tablet' },
            { label: 'Other Electronics', key: 'other' }
        ]
    },
    {
        id: 'groceries', label: 'Groceries',
        subs: [
            { label: 'Rice', key: 'rice' },
            { label: 'Cooking Oil', key: 'cookingoil' },
            { label: 'Drinks', key: 'drinks' }
        ]
    },
    {
        id: 'home-appliances', label: 'Home Appliances',
        subs: [
            { label: 'Fans', key: 'fan' },
            { label: 'Blenders', key: 'blender' },
            { label: 'Electric Kettles', key: 'kettle' },
            { label: 'Microwaves', key: 'microwave' },
            { label: 'Refrigerators', key: 'refrigerator' }
        ]
    },
    {
        id: 'fashion', label: 'Fashion',
        subs: [
            { label: 'Shoes', key: 'shoes' },
            { label: 'Bags', key: 'bags' },
            { label: "Men's Clothing", key: 'mens-clothing' },
            { label: "Women's Clothing", key: 'womens-clothing' },
            { label: 'Watches', key: 'watches' },
            { label: 'Sunglasses', key: 'sunglasses' }
        ]
    },
    {
        id: 'electricals', label: 'Electricals',
        subs: [
            { label: 'Electrical Components', key: 'elec-components' },
            { label: 'Electrical Tools', key: 'elec-tools' }
        ]
    },
    {
        id: 'health-beauty', label: 'Health & Beauty',
        subs: [
            { label: 'Body Creams', key: 'body-cream' },
            { label: 'Hair Products', key: 'hair-products' },
            { label: 'Perfumes', key: 'perfumes' },
            { label: 'Shaving Kits', key: 'shaving-kits' },
            { label: 'Body Oil', key: 'body-oil' }
        ]
    }
];

/* ── Category Nav State ── */
let currentMainCat = null; // null = show all
let currentSubCat = null;  // null = show all in current main cat

/* ── Category Nav Render ── */
function renderCategoryNav() {
    const menu = document.getElementById('mainCatDropdownMenu');
    const label = document.getElementById('mainCatDropdownLabel');
    const subBar = document.getElementById('subCatBar');
    if (!menu || !subBar) return;

    // --- Dropdown label ---
    var activeCat = currentMainCat ? CATEGORIES.find(function (c) { return c.id === currentMainCat; }) : null;
    if (label) label.textContent = activeCat ? activeCat.label : 'All Categories';

    // --- Dropdown menu items ---
    var menuHtml = '<button class="main-cat-option' + (!currentMainCat ? ' active' : '') +
        '" onclick="selectMainCategory(null)" role="option" aria-selected="' + (!currentMainCat) + '">' +
        '<svg class="cat-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L19 7"/></svg>' +
        'All Categories</button>';
    menuHtml += CATEGORIES.map(function (cat) {
        var isActive = currentMainCat === cat.id;
        return '<button class="main-cat-option' + (isActive ? ' active' : '') +
            '" onclick="selectMainCategory(\'' + cat.id + '\')" role="option" aria-selected="' + isActive + '">' +
            '<svg class="cat-option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m5 12 5 5L19 7"/></svg>' +
            cat.label + '</button>';
    }).join('');
    menu.innerHTML = menuHtml;

    // --- Subcategory bar ---
    if (!currentMainCat) {
        subBar.style.display = 'none';
        subBar.innerHTML = '';
        return;
    }
    var mainDef = CATEGORIES.find(function (c) { return c.id === currentMainCat; });
    if (!mainDef) { subBar.style.display = 'none'; return; }

    var subHtml = '<button class="sub-cat-btn' + (!currentSubCat ? ' active' : '') +
        '" onclick="selectSubCategory(null)" role="tab" aria-selected="' + (!currentSubCat) + '">All ' + mainDef.label + '</button>';
    subHtml += mainDef.subs.map(function (sub) {
        var isActive = currentSubCat === sub.key;
        return '<button class="sub-cat-btn' + (isActive ? ' active' : '') +
            '" onclick="selectSubCategory(\'' + sub.key + '\')" role="tab" aria-selected="' + isActive + '">' +
            sub.label + '</button>';
    }).join('');
    subBar.innerHTML = subHtml;
    subBar.style.display = 'flex';
}

/* ── Dropdown toggle ── */
function toggleCatDropdown() {
    var menu = document.getElementById('mainCatDropdownMenu');
    var btn = document.getElementById('mainCatDropdownBtn');
    var chevron = document.getElementById('catChevron');
    if (!menu) return;
    var isOpen = menu.classList.toggle('open');
    if (btn) btn.setAttribute('aria-expanded', isOpen);
    if (chevron) chevron.style.transform = isOpen ? 'rotate(180deg)' : '';
}

function closeCatDropdown() {
    var menu = document.getElementById('mainCatDropdownMenu');
    var btn = document.getElementById('mainCatDropdownBtn');
    var chevron = document.getElementById('catChevron');
    if (menu) menu.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (chevron) chevron.style.transform = '';
}

document.addEventListener('click', function (e) {
    var dropdown = document.getElementById('mainCatDropdown');
    if (dropdown && !dropdown.contains(e.target)) closeCatDropdown();
});

function selectMainCategory(catId) {
    currentMainCat = catId;
    currentSubCat = null;
    closeCatDropdown();
    renderCategoryNav();
    renderProducts();
    if (catId) {
        var section = document.getElementById('products');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function selectSubCategory(subKey) {
    currentSubCat = subKey;
    renderCategoryNav();
    renderProducts();
}

/* ── Lazy Load Observer for Product Cards ── */
var _cardObserver = null;
function initCardLazyLoad() {
    if (!('IntersectionObserver' in window)) return;
    _cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('card-visible');
                _cardObserver.unobserve(e.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '80px' });
}
initCardLazyLoad();

function observeProductCards() {
    if (!_cardObserver) {
        // Fallback: just make all cards visible immediately
        document.querySelectorAll('.product-card.lazy-card').forEach(function (c) {
            c.classList.add('card-visible');
        });
        return;
    }
    document.querySelectorAll('.product-card.lazy-card').forEach(function (card) {
        _cardObserver.observe(card);
    });
}


function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = ICONS.info;
    if (type === 'success') icon = ICONS.check;
    if (type === 'error') icon = ICONS.error;
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleMobileNav() {
    const hamburger = document.getElementById('hamburgerMenu');
    const overlay = document.getElementById('mobileNavOverlay');
    hamburger.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
}

function closeMobileNav() {
    const hamburger = document.getElementById('hamburgerMenu');
    const overlay = document.getElementById('mobileNavOverlay');
    hamburger.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

// Close mobile nav when tapping the dim backdrop (outside the panel)
document.addEventListener('DOMContentLoaded', function() {
    var overlay = document.getElementById('mobileNavOverlay');
    var panel = overlay ? overlay.querySelector('.mobile-nav-panel') : null;
    if (overlay && panel) {
        overlay.addEventListener('click', function(e) {
            if (!panel.contains(e.target)) closeMobileNav();
        });
    }
});

/* ── Theme ── */
const SUN_SVG = '<svg class="theme-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-3a1 1 0 011-1V1a1 1 0 01-2 0v2a1 1 0 011 1zm0 16a1 1 0 01-1 1v2a1 1 0 012 0v-2a1 1 0 01-1-1zm9-9a1 1 0 011 1h2a1 1 0 010 2h-2a1 1 0 01-1-1zm-18 0a1 1 0 01-1-1H1a1 1 0 010-2h2a1 1 0 011 1zm14.95-5.64a1 1 0 011.41 0l1.42 1.42a1 1 0 01-1.42 1.41l-1.41-1.41a1 1 0 010-1.42zM4.22 17.66a1 1 0 010 1.42l-1.42 1.41a1 1 0 01-1.41-1.41l1.41-1.42a1 1 0 011.42 0zm13.56 1.42a1 1 0 010-1.42l1.41-1.42a1 1 0 011.42 1.42l-1.42 1.41a1 1 0 01-1.41 0zM4.22 6.34a1 1 0 01-1.42 0L1.39 4.93a1 1 0 011.41-1.42L4.22 4.93a1 1 0 010 1.41z"/></svg>';
const MOON_SVG = '<svg class="theme-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.75 15.5a.75.75 0 01-.07 1A9.73 9.73 0 0112 20a9.99 9.99 0 01-9.44-13.33.75.75 0 011.1-.47A7.5 7.5 0 0016.5 13a7.49 7.49 0 004.22-1.3.75.75 0 011.03.4z"/></svg>';
function setThemeIcon(theme) {
    const desktopBtn = document.getElementById('desktopThemeBtn');
    const mobileBtn = document.getElementById('mobileThemeBtn');
    const svg = theme === 'dark' ? SUN_SVG : MOON_SVG;
    const label = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    if (desktopBtn) desktopBtn.innerHTML = svg;
    if (mobileBtn) {
        const labelSpan = mobileBtn.querySelector('.mobile-theme-label');
        mobileBtn.innerHTML = svg + ' <span class="mobile-theme-label">' + label + '</span>';
    }
}

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('technoid_theme', next);
    setThemeIcon(next);
}

// Apply saved theme on load
(function () {
    const saved = localStorage.getItem('technoid_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
}());

/* ── Custom Confirm ── */
let currentConfirmCallback = null;

function customConfirm(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    currentConfirmCallback = callback;
    openModal('customConfirmModal');
}

function closeCustomConfirm() {
    closeModal('customConfirmModal');
    currentConfirmCallback = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const okBtn = document.getElementById('confirmOkBtn');
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            if (currentConfirmCallback) currentConfirmCallback();
            closeCustomConfirm();
        });
    }
});

/* ── Modals ── */
function openModal(id) { document.getElementById(id).classList.add('open') }
function closeModal(id) { document.getElementById(id).classList.remove('open') }

/* ── Admin Nav ── */
function handleAdminNavClick() { isAdmin ? openModal('adminOptionsModal') : promptAdminLogin() }
function openAddProductPanel() {
    ['newName', 'newPrice', 'newDesc'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('newCategory').value = 'phone';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('addSuccess').style.display = 'none';
    openModal('adminPanel');
}
function promptAdminLogin() {
    if (currentUser && currentUser.role === 'admin') {
        verifyAdmin();
    } else {
        showToast('You must be logged in as an administrator to access this area.', 'error');
    }
}
function verifyAdmin() {
    isAdmin = true;
    sessionStorage.setItem('technoid_admin', '1');
    updateAdminUI();
    openModal('adminOptionsModal');
    renderProducts();
}
function exitAdmin() {
    isAdmin = false;
    sessionStorage.removeItem('technoid_admin');
    updateAdminUI();
    renderProducts();
}

function updateAdminUI() {
    document.querySelectorAll('.adminNavBtn').forEach(btn => {
        if (isAdmin) {
            btn.classList.add('admin-active');
            btn.innerHTML = 'Danger Zone <span style="opacity:0.6;font-size:0.65rem;">▼</span>';
            btn.title = 'Click for Admin Options';
        } else {
            btn.classList.remove('admin-active');
            btn.innerHTML = 'Danger Zone';
            btn.title = '';
        }
    });
}

/* ── Image Preview (shared) ── */
function previewImg(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block' };
        reader.readAsDataURL(input.files[0]);
    }
}

/* ── Products CRUD ── */
const PRODUCTS_CACHE_KEY = 'technoid_products_cache';

function getCachedProducts() {
    try {
        const cached = localStorage.getItem(PRODUCTS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
    } catch (e) { }
    return null;
}
function setCachedProducts(data) {
    try {
        // Strip base64 images to avoid exceeding localStorage quota
        var lite = data.map(function (p) {
            var copy = Object.assign({}, p);
            if (copy.image && copy.image.length > 200) copy.image = copy.image.substring(0, 200);
            return copy;
        });
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(lite));
    } catch (e) { /* storage full — ignore */ }
}

function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise(function (_, reject) {
            setTimeout(function () { reject(new Error('Request timed out')); }, ms);
        })
    ]);
}

async function loadProducts() {
    const grid = document.getElementById('productsGrid');

    // Show cached products instantly on first load
    if (products.length === 0) {
        const cached = getCachedProducts();
        if (cached && cached.length > 0) {
            products = cached;
            renderProducts();
            initCarousels();
        } else if (grid) {
            grid.innerHTML = '<div class="no-products"><div class="loading-spinner"></div><h3>Loading Collection...</h3><p>Fetching products securely.</p></div>';
        }
    }

    // Fetch fresh data with timeout (15s)
    try {
        const { data, error } = await withTimeout(
            sb.from('products').select('*').order('created_at', { ascending: false }),
            15000
        );
        if (error) { console.error('Load error:', error); showToast('Could not refresh products.', 'error'); return; }
        products = data || [];
        setCachedProducts(products);
        renderProducts();
        initCarousels();
    } catch (e) {
        console.warn('Product load timed out or failed:', e.message);
        if (products.length === 0) {
            if (grid) grid.innerHTML = '<div class="no-products"><h3>Connection Slow</h3><p>Could not load products. Please check your connection and refresh.</p></div>';
        } else {
            showToast('Using cached products — connection is slow.', 'info');
        }
    }
}
async function addProduct() {
    const name = document.getElementById('newName').value.trim();
    const cat = document.getElementById('newCategory').value;
    const price = document.getElementById('newPrice').value.trim();
    const desc = document.getElementById('newDesc').value.trim();
    const imgInput = document.getElementById('newImage');
    if (!name || !price) { showToast('Please fill in product name and price.', 'error'); return }
    const doSave = async (imgUrl) => {
        const inStock = parseInt(document.getElementById('newStock').value);
        const { error } = await sb.from('products').insert([{ name, category: cat, price, description: desc, image: imgUrl || null, in_stock: inStock }]);
        if (error) { showToast('Error saving product: ' + error.message, 'error'); return }
        document.getElementById('addSuccess').style.display = 'block';
        ['newName', 'newPrice', 'newDesc'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('imagePreview').style.display = 'none';
        imgInput.value = '';
        setTimeout(() => document.getElementById('addSuccess').style.display = 'none', 3000);
        await loadProducts();
    };
    if (imgInput.files && imgInput.files[0]) {
        const file = imgInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await sb.storage.from('products').upload(filePath, file);
        if (uploadError) { showToast('Error uploading image: ' + uploadError.message, 'error'); return }
        
        const { data } = sb.storage.from('products').getPublicUrl(filePath);
        doSave(data.publicUrl);
    } else { doSave(null) }
}
async function userAddProduct() {
    if (!currentUser) { showToast('Please login first.', 'error'); return }
    const name = document.getElementById('sellName').value.trim();
    const cat = document.getElementById('sellCategory').value;
    const price = document.getElementById('sellPrice').value.trim();
    const desc = document.getElementById('sellDesc').value.trim();
    const imgInput = document.getElementById('sellImage');
    if (!name || !price) { showToast('Please fill in product name and price.', 'error'); return }
    const doSave = async (imgUrl) => {
        const inStock = parseInt(document.getElementById('sellStock').value);
        const { error } = await sb.from('products').insert([{ name, category: cat, price, description: desc, image: imgUrl || null, user_id: currentUser.auth_id, seller_name: currentUser.username, seller_phone: currentUser.phone, in_stock: inStock }]);
        if (error) { showToast('Error listing product: ' + error.message, 'error'); return }
        document.getElementById('sellSuccess').style.display = 'block';
        ['sellName', 'sellPrice', 'sellDesc'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('sellImagePreview').style.display = 'none';
        imgInput.value = '';
        setTimeout(() => document.getElementById('sellSuccess').style.display = 'none', 3000);
        await loadProducts();
    };
    if (imgInput.files && imgInput.files[0]) {
        const file = imgInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await sb.storage.from('products').upload(filePath, file);
        if (uploadError) { showToast('Error uploading image: ' + uploadError.message, 'error'); return }
        
        const { data } = sb.storage.from('products').getPublicUrl(filePath);
        doSave(data.publicUrl);
    } else { doSave(null) }
}

/* ── Auth ── */
function switchAuthTab(tab) {
    document.getElementById('authLoginForm').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('authRegisterForm').style.display = tab === 'register' ? '' : 'none';
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
}
async function registerUser() {
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const errEl = document.getElementById('regError'), sucEl = document.getElementById('regSuccess');
    errEl.style.display = 'none'; sucEl.style.display = 'none';
    const policyCheck = document.getElementById('regPolicyCheck');
    if (policyCheck && !policyCheck.checked) { errEl.textContent = 'Please agree to the Privacy Policy and Terms of Use to continue.'; errEl.style.display = 'block'; return }
    if (!name || !username || !phone || !email || !password) { errEl.textContent = 'All fields are required.'; errEl.style.display = 'block'; return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Please enter a valid email address.'; errEl.style.display = 'block'; return }
    
    // Supabase Auth SignUp (Trigger will handle inserting into public.users)
    const { data: authData, error: authError } = await sb.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name,
                username: username,
                phone: phone
            }
        }
    });
    if (authError) { errEl.textContent = 'Auth Error: ' + authError.message; errEl.style.display = 'block'; return }

    sucEl.style.display = 'block';
    setTimeout(() => { sucEl.style.display = 'none'; switchAuthTab('login'); document.getElementById('loginUsername').value = username }, 1500);
}
async function loginUser() {
    const usernameOrEmail = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    errEl.style.display = 'none';
    const policyCheck = document.getElementById('loginPolicyCheck');
    if (policyCheck && !policyCheck.checked) { errEl.textContent = 'Please agree to the Privacy Policy and Terms of Use to continue.'; errEl.style.display = 'block'; return }
    if (!usernameOrEmail || !password) { errEl.textContent = 'Please enter username or email and password.'; errEl.style.display = 'block'; return }

    let loginEmail = usernameOrEmail;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail)) {
        const { data: u } = await sb.from('users').select('email').eq('username', usernameOrEmail).maybeSingle();
        if (u && u.email) loginEmail = u.email;
    }

    const { data: authData, error: authErr } = await sb.auth.signInWithPassword({
        email: loginEmail,
        password: password
    });
    if (authErr) { errEl.textContent = 'Invalid credentials.'; errEl.style.display = 'block'; return }

    const { data: user, error } = await sb.from('users').select('*').eq('auth_id', authData.user.id).maybeSingle();
    if (error || !user) { errEl.textContent = 'User profile not found in database. Please wait a moment for it to sync.'; errEl.style.display = 'block'; return }
    currentUser = { id: user.id, auth_id: user.auth_id, user_id: user.user_id, username: user.username, name: user.name, phone: user.phone, email: user.email || '', avatar: user.avatar || '', role: user.role || 'user' };
    // Remember Me: persist to localStorage, else only sessionStorage
    const rememberMe = document.getElementById('loginRememberMe');
    if (rememberMe && rememberMe.checked) {
        localStorage.setItem('technoid_user', JSON.stringify(currentUser));
        localStorage.setItem('technoid_remember_me', '1');
        localStorage.setItem('technoid_remembered_username', usernameOrEmail);
    } else {
        sessionStorage.setItem('technoid_user_session', JSON.stringify(currentUser));
        localStorage.removeItem('technoid_user');
        localStorage.removeItem('technoid_remember_me');
    }
    closeModal('authModal');
    updateAuthUI();
    renderProducts();
}

/* ── Google OAuth Sign-In ── */
async function signInWithGoogle() {
    // Determine which tab is active and check policy accordingly
    const loginActive = document.getElementById('authLoginForm') && document.getElementById('authLoginForm').style.display !== 'none';
    const policyId = loginActive ? 'loginPolicyCheck' : 'regPolicyCheck';
    const policyCheck = document.getElementById(policyId);
    if (policyCheck && !policyCheck.checked) {
        const errId = loginActive ? 'loginError' : 'regError';
        const errEl = document.getElementById(errId);
        if (errEl) { errEl.textContent = 'Please agree to the Privacy Policy and Terms of Use to continue.'; errEl.style.display = 'block'; }
        showToast('Please agree to the Privacy Policy before continuing.', 'error');
        return;
    }
    const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) {
        showToast('Google sign-in failed: ' + error.message, 'error');
    }
}
async function logoutUser() {
    await sb.auth.signOut();
    currentUser = null;
    localStorage.removeItem('technoid_user');
    localStorage.removeItem('technoid_remember_me');
    localStorage.removeItem('technoid_remembered_username');
    sessionStorage.removeItem('technoid_user_session');
    isAdmin = false;
    sessionStorage.removeItem('technoid_admin');
    closeModal('userPanel');
    updateAuthUI();
    updateAdminUI();
    renderProducts();
}
function updateAuthUI() {
    const loginBtns = document.querySelectorAll('.loginNavBtn');
    const userBtns = document.querySelectorAll('.userNavBtn');
    const adminBtns = document.querySelectorAll('.adminNavBtn');
    const mobileUserLinks = document.getElementById('mobileUserLinks');
    if (currentUser) {
        loginBtns.forEach(b => b.style.display = 'none');
        userBtns.forEach(b => {
            b.style.display = '';
            b.innerHTML = `
                <span class="mobile-profile-card">
                    <span class="mobile-profile-avatar-wrap">
                        ${currentUser.avatar
                            ? `<img src="${currentUser.avatar}" class="mobile-profile-avatar" />`
                            : `<span class="mobile-profile-avatar-placeholder">${ICONS.user}</span>`
                        }
                    </span>
                    <span class="mobile-profile-info">
                        <span class="mobile-profile-name">${currentUser.name || currentUser.username}</span>
                        <span class="mobile-profile-label">My Profile</span>
                    </span>
                    <span class="mobile-profile-chevron">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
                    </span>
                </span>`;
        });
        document.getElementById('profileDisplayName').textContent = currentUser.name;
        document.getElementById('profileHandle').textContent = '@' + currentUser.username;
        const avatarImg = document.getElementById('avatarDisplay');
        const avatarPh = document.getElementById('avatarPlaceholder');
        if (currentUser.avatar) { avatarImg.src = currentUser.avatar; avatarImg.style.display = 'block'; avatarPh.style.display = 'none'; }
        else { avatarImg.style.display = 'none'; avatarPh.style.display = ''; }
        adminBtns.forEach(b => b.style.display = (currentUser.role === 'admin') ? 'inline-block' : 'none');
        if (mobileUserLinks) mobileUserLinks.style.display = '';
    } else {
        loginBtns.forEach(b => b.style.display = '');
        userBtns.forEach(b => b.style.display = 'none');
        adminBtns.forEach(b => b.style.display = 'none');
        if (mobileUserLinks) mobileUserLinks.style.display = 'none';
    }
}
async function uploadAvatar(input) {
    if (!currentUser || !input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        const avatarData = e.target.result;
        const { error } = await sb.from('users').update({ avatar: avatarData }).eq('id', currentUser.id);
        if (error) { showToast('Could not update photo: ' + error.message, 'error'); return }
        currentUser.avatar = avatarData;
        localStorage.setItem('technoid_user', JSON.stringify(currentUser));
        updateAuthUI();
    };
    reader.readAsDataURL(input.files[0]);
}
async function restoreSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        const { data: user } = await sb.from('users').select('*').eq('auth_id', session.user.id).maybeSingle();
        if (user) {
            // Use Google profile photo as avatar for first-time Google sign-ups
            let avatar = user.avatar || '';
            const googleAvatar = session.user.user_metadata && session.user.user_metadata.avatar_url;
            if (!avatar && googleAvatar) {
                // Save Google photo to the user record so it persists
                avatar = googleAvatar;
                await sb.from('users').update({ avatar: googleAvatar }).eq('id', user.id);
            }
            // Also auto-populate name/username from Google if missing
            const googleName = session.user.user_metadata && session.user.user_metadata.full_name;
            const googleEmail = session.user.email || '';
            const updates = {};
            if (!user.name && googleName) updates.name = googleName;
            if (!user.email && googleEmail) updates.email = googleEmail;
            if (Object.keys(updates).length > 0) {
                await sb.from('users').update(updates).eq('id', user.id);
            }
            currentUser = {
                id: user.id,
                auth_id: user.auth_id,
                user_id: user.user_id,
                username: user.username,
                name: user.name || googleName || '',
                phone: user.phone || '',
                email: user.email || googleEmail,
                avatar: avatar,
                role: user.role || 'user'
            };
            // Sync to whichever storage is appropriate
            if (localStorage.getItem('technoid_remember_me') === '1') {
                localStorage.setItem('technoid_user', JSON.stringify(currentUser));
            } else {
                sessionStorage.setItem('technoid_user_session', JSON.stringify(currentUser));
            }
        } else { currentUser = null; }
    } else {
        // No live Supabase session — try session storage for tab-only login
        const sessionUser = sessionStorage.getItem('technoid_user_session');
        if (sessionUser) {
            try { currentUser = JSON.parse(sessionUser); } catch(e) { currentUser = null; }
        } else { currentUser = null; }
    }

    if (sessionStorage.getItem('technoid_admin') === '1' && currentUser && currentUser.role === 'admin') {
        isAdmin = true;
    }
    updateAuthUI();
    updateAdminUI();

    // Pre-fill remembered username in login form
    const remembered = localStorage.getItem('technoid_remembered_username');
    const loginInput = document.getElementById('loginUsername');
    const rememberCheck = document.getElementById('loginRememberMe');
    if (remembered && loginInput) {
        loginInput.value = remembered;
        if (rememberCheck) rememberCheck.checked = true;
    }
}


/* ── Edit Profile ── */
function prefillProfileEdits() {
    if (!currentUser) return;
    const n = document.getElementById('profileEditName');
    const p = document.getElementById('profileEditPhone');
    const e = document.getElementById('profileEditEmail');
    if (n) n.value = currentUser.name || '';
    if (p) p.value = currentUser.phone || '';
    if (e) e.value = currentUser.email || '';
    const errEl = document.getElementById('profileEditError');
    const sucEl = document.getElementById('profileEditSuccess');
    if (errEl) errEl.style.display = 'none';
    if (sucEl) sucEl.style.display = 'none';
}

async function saveProfileEdits() {
    const nameEl  = document.getElementById('profileEditName');
    const phoneEl = document.getElementById('profileEditPhone');
    const emailEl = document.getElementById('profileEditEmail');
    const errEl   = document.getElementById('profileEditError');
    const sucEl   = document.getElementById('profileEditSuccess');

    if (!nameEl || !phoneEl || !emailEl || !errEl || !sucEl) {
        showToast('Profile form not found. Please reopen the panel.', 'error'); return;
    }
    if (!currentUser) { showToast('You must be logged in to edit your profile.', 'error'); return; }

    errEl.style.display = 'none'; sucEl.style.display = 'none';

    const name  = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const email = emailEl.value.trim();

    if (!name)  { errEl.textContent = 'Name cannot be empty.';  errEl.style.display = 'block'; return; }
    if (!phone) { errEl.textContent = 'Phone cannot be empty.'; errEl.style.display = 'block'; return; }
    if (!email) { errEl.textContent = 'Email cannot be empty.'; errEl.style.display = 'block'; return; }

    try {
        const { error: dbErr } = await sb.from('users')
            .update({ name, phone, email })
            .eq('id', currentUser.id);
        if (dbErr) { errEl.textContent = 'Save failed: ' + dbErr.message; errEl.style.display = 'block'; return; }

        // Sync seller_phone on all of this user's listings (try both auth_id and user_id fields)
        const { error: prodErr1 } = await sb.from('products')
            .update({ seller_phone: phone })
            .eq('user_id', currentUser.auth_id);
        // Also try matching by the users table id in case schema differs
        const { error: prodErr2 } = await sb.from('products')
            .update({ seller_phone: phone })
            .eq('user_id', currentUser.id);
        if (prodErr1 && prodErr2) {
            errEl.textContent = 'Profile saved but listings could not be updated: ' + prodErr1.message;
            errEl.style.display = 'block';
        }

        // Bust cache and reload products from DB so payment details show new number immediately
        localStorage.removeItem(PRODUCTS_CACHE_KEY);
        await loadProducts();
        renderProducts();

        if (email !== currentUser.email) {
            const { error: authErr } = await sb.auth.updateUser({ email });
            if (authErr) { errEl.textContent = 'Profile saved, but email update failed: ' + authErr.message; errEl.style.display = 'block'; }
        }

        currentUser.name  = name;
        currentUser.phone = phone;
        currentUser.email = email;
        localStorage.setItem('technoid_user', JSON.stringify(currentUser));
        updateAuthUI();

        sucEl.textContent = 'Profile updated!';
        sucEl.style.display = 'block';
        setTimeout(() => { if (sucEl) sucEl.style.display = 'none'; }, 3000);

    } catch (err) {
        errEl.textContent = 'Unexpected error: ' + err.message;
        errEl.style.display = 'block';
    }
}


function _getOwnership(product) {
    const productUserId = product.user_id || null;
    const myId = currentUser ? currentUser.auth_id : null;
    const callerIsOwner = currentUser !== null && productUserId !== null && String(productUserId) === String(myId);
    return { productUserId, callerIsOwner };
}
function triggerDelete(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const { callerIsOwner } = _getOwnership(product);
    if (isAdmin) { deleteTargetId = productId; openModal('deleteModalAdmin') }
    else if (callerIsOwner) { deleteTargetId = productId; openModal('deleteModal') }
    else { openModal('notOwnerModal') }
}
async function confirmDeleteAdmin() {
    if (!isAdmin) { showToast('Not authorised.', 'error'); return }
    await performDelete(deleteTargetId);
    closeModal('deleteModalAdmin');
}
async function confirmDeleteUser() {
    const product = products.find(p => p.id === deleteTargetId);
    if (!product) { closeModal('deleteModal'); return }
    const { callerIsOwner } = _getOwnership(product);
    if (!callerIsOwner) { closeModal('deleteModal'); setTimeout(() => openModal('notOwnerModal'), 150); return }
    await performDelete(deleteTargetId);
    closeModal('deleteModal');
}
async function performDelete(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const { callerIsOwner } = _getOwnership(product);
    if (!isAdmin && !callerIsOwner) { showToast('Access denied.', 'error'); return }
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) { showToast('Error deleting: ' + error.message, 'error'); return }
    deleteTargetId = null;
    await loadProducts();
    showToast('Product deleted.', 'success');
}
async function toggleStock(productId) {
    if (!isAdmin) { showToast('Only admin can change stock status.', 'error'); return }
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const currentlyInStock = product.in_stock !== 0;
    const newVal = currentlyInStock ? 0 : 1;
    const newLabel = newVal === 1 ? 'In Stock' : 'Out of Stock';
    showToast('Toggling stock for "' + product.name + '"...');
    const { error } = await sb.from('products').update({ in_stock: newVal }).eq('id', productId);
    if (error) { showToast('Could not update stock: ' + error.message, 'error'); return }
    await loadProducts();
    showToast('Stock updated to ' + newLabel, 'success');
}

/* ── My Listings (User Profile) ── */
function renderMyListings() {
    if (!currentUser) return;
    const myId = currentUser.auth_id;
    const myProducts = products.filter(p => String(p.user_id) === String(myId));
    const container = document.getElementById('myListingsContainer');
    if (!container) return;
    if (myProducts.length === 0) {
        container.innerHTML = '<p style="color:var(--text3);font-size:.85rem;text-align:center;padding:1rem 0;">You have no active listings.</p>';
        return;
    }
    container.innerHTML = myProducts.map(p => {
        const inStock = p.in_stock !== 0;
        return '<div style="display:flex;align-items:center;gap:.8rem;padding:.7rem 0;border-bottom:1px solid var(--border);">' +
            (p.image ? '<img src="' + p.image + '" style="width:44px;height:44px;border-radius:6px;object-fit:cover;background:var(--card2);flex-shrink:0;" />' : '<div style="width:44px;height:44px;border-radius:6px;background:var(--card2);display:flex;align-items:center;justify-content:center;color:var(--text3);flex-shrink:0;">' + ICONS.package + '</div>') +
            '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + p.name + '</div>' +
            '<div style="font-size:.78rem;color:var(--accent);">' + p.price + '</div>' +
            '<button onclick="toggleMyListingStock(\'' + p.id + '\')" style="background:none;border:1px solid ' + (inStock ? 'rgba(0,200,100,0.45)' : 'rgba(255,100,100,0.45)') + ';color:' + (inStock ? '#4caf50' : '#ff6060') + ';border-radius:6px;padding:.18rem .45rem;cursor:pointer;font-size:.7rem;margin-top:.22rem;" title="Tap to toggle stock">● ' + (inStock ? 'In Stock' : 'Out of Stock') + '</button>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:.35rem;flex-shrink:0;">' +
            '<button onclick="openEditListing(\'' + p.id + '\')" style="background:none;border:1px solid rgba(0,194,255,0.4);color:var(--accent);border-radius:6px;padding:.28rem .5rem;cursor:pointer;" title="Edit listing">' + ICONS.edit + '</button>' +
            '<button onclick="deleteMyListing(\'' + p.id + '\')" style="background:none;border:1px solid rgba(255,100,100,0.4);color:#ff9090;border-radius:6px;padding:.28rem .5rem;cursor:pointer;" title="Delete listing">' + ICONS.trash + '</button>' +
            '</div>' +
            '</div>';
    }).join('');
}
async function toggleMyListingStock(productId) {
    if (!currentUser) { showToast('Please login first.', 'error'); return; }
    const product = products.find(p => p.id === productId);
    if (!product) { showToast('Product not found.', 'error'); return; }
    // Direct ownership check
    if (String(product.user_id) !== String(currentUser.auth_id)) {
        showToast('You can only update your own listings.', 'error'); return;
    }
    const newVal = product.in_stock !== 0 ? 0 : 1;
    const newLabel = newVal === 1 ? 'In Stock' : 'Out of Stock';
    const { error } = await sb.from('products').update({ in_stock: newVal }).eq('id', productId);
    if (error) { showToast('Could not update stock: ' + error.message, 'error'); return; }
    await loadProducts();
    renderMyListings();
    showToast('Stock updated to ' + newLabel, 'success');
}
function deleteMyListing(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const { callerIsOwner } = _getOwnership(product);
    if (!callerIsOwner) { showToast('You can only delete your own listings.', 'error'); return; }
    deleteTargetId = productId;
    openModal('deleteModal');
}

/* ── Edit Listing (User) ── */
let editTargetId = null;
function openEditListing(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    if (!isAdmin && (!currentUser || String(p.user_id) !== String(currentUser.auth_id))) { showToast('You can only edit your own listings.', 'error'); return; }
    editTargetId = productId;
    document.getElementById('editName').value = p.name || '';
    document.getElementById('editCategory').value = p.category || 'phone';
    document.getElementById('editPrice').value = p.price || '';
    document.getElementById('editDesc').value = p.description || '';
    document.getElementById('editStock').value = (p.in_stock !== 0) ? '1' : '0';
    const preview = document.getElementById('editImagePreview');
    if (p.image) { preview.src = p.image; preview.style.display = 'block'; } else { preview.style.display = 'none'; }
    document.getElementById('editSuccess').style.display = 'none';
    openModal('editListingModal');
}
async function saveEditListing() {
    if (!editTargetId) return;
    const product = products.find(x => x.id === editTargetId);
    if (!product) { showToast('Product not found.', 'error'); return; }
    if (!isAdmin && (!currentUser || String(product.user_id) !== String(currentUser.auth_id))) { showToast('Not authorised.', 'error'); return; }
    const name = document.getElementById('editName').value.trim();
    const cat = document.getElementById('editCategory').value;
    const price = document.getElementById('editPrice').value.trim();
    const desc = document.getElementById('editDesc').value.trim();
    const inStock = parseInt(document.getElementById('editStock').value);
    const imgInput = document.getElementById('editImage');
    if (!name || !price) { showToast('Please fill in name and price.', 'error'); return; }
    const doSave = async (imgUrl) => {
        const updates = { name, category: cat, price, description: desc, in_stock: inStock };
        if (imgUrl !== null) updates.image = imgUrl;
        const { error } = await sb.from('products').update(updates).eq('id', editTargetId);
        if (error) { showToast('Error saving changes: ' + error.message, 'error'); return; }
        document.getElementById('editSuccess').style.display = 'block';
        setTimeout(() => { document.getElementById('editSuccess').style.display = 'none'; closeModal('editListingModal'); }, 2000);
        editTargetId = null;
        await loadProducts();
        renderMyListings();
        showToast('Listing updated!', 'success');
    };
    if (imgInput.files && imgInput.files[0]) {
        const file = imgInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await sb.storage.from('products').upload(filePath, file);
        if (uploadError) { showToast('Error uploading image: ' + uploadError.message, 'error'); return }
        
        const { data } = sb.storage.from('products').getPublicUrl(filePath);
        doSave(data.publicUrl);
    } else { doSave(null); }
}

/* ── Admin Edit Products (browse & edit any product) ── */
function openAdminEditProducts() {
    if (!isAdmin) { showToast('Admin access required.', 'error'); return; }
    const container = document.getElementById('adminEditProductsList');
    if (!container) return;
    if (products.length === 0) {
        container.innerHTML = '<p style="color:var(--text3);font-size:.85rem;text-align:center;padding:1rem 0;">No products found.</p>';
    } else {
        container.innerHTML = products.map(p => {
            const inStock = p.in_stock !== 0;
            return '<div style="display:flex;align-items:center;gap:.8rem;padding:.7rem 0;border-bottom:1px solid var(--border);">' +
                (p.image ? '<img src="' + p.image + '" style="width:44px;height:44px;border-radius:6px;object-fit:cover;background:var(--card2);flex-shrink:0;" />' : '<div style="width:44px;height:44px;border-radius:6px;background:var(--card2);display:flex;align-items:center;justify-content:center;color:var(--text3);flex-shrink:0;">' + ICONS.package + '</div>') +
                '<div style="flex:1;min-width:0;">' +
                '<div style="font-size:.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + p.name + '</div>' +
                '<div style="font-size:.78rem;color:var(--accent);">' + p.price + '</div>' +
                '<div style="font-size:.7rem;color:var(--text3);">' + (p.seller_name ? 'by ' + p.seller_name : 'Admin product') + ' · ' + (inStock ? '● In Stock' : '○ Out of Stock') + '</div>' +
                '</div>' +
                '<button onclick="closeModal(\'adminEditProductsModal\'); openEditListing(\'' + p.id + '\')" style="background:none;border:1px solid rgba(0,194,255,0.4);color:var(--accent);border-radius:6px;padding:.35rem .7rem;cursor:pointer;font-size:.8rem;font-weight:600;flex-shrink:0;">Edit</button>' +
                '</div>';
        }).join('');
    }
    openModal('adminEditProductsModal');
}
function openAdminEditListing(productId) {
    if (!isAdmin) { showToast('Admin access required.', 'error'); return; }
    openEditListing(productId);
}

/* ── Hamburger menu shortcuts ── */
function openMyListingsView() {
    if (!currentUser) { openModal('authModal'); return; }
    openModal('userPanel');
    // Scroll to My Listings section
    setTimeout(() => {
        const container = document.getElementById('myListingsContainer');
        if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    renderMyListings();
}
function openPostProductView() {
    if (!currentUser) { openModal('authModal'); return; }
    openModal('userPanel');
    // Scroll to the top (sell form)
    setTimeout(() => {
        const panel = document.querySelector('#userPanel .modal');
        if (panel) panel.scrollTop = 0;
    }, 200);
}


/* ── Manage Users (Admin) ── */
window._adminUsers = [];

async function openManageUsers() {
    closeModal('adminOptionsModal');
    const container = document.getElementById('userListContainer');
    container.innerHTML = '<p style="color:var(--text3);font-size:.85rem;text-align:center;padding:1rem 0;">Loading...</p>';
    openModal('manageUsersModal');
    const { data: users, error } = await sb.from('users').select('*').order('user_id', { ascending: true });
    if (error || !users) { container.innerHTML = '<p style="color:red;">Failed to load users.</p>'; return; }
    if (users.length === 0) { container.innerHTML = '<p style="color:var(--text3);text-align:center;">No users found.</p>'; return; }
    window._adminUsers = users;
    let html = '';
    users.forEach(function (u, i) {
        html += '<div style="display:flex;align-items:center;gap:.8rem;padding:.75rem 0;border-bottom:1px solid var(--border);">'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="font-size:.88rem;font-weight:600;">@' + u.username + ' — ' + u.name + '</div>'
            + '<div style="font-size:.75rem;color:var(--text3);">' + (u.email || '') + (u.phone ? ' · ' + u.phone : '') + '</div>'
            + '</div>'
            + '<button data-i="' + i + '" style="background:#c0392b;color:#fff;border:none;border-radius:6px;padding:.35rem .8rem;cursor:pointer;font-weight:700;font-size:.82rem;">Delete</button>'
            + '</div>';
    });
    container.innerHTML = html;
    container.querySelectorAll('button[data-i]').forEach(function (btn) {
        btn.addEventListener('click', async function () {
            const u = window._adminUsers[parseInt(this.getAttribute('data-i'))];
            if (!u) return;
            if (!window.confirm('Delete @' + u.username + '?')) return;
            this.textContent = '...';
            this.disabled = true;
            const { data, error } = await sb.from('users').delete().eq('id', u.id).select();
            if (error) {
                showToast('Error: ' + error.message, 'error');
                this.textContent = 'Delete';
                this.disabled = false;
                return;
            }
            if (!data || data.length === 0) {
                showToast('Deletion failed! Please check Supabase RLS policies (must allow delete for users table).', 'error');
                this.textContent = 'Delete';
                this.disabled = false;
                return;
            }
            showToast('@' + u.username + ' deleted.', 'success');
            openManageUsers();
        });
    });
}

async function openMomo(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    document.getElementById('momoProductName').textContent = p.name;
    const isAdminProd = !p.seller_name;
    const phone = isAdminProd ? '0544833571' : (p.seller_phone || '0544833571');
    let sellerName = isAdminProd ? 'Atoopase Christopher' : (p.seller_name || 'Seller');
    if (!isAdminProd && p.user_id) {
        const { data: u } = await sb.from('users').select('name').eq('auth_id', p.user_id).maybeSingle();
        if (u && u.name) sellerName = u.name;
    }
    document.getElementById('momoDetails').innerHTML =
        'Send payment to:<br><strong>' + phone + '</strong> (' + sellerName + ')<br><br>After paying, send your MoMo transaction ID and name on WhatsApp to confirm your order.';
    const waNum = '233' + phone.replace(/^0/, '');
    document.getElementById('momoWhatsappLink').href =
        'https://wa.me/' + waNum + '?text=Hi%2C%20I\'m%20interested%20in%20the%20' + encodeURIComponent(p.name) + '%20listed%20at%20' + encodeURIComponent(p.price) + '%20on%20your%20shop.%20Can%20we%20negotiate%3F';
    openModal('momoModal');
}

/* ── Paystack ── */
function openPaystack(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    paystackTargetProduct = p;
    document.getElementById('paystackProductLabel').textContent = p.name + ' — ' + p.price;
    document.getElementById('paystackEmail').value = '';
    document.getElementById('paystackPhone').value = '';
    document.getElementById('paystackError').style.display = 'none';
    openModal('paystackModal');
}
function initiatePaystack() {
    const email = document.getElementById('paystackEmail').value.trim();
    const phone = document.getElementById('paystackPhone').value.trim();
    const errEl = document.getElementById('paystackError');
    if (!email || !phone) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; return }
    if (!paystackTargetProduct) return;
    errEl.style.display = 'none';
    const rawPrice = paystackTargetProduct.price.replace(/[^\d.]/g, '');
    const amountPesewas = Math.round(parseFloat(rawPrice || 0) * 100);
    if (!amountPesewas) { errEl.textContent = 'Could not parse product price.'; errEl.style.display = 'block'; return }
    closeModal('paystackModal');
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY, email, amount: amountPesewas, currency: 'GHS',
        ref: 'TN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        metadata: {
            custom_fields: [
                { display_name: 'Phone', variable_name: 'phone', value: phone },
                { display_name: 'Product', variable_name: 'product', value: paystackTargetProduct.name }
            ]
        },
        callback: function (response) { saveTransaction(response, paystackTargetProduct, email, phone); showReceipt(response, paystackTargetProduct, phone) },
        onClose: function () { }
    });
    handler.openIframe();
}
async function saveTransaction(response, product, email, phone) {
    await sb.from('transactions').insert([{
        product_id: product.id, product_name: product.name, amount: product.price,
        paystack_ref: response.reference, buyer_email: email, buyer_phone: phone,
        paid_at: new Date().toISOString()
    }]).catch(e => console.warn('Transaction save error:', e));
}

/* ── Receipt ── */
function showReceipt(response, product, phone) {
    const dateStr = new Date().toLocaleString('en-GH', { dateStyle: 'full', timeStyle: 'short' });
    document.getElementById('receiptContent').innerHTML =
        '<div style="text-align:center;margin-bottom:1rem">' +
        '<h2>' + ICONS.receipt + ' Tekstore — Payment Receipt</h2>' +
        '<small style="color:#666">technoidfix.netlify.app | 0544833571</small></div>' +
        '<div class="r-row"><span>Product</span><span>' + product.name + '</span></div>' +
        '<div class="r-row"><span>Amount Paid</span><span>' + product.price + '</span></div>' +
        '<div class="r-row"><span>Buyer Phone</span><span>' + phone + '</span></div>' +
        '<div class="r-row"><span>Date &amp; Time</span><span>' + dateStr + '</span></div>' +
        '<div class="r-row"><span>Paystack Ref</span><span style="font-family:monospace;font-size:0.78rem">' + response.reference + '</span></div>' +
        '<div class="r-row" style="color:green;font-weight:700"><span>Status</span><span style="display:flex;align-items:center;gap:4px;">' + ICONS.check + ' Payment Verified</span></div>';
    openModal('receiptModal');
}
function printReceipt() {
    const content = document.getElementById('receiptContent').innerHTML;
    const win = window.open('', '_blank');
    var d = win.document; d.open();
    d.write('<html><head><title>Receipt — Tekstore<' + '/title><' + 'style>');
    d.write('body{font-family:sans-serif;padding:2rem;max-width:500px;margin:auto;}');
    d.write('.r-row{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:0.4rem 0;}');
    d.write('h2{color:#007bBB;margin-bottom:0.5rem;}');
    d.write('<' + '/style><' + '/head><body>');
    d.write(content);
    d.write('<' + '/body><' + '/html>');
    d.close(); win.focus(); win.print();
}
function downloadReceipt() {
    const text = document.getElementById('receiptContent').innerText;
    const content = 'TEKSTORE — PAYMENT RECEIPT\n\n' + text;
    try {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'technoid_receipt.txt';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); return;
    } catch (e) { }
    try {
        const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
        const win = window.open(dataUri, '_blank');
        if (win) return;
    } catch (e) { }
    document.getElementById('receiptTextArea').value = content;
    openModal('receiptTextModal');
}
function selectReceiptText() {
    const ta = document.getElementById('receiptTextArea');
    ta.focus(); ta.select();
    try { ta.setSelectionRange(0, ta.value.length) } catch (e) { }
}

/* ── Filter & Render ── */
function catLabel(cat) {
    var map = {
        phone: 'Phone', laptop: 'Laptop', tablet: 'Tablet', accessory: 'Accessory',
        audio: 'Audio', other: 'Gadget', charger: 'Charger', powerbank: 'Power Bank',
        smartwatch: 'Smart Watch', speaker: 'Speaker', rice: 'Rice', cookingoil: 'Cooking Oil',
        drinks: 'Drinks', fan: 'Fan', blender: 'Blender', kettle: 'Kettle',
        microwave: 'Microwave', refrigerator: 'Refrigerator', shoes: 'Shoes', bags: 'Bags',
        'mens-clothing': "Men's Clothing", 'womens-clothing': "Women's Clothing",
        watches: 'Watches', sunglasses: 'Sunglasses', 'elec-components': 'Electrical Components',
        'elec-tools': 'Electrical Tools', 'body-cream': 'Body Cream', 'hair-products': 'Hair Products',
        perfumes: 'Perfumes', 'shaving-kits': 'Shaving Kits', 'body-oil': 'Body Oil'
    };
    return map[cat] || cat;
}
function renderProducts() {
    var grid = document.getElementById('productsGrid');
    var filtered;

    // Determine filter mode: main cat > sub cat > legacy filter
    if (currentMainCat) {
        var mainDef = CATEGORIES.find(function (c) { return c.id === currentMainCat; });
        if (mainDef) {
            var subKeys = mainDef.subs.map(function (s) { return s.key; });
            if (currentSubCat) {
                filtered = products.filter(function (p) { return p.category === currentSubCat; });
            } else {
                filtered = products.filter(function (p) { return subKeys.indexOf(p.category) !== -1; });
            }
        } else {
            filtered = products;
        }
    } else {
        // Legacy / All mode
        filtered = currentFilter === 'all' ? products : products.filter(function (p) { return p.category === currentFilter; });
    }

    document.getElementById('productCount').textContent = filtered.length + ' Item' + (filtered.length !== 1 ? 's' : '');
    if (filtered.length === 0) {
        var emptyLabel = currentSubCat ? catLabel(currentSubCat) : (currentMainCat ? (CATEGORIES.find(function (c) { return c.id === currentMainCat; }) || {}).label || currentMainCat : catLabel(currentFilter));
        grid.innerHTML = '<div class="no-products"><div class="no-img-placeholder" style="width:80px;height:70px;margin:0 auto 1rem;border:2px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;"></div>' +
            '<h3>' + ((!currentMainCat && currentFilter === 'all') ? 'No Products Yet' : 'No ' + emptyLabel + ' Listed') + '</h3>' +
            '<p>' + ((!currentMainCat && currentFilter === 'all') ? 'Products appear here once there is a network.' : 'Check back soon or view all products.') + '</p></div>';
        return;
    }
    grid.innerHTML = filtered.map(function (p) {
        var ownership = _getOwnership(p);
        var isAdminProd = !p.seller_name;
        var inStock = p.in_stock !== 0;
        var stockBadge = isAdmin
            ? '<button class="prod-badge-stock ' + (inStock ? 'badge-instock' : 'badge-outstock') + '" onclick="toggleStock(\'' + p.id + '\')" title="Tap to toggle stock">● ' + (inStock ? 'In Stock' : 'Out of Stock') + '</button>'
            : '<span class="prod-badge-stock ' + (inStock ? 'badge-instock' : 'badge-outstock') + '">● ' + (inStock ? 'In Stock' : 'Out of Stock') + '</span>';
        var deleteBtn = isAdmin ? '<button class="delete-btn" onclick="triggerDelete(\'' + p.id + '\')" title="Delete product" aria-label="Delete product">' + ICONS.trash + '</button>' : '';
        var editBtn = isAdmin ? '<button class="edit-btn" onclick="openAdminEditListing(\'' + p.id + '\')" title="Edit product" aria-label="Edit product">' + ICONS.edit + '</button>' : '';
        var sellerBadge = (!isAdminProd && p.seller_name) ? '<span class="prod-badge-seller">' + p.seller_name + '</span>' : '';
        var payBtn = isAdminProd
            ? '<button class="btn-paystack" onclick="openPaystack(\'' + p.id + '\')">' + ICONS.momoObj + ' MoMo / Card</button>'
            : '<button class="btn-momo" onclick="openMomo(\'' + p.id + '\')">' + ICONS.momoObj + ' Pay MoMo</button>';
        var waPhone = isAdminProd ? '0544833571' : (p.seller_phone || '0544833571');
        var waLink = 'https://wa.me/233' + waPhone.replace(/^0/, '') + '?text=Hi%2C%20I\'m%20interested%20in%20the%20' + encodeURIComponent(p.name) + '%20listed%20at%20' + encodeURIComponent(p.price) + '%20on%20your%20shop.%20Can%20we%20negotiate%3F';
        var cartOverlay = inStock
            ? '<button class="btn-cart-overlay' + (cart.some(function (c) { return c.id === p.id; }) ? ' in-cart' : '') + '" onclick="event.stopPropagation();addToCart(\'' + p.id + '\')" title="Add to cart">' + (cart.some(function (c) { return c.id === p.id; }) ? '✓' : '+') + '</button>'
            : '';
        return '<div class="product-card lazy-card' + (!inStock ? ' out-of-stock' : '') + '" data-id="' + p.id + '">' +
            '<div class="prod-img-wrap" onclick="openProductSpec(\'' + p.id + '\')" style="cursor:pointer;">' +
            (p.image ? '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" />' : '<div class="no-img-placeholder"><div class="ph-box"></div><span>No Image</span></div>') +
            stockBadge + deleteBtn + editBtn + cartOverlay +
            '</div>' +
            '<div class="prod-body">' +
            '<div class="prod-name-row">' +
            '<div class="prod-name" onclick="openProductSpec(\'' + p.id + '\')" style="cursor:pointer;">' + p.name + '</div>' +
            sellerBadge +
            '</div>' +
            (p.description ? '<div class="prod-desc">' + p.description + '</div>' : '') +
            '<div class="prod-price">' + p.price + '</div>' +
            '<div class="prod-actions">' +
            '<a href="' + waLink + '" target="_blank" class="btn-wa">' + ICONS.whatsapp + ' WhatsApp</a>' +
            payBtn +
            '</div></div></div>';
    }).join('');

    // Trigger lazy-load IntersectionObserver on newly rendered cards
    observeProductCards();
}


/* ── Product Spec Modal ── */
function openProductSpec(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const inStock = p.in_stock !== 0;
    const isAdminProd = !p.seller_name;
    const sellerName = isAdminProd ? 'Tekstore' : (p.seller_name || 'Seller');
    const sellerPhone = isAdminProd ? '0544833571' : (p.seller_phone || '0544833571');
    const waLink = 'https://wa.me/233' + sellerPhone.replace(/^0/, '') + '?text=Hi%2C%20I\'m%20interested%20in%20the%20' + encodeURIComponent(p.name) + '%20listed%20at%20' + encodeURIComponent(p.price) + '%20on%20your%20shop.%20Can%20we%20negotiate%3F';
    const catLabel = { phone: ICONS.phone + ' Phone', laptop: ICONS.laptop + ' Laptop', tablet: ICONS.tablet + ' Tablet', accessory: ICONS.accessory + ' Accessory', audio: ICONS.audio + ' Audio', other: ICONS.gadget + ' Gadget' };

    document.getElementById('specModalContent').innerHTML =
        '<div class="spec-layout">' +
        '<div class="spec-img-col">' +
        (p.image
            ? '<div class="spec-img-zoom-wrap" id="specZoomWrap">' +
              '<img src="' + p.image + '" alt="' + p.name + '" id="specZoomImg" />' +
              '<div class="zoom-lens" id="specZoomLens"></div>' +
              '<div class="zoom-result" id="specZoomResult"></div>' +
              '</div>'
            : '<div class="spec-no-img">' + ICONS.package + '<br><span>No Image</span></div>') +
        '<div class="spec-stock-badge ' + (inStock ? 'spec-instock' : 'spec-outstock') + '">● ' + (inStock ? 'In Stock' : 'Out of Stock') + '</div>' +
        '</div>' +
        '<div class="spec-info-col">' +
        '<div class="spec-category">' + (catLabel[p.category] || p.category) + '</div>' +
        '<h2 class="spec-title">' + p.name + '</h2>' +
        '<div class="spec-price">' + p.price + '</div>' +
        (p.description ? '<div class="spec-section"><div class="spec-label">Description / Specs</div><div class="spec-desc-block">' + p.description.replace(/\n/g, '<br>') + '</div></div>' : '') +
        '<div class="spec-section"><div class="spec-label">Seller</div><div class="spec-seller-info">' +
        '<span class="spec-seller-name">' + sellerName + '</span>' +
        '<span class="spec-seller-phone">📞 ' + sellerPhone + '</span>' +
        '</div></div>' +
        '<div class="spec-actions">' +
        (inStock
            ? (isAdminProd
                ? '<button class="btn-submit spec-pay-btn" onclick="closeModal(\'productSpecModal\');openPaystack(\'' + p.id + '\')"><span style="display:flex;align-items:center;justify-content:center;gap:6px">' + ICONS.momoObj + ' Pay MoMo / Card</span></button>'
                : '<button class="btn-submit spec-pay-btn" onclick="closeModal(\'productSpecModal\');openMomo(\'' + p.id + '\')"><span style="display:flex;align-items:center;justify-content:center;gap:6px">' + ICONS.momoObj + ' Pay via MoMo</span></button>')
            : '<button class="btn-submit spec-pay-btn" disabled style="opacity:.5;cursor:not-allowed;">Out of Stock</button>') +
        '<a href="' + waLink + '" target="_blank" class="btn-wa spec-wa-btn">' + ICONS.messageCircle + ' WhatsApp</a>' +
        '</div>' +
        '</div></div>';
    openModal('productSpecModal');
    if (p.image) {
        // Wait for DOM to paint before initialising zoom
        requestAnimationFrame(() => initAmazonZoom('specZoomWrap', 'specZoomImg', 'specZoomLens', 'specZoomResult', 3));
    }
}

/* ── Amazon-style Image Zoom ── */
function initAmazonZoom(wrapId, imgId, lensId, resultId, zoomLevel) {
    const wrap   = document.getElementById(wrapId);
    const img    = document.getElementById(imgId);
    const lens   = document.getElementById(lensId);
    const result = document.getElementById(resultId);
    if (!wrap || !img || !lens || !result) return;

    zoomLevel = zoomLevel || 3;

    function updateZoom(e) {
        e.preventDefault();
        const rect   = img.getBoundingClientRect();
        const scaleX = img.naturalWidth  / rect.width;
        const scaleY = img.naturalHeight / rect.height;

        // Lens dimensions (1/zoomLevel of image)
        const lensW = result.offsetWidth  / zoomLevel;
        const lensH = result.offsetHeight / zoomLevel;
        lens.style.width  = lensW + 'px';
        lens.style.height = lensH + 'px';

        // Cursor position relative to image
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let x = clientX - rect.left - lensW / 2;
        let y = clientY - rect.top  - lensH / 2;

        // Clamp
        x = Math.max(0, Math.min(x, rect.width  - lensW));
        y = Math.max(0, Math.min(y, rect.height - lensH));
        lens.style.left = x + 'px';
        lens.style.top  = y + 'px';

        // Background position in result panel
        const bgX = -(x * scaleX * (result.offsetWidth  / img.naturalWidth)  * zoomLevel);
        const bgY = -(y * scaleY * (result.offsetHeight / img.naturalHeight) * zoomLevel);
        result.style.backgroundImage    = 'url(' + img.src + ')';
        result.style.backgroundSize     = (rect.width * zoomLevel) + 'px ' + (rect.height * zoomLevel) + 'px';
        result.style.backgroundPosition = bgX + 'px ' + bgY + 'px';
    }

    wrap.addEventListener('mousemove',  updateZoom);
    wrap.addEventListener('touchmove',  updateZoom, { passive: false });

    // Handle enter/leave on mobile by detecting touch start/end
    wrap.addEventListener('touchstart', (e) => {
        lens.style.display   = 'block';
        result.style.display = 'block';
        updateZoom(e);
    }, { passive: false });
    wrap.addEventListener('touchend', () => {
        lens.style.display   = 'none';
        result.style.display = 'none';
    });
}

/* ── Scroll Reveal ── */
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ── Close modal on backdrop click ── */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open') });
});

/* ── Forgot Password ── */
async function sendPasswordReset() {
    const email = document.getElementById('resetEmail').value.trim();
    const errEl = document.getElementById('resetError'), sucEl = document.getElementById('resetSuccess');
    errEl.style.display = 'none'; sucEl.style.display = 'none';
    if (!email) { errEl.textContent = 'Please enter your email.'; errEl.style.display = 'block'; return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Please enter a valid email address.'; errEl.style.display = 'block'; return }
    const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
    });
    if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block'; return }

    sucEl.textContent = 'Password reset instructions have been sent to your email!';
    sucEl.style.display = 'block';
    document.getElementById('resetEmail').value = '';
    setTimeout(() => { sucEl.style.display = 'none'; closeModal('forgotPasswordModal') }, 4000);
}

/* ── Auth State Handler ── */
sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
        // User clicked the recovery link — show the new password modal
        openModal('newPasswordModal');
    }

    if (event === 'SIGNED_IN' && session) {
        // Supabase places access_token in the URL hash ONLY when redirecting from
        // an email verification, magic-link click, or OAuth redirect. Regular page
        // loads and normal logins never have it, so this guard prevents a race with
        // the startup restoreSession() call.
        const isRedirect = window.location.hash.includes('access_token');
        if (isRedirect) {
            // Check if this is an OAuth user who may not have a profile yet
            const authUser = session.user;
            const { data: existingUser } = await sb.from('users').select('*').eq('auth_id', authUser.id).maybeSingle();

            if (!existingUser) {
                // Auto-create a profile for Google OAuth users
                const meta = authUser.user_metadata || {};
                const name = meta.full_name || meta.name || authUser.email.split('@')[0];
                const username = (meta.preferred_username || authUser.email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '_');
                const email = authUser.email || '';
                const avatar = meta.avatar_url || meta.picture || '';

                const { error: insertErr } = await sb.from('users').insert([{
                    auth_id: authUser.id,
                    name: name,
                    username: username,
                    email: email,
                    phone: '',
                    avatar: avatar,
                    role: 'user'
                }]);
                if (insertErr) {
                    console.warn('Could not auto-create profile for OAuth user:', insertErr.message);
                }
            }

            await restoreSession();
            showToast('Signed in successfully!', 'success');
            // Clean the token from the URL so a refresh doesn't re-trigger this
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }
});

async function updateNewPassword() {
    const newPass = document.getElementById('newPasswordInput').value;
    const confirmPass = document.getElementById('confirmPasswordInput').value;
    const errEl = document.getElementById('newPasswordError');
    const sucEl = document.getElementById('newPasswordSuccess');
    errEl.style.display = 'none'; sucEl.style.display = 'none';

    if (!newPass || !confirmPass) { errEl.textContent = 'Please fill in both fields.'; errEl.style.display = 'block'; return }
    if (newPass.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; return }
    if (newPass !== confirmPass) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return }

    const { error } = await sb.auth.updateUser({ password: newPass });
    if (error) { errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block'; return }

    sucEl.textContent = 'Password updated successfully! You can now login with your new password.';
    sucEl.style.display = 'block';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    setTimeout(() => { sucEl.style.display = 'none'; closeModal('newPasswordModal') }, 3000);
}

/* ── Cart ── */
function saveCart() { localStorage.setItem('technoid_cart', JSON.stringify(cart)) }
function updateCartBadge() {
    const total = cart.reduce((s, c) => s + c.qty, 0);
    document.getElementById('cartCount').textContent = total || '';
}
function addToCart(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const existing = cart.find(c => c.id === p.id);
    if (existing) { existing.qty++; }
    else { cart.push({ id: p.id, name: p.name, price: p.price, image: p.image || '', qty: 1 }); }
    saveCart(); updateCartBadge(); renderProducts();
}
function removeFromCart(productId) {
    cart = cart.filter(c => c.id !== productId);
    saveCart(); updateCartBadge(); renderCart(); renderProducts();
}
function updateCartQty(productId, delta) {
    const item = cart.find(c => c.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(productId); return; }
    saveCart(); updateCartBadge(); renderCart();
}
function parsePrice(priceStr) {
    const num = parseFloat((priceStr || '').replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
}
function renderCart() {
    const list = document.getElementById('cartItemsList');
    const totalRow = document.getElementById('cartTotalRow');
    const actions = document.getElementById('cartActions');
    if (cart.length === 0) {
        list.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon" style="color:var(--text3);margin-bottom:1rem;">' + ICONS.cartEmpty + '</div><p>Your cart is empty</p></div>';
        totalRow.style.display = 'none'; actions.style.display = 'none';
        return;
    }
    let total = 0;
    list.innerHTML = '<div class="cart-items">' + cart.map(c => {
        const itemTotal = parsePrice(c.price) * c.qty;
        total += itemTotal;
        const img = c.image ? '<img src="' + c.image + '" class="cart-item-img" />' : '<div class="cart-item-img-ph">📦</div>';
        return '<div class="cart-item">' + img +
            '<div class="cart-item-info"><div class="cart-item-name">' + c.name + '</div>' +
            '<div class="cart-item-price">' + c.price + '</div></div>' +
            '<div class="cart-qty">' +
            '<button onclick="updateCartQty(\'' + c.id + '\', -1)" aria-label="Decrease quantity">−</button>' +
            '<span>' + c.qty + '</span>' +
            '<button onclick="updateCartQty(\'' + c.id + '\', 1)" aria-label="Increase quantity">+</button></div>' +
            '<button class="cart-remove" onclick="removeFromCart(\'' + c.id + '\')" title="Remove" aria-label="Remove item">' + ICONS.remove + '</button></div>';
    }).join('') + '</div>';
    document.getElementById('cartTotalAmount').textContent = 'GHS ' + total.toLocaleString('en', { minimumFractionDigits: 2 });
    totalRow.style.display = ''; actions.style.display = '';
}
function checkoutCart() {
    if (cart.length === 0) return;

    // Group items by seller
    const sellerGroups = {};
    cart.forEach(c => {
        const product = products.find(p => p.id === c.id);
        const isAdminProd = !product || !product.seller_name;
        const phone = isAdminProd ? '0544833571' : (product && product.seller_phone ? product.seller_phone : '0544833571');
        const sellerName = isAdminProd ? 'Tekstore' : (product && product.seller_name ? product.seller_name : 'Seller');
        if (!sellerGroups[phone]) sellerGroups[phone] = { phone, sellerName, items: [] };
        sellerGroups[phone].items.push(c);
    });

    Object.values(sellerGroups).forEach(({ phone, sellerName, items }) => {
        let total = 0;
        const lines = items.map(c => {
            const itemTotal = parsePrice(c.price) * c.qty;
            total += itemTotal;
            return '• ' + c.name + ' × ' + c.qty + '  —  ' + c.price;
        });

        const divider = '─────────────────────';
        const msg =
            '🛒 *ORDER FROM TEKSTORE*\n' +
            divider + '\n' +
            lines.join('\n') + '\n' +
            divider + '\n' +
            '*Total: GHS ' + total.toLocaleString('en', { minimumFractionDigits: 2 }) + '*\n\n' +
            'Please confirm availability and share payment details. Thank you! 🙏';

        const waNum = '233' + phone.replace(/^0/, '');
        window.open('https://wa.me/' + waNum + '?text=' + encodeURIComponent(msg), '_blank');
    });
}

function clearCart() {
    customConfirm('Clear Cart', 'Clear all items from your cart?', () => {
        cart = []; saveCart(); updateCartBadge(); renderCart(); renderProducts();
        showToast('Cart cleared.');
    });
}

function checkoutCartPaystack() {
    if (cart.length === 0) return;

    // Check if cart has any non-admin (user-seller) products
    const nonAdminItems = cart.filter(c => {
        const product = products.find(p => p.id === c.id);
        return product && !!product.seller_name;
    });
    const adminItems = cart.filter(c => {
        const product = products.find(p => p.id === c.id);
        return !product || !product.seller_name;
    });

    // If ALL items are from user sellers, show MoMo modal for each seller
    if (nonAdminItems.length > 0 && adminItems.length === 0) {
        // Group by seller
        const sellerGroups = {};
        nonAdminItems.forEach(c => {
            const product = products.find(p => p.id === c.id);
            const phone = product.seller_phone || '0544833571';
            const sellerName = product.seller_name || 'Seller';
            if (!sellerGroups[phone]) sellerGroups[phone] = { phone, sellerName, items: [] };
            sellerGroups[phone].items.push(c);
        });
        const first = Object.values(sellerGroups)[0];
        let total = first.items.reduce((s, c) => s + parsePrice(c.price) * c.qty, 0);
        let itemList = first.items.map(c => c.name + ' ×' + c.qty).join(', ');
        const waNum = '233' + first.phone.replace(/^0/, '');
        document.getElementById('momoProductName').textContent = 'Cart: ' + itemList;
        document.getElementById('momoDetails').innerHTML =
            'Send payment of <strong>GHS ' + total.toLocaleString('en', { minimumFractionDigits: 2 }) + '</strong> to:<br>' +
            '<strong>' + first.phone + '</strong> (' + first.sellerName + ')<br><br>' +
            'After paying, send your MoMo transaction ID and name on WhatsApp to confirm your order.';
        document.getElementById('momoWhatsappLink').href =
            'https://wa.me/' + waNum + '?text=' + encodeURIComponent('Hi ' + first.sellerName + ', I want to pay via MoMo for: ' + itemList + '. Total: GHS ' + total.toFixed(2));
        closeModal('cartModal');
        openModal('momoModal');
        return;
    }

    // If ALL items are admin products, open Paystack
    if (adminItems.length > 0 && nonAdminItems.length === 0) {
        var total = cart.reduce(function (s, c) { return s + parsePrice(c.price) * c.qty; }, 0);
        if (!total) { showToast('Could not calculate cart total.', 'error'); return; }
        var summary = cart.map(function (c) { return c.name + ' ×' + c.qty; }).join(', ');
        paystackTargetProduct = { id: 'cart', name: 'Cart: ' + summary, price: 'GHS ' + total.toFixed(2) };
        document.getElementById('paystackProductLabel').textContent = 'Cart Total — GHS ' + total.toLocaleString('en', { minimumFractionDigits: 2 });
        document.getElementById('paystackEmail').value = '';
        document.getElementById('paystackPhone').value = '';
        document.getElementById('paystackError').style.display = 'none';
        closeModal('cartModal');
        openModal('paystackModal');
        return;
    }

    // Mixed cart — notify user to handle separately
    showToast('Your cart has items from different sellers. Please buy them separately for correct payment routing.', 'error');
}

/* ── Search ── */
function setupSearch(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const box = document.getElementById(suggestionsId);
    if (!input || !box) return;
    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        if (!q) { box.classList.remove('active'); return; }
        const matches = products.filter(p =>
            p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
        );
        if (matches.length === 0) {
            box.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--text3);font-size:0.83rem;">No products found</div>';
        } else {
            box.innerHTML = matches.slice(0, 6).map(p => `
                <div class="suggestion-item" onclick="openProductSpec('${p.id}'); input_${inputId}_clear();">
                    ${p.image ? `<img src="${p.image}" class="suggest-img" onerror="this.style.display='none'" />` : `<div class="suggest-img" style="background:var(--bg3);display:flex;align-items:center;justify-content:center;color:var(--text3);">${ICONS.package}</div>`}
                    <div class="suggest-info">
                        <div class="suggest-name">${p.name}</div>
                        <div class="suggest-price">${p.price}</div>
                    </div>
                </div>`).join('');
        }
        box.classList.add('active');
    });
    window['input_' + inputId + '_clear'] = () => {
        input.value = '';
        box.classList.remove('active');
        closeMobileNav();
    };
    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !box.contains(e.target)) box.classList.remove('active');
    });
}

window.addEventListener('DOMContentLoaded', () => {
    setupSearch('searchInput', 'searchSuggestions');
    setupSearch('mobileSearchInput', 'mobileSearchSuggestions');

    // Initialize category navigation
    renderCategoryNav();

    // Navbar scroll effect
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }
});

function togglePasswordVisibility(inputId, btnElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        btnElement.innerHTML = '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
        btnElement.style.color = 'var(--accent)';
    } else {
        input.type = 'password';
        btnElement.innerHTML = '<svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
        btnElement.style.color = 'var(--text3)';
    }
}

/* ── Init ── */
// Run session restore and product load in parallel for faster startup
Promise.all([restoreSession(), loadProducts()]).then(function () {
    renderProducts();
});
updateCartBadge();
/* open cart modal renders fresh; user panel renders listings */
const _origOpenModal = openModal;
openModal = function (id) {
    if (id === 'cartModal') renderCart();
    if (id === 'userPanel') { prefillProfileEdits(); setTimeout(renderMyListings, 50); }
    _origOpenModal(id);
};

// Init theme icon after DOM ready
setThemeIcon(localStorage.getItem('technoid_theme') || 'dark');

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

/* ══════════════════════════════════════════════════════
   CAROUSEL SYSTEM — Categories + Featured Products
   ══════════════════════════════════════════════════════ */

/* ── Carousel Factory ──────────────────────────────────
   Creates a self-contained carousel controller for any
   .carousel-track element with arrow buttons and dots.
   ──────────────────────────────────────────────────── */
function createCarousel(trackId, prevBtnId, nextBtnId, dotsId) {
  var track    = document.getElementById(trackId);
  var prevBtn  = document.getElementById(prevBtnId);
  var nextBtn  = document.getElementById(nextBtnId);
  var dotsEl   = document.getElementById(dotsId);

  if (!track) return null;

  // ── Touch / Mouse drag state
  var isDragging = false;
  var dragStartX = 0;
  var dragScrollLeft = 0;
  var dragMoved = false;

  function getItemWidth() {
    var first = track.firstElementChild;
    if (!first) return 200;
    return first.offsetWidth + parseInt(getComputedStyle(track).gap || '16', 10);
  }

  function clampScroll(pos) {
    return Math.max(0, Math.min(pos, track.scrollWidth - track.clientWidth));
  }

  function scrollByItems(delta) {
    var step = getItemWidth() * Math.abs(delta);
    var target = clampScroll(track.scrollLeft + step * Math.sign(delta));
    track.scrollTo({ left: target, behavior: 'smooth' });
  }

  function updateDots() {
    if (!dotsEl || dotsEl.children.length === 0) return;
    var max = track.scrollWidth - track.clientWidth;
    if (max <= 0) return;
    var ratio = track.scrollLeft / max;
    var total = dotsEl.children.length;
    var idx   = Math.min(Math.round(ratio * (total - 1)), total - 1);
    Array.from(dotsEl.children).forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 0;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= max - 2;
  }

  function buildDots(numItems) {
    if (!dotsEl) return;
    // Show one dot per ~3 items (groups), max 8 dots
    var numDots = Math.min(Math.ceil(numItems / 3), 8);
    if (numDots <= 1) { dotsEl.style.display = 'none'; return; }
    dotsEl.innerHTML = '';
    for (var i = 0; i < numDots; i++) {
      var d = document.createElement('button');
      d.className = 'c-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      (function (idx) {
        d.addEventListener('click', function () {
          var max = track.scrollWidth - track.clientWidth;
          var ratio = numDots > 1 ? idx / (numDots - 1) : 0;
          track.scrollTo({ left: clampScroll(ratio * max), behavior: 'smooth' });
        });
      })(i);
      dotsEl.appendChild(d);
    }
  }

  // ── Arrow buttons
  if (prevBtn) prevBtn.addEventListener('click', function () { scrollByItems(-3); });
  if (nextBtn) nextBtn.addEventListener('click', function () { scrollByItems(3); });

  // ── Scroll → update dots
  track.addEventListener('scroll', updateDots, { passive: true });

  // ── Touch swipe
  track.addEventListener('touchstart', function (e) {
    dragStartX     = e.touches[0].clientX;
    dragScrollLeft = track.scrollLeft;
    dragMoved      = false;
    track.style.scrollSnapType = 'none';
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    var dx = dragStartX - e.touches[0].clientX;
    if (Math.abs(dx) > 5) dragMoved = true;
    track.scrollLeft = dragScrollLeft + dx;
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    track.style.scrollSnapType = '';
    if (dragMoved) {
      // Snap to nearest item
      var item = getItemWidth();
      var nearest = Math.round(track.scrollLeft / item) * item;
      track.scrollTo({ left: clampScroll(nearest), behavior: 'smooth' });
    }
  }, { passive: true });

  // ── Mouse drag (desktop)
  track.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragMoved  = false;
    dragStartX = e.pageX - track.offsetLeft;
    dragScrollLeft = track.scrollLeft;
    track.classList.add('is-dragging');
    track.style.scrollSnapType = 'none';
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    e.preventDefault();
    var dx = e.pageX - track.offsetLeft - dragStartX;
    if (Math.abs(dx) > 5) dragMoved = true;
    track.scrollLeft = dragScrollLeft - dx;
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');
    track.style.scrollSnapType = '';
    if (dragMoved) {
      var item = getItemWidth();
      var nearest = Math.round(track.scrollLeft / item) * item;
      track.scrollTo({ left: clampScroll(nearest), behavior: 'smooth' });
    }
  });

  // Prevent click-through after drag
  track.addEventListener('click', function (e) {
    if (dragMoved) e.stopPropagation();
  }, true);

  // ── Auto-slide (Amazon-style) ──────────────────────────
  var autoTimer = null;
  var autoInterval = 3200; // ms between slides
  var autoItemsPerStep = 1;

  function autoStep() {
    var max = track.scrollWidth - track.clientWidth;
    if (max <= 0) return;
    var next = track.scrollLeft + getItemWidth() * autoItemsPerStep;
    if (next >= max - 2) {
      // Loop back to start smoothly
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollTo({ left: next, behavior: 'smooth' });
    }
  }

  function startAuto() {
    if (autoTimer) clearInterval(autoTimer);
    // If the track has no scrollable width yet (images still loading),
    // keep retrying every 300ms until it does — fixes deployed/network environments
    var max = track.scrollWidth - track.clientWidth;
    if (max <= 0) {
      setTimeout(startAuto, 300);
      return;
    }
    autoTimer = setInterval(autoStep, autoInterval);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Pause on hover / touch
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('touchstart', stopAuto, { passive: true });
  track.addEventListener('touchend', function () {
    setTimeout(startAuto, 2000); // resume after 2s
  }, { passive: true });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAuto(); else startAuto();
  });

  startAuto();

  return { buildDots: buildDots, updateDots: updateDots, startAuto: startAuto, stopAuto: stopAuto };
}

/* ── Build Featured Products Carousel ────────────────── */
function buildFeaturedCarousel() {
  var block = document.getElementById('featuredCarouselBlock');
  var track = document.getElementById('featTrack');
  if (!track || !block) return;

  var inStock = products.filter(function (p) { return p.in_stock !== 0 && p.image; });
  if (inStock.length === 0) { block.style.display = 'none'; return; }

  // Pick up to 12 products, shuffle lightly for variety
  var featured = inStock.slice(0, 12);

  track.innerHTML = featured.map(function (p) {
    return '<div class="feat-card" onclick="openProductSpec(\'' + p.id + '\')" role="button" tabindex="0" aria-label="View ' + p.name + '">' +
      '<div class="feat-card-img-wrap">' +
        '<span class="feat-card-img-placeholder">🛍️</span>' +
        '<img data-src="' + p.image + '" alt="' + p.name + '" />' +
        '<span class="feat-card-badge">Featured</span>' +
      '</div>' +
      '<div class="feat-card-body">' +
        '<div class="feat-card-name">' + p.name + '</div>' +
        '<div class="feat-card-price">' + p.price + '</div>' +
        '<div class="feat-card-cta">Tap to view →</div>' +
      '</div>' +
    '</div>';
  }).join('');

  block.style.display = '';

  var ctrl = createCarousel('featTrack', 'featPrev', 'featNext', 'featDots');
  if (ctrl) {
    ctrl.buildDots(featured.length);
    ctrl.updateDots();
  }

  // Lazy-load images via IntersectionObserver
  observeCarouselImages();
}

/* ── Lazy-Load Observer for Carousel ─────────────────── */
function observeCarouselImages() {
  var imgs = document.querySelectorAll('#featTrack img[data-src]');
  if (!imgs.length) return;

  if (!window.IntersectionObserver) {
    // Fallback: load all immediately
    imgs.forEach(function (img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    });
    return;
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var img = entry.target;
      var src = img.getAttribute('data-src');
      if (!src) return;
      img.src = src;
      img.removeAttribute('data-src');
      img.onload = function () { img.classList.add('loaded'); };
      img.onerror = function () { img.classList.add('loaded'); };
      obs.unobserve(img);
    });
  }, { root: document.getElementById('featTrack'), rootMargin: '0px 200px 0px 200px', threshold: 0.01 });

  imgs.forEach(function (img) { obs.observe(img); });
}

/* ── Filter products by carousel category click ─────── */
function filterByCarouselCat(key) {
  // Set the existing filter system and scroll to products
  currentFilter   = key;
  currentMainCat  = null;
  currentSubCat   = null;
  renderProducts();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Init Carousels (called after products load) ─────── */
function initCarousels() {
  buildFeaturedCarousel();
}
