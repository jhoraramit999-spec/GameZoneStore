let cart = [];
function addFromCard(button) {
  const card = button.closest('.game');
  const id = Number(button.dataset.id);
  const price = Number(button.dataset.price);
  const name = card.querySelector('h3').textContent.trim();
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({id, name, price, qty: 1});
  document.getElementById('count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  button.textContent = 'Added ✓';
  setTimeout(() => button.textContent = 'Add to cart', 900);
}
function showCart() {
  const items = document.getElementById('items');
  items.innerHTML = cart.map(item => `<p>${item.name} × ${item.qty} — ₹${item.price * item.qty}</p>`).join('') || '<p>Your cart is empty</p>';
  document.getElementById('total').textContent = 'Total: ₹' + cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('cart').showModal();
}
async function checkout() {
  if (!cart.length) return alert('Cart is empty');
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({items: cart})
    });
    const result = await response.json();
    alert(result.message || result.error || 'Order request completed');
  } catch (error) {
    alert('Checkout failed. Please try again.');
  }
}
function filterGames() {
  const search = document.getElementById('search');
  if (!search) return;
  const query = search.value.toLowerCase();
  document.querySelectorAll('.game').forEach(game => {
    game.style.display = game.innerText.toLowerCase().includes(query) ? '' : 'none';
  });
}
\n
// GameZone official download links (store pages; some games require purchase)
document.addEventListener("DOMContentLoaded", function () {
  const officialLinks = {
    "cyberpunk 2077": "https://www.gog.com/en/game/cyberpunk_2077",
    "forza horizon 5": "https://store.steampowered.com/app/1551360/Forza_Horizon_5/",
    "minecraft": "https://www.minecraft.net/en-us/store/minecraft-java-bedrock-edition-pc",
    "gta v": "https://store.rockstargames.com/game/buy-grand-theft-auto-v"
  };
  document.querySelectorAll(".game").forEach(function (card) {
    if (card.querySelector(".official-download")) return;
    const heading = card.querySelector("h2,h3,h4");
    if (!heading) return;
    const name = heading.textContent.trim().toLowerCase();
    const url = Object.entries(officialLinks).find(([key]) => name.includes(key))?.[1];
    if (!url) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "official-download";
    button.textContent = "DOWNLOAD";
    button.style.cssText = "margin:8px 0 0 8px;padding:10px 16px;border:1px solid #7656d6;border-radius:8px;background:#7656d6;color:white;font-weight:700;cursor:pointer";
    button.addEventListener("click", function () {
      window.open(url, "_blank", "noopener,noreferrer");
    });
    const addButton = card.querySelector("button");
    if (addButton) addButton.insertAdjacentElement("afterend", button);
    else card.appendChild(button);
  });
});
