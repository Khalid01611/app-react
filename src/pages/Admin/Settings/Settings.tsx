import Card from "../../../components/ui/Card"
import AdminLayout from "../../../layouts/Admin/AdminLayout"

const Settings = () => {
  return (
    <AdminLayout>
      <Card title="SMS Settings" description="Customize your SMS alerts and messaging options." href="/sms-settings" />
      <Card title="Invoice Settings" description="Configure invoice number format and settings." href="/invoice-settings" />
    </AdminLayout>
  )
}

export default Settings