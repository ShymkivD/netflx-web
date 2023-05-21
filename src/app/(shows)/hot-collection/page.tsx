import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import HotCollection from "@/components/hot-collection"

export const metadata: Metadata = {
  title: "Collection of Shows",
  description: "All shows and movies chosen best by our users",
}

export default async function CollectionPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <section className="pb-16 pt-10">
      <HotCollection user={user} />
    </section>
  )
}
