"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card"
import { Button } from "@/components/common/Button"

interface PayslipData {
  employeeId: string
  baseSalary: number
  overtimeHours: number
  overtimePay: number
  bonusAmount: number
  grossSalary: number
  federalIncomeTax: number
  stateIncomeTax: number
  socialSecurityTax: number
  medicareTax: number
  localTax: number
  totalTaxes: number
  healthInsurance: number
  dentalInsurance: number
  retirementPlan: number
  totalDeductions: number
  netSalary: number
  currency: string
}

interface PayslipPreviewProps {
  payslip: PayslipData
  companyName: string
  onDownloadPDF?: () => void
}

export function PayslipPreview({
  payslip,
  companyName,
  onDownloadPDF,
}: PayslipPreviewProps) {
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{companyName}</CardTitle>
        <p className="text-center text-gray-600 mt-2 text-sm">PAYSLIP</p>
        <p className="text-center text-gray-500 text-xs mt-1">
          Employee ID: {payslip.employeeId}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Earnings Section */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">EARNINGS</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <p className="text-gray-600">Base Salary</p>
              <p className="text-gray-900 font-medium">
                {formatCurrency(payslip.baseSalary, payslip.currency)}
              </p>
            </div>

            {payslip.overtimePay > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Overtime ({payslip.overtimeHours}h)</p>
                <p className="text-gray-900 font-medium">
                  {formatCurrency(payslip.overtimePay, payslip.currency)}
                </p>
              </div>
            )}

            {payslip.bonusAmount > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Bonus</p>
                <p className="text-gray-900 font-medium">
                  {formatCurrency(payslip.bonusAmount, payslip.currency)}
                </p>
              </div>
            )}

            <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
              <p className="text-gray-900">Gross Salary</p>
              <p className="text-gray-900">
                {formatCurrency(payslip.grossSalary, payslip.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Taxes Section */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">TAXES & CONTRIBUTIONS</h3>
          <div className="space-y-2 text-sm">
            {payslip.federalIncomeTax > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Federal Income Tax</p>
                <p className="text-gray-900">
                  -{formatCurrency(payslip.federalIncomeTax, payslip.currency)}
                </p>
              </div>
            )}

            {payslip.stateIncomeTax > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">State Income Tax</p>
                <p className="text-gray-900">
                  -{formatCurrency(payslip.stateIncomeTax, payslip.currency)}
                </p>
              </div>
            )}

            {payslip.socialSecurityTax > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Social Security (INSS)</p>
                <p className="text-gray-900">
                  -{formatCurrency(payslip.socialSecurityTax, payslip.currency)}
                </p>
              </div>
            )}

            {payslip.medicareTax > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Medicare</p>
                <p className="text-gray-900">
                  -{formatCurrency(payslip.medicareTax, payslip.currency)}
                </p>
              </div>
            )}

            <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
              <p className="text-gray-900">Total Taxes</p>
              <p className="text-gray-900">
                -{formatCurrency(payslip.totalTaxes, payslip.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">DEDUCTIONS</h3>
          <div className="space-y-2 text-sm">
            {payslip.healthInsurance > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Health Insurance</p>
                <p className="text-gray-900">
                  -{formatCurrency(payslip.healthInsurance, payslip.currency)}
                </p>
              </div>
            )}

            {payslip.dentalInsurance > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Dental Insurance</p>
                <p className="text-gray-900">
                  -{formatCurrency(payslip.dentalInsurance, payslip.currency)}
                </p>
              </div>
            )}

            {payslip.retirementPlan > 0 && (
              <div className="flex justify-between">
                <p className="text-gray-600">Retirement Plan</p>
                <p className="text-gray-900">
                  -{formatCurrency(payslip.retirementPlan, payslip.currency)}
                </p>
              </div>
            )}

            <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
              <p className="text-gray-900">Total Deductions</p>
              <p className="text-gray-900">
                -{formatCurrency(payslip.totalDeductions, payslip.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-900">NET PAY</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(payslip.netSalary, payslip.currency)}
            </p>
          </div>
        </div>

        {onDownloadPDF && (
          <Button variant="primary" fullWidth onClick={onDownloadPDF}>
            📥 Download as PDF
          </Button>
        )}
      </CardContent>
    </Card>
  )
}