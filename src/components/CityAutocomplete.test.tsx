import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CityAutocomplete from './CityAutocomplete'
import type { City } from '../types'

const pune: City = { id: 1, name: 'Pune', state: 'Maharashtra' }
const bengaluru: City = { id: 2, name: 'Bengaluru', state: 'Karnataka' }
const cities: City[] = [pune, bengaluru]

interface HarnessProps {
  onSelect: (city: City) => void
}

function Harness({ onSelect }: HarnessProps) {
  const [value, setValue] = useState('')
  return (
    <CityAutocomplete
      label="From"
      placeholder="From"
      cities={cities}
      value={value}
      onValueChange={setValue}
      onSelect={onSelect}
    />
  )
}

describe('CityAutocomplete', () => {
  it('filters city suggestions by name prefix and shows state as secondary text', async () => {
    const user = userEvent.setup()
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox', { name: 'From' })

    await user.type(input, 'pu')

    expect(screen.getByRole('option', { name: 'Pune, Maharashtra' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Bengaluru, Karnataka' })).not.toBeInTheDocument()
  })

  it('moves through suggestions with ArrowDown and selects the active option with Enter', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const input = screen.getByRole('combobox', { name: 'From' })

    await user.type(input, 'pu')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith(pune)
  })

  it('declares the combobox ARIA pattern and tracks the active option', async () => {
    const user = userEvent.setup()
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox', { name: 'From' })

    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-expanded', 'false')

    await user.type(input, 'pu')

    const option = screen.getByRole('option', { name: 'Pune, Maharashtra' })
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', option.id)
    expect(option).toHaveAttribute('aria-selected', 'true')
  })

  it('closes the suggestion list with Escape', async () => {
    const user = userEvent.setup()
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox', { name: 'From' })

    await user.type(input, 'pu')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not render a listbox when the value is empty', () => {
    render(<Harness onSelect={vi.fn()} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
