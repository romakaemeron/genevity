import { redirect } from "next/navigation";

// The categories tab was retired — service category hubs are edited from the
// unified "Pages" hub. Anything still linking here lands there instead.
export default function OldCategoriesListRedirect() {
  redirect("/admin/pages");
}
