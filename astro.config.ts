import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'

import { rehypeHeadingIds } from '@astrojs/markdown-remark'
import sitemap from '@astrojs/sitemap'
import AstroPureIntegration from 'astro-pure'
import { defineConfig, fontProviders } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'

// Local integrations
import rehypeAutolinkHeadings from './src/plugins/rehype-auto-link-headings.ts'
// Shiki
import {
  addCollapse,
  addCopyButton,
  addLanguage,
  addTitle,
  updateStyle
} from './src/plugins/shiki-custom-transformers.ts'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerRemoveNotationEscape
} from './src/plugins/shiki-official/transformers.ts'
import config from './src/site.config.ts'

const blogContentDir = join(process.cwd(), 'src', 'content', 'blog')

function normalizePathname(pathname: string) {
  return pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname
}

function getMarkdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) return getMarkdownFiles(fullPath)

    return ['.md', '.mdx'].includes(extname(fullPath)) ? [fullPath] : []
  })
}

function getBlogRouteFromFile(filePath: string, frontmatter: string) {
  const slugMatch = frontmatter.match(/^slug:\s*(.+)\s*$/m)
  const slug = slugMatch?.[1]?.trim()

  if (slug) return `/blog/${slug}`

  const relativePath = relative(blogContentDir, filePath)
  const pathWithoutExt = relativePath.replace(/\.(md|mdx)$/i, '')
  const segments = pathWithoutExt.split(sep)

  if (segments.at(-1) === 'index') segments.pop()

  return `/blog/${segments.join('/')}`
}

function getHiddenBlogPathnames() {
  return new Set(
    getMarkdownFiles(blogContentDir).flatMap((filePath) => {
      const fileContent = readFileSync(filePath, 'utf-8')
      const frontmatterMatch = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      const frontmatter = frontmatterMatch?.[1]

      if (!frontmatter) return []

      const hiddenMatch = frontmatter.match(/^hidden:\s*(true|false)\s*$/m)
      if (hiddenMatch?.[1] !== 'true') return []

      return [normalizePathname(getBlogRouteFromFile(filePath, frontmatter))]
    })
  )
}

const hiddenBlogPathnames = getHiddenBlogPathnames()

// https://astro.build/config
export default defineConfig({
  vite: {
    assetsInclude: ['**/*.base', '**/.obsidian/**', '**/_bases/**'],
    server: {
      watch: {
        ignored: ['**/.obsidian/**', '**/_bases/**', '**/bases/**', '**/_home/**', '**/home/**', '**/_base/**', '**/base/**']
      }
    }
  },
  // [Basic]
  site: 'https://beiboogie.github.io',
  // Deploy to a sub path
  // https://astro-pure.js.org/docs/setup/deployment#platform-with-base-path
  // base: '/astro-pure/',
  trailingSlash: 'ignore',
  // root: './my-project-directory',
  server: { host: true },

  // [Assets]
  image: {
    responsiveStyles: true,
    service: { entrypoint: 'astro/assets/services/sharp' },
    remotePatterns: [
      // Allow improve Github activity chart
      {
        protocol: 'https',
        hostname: '**.rshah.org'
      },
      // Allow remote hero images from Unsplash
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
            {
        protocol: 'https',
        hostname: 'i0.hdslb.com'
      }
    ]
  },

  // [Markdown]
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [rehypeKatex, {}],
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['anchor'] },
          content: { type: 'text', value: '#' }
        }
      ]
    ],
    // https://docs.astro.build/en/guides/syntax-highlighting/
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark'
      },
      transformers: [
        // Two copies of @shikijs/types (one under node_modules
        // and another nested under @astrojs/markdown-remark → shiki).
        // Official transformers
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerNotationDiff(),
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerNotationHighlight(),
        // @ts-ignore this happens due to multiple versions of shiki types
        transformerRemoveNotationEscape(),
        // Custom transformers
        // @ts-ignore this happens due to multiple versions of shiki types
        updateStyle(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addTitle(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addLanguage(),
        // @ts-ignore this happens due to multiple versions of shiki types
        addCopyButton(2000), // timeout in ms
        // @ts-ignore this happens due to multiple versions of shiki types
        addCollapse(15) // max lines that needs to collapse
      ]
    }
  },

  // [Integrations]
  integrations: [
    sitemap({
      filter(page) {
        return !hiddenBlogPathnames.has(normalizePathname(new URL(page).pathname))
      }
    }),
    // mdx(),
    AstroPureIntegration(config)
  ],

  // [Experimental]
  experimental: {
    // Allow compatible editors to support intellisense features for content collection entries
    // https://docs.astro.build/en/reference/experimental-flags/content-intellisense/
    contentIntellisense: true,
    // Enable SVGO optimization for SVG assets
    // https://docs.astro.build/en/reference/experimental-flags/svg-optimization/
    svgo: true,
    // Enable font preloading and optimization
    // https://docs.astro.build/en/reference/experimental-flags/fonts/
    fonts: [
      {
        provider: fontProviders.fontshare(),
        name: 'Satoshi',
        cssVariable: '--font-satoshi',
        // Default included:
        // weights: [400],
        // styles: ["normal", "italics"],
        // subsets: ["cyrillic-ext", "cyrillic", "greek-ext", "greek", "vietnamese", "latin-ext", "latin"],
        // fallbacks: ["sans-serif"],
        styles: ['normal', 'italic'],
        weights: [400, 500],
        subsets: ['latin']
      }
    ]
  }
})
