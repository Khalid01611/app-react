import { FiMessageSquare, FiFileText, FiSettings, FiGlobe } from "react-icons/fi"
import Card from "../../../components/ui/Card"
import AdminLayout from "../../../layouts/Admin/AdminLayout"

const Settings = () => {
  const breadcrumb = [{ label: "Dashboard", path: "/dashboard" }, { label: "Settings" }]

  return (
    <AdminLayout breadcrumbItems={breadcrumb}>
      <div className="py-6">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiSettings className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your application settings and configurations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group">
            <Card 
              title="SMS Settings" 
              description="Customize your SMS alerts and messaging options." 
              href="/sms-settings"
              icon={<FiMessageSquare className="w-6 h-6" />}
            />
          </div>
          <div className="group">
            <Card 
              title="Invoice Settings" 
              description="Configure invoice number format and settings." 
              href="/invoice-settings"
              icon={<FiFileText className="w-6 h-6" />}
            />
          </div>
          <div className="group">
            <Card 
              title="Site Settings" 
              description="Configure site settings and general configurations." 
              href="/site-settings"
              icon={<FiGlobe className="w-6 h-6" />}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Settings