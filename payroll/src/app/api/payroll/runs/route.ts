import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PayrollController } from "@/lib/controllers/payroll.controller"

const payrollController = new PayrollController()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = request.headers.get("X-Company-ID") || ""
    const result = await payrollController.processPayrollRun(
      { companyId, userId: session.user.id },
      params.id
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing payroll run:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}