import { render, screen } from '../../test-utils'
import Home from '../../src/app/(main)/page'
 
describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)
 
    const heading = screen.getByText('continuous');
 
    expect(heading).toBeInTheDocument()
  })
})