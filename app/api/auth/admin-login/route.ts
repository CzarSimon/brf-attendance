import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"

const loginSchema = z.object({
  password: z.string().min(1, "Lösenord krävs"),
})

const ADMIN_PASSWORD_HASH = "be4c8e86449b6c65cc7b44247233b1a8"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = loginSchema.parse(body)

    if (password !== ADMIN_PASSWORD_HASH) {
      return NextResponse.json({ error: "Felaktigt lösenord" }, { status: 401 })
    }

    // Set admin session cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Inloggning misslyckades" }, { status: 500 })
  }
}
