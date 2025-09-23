import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import request from "../service/AxiosInstance"

interface SiteSettings {
  siteName: string
  logo: string
  mobile: string
  email: string
  address: string
}

interface SiteSettingsContextType {
  siteSettings: SiteSettings
  loading: boolean
  refreshSettings: () => void
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined)

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider")
  }
  return context
}

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "EastWest App",
    logo: "",
    mobile: "",
    email: "",
    address: ""
  })
  const [loading, setLoading] = useState(true)

  const fetchSiteSettings = async () => {
    try {
      const res = await request.get("/api/admin/site-settings")
      setSiteSettings({
        siteName: res.data.siteName || "EastWest App",
        logo: res.data.logo || "",
        mobile: res.data.mobile || "",
        email: res.data.email || "",
        address: res.data.address || ""
      })
    } catch (error) {
      console.error("Failed to fetch site settings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  const refreshSettings = () => {
    fetchSiteSettings()
  }

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}