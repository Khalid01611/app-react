import { useState, useEffect } from "react"
import AdminLayout from "../../../layouts/Admin/AdminLayout"
import Button from "../../../components/ui/Button"
import Input from "../../../components/ui/Input"
import Label from "../../../components/ui/Label"
import request from "../../../service/AxiosInstance"
import { toastError, toastSuccess } from "../../../utils/Toast"
import { handleApiError } from "../../../utils/Api"

const InvoiceSettings = () => {
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchInvoiceSettings()
  }, [])

  const fetchInvoiceSettings = async () => {
    try {
      const res = await request.get("/api/admin/invoice-settings")
      setInvoiceNumber(res.data.invoiceNumber || "")
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleSave = async () => {
    if (!invoiceNumber.trim()) {
      toastError("Invoice number is required")
      return
    }

    setLoading(true)
    try {
      const res = await request.post("/api/admin/invoice-settings", { invoiceNumber })
      toastSuccess(res.data.message)
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  const breadcrumb = [{ label: "Dashboard", path: "/dashboard" }, { label: "Settings", path: "/settings" }, { label: "Invoice Settings" }]

  return (
    <AdminLayout breadcrumbItems={breadcrumb}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-md">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Invoice Settings</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure your invoice number format</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber" required>Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default InvoiceSettings