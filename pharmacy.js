let paymentbtn=document.getElementById("ifclicked")
document.addEventListener('DOMContentLoaded', () => {


    // Fetch and render medicines from the JSON file
    fetch('medicines.json')
        .then(response => response.json())
        .then(data => renderMedicines(data))
        .catch(error => console.error('Error fetching data:', error));

    // Function to render the medicines
    function renderMedicines(data) {
        const container = document.getElementById('medicine-sections');
        data.columns.forEach(column => {
            const section = document.createElement('section');
            section.innerHTML = `
                <h2>${column.name}</h2>
                <div class="product-grid">
                    ${column.medicines.map(medicine => createProductCard(medicine)).join('')}
                </div>
            `;
            container.appendChild(section);
        });
    }

    // Function to create product cards
    function createProductCard(medicine) {
        return `
            <div class="product-card">
                <img src="${medicine.image}" alt="${medicine.name}">
                <h3 class="shop-item-title">${medicine.name}</h3>
                <p class="price">$${medicine.price.toFixed(2)}</p>
                <label for="quantity-${medicine.name}">Quantity:</label>
                <input id="quantity-${medicine.name}" type="number" min="1" value="1">
                <button class="shop-item-button btn btn-primary">Add to Cart</button>
            </div>
        `;
    }

    // Cart logic variables
    const cartItemsContainer = document.getElementById('cart-table-body');

    // Create and append Favorites buttons
    const addToFavoritesBtn = createButton("Add to Favorites", ["btn", "btn-primary"]);
    const applyFavoritesBtn = createButton("Apply Favorites", ["btn", "btn-primary"]);

    const cartSummary = document.querySelector('.cart-summary');
    cartSummary.appendChild(addToFavoritesBtn);
    cartSummary.appendChild(applyFavoritesBtn);

    // Function to create styled buttons
    function createButton(text, classes) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add(...classes);
        return button;
    }

    // Add to Favorites Logic
    addToFavoritesBtn.addEventListener('click', () => {
        const cartRows = cartItemsContainer.querySelectorAll('tr');
        const favorites = [];

        cartRows.forEach(row => {
            const title = row.querySelector('.cart-item-title').innerText;
            const quantity = row.querySelector('.cart-quantity-input').value;
            const price = row.querySelector('.cart-price').innerText.replace('$', '');
            favorites.push({ title, quantity: parseInt(quantity), price: parseFloat(price) });
        });

        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Items have been added to favorites!');
    });

    // Apply Favorites Logic
    applyFavoritesBtn.addEventListener('click', () => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.length === 0) {
            alert('No favorites to apply.');
            return;
        }

        favorites.forEach(item => {
            addItemToCart(item.title, `$${item.price.toFixed(2)}`, item.quantity);
        });

        updateCartTotal();
        alert('Favorites applied to the cart!');
    });

    // Add Item to Cart Function
    function addItemToCart(title, price, quantity) {
        const cartRows = cartItemsContainer.querySelectorAll('tr');

        for (let i = 0; i < cartRows.length; i++) {
            if (cartRows[i].querySelector('.cart-item-title').innerText === title) {
                alert(`${title} is already in the cart!`);
                return;
            }
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="cart-item-title">${title}</td>
            <td><input class="cart-quantity-input" type="number" value="${quantity}" min="1" max="30"></td>
            <td class="cart-price">${price}</td>
            <td><button class="btn btn-danger">REMOVE</button></td>
        `;
        cartItemsContainer.appendChild(row);

        row.querySelector('.btn-danger').addEventListener('click', () => {
            row.remove();
            updateCartTotal();
        });

        row.querySelector('.cart-quantity-input').addEventListener('change', updateCartTotal);
    }

    // Update Cart Total
    function updateCartTotal() {
        const cartRows = cartItemsContainer.querySelectorAll('tr');
        let total = 0;

        cartRows.forEach(row => {
            const price = parseFloat(row.querySelector('.cart-price').innerText.replace('$', ''));
            const quantity = row.querySelector('.cart-quantity-input').value;
            total += price * quantity;
        });

        document.querySelector('.cart-total-price').innerText = `$${total.toFixed(2)}`;
    }

    // Add Event Listener for Add to Cart Buttons
    document.body.addEventListener('click', event => {
        if (event.target.classList.contains('shop-item-button')) {
            const productCard = event.target.closest('.product-card');
            const title = productCard.querySelector('.shop-item-title').innerText;
            const price = productCard.querySelector('.price').innerText;
            const quantity = parseInt(productCard.querySelector('input').value);

            if (quantity <= 0 || quantity > 30 || isNaN(quantity)) {
                alert('Invalid quantity! Enter a value between 1 and 30.');
                return;
            }

            addItemToCart(title, price, quantity);
            updateCartTotal();
            saveCartItemsToStorage();
        }
    });
});


function saveCartItemsToStorage() { 
    const tableBody = document.getElementById("cart-table-body");
    const rows = tableBody.querySelectorAll("tr");
    const cartItems = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const product = cells[0]?.textContent.trim();
        const quantityText = cells[1]?.textContent.trim();
        const quantity = parseInt(quantityText, 10);

        const validQuantity = isNaN(quantity) ? 0 : quantity;

        const priceText = cells[2]?.textContent.trim().replace("$", "");
        const price = parseFloat(priceText) || 0.0;

        cartItems.push({ product, quantity: validQuantity, price });
    });


    localStorage.setItem("containerData", JSON.stringify(cartItems));
}


function movetocheckout(){
    window.location.href = './payment.html';
    saveCartItemsToStorage()
}

paymentbtn.addEventListener("click", movetocheckout )