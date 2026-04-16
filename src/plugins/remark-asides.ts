/// <reference types="mdast-util-directive" />

import type { Root, Parent, Paragraph, PhrasingContent } from 'mdast'
import type { Directives, LeafDirective, TextDirective } from 'mdast-util-directive'
import { directiveToMarkdown } from 'mdast-util-directive'
import { toHast } from 'mdast-util-to-hast'
import { toMarkdown } from 'mdast-util-to-markdown'
import { fromHtml } from 'hast-util-from-html'
import type { Element, ElementContent, Root as HastRoot, Text } from 'hast'
import { Icons } from 'astro-pure/libs'
import type { Plugin, Transformer } from 'unified'
import { visit } from 'unist-util-visit'

type AsideVariant = 'note' | 'tip' | 'caution' | 'danger'

const asideVariants = new Set<AsideVariant>(['note', 'tip', 'caution', 'danger'])
const asideIconMap = {
  note: 'info',
  tip: 'bulb',
  caution: 'alert',
  danger: 'octangon'
} as const

function isNodeDirective(node: { type: string }): node is Directives {
  return (
    node.type === 'textDirective' ||
    node.type === 'leafDirective' ||
    node.type === 'containerDirective'
  )
}

function toPlainText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if ('value' in node && typeof node.value === 'string') return node.value
      if ('children' in node && Array.isArray(node.children))
        return toPlainText(node.children as PhrasingContent[])
      return ''
    })
    .join('')
    .trim()
}

function toAsideNode(
  variant: AsideVariant,
  title: string,
  titleNodes: PhrasingContent[],
  contentChildren: Paragraph['children']
): Paragraph {
  const iconName = asideIconMap[variant]
  const iconNode = fromHtml(
    `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">${Icons[iconName]}</svg>`,
    { fragment: true, space: 'svg' }
  ).children.find((child): child is Element => child.type === 'element')

  const titleHast = toHast({
    type: 'paragraph',
    children: titleNodes
  }) as Element
  const titleChildren: ElementContent[] = []
  if (iconNode) titleChildren.push(iconNode)
  if (Array.isArray(titleHast.children)) {
    titleChildren.push(...titleHast.children)
  } else {
    titleChildren.push({ type: 'text', value: title } as Text)
  }

  const contentHastRoot = toHast({
    type: 'root',
    children: contentChildren as Root['children']
  }) as HastRoot
  const contentHastChildren = contentHastRoot.children.filter(
    (child): child is ElementContent => child.type !== 'doctype'
  )

  return {
    type: 'paragraph',
    data: {
      hName: 'aside',
      hProperties: {
        'aria-label': title,
        class: 'aside my-3 overflow-hidden rounded-xl border'
      },
      hChildren: [
        {
          type: 'element',
          tagName: 'div',
          properties: {
            class:
              `aside-container border-l-8 border-primary px-4 py-3 bg-primary aside-${variant}`
          },
          children: [
            {
              type: 'element',
              tagName: 'p',
              properties: {
                class: 'not-prose flex items-center gap-x-2 font-medium text-primary',
                'aria-hidden': 'true'
              },
              children: titleChildren
            },
            {
              type: 'element',
              tagName: 'div',
              properties: {
                class: 'aside-content mt-2'
              },
              children: contentHastChildren
            }
          ]
        }
      ]
    },
    children: []
  }
}

export const remarkAsides: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined || !isNodeDirective(node)) return
      if (node.type !== 'containerDirective') return
      if (!asideVariants.has(node.name as AsideVariant)) return

      const variant = node.name as AsideVariant
      const defaultTitle = variant.toUpperCase()
      let title = defaultTitle
      let titleNodes: PhrasingContent[] = [{ type: 'text', value: defaultTitle }]

      const firstChild = node.children[0]
      if (
        firstChild?.type === 'paragraph' &&
        firstChild.data &&
        'directiveLabel' in firstChild.data &&
        firstChild.children.length > 0
      ) {
        titleNodes = firstChild.children
        title = toPlainText(firstChild.children) || defaultTitle
        node.children.splice(0, 1)
      }

      parent.children[index] = toAsideNode(variant, title, titleNodes, node.children as Paragraph['children'])
    })
  }

  return transformer
}

function restoreUnhandledDirective(
  node: TextDirective | LeafDirective | Directives,
  index: number,
  parent: Parent
) {
  let markdown = toMarkdown(node, { extensions: [directiveToMarkdown()] })
  if (markdown.endsWith('\n')) markdown = markdown.slice(0, -1)

  const textNode = { type: 'text', value: markdown } as const

  if (node.type === 'textDirective') {
    parent.children[index] = textNode
    return
  }

  parent.children[index] = {
    type: 'paragraph',
    children: [textNode]
  }
}

export const remarkDirectivesRestoration: Plugin<[], Root> = () => {
  const transformer: Transformer<Root> = (tree) => {
    visit(tree, (node, index, parent) => {
      if (!parent || index === undefined || !isNodeDirective(node)) return
      if (node.type === 'containerDirective' && asideVariants.has(node.name as AsideVariant)) return
      restoreUnhandledDirective(node, index, parent)
    })
  }

  return transformer
}
