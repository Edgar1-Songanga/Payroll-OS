payroll/src/app/(dashboard)/employees/salaries/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/common/Button"
import { Input } from "@/components/common/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card"
import { Modal, useModal } from "@/components/common/Modal"
import { payrollService } from "@/lib/services/payroll.service"

export default function EmployeeSalariesPage() {
  const { user } = useAuth()
  const companyId = user?.companyId || ""
  const modal = useModal()

  const [salaries, setSalaries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    baseSalary: 0,
    healthInsurance: 0,
    dentalInsurance: 0,
    retirementPlan: 0,
  })

  useEffect(() => {
    loadSalaries()
  }, [companyId])

  const loadSalaries = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await payrollService.getEmployeeSalaries(companyId)
      setSalaries(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load salaries")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClick = (salary: any) => {
    setEditingId(salary.employeeId)
    setFormData({
      baseSalary: salary.baseSalary,
      healthInsurance: salary.healthInsurance,
      dentalInsurance: salary.dentalInsurance,
      retirementPlan: salary.retirementPlan,
    })
    modal.open()
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      await payrollService.updateEmployeeSalary(companyId, editingId, formData)
      modal.close()
      loadSalaries()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update salary")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Salaries</h1>
        <p className="text-gray-600 mt-1">Manage employee salary information</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Salaries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9922A]" />
            </div>
          ) : salaries.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No salaries configured yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Base Salary
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Health Insurance
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Retirement Plan
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((salary) => (
                    <tr
                      key={salary.employeeId}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-gray-900">
                        {salary.employeeId}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        ${salary.baseSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        ${salary.healthInsurance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        ${salary.retirementPlan.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditClick(salary)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Edit Salary"
        footer={
          <>
            <Button variant="secondary" onClick={modal.close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Base Salary"
            type="number"
            value={formData.baseSalary}
            onChange={(e) =>
              setFormData({
                ...formData,
                baseSalary: parseFloat(e.target.value),
              })
            }
          />

          <Input
            label="Health Insurance"
            type="number"
            step="0.01"
            value={formData.healthInsurance}
            onChange={(e) =>
              setFormData({
                ...formData,
                healthInsurance: parseFloat(e.target.value),
              })
            }
          />

          <Input
            label="Dental Insurance"
            type="number"
            step="0.01"
            value={formData.dentalInsurance}
            onChange={(e) =>
              setFormData({
                ...formData,
                dentalInsurance: parseFloat(e.target.value),
              })
            }
          />

          <Input
            label="Retirement Plan"
            type="number"
            step="0.01"
            value={formData.retirementPlan}
            onChange={(e) =>
              setFormData({
                ...formData,
                retirementPlan: parseFloat(e.target.value),
              })
            }
          />
        </div>
      </Modal>
    </div>
  )
}