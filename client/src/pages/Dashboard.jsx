import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { Card } from '../components/Card';
import { Spinner } from '../components/Loader';
import { 
  FiPackage, 
  FiUsers, 
  FiTrendingUp, 
  FiShoppingBag, 
  FiDollarSign, 
  FiActivity, 
  FiCheckCircle, 
  FiClock, 
  FiArrowUpRight, 
  FiCalendar 
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Mock charts and timeline data since backend returns counts
  const revenueHistory = [
    { name: 'Jan', revenue: 45000, orders: 12 },
    { name: 'Feb', revenue: 52000, orders: 15 },
    { name: 'Mar', revenue: 49000, orders: 14 },
    { name: 'Apr', revenue: 63000, orders: 20 },
    { name: 'May', revenue: 58000, orders: 18 },
    { name: 'Jun', revenue: 75000, orders: 25 },
    { name: 'Jul', revenue: stats?.invoices?.totalAmount || 85000, orders: stats?.counts?.orders || 28 },
  ];

  const supplierShare = [
    { name: 'Apex Loom', value: 40, color: '#3B82F6' },
    { name: 'Vardhman Mills', value: 25, color: '#22C55E' },
    { name: 'Zenith Knits', value: 20, color: '#F59E0B' },
    { name: 'Sutlej Textiles', value: 15, color: '#8B5CF6' }
  ];

  const orderStatuses = [
    { name: 'Completed', count: stats?.orders?.completedCount || 8, fill: '#22C55E' },
    { name: 'Pending', count: stats?.orders?.pendingCount || 4, fill: '#F59E0B' },
    { name: 'Processing', count: 3, fill: '#3B82F6' },
    { name: 'Cancelled', count: 1, fill: '#EF4444' }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'order',
      title: 'Sales Order #SO-4290 Created',
      description: 'Buyer Zara Clothing ordered 150 Cotton Hoodies',
      time: '15 mins ago',
      icon: FiShoppingBag,
      iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    },
    {
      id: 2,
      type: 'invoice',
      title: 'Invoice #INV-2083 Marked Paid',
      description: 'Received ₹1,45,000.00 from H&M Sourcing India',
      time: '2 hours ago',
      icon: FiCheckCircle,
      iconBg: 'bg-green-500/10 text-green-400 border border-green-500/20'
    },
    {
      id: 3,
      type: 'product',
      title: 'New Finished Good Catalog Synced',
      description: 'Style "Oversized Linen Shirt" indexed to Typesense',
      time: '5 hours ago',
      icon: FiPackage,
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
    },
    {
      id: 4,
      type: 'buyer',
      title: 'New Buyer Profile Added',
      description: 'Reliance Retail registered as active domestic buyer',
      time: '1 day ago',
      icon: FiUsers,
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    }
  ];

  // Formatting helpers
  const formatCurrency = (val) => {
    return '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const formatNumber = (val) => val.toLocaleString('en-IN');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-900 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-success/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            AI ERP v1.0
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">AI ERP Dashboard</h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl">
            AI-Powered Apparel Enterprise Resource Planning. Ask questions, search images, and inspect catalogs dynamically.
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard
          title="Total Finished Goods"
          value={stats?.counts?.products || 0}
          formatter={formatNumber}
          icon={FiPackage}
          iconColor="text-blue-400"
          trend={{ value: 12.4, isPositive: true, text: 'from last month' }}
          loading={loading}
        />
        <StatCard
          title="Total Suppliers"
          value={stats?.counts?.suppliers || 0}
          formatter={formatNumber}
          icon={FiUsers}
          iconColor="text-green-400"
          trend={{ value: 4.8, isPositive: true, text: 'vs last quarter' }}
          loading={loading}
        />
        <StatCard
          title="Total Buyers"
          value={stats?.counts?.buyers || 0}
          formatter={formatNumber}
          icon={FiUsers}
          iconColor="text-amber-400"
          trend={{ value: 8.2, isPositive: true, text: 'from last month' }}
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={stats?.counts?.orders || 0}
          formatter={formatNumber}
          icon={FiShoppingBag}
          iconColor="text-purple-400"
          trend={{ value: 1.5, isPositive: false, text: 'from last week' }}
          loading={loading}
        />
        <StatCard
          title="Total Invoiced Revenue"
          value={stats?.invoices?.totalAmount || 0}
          formatter={formatCurrency}
          icon={FiDollarSign}
          iconColor="text-emerald-400"
          trend={{ value: 18.2, isPositive: true, text: 'vs target' }}
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Revenue Trajectory"
            subtitle="Monthly invoicing amounts vs orders volume"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueHistory}
                margin={{ top: 15, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Invoiced Revenue (₹)"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Sales Orders Count"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Supplier share Pie chart */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Supplier Market Share"
            subtitle="Product sourcing inventory breakdown"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={supplierShare}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {supplierShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '0.75rem' }}
                />
                <Legend
                  verticalAlign="bottom"
                  layout="horizontal"
                  align="center"
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', color: '#A1A1AA' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      </div>

      {/* Second Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Orders Bar Chart */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Order Status Distribution"
            subtitle="Processing vs completed orders tracking"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderStatuses}
                margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '0.75rem' }}
                />
                <Bar dataKey="count" name="Orders Count" radius={[4, 4, 0, 0]}>
                  {orderStatuses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <Card className="h-[380px] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-800/60">
              <div>
                <h4 className="text-sm font-semibold text-white">Recent Activities</h4>
                <p className="text-xs text-zinc-500 mt-0.5">Timeline of recent transactional triggers</p>
              </div>
              <FiActivity className="w-4 h-4 text-zinc-500" />
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
              {recentActivity.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start space-x-3 text-xs leading-normal">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${act.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-semibold text-white truncate pr-2">{act.title}</h5>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap flex items-center">
                          <FiClock className="w-3 h-3 mr-1" />
                          {act.time}
                        </span>
                      </div>
                      <p className="text-zinc-400 mt-0.5">{act.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
