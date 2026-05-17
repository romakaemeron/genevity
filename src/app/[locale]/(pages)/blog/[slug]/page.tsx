import { redirect } from "next/navigation";

export const revalidate = 86400;

export default function BlogPostPage() {
  redirect("/");
}
