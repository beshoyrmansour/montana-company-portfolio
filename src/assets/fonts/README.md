# Local website fonts

Existing font families downloaded from Google Fonts at commit `47d54ca1ebb14fd864695f1d39dc734f39017c33`:
https://github.com/google/fonts/tree/47d54ca1ebb14fd864695f1d39dc734f39017c33/ofl

Converted losslessly from TTF to WOFF2 with FontTools; all glyphs and original weight/style coverage are retained. Each family includes its SIL Open Font License in OFL.txt. Signika and Cormorant Garamond are variable fonts.

Loaded through next/font/local to avoid the intermittent extensionless Google Fonts URL parsing failure: https://github.com/vercel/next.js/issues/99114. No font download is required during dev or build.
