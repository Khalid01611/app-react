import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useSelector } from "react-redux"
import request from "../service/AxiosInstance"
import type { RootState } from "../interface/types"

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
  const { user } = useSelector((state: RootState) => state.auth)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "EastWest App",
    logo: "",
    mobile: "",
    email: "",
    address: ""
  })
  const [loading, setLoading] = useState(false)

  const fetchSiteSettings = async () => {
    if (!user) return
    
    setLoading(true)
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
      // Failed to fetch site settings - using defaults
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSiteSettings()
    }
  }, [user])

  const refreshSettings = () => {
    fetchSiteSettings()
  }

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}