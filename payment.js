document.addEventListener("DOMContentLoaded", () => {
    let makePaymentBtn = document.getElementById("make-payment");
    let itemsInCart = JSON.parse(localStorage.getItem('containerData')) || [];

    // Update the order summary table when the page loads
    function updateCartTable() {
        const tableBody = document.getElementById("order-items");
        tableBody.innerHTML = "";

        if (itemsInCart.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td colspan="3">Your cart is empty. Please add items to your cart to place an order.</td>
            `;
            tableBody.appendChild(row);
        } else {
            itemsInCart.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item.product}</td>
                    <td>$${item.price.toFixed(2)}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    updateCartTable();

    const paymentMethodSelect = document.getElementById("payment-method");
    const cardPaymentFields = document.getElementById("card-payment-fields");
    const cashDeliveryFields = document.getElementById("cash-delivery-fields");

    cardPaymentFields.style.display = "none";
    cashDeliveryFields.style.display = "none";

    function togglePaymentFields() {
        const selectedMethod = paymentMethodSelect.value;

        if (selectedMethod === "card") {
            cardPaymentFields.style.display = "block";
            cashDeliveryFields.style.display = "none";
        } else if (selectedMethod === "cash") {
            cardPaymentFields.style.display = "none";
            cashDeliveryFields.style.display = "block";
        } else {
            cardPaymentFields.style.display = "none";
            cashDeliveryFields.style.display = "none";
        }
    }

    paymentMethodSelect.addEventListener("change", togglePaymentFields);

    // Check Cart and Validate Before Payment
    function checkPaymentDetails(event) {
        event.preventDefault();

        const errorContainer = document.getElementById("error-messages");
        if (errorContainer) {
            errorContainer.remove();
        }

        // Check if the cart is empty
        if (itemsInCart.length === 0) {
            const missingFields = ["You cannot proceed with an order without adding items to your cart."];
            
            const errorMessage = document.createElement("div");
            errorMessage.id = "error-messages";
            errorMessage.style.color = "red";
            errorMessage.style.marginTop = "10px";
            errorMessage.innerHTML = `<p><strong>Error:</strong></p><ul>${missingFields
                .map(field => `<li>${field}</li>`)
                .join("")}</ul>`;

            const paymentButton = document.getElementById("make-payment");
            paymentButton.parentElement.insertBefore(errorMessage, paymentButton);
            return;
        }

        const missingFields = [];
        const paymentMethod = paymentMethodSelect.value;

        if (paymentMethod === "card") {
            const cardNumber = document.querySelector("#card-payment-fields .input1");
            const expiryDate = document.querySelector("#card-payment-fields .input2");
            const cardholderName = document.querySelector("#card-payment-fields .input-cardholder");
            const cvc = document.querySelector("#card-payment-fields .input3");

            // Card number validation (must be 16 digits and not negative)
            if (cardNumber && !/^\d{16}$/.test(cardNumber.value)) {
                missingFields.push("Card Number (must be 16 digits)");
            }

            // Expiry date validation (must not be before current date)
            const expiry = new Date(expiryDate.value);
            const currentDate = new Date();
            if (expiryDate && expiry < currentDate) {
                missingFields.push("Your card is expired");
            }

            // Cardholder name validation (should not contain numbers or negative values)
            if (cardholderName && /[^a-zA-Z ]/.test(cardholderName.value)) {
                missingFields.push("Cardholder's Name (must not contain numbers or negative values)");
            }

            // CVC validation (should be 3 digits and not negative)
            if (cvc && (!/^\d{3}$/.test(cvc.value) || parseInt(cvc.value) < 0)) {
                missingFields.push("Security Code (CVC) (must be 3 digits and not negative)");
            }
        } else if (paymentMethod === "cash") {
            const address = document.querySelector("#cash-delivery-fields .input1");
            const phoneNumber = document.querySelector("#cash-delivery-fields .input2");
            const email = document.querySelector("#cash-delivery-fields .input3");

            // If any field in cash payment is empty, show error message
            if (!address || !phoneNumber || !email || !address.value.trim() || !phoneNumber.value.trim() || !email.value.trim()) {
                missingFields.push("All cash payment details must be filled.");
            }
        } else {
            missingFields.push("Payment Method");
        }

        if (missingFields.length > 0) {
            const errorMessage = document.createElement("div");
            errorMessage.id = "error-messages";
            errorMessage.style.color = "red";
            errorMessage.style.marginTop = "10px";
            errorMessage.innerHTML = `<p><strong>Please fill in the following fields:</strong></p><ul>${missingFields
                .map(field => `<li>${field}</li>`)
                .join("")}</ul>`;

            const paymentButton = document.getElementById("make-payment");
            paymentButton.parentElement.insertBefore(errorMessage, paymentButton);
        } else {
            alert("Your order has been placed!");
        }
    }

    makePaymentBtn.addEventListener("click", checkPaymentDetails);
});
