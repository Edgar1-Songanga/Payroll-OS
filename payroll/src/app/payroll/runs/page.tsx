/payroll/src/app/(dashboard)/payroll/runs/page.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/common/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card"
import { payrollService } from "@/lib/services/payroll.service"

export default function PayrollRunsPage() {
  const { user } = useAuth()
  const companyId = user?.companyId || ""

  const [runs, setRuns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRuns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const result = await payrollService.getPayrollRuns(companyId)
        setRuns(result.data || [])
      } catch (err) {
        setError(