import { getTranslations } from 'next-intl/server';
import { getActiveTheme, isThemeGreetingEnabled } from '@/lib/theme';
import { GreetingOrnament } from '@/components/decoration/Ornaments';
import type { Locale } from '@/lib/i18n';

interface ThemeGreetingProps {
  locale: Locale;
}

/**
 * Editorial greeting strip — visible during Ramadan + Christmas themes only.
 *
 * Painted by `.greeting-strip` in globals.css (gradient bg per theme, italic
 * display-serif emphasis on the title, optional sub-line on `sm:` and up).
 *
 * Toggle visibility with NEXT_PUBLIC_THEME_GREETING_ENABLED=true at build.
 */
export async function ThemeGreeting({ locale }: ThemeGreetingProps) {
  if (!isThemeGreetingEnabled()) return null;

  const theme = getActiveTheme();
  if (theme === 'default') return null;

  const t = await getTranslations({ locale, namespace: `themeGreeting.${theme}` });
  const title = t('title');
  const message = t('message');

  return (
    <aside role="complementary" aria-label={title} className="greeting-strip" data-show="1">
      <GreetingOrnament theme={theme} />
      <strong>{title}</strong>
      <span aria-hidden style={{ opacity: 0.5 }}>
        ·
      </span>
      <span className="sub">{message}</span>
      <GreetingOrnament theme={theme} />
    </aside>
  );
}
