import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SearchCard from './SearchCard'

describe('SearchCard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows today's date by default", () => {
    render(<SearchCard />)
    expect(screen.getByText('02 Oct, 2026')).toBeInTheDocument()
    expect(screen.getByText('(Today)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'true')
  })

  it("switches to tomorrow's date when Tomorrow is clicked", async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
    await user.click(screen.getByRole('button', { name: 'Tomorrow' }))
    expect(screen.getByText('03 Oct, 2026')).toBeInTheDocument()
    expect(screen.getByText('(Tomorrow)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toHaveClass('chip-active')
  })

  it('selects a day chip with the keyboard', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
    screen.getByRole('button', { name: 'Tomorrow' }).focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('03 Oct, 2026')).toBeInTheDocument()
  })

  it('toggles the booking-for-women switch', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)
    const toggle = screen.getByRole('switch', { name: 'Booking for women' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('renders From and To comboboxes with a swap button between them', () => {
    render(<SearchCard />)
    expect(screen.getByRole('combobox', { name: 'From' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'To' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Swap From and To' })).toBeInTheDocument()
  })

  it('shows a required error next to each empty field when searching', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)

    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(screen.getByRole('combobox', { name: 'From' })).toHaveAccessibleDescription(
      'Please select a city',
    )
    expect(screen.getByRole('combobox', { name: 'To' })).toHaveAccessibleDescription(
      'Please select a city',
    )
  })

  it('requires a chosen suggestion when text matches a city but none was selected', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)

    const from = screen.getByRole('combobox', { name: 'From' })
    await user.type(from, 'pu')
    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(from).toHaveAccessibleDescription('Please select a city from the list')
  })

  it('shows an error on both fields when the same city is selected twice', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)

    const from = screen.getByRole('combobox', { name: 'From' })
    await user.type(from, 'pu')
    await user.click(screen.getByRole('option', { name: 'Pune, Maharashtra' }))

    const to = screen.getByRole('combobox', { name: 'To' })
    await user.type(to, 'pu')
    await user.click(screen.getByRole('option', { name: 'Pune, Maharashtra' }))

    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(from).toHaveAccessibleDescription('From and To must be different')
    expect(to).toHaveAccessibleDescription('From and To must be different')
  })

  it('exchanges the two selected cities when swapping', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)

    const from = screen.getByRole('combobox', { name: 'From' })
    await user.type(from, 'pu')
    await user.click(screen.getByRole('option', { name: 'Pune, Maharashtra' }))

    const to = screen.getByRole('combobox', { name: 'To' })
    await user.type(to, 'be')
    await user.click(screen.getByRole('option', { name: 'Bengaluru, Karnataka' }))

    await user.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(from).toHaveValue('Bengaluru')
    expect(to).toHaveValue('Pune')
  })

  it('keeps an empty field empty when swapping a single selection', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)

    const from = screen.getByRole('combobox', { name: 'From' })
    await user.type(from, 'pu')
    await user.click(screen.getByRole('option', { name: 'Pune, Maharashtra' }))

    await user.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(from).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'To' })).toHaveValue('Pune')
  })

  it('clears a field error as soon as that field is edited', async () => {
    const user = userEvent.setup()
    render(<SearchCard />)

    await user.click(screen.getByRole('button', { name: 'Search buses' }))
    const from = screen.getByRole('combobox', { name: 'From' })
    expect(from).toHaveAccessibleDescription('Please select a city')

    await user.type(from, 'pu')

    expect(from).not.toHaveAccessibleDescription()
  })

  it('renders a journey date picker that blocks past dates', () => {
    render(<SearchCard />)
    const dateInput = screen.getByLabelText('Journey date')
    expect(dateInput).toBeInTheDocument()
    expect(dateInput).toHaveAttribute('min', '2026-10-02')
  })

  it('overrides the day chips when a date is picked', () => {
    render(<SearchCard />)

    fireEvent.change(screen.getByLabelText('Journey date'), {
      target: { value: '2026-10-05' },
    })

    expect(screen.getByText('05 Oct, 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('clears a picked date when a day chip is clicked', () => {
    render(<SearchCard />)

    fireEvent.change(screen.getByLabelText('Journey date'), {
      target: { value: '2026-10-05' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Tomorrow' }))

    expect(screen.getByLabelText('Journey date')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Tomorrow' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('03 Oct, 2026')).toBeInTheDocument()
  })

  it('prefills the card from initial search values', () => {
    render(
      <SearchCard initialFromCityId={1} initialToCityId={2} initialDate="2026-10-05" />,
    )

    expect(screen.getByRole('combobox', { name: 'From' })).toHaveValue('Pune')
    expect(screen.getByRole('combobox', { name: 'To' })).toHaveValue('Bengaluru')
    expect(screen.getByLabelText('Journey date')).toHaveValue('2026-10-05')
    expect(screen.getByText('05 Oct, 2026')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('blocks a past journey date and shows an error instead of searching', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchCard onSearch={onSearch} />)

    const from = screen.getByRole('combobox', { name: 'From' })
    await user.type(from, 'pu')
    await user.click(screen.getByRole('option', { name: 'Pune, Maharashtra' }))

    const to = screen.getByRole('combobox', { name: 'To' })
    await user.type(to, 'be')
    await user.click(screen.getByRole('option', { name: 'Bengaluru, Karnataka' }))

    fireEvent.change(screen.getByLabelText('Journey date'), {
      target: { value: '2000-01-01' },
    })

    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(onSearch).not.toHaveBeenCalled()
    expect(screen.getByText('Date cannot be in the past')).toBeInTheDocument()
  })

  it('calls onSearch with the selected cities and journey date', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchCard onSearch={onSearch} />)

    const from = screen.getByRole('combobox', { name: 'From' })
    await user.type(from, 'pu')
    await user.click(screen.getByRole('option', { name: 'Pune, Maharashtra' }))

    const to = screen.getByRole('combobox', { name: 'To' })
    await user.type(to, 'be')
    await user.click(screen.getByRole('option', { name: 'Bengaluru, Karnataka' }))

    fireEvent.change(screen.getByLabelText('Journey date'), {
      target: { value: '2026-10-02' },
    })

    await user.click(screen.getByRole('button', { name: 'Search buses' }))

    expect(onSearch).toHaveBeenCalledWith({ fromId: 1, toId: 2, date: '2026-10-02' })
  })
})
