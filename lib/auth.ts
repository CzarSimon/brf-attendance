import { cookies } from "next/headers"

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")
    return adminSession?.value === "authenticated"
  } catch {
    return false
  }
}

export async function requireAdminAuth() {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    throw new Error("Admin authentication required")
  }
}
