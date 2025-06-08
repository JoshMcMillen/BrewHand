// Test file for BrewHand effectiveness
// Use @brewhand in VS Code chat to enhance this code

function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    return total;
}

// TODO: Add error handling
// TODO: Add input validation
// TODO: Add type definitions

const items = [
    { name: "Item 1", price: 10 },
    { name: "Item 2", price: 20 }
];

console.log(calculateTotal(items));
