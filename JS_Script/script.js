/* =========================================================
   Casa Luna | Lab Activity 3
   All JavaScript lives in this external file (no inline scripts).
   One script powers all pages (index.html, menu.html, order.html).

   EVENT TYPES USED (4+ required):
     click, mouseover, mouseout, change, input, keydown

   FUNCTIONS (4+ required, all target elements with
   document.getElementById): see the list below.
   ========================================================= */

"use strict";

var TAX_RATE = 0.12;
var PROMO_CODES = { LUNA10: 0.10 };
var STORAGE_KEY = "casaLunaCart";

var cart = [];        // [{ id, name, price, qty }]
var promoRate = 0;    // e.g. 0.10 for 10% off
var toastTimer = null;

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
function formatPrice(amount) {
  /* Philippine peso with thousands separators, e.g. \u20b11,250.00 */
  return "\u20b1" + amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart: cart, promoRate: promoRate }));
  } catch (error) {
    /* storage can be blocked; the order still works for this page view */
  }
}

function loadCart() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var data = JSON.parse(raw);
      cart = Array.isArray(data.cart) ? data.cart : [];
      promoRate = data.promoRate || 0;
    }
  } catch (error) {
    cart = [];
    promoRate = 0;
  }
}

/* ---------------------------------------------------------
   Function 1: showToast(message)
   Slides a small confirmation message in at the bottom.
   --------------------------------------------------------- */
function showToast(message, withLink) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  if (withLink) {
    var link = document.createElement("a");
    link.href = "order.html";
    link.textContent = "View order";
    link.className = "toast-link";
    toast.appendChild(link);
  }
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("is-visible");
  }, withLink ? 3500 : 2200);
}

/* ---------------------------------------------------------
   Function 2: calculateTotals()
   Returns subtotal, discount, tax, tip and total.
   --------------------------------------------------------- */
function calculateTotals() {
  var tipSelect = document.getElementById("tipSelect");
  var tipRate = tipSelect ? (parseFloat(tipSelect.value) || 0) : 0;

  var subtotal = 0;
  cart.forEach(function (item) {
    subtotal += item.price * item.qty;
  });

  var discount = subtotal * promoRate;
  var taxable = subtotal - discount;
  var tax = taxable * TAX_RATE;
  var tip = taxable * tipRate;

  return {
    subtotal: subtotal,
    discount: discount,
    tax: tax,
    tip: tip,
    total: taxable + tax + tip
  };
}

/* ---------------------------------------------------------
   Function 3: updateCart()
   Re-draws the order list, the totals and the count badge.
   --------------------------------------------------------- */
function updateCart() {
  var list = document.getElementById("cartItems");
  var countBadge = document.getElementById("cartCount");

  /* the header badge exists on every page */
  var totalQty = 0;
  cart.forEach(function (item) { totalQty += item.qty; });
  countBadge.textContent = totalQty;

  /* only the Order page has the cart panel */
  if (!list) { return; }

  var emptyMsg = document.getElementById("cartEmpty");
  var placeBtn = document.getElementById("placeOrderBtn");
  var clearBtn = document.getElementById("clearCartBtn");

  list.textContent = "";
  totalQty = 0;

  cart.forEach(function (item) {
    totalQty += item.qty;

    var row = document.createElement("li");
    row.className = "cart-item";

    var name = document.createElement("span");
    name.className = "cart-item-name";
    name.textContent = item.name;

    var lineTotal = document.createElement("span");
    lineTotal.className = "cart-item-total";
    lineTotal.textContent = formatPrice(item.price * item.qty);

    var qty = document.createElement("div");
    qty.className = "qty";

    var minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "\u2212";
    minus.setAttribute("data-action", "minus");
    minus.setAttribute("data-id", item.id);
    minus.setAttribute("aria-label", "Remove one " + item.name);

    var count = document.createElement("span");
    count.textContent = item.qty + " \u00d7 " + formatPrice(item.price);

    var plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("data-action", "plus");
    plus.setAttribute("data-id", item.id);
    plus.setAttribute("aria-label", "Add one " + item.name);

    qty.appendChild(minus);
    qty.appendChild(count);
    qty.appendChild(plus);

    row.appendChild(name);
    row.appendChild(lineTotal);
    row.appendChild(qty);
    list.appendChild(row);
  });

  var isEmpty = cart.length === 0;
  emptyMsg.hidden = !isEmpty;
  placeBtn.disabled = isEmpty;
  clearBtn.hidden = isEmpty;
  countBadge.textContent = totalQty;

  var totals = calculateTotals();
  document.getElementById("subtotalAmt").textContent = formatPrice(totals.subtotal);
  document.getElementById("discountAmt").textContent = "-" + formatPrice(totals.discount);
  document.getElementById("discountRow").hidden = totals.discount === 0;
  document.getElementById("taxAmt").textContent = formatPrice(totals.tax);
  document.getElementById("tipAmt").textContent = formatPrice(totals.tip);
  document.getElementById("totalAmt").textContent = formatPrice(totals.total);

  var bar = document.getElementById("mobileCartBar");
  if (bar) {
    bar.textContent = "View order \u00b7 " + totalQty + (totalQty === 1 ? " item" : " items") +
      " \u00b7 " + formatPrice(totals.total);
  }

  var promoMsg = document.getElementById("promoMsg");
  if (promoRate > 0 && !promoMsg.textContent) {
    promoMsg.textContent = "Promo applied: " + Math.round(promoRate * 100) + "% off.";
    promoMsg.className = "note is-good";
  }
}

/* ---------------------------------------------------------
   Function 4: addToCart(id, name, price)
   --------------------------------------------------------- */
function addToCart(id, name, price) {
  var existing = cart.find(function (item) { return item.id === id; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: id, name: name, price: price, qty: 1 });
  }
  saveCart();
  updateCart();
  showToast(name + " added to your order", !document.getElementById("cartItems"));

  var badge = document.getElementById("cartCount");
  badge.classList.remove("bump");
  void badge.offsetWidth; /* restart the animation */
  badge.classList.add("bump");
}

/* ---------------------------------------------------------
   Function 5: changeQuantity(id, delta)
   --------------------------------------------------------- */
function changeQuantity(id, delta) {
  var item = cart.find(function (entry) { return entry.id === id; });
  if (!item) { return; }
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(function (entry) { return entry.id !== id; });
  }
  saveCart();
  updateCart();
}

/* ---------------------------------------------------------
   Function 6: scrollToCart()
   Mobile helper: jumps down to the order panel.
   --------------------------------------------------------- */
function scrollToCart() {
  var panel = document.getElementById("cartPanel");
  if (panel) {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* ---------------------------------------------------------
   Function 7: applyPromo()
   --------------------------------------------------------- */
function applyPromo() {
  var input = document.getElementById("promoInput");
  var message = document.getElementById("promoMsg");
  var code = input.value.trim().toUpperCase();

  if (code === "") {
    message.textContent = "Enter a promo code first.";
    message.className = "note is-bad";
    return;
  }

  if (PROMO_CODES[code]) {
    promoRate = PROMO_CODES[code];
    message.textContent = "Promo applied: " + Math.round(promoRate * 100) + "% off.";
    message.className = "note is-good";
  } else {
    promoRate = 0;
    message.textContent = "That code is not valid.";
    message.className = "note is-bad";
  }
  saveCart();
  updateCart();
}

/* ---------------------------------------------------------
   Function 8: updateOrderTypeNote()
   Runs on the "change" event of the order type radio buttons.
   --------------------------------------------------------- */
function updateOrderTypeNote() {
  var note = document.getElementById("orderTypeNote");
  var dineIn = document.getElementById("typeDineIn").checked;
  note.textContent = dineIn
    ? "We will bring your order to your table."
    : "Ready in about 15 minutes.";
}

/* ---------------------------------------------------------
   Function 9: placeOrder()
   Validates the form, then shows a confirmation.
   --------------------------------------------------------- */
function placeOrder() {
  var nameInput = document.getElementById("customerName");
  var error = document.getElementById("formError");
  var customer = nameInput.value.trim();

  if (cart.length === 0) {
    error.textContent = "Add at least one item before placing your order.";
    return;
  }
  if (customer === "") {
    error.textContent = "Please enter a name for the order.";
    nameInput.classList.add("input-error");
    nameInput.focus();
    return;
  }

  error.textContent = "";
  nameInput.classList.remove("input-error");

  var totals = calculateTotals();
  var type = document.getElementById("typeDineIn").checked ? "dine in" : "pickup";
  var orderNumber = "LC-" + (1000 + Math.floor(Math.random() * 9000));

  document.getElementById("confirmTitle").textContent = "Grazie, " + customer + "!";
  document.getElementById("confirmMsg").textContent =
    "Order " + orderNumber + " (" + type + ") is being prepared. " +
    document.getElementById("orderTypeNote").textContent;

  var confirmList = document.getElementById("confirmList");
  confirmList.textContent = "";
  cart.forEach(function (item) {
    var li = document.createElement("li");
    var left = document.createElement("span");
    left.textContent = item.qty + " \u00d7 " + item.name;
    var right = document.createElement("span");
    right.textContent = formatPrice(item.price * item.qty);
    li.appendChild(left);
    li.appendChild(right);
    confirmList.appendChild(li);
  });

  document.getElementById("confirmTotal").textContent = "Total: " + formatPrice(totals.total);
  document.getElementById("cartView").hidden = true;
  document.getElementById("confirmView").hidden = false;

  cart = [];
  promoRate = 0;
  saveCart();
  updateCart();
}

/* ---------------------------------------------------------
   Function 10: startNewOrder() / clearCart()
   --------------------------------------------------------- */
function startNewOrder() {
  document.getElementById("confirmView").hidden = true;
  document.getElementById("cartView").hidden = false;
  document.getElementById("customerName").value = "";
  document.getElementById("promoInput").value = "";
  document.getElementById("promoMsg").textContent = "";
  document.getElementById("tipSelect").value = "0";
  updateOrderTypeNote();
  showToast("Ready for a new order");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearCart() {
  cart = [];
  promoRate = 0;
  document.getElementById("promoMsg").textContent = "";
  saveCart();
  updateCart();
}

/* ---------------------------------------------------------
   Function 11: filterMenu()
   Runs on "change" (category) and "input" (search box).
   --------------------------------------------------------- */
function filterMenu() {
  var category = document.getElementById("categoryFilter").value;
  var query = document.getElementById("searchInput").value.trim().toLowerCase();
  var grid = document.getElementById("menuGrid");
  var visibleTotal = 0;

  grid.querySelectorAll(".menu-section").forEach(function (section) {
    var visibleInSection = 0;
    section.querySelectorAll(".menu-card").forEach(function (card) {
      var text = card.textContent.toLowerCase();
      var matchesCategory = category === "all" || card.dataset.category === category;
      var matchesSearch = query === "" || text.indexOf(query) !== -1;
      card.hidden = !(matchesCategory && matchesSearch);
      if (!card.hidden) { visibleInSection += 1; }
    });
    section.hidden = visibleInSection === 0;
    visibleTotal += visibleInSection;
  });

  document.getElementById("noResults").hidden = visibleTotal !== 0;
}

/* ---------------------------------------------------------
   Function 12: highlightCard(event) / unhighlightCard(event)
   Runs on "mouseover" and "mouseout" of a menu grid.
   --------------------------------------------------------- */
function highlightCard(event) {
  var card = event.target.closest(".menu-card");
  if (!card) { return; }
  card.classList.add("is-highlighted");

  var hint = document.getElementById("hoverHint");
  if (hint) {
    hint.textContent = card.dataset.name + " is " + formatPrice(Number(card.dataset.price)) +
      ". Press Add to order to add it.";
    hint.classList.add("is-active");
  }
}

function unhighlightCard(event) {
  var card = event.target.closest(".menu-card");
  if (!card || card.contains(event.relatedTarget)) { return; }
  card.classList.remove("is-highlighted");

  var hint = document.getElementById("hoverHint");
  if (hint) {
    hint.textContent = "Hover over a dish to see how to add it.";
    hint.classList.remove("is-active");
  }
}

/* ---------------------------------------------------------
   Function 13: handleAddClick(event)
   One click listener per grid; finds which "Add to order"
   button was pressed.
   --------------------------------------------------------- */
function handleAddClick(event) {
  var button = event.target.closest(".add-btn");
  if (!button) { return; }
  var card = button.closest(".menu-card");
  addToCart(card.dataset.id, card.dataset.name, Number(card.dataset.price));
}

/* ---------------------------------------------------------
   Function 14: toggleNav()
   Opens and closes the mobile navigation.
   --------------------------------------------------------- */
function toggleNav() {
  var nav = document.getElementById("mainNav");
  var toggle = document.getElementById("navToggle");
  var isOpen = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.textContent = isOpen ? "Close" : "Menu";
}

/* ---------------------------------------------------------
   Function 15: setValueActive(id, isActive)
   Hover effect for the dark green strip on the home page.
   --------------------------------------------------------- */
function setValueActive(id, isActive) {
  var item = document.getElementById(id);
  if (item) {
    item.classList.toggle("is-active", isActive);
  }
}

/* ---------------------------------------------------------
   on(id, type, handler): safely attach a listener by id.
   Pages without that element (e.g. the Home page has no cart
   panel) are simply skipped.
   --------------------------------------------------------- */
function on(id, type, handler) {
  var el = document.getElementById(id);
  if (el) { el.addEventListener(type, handler); }
}

/* ---------------------------------------------------------
   init(): connect every event listener
   --------------------------------------------------------- */
function init() {
  loadCart();

  /* click events */
  on("navToggle", "click", toggleNav);
  on("applyPromoBtn", "click", applyPromo);
  on("placeOrderBtn", "click", placeOrder);
  on("clearCartBtn", "click", clearCart);
  on("newOrderBtn", "click", startNewOrder);
  on("mobileCartBar", "click", scrollToCart);

  on("cartItems", "click", function (event) {
    var button = event.target.closest("button");
    if (!button) { return; }
    var delta = button.getAttribute("data-action") === "plus" ? 1 : -1;
    changeQuantity(button.getAttribute("data-id"), delta);
  });

  /* change events */
  on("tipSelect", "change", updateCart);
  on("orderTypeGroup", "change", updateOrderTypeNote);
  on("categoryFilter", "change", filterMenu);

  /* input + keydown events */
  on("searchInput", "input", filterMenu);
  on("customerName", "input", function () {
    this.classList.remove("input-error");
    document.getElementById("formError").textContent = "";
  });
  on("promoInput", "keydown", function (event) {
    if (event.key === "Enter") { applyPromo(); }
  });

  /* mouseover + mouseout: Home page value strip */
  ["valueFresh", "valueCoffee", "valueCozy"].forEach(function (id) {
    on(id, "mouseover", function () { setValueActive(id, true); });
    on(id, "mouseout", function () { setValueActive(id, false); });
  });

  /* menu grids: Home (featuredGrid), Menu + Order pages (menuGrid) */
  ["featuredGrid", "menuGrid"].forEach(function (id) {
    on(id, "click", handleAddClick);
    on(id, "mouseover", highlightCard);
    on(id, "mouseout", unhighlightCard);
  });

  if (document.getElementById("orderTypeNote")) { updateOrderTypeNote(); }
  updateCart();
}

init();