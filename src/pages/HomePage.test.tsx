import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'
import SearchResults from './SearchResults'

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('prefills the search card from the URL', () => {
    renderApp('/?from=1&to=2&date=2026-10-02')

    expect(screen.getByRole('combobox', { name: 'From' })).toHaveValue('Pune')
    expect(screen.getByRole('combobox', { name: 'To' })).toHaveValue('Bengaluru')
    expect(screen.getByLabelText('Journey date')).toHaveValue('2026-10-02')
  })

  it('navigates to the search results page on a valid search', async () => {
    const user = userEvent.setup()
    renderApp('/')

    const from = screen.getByRole('combobox', { name: 'From' })
    await user.type(from, 'pu')
    await user.click(screen.getByRole('option', { name: 'Pune, Maharashtra' }))

    const to = screen.getByRole('combobox', { name: 'To' })
    await user.type(to, 'be')
    await user.click(screen.getByRole('option', { name: 'Bengaluru, Karnataka' }))

    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Pune → Bengaluru · 02 Oct',
    )
  })
})
