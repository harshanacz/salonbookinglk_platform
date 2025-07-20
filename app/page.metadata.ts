import { generateSEO, seoConfigs } from '@/lib/seo'

export const metadata = generateSEO({
  ...seoConfigs.home,
  url: '/',
})

export default metadata
