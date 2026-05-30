/** @agent-context Helpers for locale copy swap animations */

export function queryLocaleTextElements(root: ParentNode = document): HTMLElement[] {
  return Array.from(root.querySelectorAll('.bw-locale-text')) as HTMLElement[]
}
