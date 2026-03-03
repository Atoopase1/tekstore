/* Technoid Store — App Logic */
const SUPABASE_URL = 'https://ryummrmtwqwfezfcgkoi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dW1tcm10d3F3ZmV6ZmNna29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzQ2MzUsImV4cCI6MjA4NzM1MDYzNX0.wSa4uVyG7aEyw6CkR-k9gDBOINdbwPqXAU2rinvTUvI';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const PAYSTACK_PUBLIC_KEY = 'pk_live_e3e8efc8e741d22c41ce05e297b5260daa34183a';
const ADMIN_HASH = 'S29maQ=='; // Base64 'Kofi'
const ADMIN_EMAIL = 'atoopase@gmail.com';
let isAdmin = false, deleteTargetId = null, currentFilter = 'all', products = [], currentUser = null, paystackTargetProduct = null;
let cart = JSON.parse(localStorage.getItem('technoid_cart') || '[]');

/* ── UI Helpers ── */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function toggleMobileNav() {
    const hamburger = document.getElementById('hamburgerMenu');
    const navLinks = document.querySelector('.nav-links');

    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
}

function closeMobileNav() {
    const hamburger = document.getElementById('hamburgerMenu');
    const navLinks = document.querySelector('.nav-links');

    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
}

/* ── Theme ── */
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.querySelector('.theme-toggle').textContent = isDark ? '🌙' : '☀️';
    localStorage.setItem('technoid_theme', isDark ? 'light' : 'dark');
}
(function () {
    const saved = localStorage.getItem('technoid_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    window.addEventListener('DOMContentLoaded', () => {
        document.querySelector('.theme-toggle').textContent = saved === 'dark' ? '☀️' : '🌙';
    });
})();

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
    const btn = document.getElementById('adminNavBtn');
    if (isAdmin) {
        btn.classList.add('admin-active');
        btn.innerHTML = ' Admin <span style="opacity:0.6;font-size:0.65rem;">▼</span>';
        btn.title = 'Click for Admin Options';
    } else {
        btn.classList.remove('admin-active');
        btn.innerHTML = 'Admin';
        btn.title = '';
    }
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
async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (grid && products.length === 0) {
        grid.innerHTML = '<div class="no-products"><div class="loading-spinner"></div><h3>Loading Collection...</h3><p>Fetching products securely.</p></div>';
    }
    const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Load error:', error); return }
    products = data || [];
    renderProducts();
}
async function addProduct() {
    const name = document.getElementById('newName').value.trim();
    const cat = document.getElementById('newCategory').value;
    const price = document.getElementById('newPrice').value.trim();
    const desc = document.getElementById('newDesc').value.trim();
    const imgInput = document.getElementById('newImage');
    if (!name || !price) { showToast('Please fill in product name and price.', 'error'); return }
    const doSave = async (imgData) => {
        const inStock = parseInt(document.getElementById('newStock').value);
        const { error } = await sb.from('products').insert([{ name, category: cat, price, description: desc, image: imgData || null, seller_id: 1, in_stock: inStock }]);
        if (error) { showToast('Error saving product: ' + error.message, 'error'); return }
        document.getElementById('addSuccess').style.display = 'block';
        ['newName', 'newPrice', 'newDesc'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('imagePreview').style.display = 'none';
        imgInput.value = '';
        setTimeout(() => document.getElementById('addSuccess').style.display = 'none', 3000);
        await loadProducts();
    };
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => doSave(e.target.result);
        reader.readAsDataURL(imgInput.files[0]);
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
    const doSave = async (imgData) => {
        const inStock = parseInt(document.getElementById('sellStock').value);
        const { error } = await sb.from('products').insert([{ name, category: cat, price, description: desc, image: imgData || null, seller_id: currentUser.user_id, seller_name: currentUser.username, seller_phone: currentUser.phone, in_stock: inStock }]);
        if (error) { showToast('Error listing product: ' + error.message, 'error'); return }
        document.getElementById('sellSuccess').style.display = 'block';
        ['sellName', 'sellPrice', 'sellDesc'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('sellImagePreview').style.display = 'none';
        imgInput.value = '';
        setTimeout(() => document.getElementById('sellSuccess').style.display = 'none', 3000);
        await loadProducts();
    };
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => doSave(e.target.result);
        reader.readAsDataURL(imgInput.files[0]);
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
    if (!name || !username || !phone || !email || !password) { errEl.textContent = 'All fields are required.'; errEl.style.display = 'block'; return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.textContent = 'Please enter a valid email address.'; errEl.style.display = 'block'; return }
    const { data: existing } = await sb.from('users').select('id').eq('username', username).maybeSingle();
    if (existing) { errEl.textContent = 'Username already taken.'; errEl.style.display = 'block'; return }
    // Find the max existing user_id safely instead of counting
    const { data: maxIdData } = await sb.from('users').select('user_id').order('user_id', { ascending: false }).limit(1).maybeSingle();
    const newUserId = (maxIdData && maxIdData.user_id ? parseInt(maxIdData.user_id) : 0) + 1;

    // Supabase Auth SignUp
    const { data: authData, error: authError } = await sb.auth.signUp({
        email: email,
        password: password
    });
    if (authError) { errEl.textContent = 'Auth Error: ' + authError.message; errEl.style.display = 'block'; return }

    const { error } = await sb.from('users').insert([{ user_id: newUserId, name, username, phone, email, auth_id: authData.user.id }]);
    if (error) {
        errEl.textContent = 'Error: ' + error.message; errEl.style.display = 'block';
        // Cleanup the Auth user if profile insert failed due to constraint
        // (This lets them try again without 'User already registered' error)
        console.warn('Profile insertion failed. Note: User cannot be fully deleted client-side. Please check database constraint.');
        return;
    }
    sucEl.style.display = 'block';
    setTimeout(() => { sucEl.style.display = 'none'; switchAuthTab('login'); document.getElementById('loginUsername').value = username }, 1500);
}
async function loginUser() {
    const usernameOrEmail = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');
    errEl.style.display = 'none';
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
    if (error || !user) { errEl.textContent = 'User profile not found in database.'; errEl.style.display = 'block'; return }
    currentUser = { id: user.id, user_id: user.user_id, username: user.username, name: user.name, phone: user.phone, email: user.email || '', avatar: user.avatar || '', role: user.role || 'user' };
    localStorage.setItem('technoid_user', JSON.stringify(currentUser));
    closeModal('authModal');
    updateAuthUI();
    renderProducts();
}
async function logoutUser() {
    await sb.auth.signOut();
    currentUser = null;
    localStorage.removeItem('technoid_user');
    isAdmin = false;
    sessionStorage.removeItem('technoid_admin');
    closeModal('userPanel');
    document.getElementById('adminNavBtn').style.display = 'none';
    updateAuthUI();
    updateAdminUI();
    renderProducts();
}
function updateAuthUI() {
    const loginBtn = document.getElementById('loginNavBtn');
    const userBtn = document.getElementById('userNavBtn');
    const adminBtn = document.getElementById('adminNavBtn');
    if (currentUser) {
        loginBtn.style.display = 'none';
        userBtn.style.display = '';
        userBtn.innerHTML = (currentUser.avatar ? '<img src="' + currentUser.avatar + '" class="nav-avatar" />' : '\uD83D\uDC64 ') + currentUser.username;
        document.getElementById('profileDisplayName').textContent = currentUser.name;
        document.getElementById('profileHandle').textContent = '@' + currentUser.username;
        const avatarImg = document.getElementById('avatarDisplay');
        const avatarPh = document.getElementById('avatarPlaceholder');
        if (currentUser.avatar) { avatarImg.src = currentUser.avatar; avatarImg.style.display = 'block'; avatarPh.style.display = 'none'; }
        else { avatarImg.style.display = 'none'; avatarPh.style.display = ''; }
        adminBtn.style.display = (currentUser.role === 'admin') ? 'inline-block' : 'none';
    } else {
        loginBtn.style.display = '';
        userBtn.style.display = 'none';
        adminBtn.style.display = 'none';
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
            currentUser = { id: user.id, user_id: user.user_id, username: user.username, name: user.name, phone: user.phone, email: user.email || '', avatar: user.avatar || '', role: user.role || 'user' };
            localStorage.setItem('technoid_user', JSON.stringify(currentUser));
        } else { currentUser = null; }
    } else { currentUser = null; }

    if (sessionStorage.getItem('technoid_admin') === '1' && currentUser && currentUser.role === 'admin') {
        isAdmin = true;
    }
    updateAuthUI();
    updateAdminUI();
}

/* ── Delete ── */
function _getOwnership(product) {
    const rawSellerId = product.seller_id;
    const sellerId = (rawSellerId !== null && rawSellerId !== undefined && rawSellerId !== '') ? parseInt(rawSellerId, 10) : 0;
    const isAdminProduct = sellerId === 0 || sellerId === 1;
    const myUserId = currentUser ? parseInt(currentUser.user_id, 10) : -1;
    const callerIsOwner = !isAdmin && currentUser !== null && myUserId >= 2 && !isAdminProduct && sellerId === myUserId;
    return { sellerId, isAdminProduct, callerIsOwner };
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
    const myId = parseInt(currentUser.user_id, 10);
    const myProducts = products.filter(p => parseInt(p.seller_id, 10) === myId);
    const container = document.getElementById('myListingsContainer');
    if (!container) return;
    if (myProducts.length === 0) {
        container.innerHTML = '<p style="color:var(--text3);font-size:.85rem;text-align:center;padding:1rem 0;">You have no active listings.</p>';
        return;
    }
    container.innerHTML = myProducts.map(p => {
        const inStock = p.in_stock !== 0;
        return '<div style="display:flex;align-items:center;gap:.8rem;padding:.7rem 0;border-bottom:1px solid var(--border);">' +
            (p.image ? '<img src="' + p.image + '" style="width:44px;height:44px;border-radius:6px;object-fit:cover;background:var(--card2);flex-shrink:0;" />' : '<div style="width:44px;height:44px;border-radius:6px;background:var(--card2);display:flex;align-items:center;justify-content:center;font-size:.7rem;color:var(--text3);flex-shrink:0;"></div>') +
            '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + p.name + '</div>' +
            '<div style="font-size:.78rem;color:var(--accent);">' + p.price + '</div>' +
            '<button onclick="toggleMyListingStock(\'' + p.id + '\')" style="background:none;border:1px solid ' + (inStock ? 'rgba(0,200,100,0.45)' : 'rgba(255,100,100,0.45)') + ';color:' + (inStock ? '#4caf50' : '#ff6060') + ';border-radius:6px;padding:.18rem .45rem;cursor:pointer;font-size:.7rem;margin-top:.22rem;" title="Tap to toggle stock">● ' + (inStock ? 'In Stock' : 'Out of Stock') + '</button>' +
            '</div>' +
            '<button onclick="deleteMyListing(\'' + p.id + '\')" style="background:none;border:1px solid rgba(255,100,100,0.4);color:#ff9090;border-radius:6px;padding:.28rem .5rem;cursor:pointer;font-size:.85rem;flex-shrink:0;" title="Delete listing">🗑</button>' +
            '</div>';
    }).join('');
}
async function toggleMyListingStock(productId) {
    if (!currentUser) { showToast('Please login first.', 'error'); return; }
    const product = products.find(p => p.id === productId);
    if (!product) { showToast('Product not found.', 'error'); return; }
    // Direct ownership check — works for all user_id values including 1
    if (String(product.seller_id) !== String(currentUser.user_id)) {
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

function openMomo(productId) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    document.getElementById('momoProductName').textContent = p.name;
    const isAdminProd = !p.seller_id || p.seller_id === 1;
    const phone = isAdminProd ? '0544833571' : (p.seller_phone || '0544833571');
    const sellerName = isAdminProd ? 'Atoopase Christopher' : (p.seller_name || 'Seller');
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
        '<h2>🧾 Technoid Store — Payment Receipt</h2>' +
        '<small style="color:#666">technoidfix.netlify.app | 0544833571</small></div>' +
        '<div class="r-row"><span>Product</span><span>' + product.name + '</span></div>' +
        '<div class="r-row"><span>Amount Paid</span><span>' + product.price + '</span></div>' +
        '<div class="r-row"><span>Buyer Phone</span><span>' + phone + '</span></div>' +
        '<div class="r-row"><span>Date &amp; Time</span><span>' + dateStr + '</span></div>' +
        '<div class="r-row"><span>Paystack Ref</span><span style="font-family:monospace;font-size:0.78rem">' + response.reference + '</span></div>' +
        '<div class="r-row" style="color:green;font-weight:700"><span>Status</span><span>✅ Payment Verified</span></div>';
    openModal('receiptModal');
}
function printReceipt() {
    const content = document.getElementById('receiptContent').innerHTML;
    const win = window.open('', '_blank');
    var d = win.document; d.open();
    d.write('<html><head><title>Receipt — Technoid Store<' + '/title><' + 'style>');
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
    const content = 'TECHNOID STORE — PAYMENT RECEIPT\n\n' + text;
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
function filterProducts(cat, btn) {
    currentFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts();
}
function catLabel(cat) {
    const map = { phone: 'Phone', laptop: 'Laptop', tablet: 'Tablet', accessory: 'Accessory', audio: 'Audio', other: 'Gadget' };
    return map[cat] || cat;
}
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const filtered = currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter);
    document.getElementById('productCount').textContent = filtered.length + ' product' + (filtered.length !== 1 ? 's' : '');
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="no-products"><div class="no-img-placeholder" style="width:80px;height:70px;margin:0 auto 1rem;border:2px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;"></div>' +
            '<h3>' + (currentFilter === 'all' ? 'No Products Yet' : 'No ' + catLabel(currentFilter) + 's Listed') + '</h3>' +
            '<p>' + (currentFilter === 'all' ? 'Products appear here once there is a network.' : 'Check back soon or view all products.') + '</p></div>';
        return;
    }
    grid.innerHTML = filtered.map(p => {
        const { sellerId, isAdminProduct, callerIsOwner } = _getOwnership(p);
        const inStock = p.in_stock !== 0;
        const stockBadge = isAdmin
            ? '<button class="prod-badge-stock ' + (inStock ? 'badge-instock' : 'badge-outstock') + '" onclick="toggleStock(\'' + p.id + '\')" title="Tap to toggle stock">● ' + (inStock ? 'In Stock' : 'Out of Stock') + '</button>'
            : '<span class="prod-badge-stock ' + (inStock ? 'badge-instock' : 'badge-outstock') + '">● ' + (inStock ? 'In Stock' : 'Out of Stock') + '</span>';
        const deleteBtn = isAdmin ? '<button class="delete-btn" onclick="triggerDelete(\'' + p.id + '\')" title="Delete product">🗑</button>' : '';
        const sellerBadge = (!isAdminProduct && p.seller_name) ? '<span class="prod-badge-seller">' + p.seller_name + '</span>' : '';
        const payBtn = isAdminProduct
            ? '<button class="btn-paystack" onclick="openPaystack(\'' + p.id + '\')">MoMo / Card</button>'
            : '<button class="btn-momo" onclick="openMomo(\'' + p.id + '\')">Pay MoMo</button>';
        const waLink = 'https://wa.me/233544833571?text=Hi%2C%20I\'m%20interested%20in%20the%20' + encodeURIComponent(p.name) + '%20listed%20at%20' + encodeURIComponent(p.price) + '%20on%20your%20shop.%20Can%20we%20negotiate%3F';
        var cartOverlay = inStock
            ? '<button class="btn-cart-overlay' + (cart.some(c => c.id === p.id) ? ' in-cart' : '') + '" onclick="event.stopPropagation();addToCart(\'' + p.id + '\')" title="Add to cart">' + (cart.some(c => c.id === p.id) ? '✓' : '+') + '</button>'
            : '';
        return '<div class="product-card' + (!inStock ? ' out-of-stock' : '') + '" data-id="' + p.id + '">' +
            '<div class="prod-img-wrap">' +
            (p.image ? '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" />' : '<div class="no-img-placeholder"><div class="ph-box"></div><span>No Image</span></div>') +
            stockBadge + sellerBadge + deleteBtn + cartOverlay +
            '</div>' +
            '<div class="prod-body">' +
            '<div class="prod-name">' + p.name + '</div>' +
            (p.description ? '<div class="prod-desc">' + p.description + '</div>' : '') +
            '<div class="prod-price">' + p.price + '</div>' +
            '<div class="prod-actions">' +
            '<a href="' + waLink + '" target="_blank" class="btn-wa">WhatsApp</a>' +
            payBtn +
            '</div></div></div>';
    }).join('');
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
        list.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Your cart is empty</p></div>';
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
            '<button onclick="updateCartQty(\'' + c.id + '\', -1)">−</button>' +
            '<span>' + c.qty + '</span>' +
            '<button onclick="updateCartQty(\'' + c.id + '\', 1)">+</button></div>' +
            '<button class="cart-remove" onclick="removeFromCart(\'' + c.id + '\')" title="Remove">✕</button></div>';
    }).join('') + '</div>';
    document.getElementById('cartTotalAmount').textContent = 'GHS ' + total.toLocaleString('en', { minimumFractionDigits: 2 });
    totalRow.style.display = ''; actions.style.display = '';
}
function checkoutCart() {
    if (cart.length === 0) return;
    let msg = 'Hi, I want to order the following from Technoid Store:\n\n';
    let total = 0;
    cart.forEach(c => {
        const itemTotal = parsePrice(c.price) * c.qty;
        total += itemTotal;
        msg += '• ' + c.name + ' × ' + c.qty + ' — ' + c.price + '\n';
    });
    msg += '\nTotal: GHS ' + total.toLocaleString('en', { minimumFractionDigits: 2 });
    msg += '\n\nPlease confirm availability and payment details.';
    window.open('https://wa.me/233544833571?text=' + encodeURIComponent(msg), '_blank');
}
function clearCart() {
    customConfirm('Clear Cart', 'Clear all items from your cart?', () => {
        cart = []; saveCart(); updateCartBadge(); renderCart(); renderProducts();
        showToast('Cart cleared.');
    });
}
function checkoutCartPaystack() {
    if (cart.length === 0) return;
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
}

/* ── Init ── */
restoreSession();
loadProducts();
updateCartBadge();

/* open cart modal renders fresh; user panel renders listings */
const _origOpenModal = openModal;
openModal = function (id) {
    if (id === 'cartModal') renderCart();
    if (id === 'userPanel') setTimeout(renderMyListings, 50);
    _origOpenModal(id);
};
