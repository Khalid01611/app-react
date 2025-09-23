import { useEffect, useState } from "react";
import { FiUsers, FiPackage, FiFileText, FiDollarSign, FiTrendingUp, FiCreditCard, FiCalendar, FiActivity } from "react-icons/fi";
import AdminLayout from "../../layouts/Admin/AdminLayout";
import request from "../../service/AxiosInstance";
import { toastError } from "../../utils/Toast";

interface DashboardStats {
  overview: {
    totalInvoices: number;
    totalRevenue: number;
    totalProfit: number;
    totalQuantity: number;
    totalUsers: number;
    totalProducts: number;
    averageOrderValue: number;
  };
  topProducts: Array<{ product: string; quantity: number; revenue: number; profit: number }>;
  topSellers: Array<{ seller: string; invoices: number; revenue: number; quantity: number }>;
  paymentMethodStats: Array<{ method: string; count: number; amount: number }>;
  dailyStats: Array<{ date: string; invoices: number; revenue: number; profit: number; quantity: number }>;
  recentInvoices: Array<any>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await request.get(`/api/admin/dashboard/stats?period=${period}`);
      if (res.data.status) {
        setStats(res.data.data);
      }
    } catch (error: any) {
      toastError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [period]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </AdminLayout>
    );
  }

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your business.</p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`৳${stats.overview.totalRevenue.toLocaleString()}`}
            icon={<FiDollarSign className="w-6 h-6 text-white" />}
            color="bg-green-500"
            subtitle={`Avg: ৳${stats.overview.averageOrderValue.toFixed(2)} per order`}
          />
          <StatCard
            title="Total Invoices"
            value={stats.overview.totalInvoices.toLocaleString()}
            icon={<FiFileText className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            subtitle={`${stats.overview.totalQuantity} items sold`}
          />
          <StatCard
            title="Total Profit"
            value={`৳${stats.overview.totalProfit.toLocaleString()}`}
            icon={<FiTrendingUp className="w-6 h-6 text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Active Users"
            value={stats.overview.totalUsers.toLocaleString()}
            icon={<FiUsers className="w-6 h-6 text-white" />}
            color="bg-orange-500"
            subtitle={`${stats.overview.totalProducts} products`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiPackage className="w-5 h-5 mr-2" />
              Top Products
            </h3>
            <div className="space-y-3">
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.product}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">৳{product.revenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">৳{product.profit.toLocaleString()} profit</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiCreditCard className="w-5 h-5 mr-2" />
              Payment Methods
            </h3>
            <div className="space-y-3">
              {stats.paymentMethodStats.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{method.method}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{method.count} transactions</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">৳{method.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Sellers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiActivity className="w-5 h-5 mr-2" />
              Top Sellers
            </h3>
            <div className="space-y-3">
              {stats.topSellers.slice(0, 5).map((seller, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{seller.seller}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{seller.invoices} invoices</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">৳{seller.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{seller.quantity} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiCalendar className="w-5 h-5 mr-2" />
              Recent Invoices
            </h3>
            <div className="space-y-3">
              {stats.recentInvoices.slice(0, 5).map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{invoice.invoice_no}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">৳{invoice.total_amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.date_time).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
