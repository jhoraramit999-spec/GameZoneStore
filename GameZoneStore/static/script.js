let cart = [];
const CART_KEY = "gamezone_cart_v1";

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}
function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
}
function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (Array.isArray(saved)) cart = saved.filter(x => x && Number.isFinite(Number(x.id)) && Number(x.price) >= 0 && Number(x.qty) > 0);
  } catch (e) { cart = []; }
  updateCartCount();
}
function updateCartCount() {
  const count = document.getElementById("count");
  if (count) count.textContent = cart.reduce((sum, item) => sum + Number(item.qty), 0);
}
function addFromCard(button) {
  const card = button.closest(".game");
  if (!card) return;
  const id = Number(button.dataset.id);
  const price = Number(button.dataset.price);
  const name = card.querySelector("h3")?.textContent.trim() || "Game";
  if (!Number.isFinite(id) || !Number.isFinite(price) || price < 0) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, name, price, qty: 1 });
  saveCart();
  updateCartCount();
  const oldText = button.textContent;
  button.textContent = "Added ✓";
  setTimeout(() => button.textContent = oldText || "Add to cart", 900);
}
function changeQty(id, amount) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart();
  showCart();
  updateCartCount();
}
function removeItem(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
  showCart();
  updateCartCount();
}
function showCart() {
  const items = document.getElementById("items");
  const total = document.getElementById("total");
  if (!items || !total) return;
  if (!cart.length) {
    items.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    items.innerHTML = cart.map(item => `
      <div class="cart-row" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #ddd">
        <div><strong>${escapeHTML(item.name)}</strong><br><small>${money(item.price)} each</small></div>
        <div style="display:flex;align-items:center;gap:8px">
          <button type="button" onclick="changeQty(${Number(item.id)},-1)">−</button>
          <strong>${Number(item.qty)}</strong>
          <button type="button" onclick="changeQty(${Number(item.id)},1)">+</button>
          <button type="button" onclick="removeItem(${Number(item.id)})">Remove</button>
        </div>
        <strong>${money(item.price * item.qty)}</strong>
      </div>`).join("");
  }
  total.textContent = "Total: " + money(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
  const dialog = document.getElementById("cart");
  if (dialog && !dialog.open) dialog.showModal();
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}
async function checkout() {
  if (!cart.length) return alert('Your cart is empty.');
  const qr = document.getElementById('payment-qr');
  const amount = document.getElementById('qr-total');
  if (qr) qr.hidden = false;
  if (amount) amount.textContent = 'Amount to pay: ' + money(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
  return;

  if (!cart.length) return alert("Your cart is empty.");
  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart.map(({id, qty}) => ({id, qty})) })
    });
    const result = await response.json();
    if (!response.ok) {
      alert(result.error || result.message || "Payment is not configured yet.");
      return;
    }
    alert(result.message || "Order created.");
  } catch (error) {
    alert("Checkout failed. Please check your internet connection and try again.");
  }
}
function filterGames() {
  const search = document.getElementById("search");
  if (!search) return;
  const query = search.value.toLowerCase();
  document.querySelectorAll(".game").forEach(game => {
    game.style.display = game.innerText.toLowerCase().includes(query) ? "" : "none";
  });
}
