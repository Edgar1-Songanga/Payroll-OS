"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card"
import { Button } from "@/components/common/Button"
import Link from "next/link"
import { payrollService } from "@/lib/services/payroll.service"

export function PayrollDashboard() {
  const { user } = useAuth()
  const companyId = user?.companyId || ""

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingPayrolls: 0,
    totalMonthlyPayroll: 0,
    nextPayDate: null,
    anomaliesDetected: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const response = await payrollService.getPayrollRuns(companyId)

        const runs = response.data || []
        setStats({
          totalEmployees: runs.length,
          pendingPayrolls: runs.filter((r: any) => r.status === "draft").length,
          totalMonthlyPayroll: runs.reduce((sum: number, r: any) => sum + (r.totalNetPay || 0), 0),
          nextPayDate: runs[0]?.payDate || null,
          anomaliesDetected: 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats")
      } finally {
        setIsLoading(false)
      }
    }

    if (companyId) {
      loadStats()
    }
  }, [companyId])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payroll Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage salaries, taxes, and compliance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Total Employees</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isLoading ? "..." : stats.totalEmployees}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Pending Payrolls</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {isLoading ? "..." : stats.pendingPayrolls}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Monthly Payroll</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {isLoading ? "..." : `$${(stats.totalMonthlyPayroll / 1000).toFixed(1)}k`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Next Pay Date</p>
            <p className="text-lg font-bold text-gray-900 mt-2">
              {isLoading
                ? "..."
                : stats.nextPayDate
                ? new Date(stats.nextPayDate).toLocaleDateString()
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 text-sm">Anomalies</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {isLoading ? "..." : stats.anomaliesDetected}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payroll Runs */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Payroll Runs</CardTitle>
          <Link href="/payroll/runs/new">
            <Button variant="primary">+ New Payroll Run</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            {isLoading ? "Loading..." : "Create a new payroll run to get started"}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/payroll/runs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Payroll Runs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Manage</p>
              </div>
              <span className="text-4xl">💼</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employees/salaries">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Salaries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Update</p>
              </div>
              <span className="text-4xl">💰</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/government/compliance">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-medium">Compliance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Review</p>
              </div>
              <span className="text-4xl">📋</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}