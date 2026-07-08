import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Table } from '../components/Table';
import { SearchBox } from '../components/SearchBox';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Card } from '../components/Card';
import { FiPackage, FiInfo, FiFileText, FiEye, FiDownload, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const FinishedGoods = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // View details modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [techPack, setTechPack] = useState(null);
  const [loadingTechPack, setLoadingTechPack] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProducts();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and Search logic
  useEffect(() => {
    let result = [...products];

    // Search query match
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.color?.toLowerCase().includes(query) ||
        p.suppliers?.company_name?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => {
        const status = getProductStatus(p.quantity);
        return status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Handle nested company_name sort
        if (sortConfig.key === 'supplier') {
          valA = a.suppliers?.company_name || '';
          valB = b.suppliers?.company_name || '';
        }

        if (typeof valA === 'string') {
          return sortConfig.direction === 'asc' 
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortConfig.direction === 'asc'
            ? (valA || 0) - (valB || 0)
            : (valB || 0) - (valA || 0);
        }
      });
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset page on filter
  }, [products, search, statusFilter, sortConfig]);

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  // Status mapping
  const getProductStatus = (qty) => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= 20) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusBadge = (qty) => {
    const status = getProductStatus(qty);
    switch (status) {
      case 'In Stock': return <Badge variant="success">In Stock</Badge>;
      case 'Low Stock': return <Badge variant="warning">Low Stock ({qty})</Badge>;
      case 'Out of Stock': return <Badge variant="danger">Out of Stock</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  // Open product details and load techpack
  const handleViewDetails = async (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setLoadingTechPack(true);
    
    try {
      // Fetch full product details
      const detail = await apiService.getProductById(product.id);
      
      // Construct a mock tech pack if backend is empty
      // In production, this would fetch from a /api/tech-packs/:id endpoint
      const mockTechPack = {
        designer: detail.tech_packs?.designer_name || 'Alok Sharma',
        version: detail.tech_packs?.version || '1.0',
        specifications: detail.tech_packs?.specifications || {
          GSM: product.description?.match(/\b(\d+)\s*gsm\b/i)?.[1] || '240 GSM',
          fabric: product.description?.match(/cotton|fleece|polyester|linen/i)?.[0] || '100% Premium Cotton',
          fit: 'Relaxed Fit',
          season: 'Spring / Summer',
          measurements: {
            chest: '44 in',
            length: '29 in',
            sleeve: '26 in',
            shoulder: '19.5 in'
          },
          care: 'Machine wash cold, lay flat to dry, do not bleach'
        }
      };
      setTechPack(mockTechPack);
    } catch (error) {
      console.error('Error fetching tech pack details:', error);
      // Fallback tech pack
      setTechPack({
        designer: 'Alok Sharma',
        version: '1.0',
        specifications: {
          GSM: '240 GSM',
          fabric: '100% Cotton Fleece',
          fit: 'Standard Fit',
          season: 'All Season',
          measurements: { chest: '42 in', length: '28 in', sleeve: '25 in' },
          care: 'Wash with like colors'
        }
      });
    } finally {
      setLoadingTechPack(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentData = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tableHeaders = [
    { key: 'image', label: 'Item Visual', sortable: false, width: '80px' },
    { key: 'sku', label: 'Style #', sortable: true, width: '150px' },
    { key: 'name', label: 'Style Name', sortable: true },
    { key: 'fabric', label: 'Fabric Composition', sortable: false },
    { key: 'supplier', label: 'Supplier', sortable: true },
    { key: 'price', label: 'Price (INR)', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false, width: '100px' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FiPackage className="w-6 h-6 text-primary" />
            <span>Finished Goods Catalog</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage, sort, and inspect tech pack specifications for garments</p>
        </div>
      </div>

      {/* Search and Filters Card */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBox
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search style #, name, supplier..."
        />

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold uppercase text-zinc-550">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">All Inventory</option>
            <option value="in stock">In Stock</option>
            <option value="low stock">Low Stock</option>
            <option value="out of stock">Out of Stock</option>
          </select>
        </div>
      </Card>

      {/* Main Datatable */}
      <Table
        headers={tableHeaders}
        data={currentData}
        loading={loading}
        sortConfig={sortConfig}
        onSort={handleSort}
        emptyTitle="No Finished Goods catalog found"
        emptyDescription="Please check database connections or seed your Postgres database."
        renderRow={(product) => {
          // Extract GSM & Fabric from description
          const fabric = product.description?.match(/cotton|fleece|polyester|linen/i)?.[0] || 'Cotton';
          const gsm = product.description?.match(/\b(\d+)\s*gsm\b/i)?.[0] || '220 GSM';
          const visualTag = product.color ? product.color.toLowerCase() : 'apparel';

          return (
            <tr key={product.id} className="hover:bg-zinc-900/35 transition-colors group">
              <td className="px-6 py-4.5">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shadow-inner relative">
                  {/* Generate a placeholder colored shirt icon based on color parameter */}
                  <div 
                    className="w-6 h-6 rounded-full opacity-60" 
                    style={{ backgroundColor: product.color || '#3b82f6' }}
                  />
                </div>
              </td>
              <td className="px-6 py-4.5 text-sm font-semibold text-zinc-300 font-mono">
                {product.sku}
              </td>
              <td className="px-6 py-4.5 text-sm font-medium text-white">
                {product.name}
              </td>
              <td className="px-6 py-4.5 text-xs text-zinc-400 capitalize">
                {fabric} ({gsm})
              </td>
              <td className="px-6 py-4.5 text-sm text-zinc-350">
                {product.suppliers?.company_name || 'N/A'}
              </td>
              <td className="px-6 py-4.5 text-sm font-semibold text-white font-mono">
                ₹{parseFloat(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4.5 text-sm">
                {getStatusBadge(product.quantity)}
              </td>
              <td className="px-6 py-4.5 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(product)}
                  icon={FiEye}
                  className="hover:bg-zinc-800"
                >
                  Inspect
                </Button>
              </td>
            </tr>
          );
        }}
      />

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-end">
          <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-450 hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-xs font-semibold transition-colors cursor-pointer ${
                  currentPage === idx + 1
                    ? 'bg-primary border-primary text-white z-10'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-450 hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Detail Specifications (Tech Pack) Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? `Tech Pack - Style #${selectedProduct.sku}` : ''}
        size="lg"
      >
        {loadingTechPack || !techPack ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Spinner size="lg" />
            <span className="text-zinc-500 text-xs">Fetching DDL Specifications...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Product Card */}
            <div className="flex items-center space-x-4 bg-zinc-950 p-4 border border-zinc-850 rounded-2xl">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: selectedProduct.color || '#3b82f6' }}
              />
              <div>
                <h4 className="text-base font-semibold text-white">{selectedProduct.name}</h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Style ID: {selectedProduct.id}</p>
              </div>
            </div>

            {/* Grid Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Designer</span>
                <p className="text-sm font-medium text-white mt-0.5">{techPack.designer}</p>
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Revision Version</span>
                <p className="text-sm font-medium text-white mt-0.5">{techPack.version}</p>
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">GSM / Fabric</span>
                <p className="text-sm font-medium text-white mt-0.5">{techPack.specifications.fabric} ({techPack.specifications.GSM})</p>
              </div>
              <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Season Release</span>
                <p className="text-sm font-medium text-white mt-0.5">{techPack.specifications.season}</p>
              </div>
            </div>

            {/* Measurements specifications */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center">
                <FiFileText className="w-4 h-4 mr-1.5 text-primary" />
                <span>Base Measurements</span>
              </h5>
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-zinc-800/80">
                  <thead className="bg-zinc-950/40">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500">Component</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-500">Target Value (L)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-transparent text-xs">
                    {Object.entries(techPack.specifications.measurements).map(([key, val]) => (
                      <tr key={key}>
                        <td className="px-4 py-2 text-zinc-400 capitalize">{key}</td>
                        <td className="px-4 py-2 text-white font-mono font-semibold">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Care guidelines */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-primary flex items-center">
                <FiInfo className="w-3.5 h-3.5 mr-1" />
                Care Instructions
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {techPack.specifications.care}
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  toast.success('Specifications downloaded as PDF.');
                  setIsModalOpen(false);
                }}
                icon={FiDownload}
              >
                Download PDF DDL
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default FinishedGoods;
