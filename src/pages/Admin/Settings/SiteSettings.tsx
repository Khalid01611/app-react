import { useState, useEffect } from "react"
import { FiGlobe } from "react-icons/fi"
import Button from "../../../components/ui/Button"
import Input from "../../../components/ui/Input"
import Label from "../../../components/ui/Label"
import FileInput from "../../../components/ui/FileInput"
import request from "../../../service/AxiosInstance"
import { toastError, toastSuccess } from "../../../utils/Toast"
import { handleApiError } from "../../../utils/Api"
import AdminLayout from "../../../layouts/Admin/AdminLayout"
import { useSiteSettings } from "../../../context/SiteSettingsContext"

const SiteSettings = () => {
  const { refreshSettings } = useSiteSettings()
  const [siteName, setSiteName] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const res = await request.get("/api/admin/site-settings")
      const data = res.data
      setSiteName(data.siteName || "")
      setLogoPreview(data.logo || "")
      setMobile(data.mobile || "")
      setEmail(data.email || "")
      setAddress(data.address || "")
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogo(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!siteName.trim()) {
      toastError("Site name is required")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("siteName", siteName)
      formData.append("mobile", mobile)
      formData.append("email", email)
      formData.append("address", address)
      if (logo) {
        formData.append("logo", logo)
      }

      const res = await request.post("/api/admin/site-settings", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      toastSuccess(res.data.message)
      refreshSettings() // Refresh the global site settings
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  const breadcrumb = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Settings", path: "/settings" },
    { label: "Site Settings" }
  ]

  return (
    <AdminLayout breadcrumbItems={breadcrumb}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <FiGlobe className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Site Settings</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Configure your site information and branding</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName" required>Site Name</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Enter site name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <FileInput
              id="logo"
              accept="image/*"
              onChange={handleLogoChange}
            />
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="Logo preview" className="h-16 w-auto rounded" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Enter address"
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

export default SiteSettings