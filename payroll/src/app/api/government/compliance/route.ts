import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GovernmentController } from "@/lib/controllers/government.controller"

const governmentController = new GovernmentController()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = request.headers.get("X-Company-ID") || ""
    const searchParams = request.nextUrl.searchParams
    const month = parseInt(searchParams.get("month") || "1")
    const year = parseInt(searchParams.get("year") || "2024")

    const report = await governmentController.getComplianceReport(
      { companyId, userId: session.user.id },
      month,
      year
    )

    return NextResponse.json({ data: report })
  } catch (error) {
    console.error("Error fetching compliance report:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}