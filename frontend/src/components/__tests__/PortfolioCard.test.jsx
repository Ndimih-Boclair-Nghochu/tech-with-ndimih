import React from 'react'
import { render } from '@testing-library/react'
import PortfolioCard from '../PortfolioCard'

test('renders portfolio card with title and excerpt', () => {
  const item = { id: 1, slug: 'test', title: 'Test Project', excerpt: 'Short excerpt', cover: '/placeholder.png' }
  const { getByText, getByAltText } = render(<PortfolioCard item={item} />)
  expect(getByText('Test Project')).toBeTruthy()
  expect(getByText('Short excerpt')).toBeTruthy()
  expect(getByAltText('Test Project') || getByAltText('')).toBeTruthy()
})
