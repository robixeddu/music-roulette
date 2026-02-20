import { test, expect } from '@playwright/test'

/**
 * E2E test del flusso principale.
 * Richiede che il server di sviluppo sia in esecuzione su localhost:3000.
 * Configurato in playwright.config.ts con webServer.
 */

test.describe('Song Roulette - Flusso principale', () => {
  test('la homepage si carica e mostra le regole', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Song Roulette/i })).toBeVisible()
    await expect(page.getByRole('list')).toBeVisible()
    await expect(page.getByRole('link', { name: /Inizia a giocare/i })).toBeVisible()
  })

  test('il link porta alla pagina di gioco', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Inizia a giocare/i }).click()
    await expect(page).toHaveURL('/game')
  })

  test('la pagina di gioco mostra il pulsante di start', async ({ page }) => {
    await page.goto('/game')
    await expect(page.getByRole('button', { name: /Inizia a giocare/i })).toBeVisible()
  })

  test('cliccando start appare il player audio', async ({ page }) => {
    await page.goto('/game')
    await page.getByRole('button', { name: /Inizia a giocare/i }).click()

    // Attende che il gioco carichi (skeleton → game board)
    await expect(page.getByRole('button', { name: /Riproduci estratto/i })).toBeVisible({
      timeout: 10_000,
    })
  })

  test('le vite sono visibili e pari a 3 all'inizio', async ({ page }) => {
    await page.goto('/game')
    await page.getByRole('button', { name: /Inizia a giocare/i }).click()

    // aria-label del LivesIndicator
    await expect(
      page.getByRole('status', { name: /Vite rimaste: 3 su 3/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('selezionando una risposta compare il feedback', async ({ page }) => {
    await page.goto('/game')
    await page.getByRole('button', { name: /Inizia a giocare/i }).click()

    // Aspetta che le opzioni siano caricate
    const radiogroup = page.getByRole('group')
    await expect(radiogroup).toBeVisible({ timeout: 10_000 })

    // Clicca la prima opzione
    const firstBtn = radiogroup.getByRole('button').first()
    await firstBtn.click()

    // Dopo la risposta deve comparire almeno un ✓ (la corretta è sempre evidenziata)
    await expect(page.getByText('✓')).toBeVisible()
  })

  test('il skip link porta al contenuto principale', async ({ page }) => {
    await page.goto('/')
    // Premi Tab per focalizzare il skip link
    await page.keyboard.press('Tab')
    const skipLink = page.getByRole('link', { name: /Vai al contenuto principale/i })
    await expect(skipLink).toBeFocused()
  })

  test('la navigazione da tastiera funziona sulle opzioni', async ({ page }) => {
    await page.goto('/game')
    await page.getByRole('button', { name: /Inizia a giocare/i }).click()

    const radiogroup = page.getByRole('group')
    await expect(radiogroup).toBeVisible({ timeout: 10_000 })

    // Porta il focus al primo bottone con Tab
    const firstBtn = radiogroup.getByRole('button').first()
    await firstBtn.focus()
    await expect(firstBtn).toBeFocused()

    // Premi Enter per selezionare
    await page.keyboard.press('Enter')
    await expect(page.getByText('✓')).toBeVisible()
  })
})
