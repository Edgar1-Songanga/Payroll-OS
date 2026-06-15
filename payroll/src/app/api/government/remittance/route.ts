import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GovernmentController } from "@/lib/controllers/government.controller"

const governmentController = new GovernmentController()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = request.headers.get("X-Company-ID") || ""
    const body = await request.json()

    const [inss, tax] = await Promise.all([
      governmentController.generateINSSRemittance(
        { companyId, userId: session.user.id },
        body.payrollRunId
      ),
      governmentController.generateTaxRemittance(
        { companyId, userId: session.user.id },
        body.payrollRunId
      ),
    ])

    return NextResponse.json({ inssRemittance: inss, taxRemittance: tax })
  } catch (error) {
    console.error("Error generating remittance:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}