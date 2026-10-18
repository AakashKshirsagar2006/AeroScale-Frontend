/** Spring's Page is flat ({ content, last, number... }) or nested under `page` depending on config. Accept both. */
export function toPage(data, mapItem) {
  const items = (data.content ?? []).map(mapItem);
  const meta = data.page ?? data;
  const number = meta.number ?? 0;
  const hasMore = data.last != null ? !data.last : number + 1 < (meta.totalPages ?? 0);
  return { items, hasMore, total: meta.totalElements ?? items.length };
}
