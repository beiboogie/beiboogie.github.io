import { type CollectionEntry, getCollection } from 'astro:content'

type BlogPost = CollectionEntry<'blog'>
const prod = import.meta.env.PROD

export async function getAllBlogPosts() {
  return await getCollection('blog', ({ data }) => {
    return prod ? !data.draft : true
  })
}

export async function getVisibleBlogPosts() {
  const posts = await getAllBlogPosts()
  return posts.filter((post) => !post.data.hidden)
}

export function sortBlogPostsByDate(posts: BlogPost[]) {
  return [...posts].sort((a, b) => {
    const aDate = new Date(a.data.updatedDate ?? a.data.publishDate ?? 0).valueOf()
    const bDate = new Date(b.data.updatedDate ?? b.data.publishDate ?? 0).valueOf()
    return bDate - aDate
  })
}

export function groupBlogPostsByYear(posts: BlogPost[]) {
  const postsByYear = posts.reduce((acc, post) => {
    const date = post.data.updatedDate ?? post.data.publishDate
    const year = date ? new Date(date).getFullYear() : undefined

    if (year === undefined) return acc

    if (!acc.has(year)) {
      acc.set(year, [])
    }

    acc.get(year)?.push(post)
    return acc
  }, new Map<number, BlogPost[]>())

  return Array.from(postsByYear.entries()).sort((a, b) => b[0] - a[0])
}

export function getUniqueBlogTags(posts: BlogPost[]) {
  return [...new Set(posts.flatMap((post) => [...post.data.tags]))]
}

export function getUniqueBlogTagsWithCount(posts: BlogPost[]): [string, number][] {
  return [
    ...posts.reduce(
      (acc, post) => {
        post.data.tags.forEach((tag) => acc.set(tag, (acc.get(tag) || 0) + 1))
        return acc
      },
      new Map<string, number>()
    )
  ].sort((a, b) => b[1] - a[1])
}
