import project from '../tests/data/fumoir.json'
import {generateSitemap} from './sitemap'

describe('Sitemap test', () => {
  it('should generate sitemap', async () => {
    const map = generateSitemap(project)
  })

})
