import { motion } from "framer-motion";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const Logo: React.FC = () => {
  const { siteSettings, loading } = useSiteSettings();

  if (loading) {
    return (
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2"></div>
        <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <motion.a href="#" className="flex items-center group" whileHover={{ scale: 1.05 }}>
      {siteSettings.logo && (
        <img 
          src={siteSettings.logo} 
          alt="Logo" 
          className="w-8 h-8 mr-2 rounded"
        />
      )}
      <span className="self-center text-xl font-bold whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 group-hover:from-indigo-600 group-hover:to-purple-700 transition-all duration-300">
        {siteSettings.siteName}
      </span>
    </motion.a>
  );
};

export default Logo;
