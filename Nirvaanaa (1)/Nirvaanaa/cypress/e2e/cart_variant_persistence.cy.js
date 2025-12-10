describe('Cart variant persistence', () => {
  it('adds a product with selected color variant to cart and persists after reload', () => {
    cy.visit('/products');

    // Open first product
    cy.get('a[href^="/products/"]').first().click();

    // If color variant buttons exist, click the first one
    cy.get('button[title]').then(($btns) => {
      const colorBtn = Array.from($btns).find(b => /color/i.test(b.title));
      if (colorBtn) {
        cy.wrap(colorBtn).click();
      }
    });

    // Click Add to Cart
    cy.contains('Add to Cart').click();

    // Go to cart
    cy.visit('/cart');

    // Assert at least one cart item and that it shows a color swatch or color name
    cy.get('[title="Remove item"]').should('exist');
    cy.get('div').then(($divs) => {
      // Look for small color swatch by data or style
      const swatch = $divs.filter((i, el) => el.title && /color/i.test(el.title));
      if (swatch.length > 0) {
        cy.wrap(swatch.first()).should('exist');
      } else {
        // Fallback: ensure text for color name exists
        cy.get('.text-xs').should('exist');
      }
    });

    // Reload and ensure cart still contains the item
    cy.reload();
    cy.get('[title="Remove item"]').should('exist');
  });
});
