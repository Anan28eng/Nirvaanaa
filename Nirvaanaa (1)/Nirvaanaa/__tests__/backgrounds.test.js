const fs = require('fs');
const path = require('path');

describe('UI background refactor checks', () => {
  const root = path.resolve(__dirname, '..');

  test('globals.css contains updated --nirvaanaa-shell', () => {
    const globals = fs.readFileSync(path.join(root, 'app', 'globals.css'), 'utf8');
    expect(globals).toMatch(/--nirvaanaa-shell:\s*#e6f0f9/);
  });

  test('tailwind.config.js contains offwhite color', () => {
    const tailwind = fs.readFileSync(path.join(root, 'tailwind.config.js'), 'utf8');
    expect(tailwind).toMatch(/offwhite\':\s*'#e6f0f9'/);
  });

    const filesToCheck = [
      'app/auth/signin/page.js',
      'app/faq/FAQPageClient.js',
      'app/error.js',
      'app/not-found.js',
      'components/cart/EnhancedCartPage.js',
      'components/wishlist/EnhancedWishlistPage.js',
      'app/layout.js',
    ];

  filesToCheck.forEach((relPath) => {
    test(`${relPath} includes bg-nirvaanaa-offwhite`, () => {
      const abs = path.join(root, relPath);
      const content = fs.readFileSync(abs, 'utf8');
        // layout may use the shell variable class; accept either shell or offwhite
        const pattern = relPath === 'app/layout.js'
          ? /bg-nirvaanaa-offwhite|bg-nirvaanaa-shell/
          : /bg-nirvaanaa-offwhite/;
        expect(content).toMatch(pattern);
    });
  });
});
