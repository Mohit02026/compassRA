// Mock Google Fonts CSS responses for E2E tests.
// Set via NEXT_FONT_GOOGLE_MOCKED_RESPONSES env var — next/font/google reads this
// instead of fetching from the network. Keys are the exact CSS API URLs that
// next/font/google generates for each font declaration in app/layout.tsx.
//
// IMPORTANT: use local() sources only (no url() references).
// url() causes next/font/google to emit font files to .next/static/media/ with
// different hashes between server and client webpack compilations, causing React
// hydration mismatches ("An error occurred during hydration").
// local() means no font file emission — CSS is identical between server and client.

module.exports = {
  // Plus Jakarta Sans — weights 400,500,600,700
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap': `
/* latin */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Plus Jakarta Sans'), local('PlusJakartaSans-Regular');
  unicode-range: U+0000-00FF;
}
/* latin */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('Plus Jakarta Sans Medium'), local('PlusJakartaSans-Medium');
  unicode-range: U+0000-00FF;
}
/* latin */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: local('Plus Jakarta Sans SemiBold'), local('PlusJakartaSans-SemiBold');
  unicode-range: U+0000-00FF;
}
/* latin */
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: local('Plus Jakarta Sans Bold'), local('PlusJakartaSans-Bold');
  unicode-range: U+0000-00FF;
}
`,

  // DM Sans — weights 400,500
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap': `
/* latin */
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('DM Sans'), local('DMSans-Regular');
  unicode-range: U+0000-00FF;
}
/* latin */
@font-face {
  font-family: 'DM Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('DM Sans Medium'), local('DMSans-Medium');
  unicode-range: U+0000-00FF;
}
`,

  // Inter — weights 400,500
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap': `
/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Inter'), local('Inter-Regular');
  unicode-range: U+0000-00FF;
}
/* latin */
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: local('Inter Medium'), local('Inter-Medium');
  unicode-range: U+0000-00FF;
}
`,
}
