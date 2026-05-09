/**
 * Thin wrapper around @nuxtjs/i18n v9 that also:
 *  - persists the chosen locale to localStorage / cookie
 *  - sets html[dir] and html[lang] reactively
 *  - exposes isRTL for conditional layout logic
 */
export function useLocale() {
  const { locale, setLocale, locales, t } = useI18n()

  const isRTL = computed(() => locale.value === 'fa')

  const availableLocales = computed(() =>
    (locales.value as Array<{ code: string; name: string; dir?: string }>)
  )

  function applyDir(code: string) {
    if (!process.client) return
    const dir = code === 'fa' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', code === 'fa' ? 'fa' : 'en')
  }

  async function switchLocale(code: string) {
    await setLocale(code as 'en' | 'fa')
    if (process.client) {
      localStorage.setItem('vpn_locale', code)
      applyDir(code)
    }
  }

  function restoreLocale() {
    if (!process.client) return
    const saved = localStorage.getItem('vpn_locale')
    const target = saved || locale.value
    if (saved && saved !== locale.value) {
      setLocale(saved as 'en' | 'fa')
    }
    applyDir(target)
  }

  // Keep DOM in sync whenever locale changes
  watch(locale, (val) => {
    if (process.client) applyDir(val)
  }, { immediate: false })

  return { locale, isRTL, availableLocales, switchLocale, restoreLocale, t }
}
