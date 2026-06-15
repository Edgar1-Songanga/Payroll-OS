import { Decimal } from "decimal.js"
import { prisma } from "@magestade/database"
import { RegulatoryAutomation } from "@magestade/payroll-os"

interface GovernmentContext {
  companyId: string
  userId: string
}

export class GovernmentController {
  private regulatory: RegulatoryAutomation

  constructor() {
    this.regulatory = new RegulatoryAutomation()
  }

  async generateINSSRemittance(
    context: GovernmentContext,
    payrollRunId: string
  ) {
    const run = await prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
    })

    if (!run) throw new Error("Payroll run not found")

    const payslips = await prisma.payslip.findMany({
      where: { payrollRunId },
    })

    const inssRemittance = this.regulatory.generateINSSRemittance(
      payslips.map((p) => ({
        inssEmployee: p.socialSecurityTax.toNumber(),
        inssEmployer: p.socialSecurityTax.toNumber(),
        inssTotal: p.socialSecurityTax.times(2).toNumber(),
      })),
      run.payrollPeriodStart.getMonth() + 1,
      run.payrollPeriodStart.getFullYear()
    )

    // Save remittance record
    await prisma.governmentRemittance.create({
      data: {
        companyId: context.companyId,
        payrollRunId,
        remittanceType: "INSS",
        month: run.payrollPeriodStart.getMonth() + 1,
        year: run.payrollPeriodStart.getFullYear(),
        totalAmount: new Decimal(inssRemittance.totalRemittance.toString()),
        dueDate: inssRemittance.dueDate,
        status: "pending",
      },
    })

    return inssRemittance
  }

  async generateTaxRemittance(
    context: GovernmentContext,
    payrollRunId: string
  ) {
    const run = await prisma.payrollRun.findUnique({
      where: { id: payrollRunId },
    })

    if (!run) throw new Error("Payroll run not found")

    const payslips = await prisma.payslip.findMany({
      where: { payrollRunId },
    })

    const taxRemittance = this.regulatory.generateTaxRemittance(
      payslips.map((p) => ({
        irps: p.federalIncomeTax.toNumber(),
        taxCredit: p.federalIncomeTax.times(0.1).toNumber(),
      })),
      run.payrollPeriodStart.getMonth() + 1,
      run.payrollPeriodStart.getFullYear()
    )

    // Save remittance record
    await prisma.governmentRemittance.create({
      data: {
        companyId: context.companyId,
        payrollRunId,
        remittanceType: "TAX",
        month: run.payrollPeriodStart.getMonth() + 1,
        year: run.payrollPeriodStart.getFullYear(),
        totalAmount: new Decimal(taxRemittance.netTaxRemittance.toString()),
        dueDate: taxRemittance.dueDate,
        status: "pending",
      },
    })

    return taxRemittance
  }

  async getComplianceReport(
    context: GovernmentContext,
    month: number,
    year: number
  ) {
    const payslips = await prisma.payslip.findMany({
      where: {
        companyId: context.companyId,
        month,
        taxYear: year,
      },
    })

    const totalGross = payslips.reduce((sum, p) => sum.plus(p.grossSalary), new Decimal(0))
    const totalNet = payslips.reduce((sum, p) => sum.plus(p.netSalary), new Decimal(0))
    const totalTaxes = payslips.reduce((sum, p) => sum.plus(p.totalTaxes), new Decimal(0))
    const totalINSS = payslips.reduce(
      (sum, p) => sum.plus(p.socialSecurityTax),
      new Decimal(0)
    )

    const minWageAmount = new Decimal(100000)
    const minimumWageCompliance = payslips.every((p) =>
      p.netSalary.greaterThanOrEqualTo(minWageAmount)
    )

    return {
      period: new Date(year, month - 1),
      statistics: {
        totalEmployees: payslips.length,
        totalGross: totalGross.toNumber(),
        totalNet: totalNet.toNumber(),
        totalTaxes: totalTaxes.toNumber(),
        totalINSS: totalINSS.toNumber(),
      },
      compliance: {
        minimumWageCompliance,
        taxComplianceRate: 100,
        remittanceStatus: "ON_TIME",
      },
    }
  }
}