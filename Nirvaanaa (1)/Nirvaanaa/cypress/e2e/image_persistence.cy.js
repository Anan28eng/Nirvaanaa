describe('Product image persistence', () => {
  it('keeps product images visible across reloads and navigation', () => {
    // Visit products listing
    cy.visit('/products');

    // Click the first product card link
    cy.get('a[href^="/products/"]').first().then(($a) => {
      const href = $a.attr('href');
      cy.wrap($a).click();

      // Ensure we're on the product page
      cy.location('pathname').should('eq', href);

      // Wait for the main image to load (img tag with role or alt)
      cy.get('img').should('exist');
      cy.get('img').first().should('be.visible');

      // Reload the page and ensure image remains visible
      cy.reload();
      cy.get('img').first().should('be.visible');

      // Navigate back to products and return to ensure client navigation keeps image
      cy.go('back');
      cy.location('pathname').should('eq', '/products');
      cy.get('a[href^="/products/"]').first().click();
      cy.get('img').first().should('be.visible');
    });
  });
});
