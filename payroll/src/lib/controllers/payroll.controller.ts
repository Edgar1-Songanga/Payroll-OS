import { Decimal } from "decimal.js"
import { prisma } from "@magestade/database"
import { PayrollOS } from "@magestade/payroll-os"
import { AngolaPayrollEngine } from "@magestade/payroll-os/engines/angola-payroll-engine"

interface PayrollContext {
  companyId: string
  userId: string
}

export class PayrollController {
  private payrollOS: PayrollOS
  private angolaEngine: AngolaPayrollEngine

  constructor() {
    this.payrollOS = new PayrollOS()
    this.angolaEngine = new AngolaPayrollEngine()
  }

  async createPayrollRun(
    context: PayrollContext,
    data: {
      payrollPeriodStart: Date
      payrollPeriodEnd: Date
      payDate: Date
      month: number
      year: number
    }
  ) {
    // Validate input
    if (data.payDate < data.payrollPeriodEnd) {
      throw new Error("Pay date must be after payroll period end")
    }

    // Create payroll run
    const run = await prisma.payrollRun.create({
      data: {
        companyId: context.companyId,
        payrollPeriodStart: data.payrollPeriodStart,
        payrollPeriodEnd: data.payrollPeriodEnd,
        payDate: data.payDate,
        status: "draft",
        totalGrossSalary: new Decimal(0),
        totalTaxes: new Decimal(0),
        totalDeductions: new Decimal(0),
        totalNetPay: new Decimal(0),
      },
    })

    return run
  }

  async processPayrollRun(context: PayrollContext, runId: string) {
    // Get payroll run
    const run = await prisma.payrollRun.findUnique({
      where: { id: runId },
    })

    if (!run) throw new Error("Payroll run not found")

    // Get all active employees for company
    const employees = await prisma.employeeSalary.findMany({
      where: { companyId: context.companyId, isActive: true },
    })

    if (employees.length === 0) {
      throw new Error("No active employees found")
    }

    // Convert to format PayrollOS expects
    const employeesData = employees.map((e) => ({
      id: e.employeeId,
      name: `Employee ${e.employeeId}`,
      grossSalary: new Decimal(e.baseSalary.toString()),
      employmentType: "full-time" as const,
      sector: "general",
      hireDate: e.effectiveDate,
      isGovernmentEmployee: false,
      dependents: 0,
    }))

    // Process payroll
    const results = await this.payrollOS.processPayroll(
      employeesData,
      run.payrollPeriodStart.getMonth() + 1,
      run.payrollPeriodStart.getFullYear(),
      (progress) => {
        console.log(`Processing: ${progress.percentage.toFixed(2)}%`)
      }
    )

    // Create payslips
    const payslips = []
    for (const payslip of results.payslips) {
      const created = await prisma.payslip.create({
        data: {
          employeeId: payslip.employeeId,
          companyId: context.companyId,
          payrollRunId: runId,
          baseSalary: new Decimal(payslip.baseSalary.toString()),
          grossSalary: new Decimal(payslip.baseSalary.toString()),
          federalIncomeTax: new Decimal(payslip.taxes.federalIncomeTax?.toString() || "0"),
          stateIncomeTax: new Decimal(payslip.taxes.stateIncomeTax?.toString() || "0"),
          socialSecurityTax: new Decimal(payslip.taxes.socialSecurityTax?.toString() || "0"),
          medicareTax: new Decimal(payslip.taxes.medicareTax?.toString() || "0"),
          localTax: new Decimal(payslip.taxes.localTax?.toString() || "0"),
          totalTaxes: new Decimal(payslip.taxes.totalTaxes?.toString() || "0"),
          healthInsurance: new Decimal(payslip.deductions.healthInsurance?.toString() || "0"),
          dentalInsurance: new Decimal(payslip.deductions.dentalInsurance?.toString() || "0"),
          retirementPlan: new Decimal(payslip.deductions.retirementPlan?.toString() || "0"),
          totalDeductions: new Decimal(
            Object.values(payslip.deductions).reduce((a: any, b: any) => a + b, 0).toString()
          ),
          netSalary: new Decimal(payslip.netPay.toString()),
          taxYear: run.payrollPeriodStart.getFullYear(),
          month: run.payrollPeriodStart.getMonth() + 1,
          currency: "AOA",
        },
      })
      payslips.push(created)
    }

    // Update payroll run
    const updatedRun = await prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: "processed",
        totalGrossSalary: new Decimal(results.summary.totalGrossSalary.toString()),
        totalTaxes: new Decimal(results.summary.totalTaxes.toString()),
        totalDeductions: new Decimal(results.summary.totalDeductions.toString()),
        totalNetPay: new Decimal(results.summary.totalNetPay.toString()),
        totalEmployees: payslips.length,
        processedBy: context.userId,
        processedAt: new Date(),
      },
    })

    return { run: updatedRun, payslips }
  }

  async approvePayrollRun(context: PayrollContext, runId: string) {
    const run = await prisma.payrollRun.findUnique({
      where: { id: runId },
    })

    if (!run) throw new Error("Payroll run not found")
    if (run.status !== "processed") throw new Error("Run must be processed first")

    return await prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: "approved",
        approvedBy: context.userId,
        approvedAt: new Date(),
      },
    })
  }

  async getPayslipSummary(context: PayrollContext, payslipId: string) {
    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId },
    })

    if (!payslip) throw new Error("Payslip not found")

    return {
      employeeId: payslip.employeeId,
      grossSalary: payslip.grossSalary.toNumber(),
      taxes: {
        federal: payslip.federalIncomeTax.toNumber(),
        state: payslip.stateIncomeTax.toNumber(),
        socialSecurity: payslip.socialSecurityTax.toNumber(),
        medicare: payslip.medicareTax.toNumber(),
        total: payslip.totalTaxes.toNumber(),
      },
      deductions: {
        health: payslip.healthInsurance.toNumber(),
        dental: payslip.dentalInsurance.toNumber(),
        retirement: payslip.retirementPlan.toNumber(),
        total: payslip.totalDeductions.toNumber(),
      },
      netSalary: payslip.netSalary.toNumber(),
    }
  }
}