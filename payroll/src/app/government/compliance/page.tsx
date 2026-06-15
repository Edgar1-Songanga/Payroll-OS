/payroll/src/app/(dashboard)/government/compliance/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card"
import { Button } from "@/components/common/Button"
import { payrollService } from "@/lib/services/payroll.service"

export default function GovernmentCompliancePage() {
  const { user } = useAuth()
  const companyId = user?.companyId || ""

  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [remittance, setRemittance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateRemittance = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await payrollService.generateGovernmentRemittance(
        companyId,
        ""
      )
      setRemittance(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate remittance")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Government Compliance</h1>
        <p className="text-gray-600 mt-1">
          Manage INSS and Tax Authority remittances
        </p>
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
              className="px-4 py-2 border border-gray-300 rounded-lg"
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

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={generateRemittance}
              loading={isLoading}
            >
              Generate Remittance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* INSS Remittance */}
      {remittance?.inssRemittance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏛️ INSS Remittance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {remittance.inssRemittance.totalEmployees}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Employee Contribution</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  $
                  {(
                    remittance.inssRemittance.totalEmployeeContribution / 1000
                  ).toFixed(1)}
                  k
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Employer Contribution</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  $
                  {(
                    remittance.inssRemittance.totalEmployerContribution / 1000
                  ).toFixed(1)}
                  k
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Total Due</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ${(remittance.inssRemittance.totalRemittance / 1000).toFixed(1)}k
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Due Date:</strong>{" "}
                {new Date(remittance.inssRemittance.dueDate).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-4 space-x-2">
              <Button variant="primary">Download File</Button>
              <Button variant="secondary">Submit to INSS</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAX Remittance */}
      {remittance?.taxRemittance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Tax Authority Remittance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {remittance.taxRemittance.totalEmployees}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Total IRPS</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(remittance.taxRemittance.totalIRPS / 1000).toFixed(1)}k
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Total Tax Credit</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${(remittance.taxRemittance.totalTaxCredit / 1000).toFixed(1)}k
                </p>
              </div>

              <div>