import type { TocHeading } from '@/components/TableOfContents'

/** マークダウン記法を除いた見出しテキストを返す */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim()
}

/** 見出しテキストから HTML id を生成する（日本語対応） */
export function headingToId(text: string): string {
  return text.trim().replace(/\s+/g, '-')
}

/** マークダウン文字列から h1〜h3 の見出し一覧を抽出する */
export function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = []
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (!match) continue
    const level = match[1].length
    const text = stripMarkdown(match[2])
    const id = headingToId(text)
    headings.push({ level, text, id })
  }
  return headings
}
