/payroll/src/app/(dashboard)/reports/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card"
import { payrollService } from "@/lib/services/payroll.service"

export default function ReportsPage() {
  const { user } = useAuth()
  const companyId = user?.companyId || ""

  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await payrollService.getComplianceReport(
        companyId,
        month,
        year
      )
      setReport(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payroll Reports</h1>
        <p className="text-gray-600 mt-1">View compliance and payroll analytics</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Filter */}
      <Card>
        <CardContent className="pt-6 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={generateReport}
              loading={isLoading}
              disabled={isLoading}
            >
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {report.statistics?.totalEmployees || 0}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Total Gross Pay</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${(report.statistics?.totalGross / 1000).toFixed(1)}k
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Total Net Pay</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${(report.statistics?.totalNet / 1000).toFixed(1)}k
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Total Taxes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${(report.statistics?.totalTaxes / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Minimum Wage Compliance</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      report.compliance?.minimumWageCompliance
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {report.compliance?.minimumWageCompliance ? "✓ OK" : "✗ Failed"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Tax Compliance</p>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    {report.compliance?.taxComplianceRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-600">Remittance Status</p>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {report.compliance?.remittanceStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}