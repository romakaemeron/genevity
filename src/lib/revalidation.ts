/** Cache tag helpers for tag-based revalidation via Sanity webhooks. */

export const TAG_GLOBAL = "global";

export function tagForService(slug: string) {
  return `service:${slug}`;
}

export function tagForCategory(slug: string) {
  return `category:${slug}`;
}

export function tagForStaticPage(slug: string) {
  return `static:${slug}`;
}

export function tagForDoctor(id: string) {
  return `doctor:${id}`;
}

/** Given a Sanity document type and slug/id, return the tags to revalidate. */
export function tagsForDocument(type: string, slug?: string, id?: string): string[] {
  const tags = [TAG_GLOBAL];

  switch (type) {
    case "service":
      if (slug) tags.push(tagForService(slug));
      break;
    case "serviceCategory":
      if (slug) tags.push(tagForCategory(slug));
      break;
    case "staticPage":
      if (slug) tags.push(tagForStaticPage(slug));
      break;
    case "doctor":
      if (id) tags.push(tagForDoctor(id));
      break;
    case "navigation":
    case "siteSettings":
    case "hero":
    case "about":
    case "uiStrings":
      // These affect all pages — TAG_GLOBAL is already included
      break;
  }

  return tags;
}
