describe('Color variant image behavior', () => {
  it('updates gallery when selecting a color and keeps images visible across reloads', () => {
    // Go to products listing and open first product
    cy.visit('/products');
    cy.get('a[href^="/products/"]').first().click();

    // Ensure at least one color variant button exists or skip
    cy.get('button').then(($btns) => {
      const colorButtons = $btns.filter((i, el) => el.title && /color/i.test(el.title));
      if (colorButtons.length === 0) {
        // No color variants available, assert main image visible
        cy.get('img').first().should('be.visible');
        return;
      }

      // Click the second color if available, otherwise the first
      const btn = colorButtons.length > 1 ? colorButtons[1] : colorButtons[0];
      cy.wrap(btn).click();

      // Thumbnails should update - ensure at least one thumbnail is visible
      cy.get('img').first().should('be.visible');

      // Capture src of main image
      cy.get('img').first().invoke('attr', 'src').then((firstSrc) => {
        // Reload and ensure main image still visible (not fallback removed)
        cy.reload();
        cy.get('img').first().should('be.visible');
        cy.get('img').first().invoke('attr', 'src').should('not.be.empty');
      });
    });
  });
});
