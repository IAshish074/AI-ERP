import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { SearchBox } from '../components/SearchBox';
import { ProductCardSkeleton } from '../components/Loader';
import { FiSearch, FiSliders, FiGrid, FiList, FiTrendingUp, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Dynamic filter lists
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [gsms, setGsms] = useState([]);

  // Active filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedGsm, setSelectedGsm] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortOption, setSortOption] = useState('name-asc'); // 'price-asc' | 'price-desc' | 'name-asc' | 'qty-desc'

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProducts();
      setProducts(data || []);
      setFiltered(data || []);
      extractFilters(data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Parse attributes from descriptions and fields
  const extractFilters = (items) => {
    const categoriesSet = new Set();
    const colorsSet = new Set();
    const suppliersSet = new Set();
    const fabricsSet = new Set();
    const seasonsSet = new Set();
    const gsmsSet = new Set();

    items.forEach(item => {
      // 1. Color
      if (item.color) colorsSet.add(item.color.trim());

      // 2. Supplier
      if (item.suppliers?.company_name) suppliersSet.add(item.suppliers.company_name.trim());

      // 3. Parse fabric from description (e.g. "cotton", "polyester", "fleece", "linen")
      const desc = item.description || '';
      const fabricMatch = desc.match(/cotton|fleece|polyester|linen|wool|silk/i);
      if (fabricMatch) {
        fabricsSet.add(fabricMatch[0]);
      } else {
        fabricsSet.add('Cotton'); // Default fallback
      }

      // 4. Parse GSM (e.g. "240 gsm", "180 gsm")
      const gsmMatch = desc.match(/\b(\d+)\s*gsm\b/i);
      if (gsmMatch) {
        gsmsSet.add(gsmMatch[0]);
      }

      // 5. Parse Category (e.g. Hoodie, T-Shirt, Shirt, Pants, Jacket)
      const catMatch = item.name.match(/hoodie|t-shirt|shirt|pants|jacket|jeans|sweater/i) || desc.match(/hoodie|t-shirt|shirt|pants|jacket|jeans|sweater/i);
      if (catMatch) {
        categoriesSet.add(catMatch[0]);
      } else {
        categoriesSet.add('Apparel');
      }

      // 6. Season defaults
      const seasonMatch = desc.match(/spring|summer|autumn|winter|monsoon/i);
      if (seasonMatch) {
        seasonsSet.add(seasonMatch[0]);
      }
    });

    setCategories(Array.from(categoriesSet));
    setColors(Array.from(colorsSet));
    setSuppliers(Array.from(suppliersSet));
    setFabrics(Array.from(fabricsSet));
    setSeasons(Array.from(seasonsSet));
    setGsms(Array.from(gsmsSet));
  };

  // Main filter pipeline
  useEffect(() => {
    let result = [...products];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => 
        item.name?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(item => {
        const itemCat = item.name.toLowerCase() + ' ' + (item.description || '').toLowerCase();
        return itemCat.includes(selectedCategory.toLowerCase());
      });
    }

    // Color filter
    if (selectedColor) {
      result = result.filter(item => item.color?.toLowerCase() === selectedColor.toLowerCase());
    }

    // Supplier filter
    if (selectedSupplier) {
      result = result.filter(item => item.suppliers?.company_name === selectedSupplier);
    }

    // Fabric filter
    if (selectedFabric) {
      result = result.filter(item => (item.description || '').toLowerCase().includes(selectedFabric.toLowerCase()));
    }

    // Season filter
    if (selectedSeason) {
      result = result.filter(item => (item.description || '').toLowerCase().includes(selectedSeason.toLowerCase()));
    }

    // GSM filter
    if (selectedGsm) {
      result = result.filter(item => (item.description || '').toLowerCase().includes(selectedGsm.toLowerCase()));
    }

    // Price Minimum
    if (priceMin) {
      result = result.filter(item => parseFloat(item.price) >= parseFloat(priceMin));
    }

    // Price Maximum
    if (priceMax) {
      result = result.filter(item => parseFloat(item.price) <= parseFloat(priceMax));
    }

    // Sort operations
    if (sortOption === 'price-asc') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortOption === 'price-desc') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortOption === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'qty-desc') {
      result.sort((a, b) => b.quantity - a.quantity);
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [
    products, search, selectedCategory, selectedColor, selectedSupplier,
    selectedFabric, selectedSeason, selectedGsm, priceMin, priceMax, sortOption
  ]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedSupplier('');
    setSelectedFabric('');
    setSelectedSeason('');
    setSelectedGsm('');
    setPriceMin('');
    setPriceMax('');
    setSortOption('name-asc');
    toast.success('Filters cleared');
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FiSearch className="w-6 h-6 text-primary" />
            <span>Product Advanced Search</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Refine and search finished goods catalogs using multi-faceted criteria</p>
        </div>
      </div>

      {/* Main filters panel */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <SearchBox
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search style name, SKU description..."
            className="flex-1 max-w-xl"
          />

          <div className="flex items-center space-x-3 self-end md:self-auto">
            {/* Grid / List Toggles */}
            <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-zinc-950 border border-zinc-900">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                  layoutMode === 'grid' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-550 hover:text-zinc-300'
                }`}
              >
                <FiGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                  layoutMode === 'list' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-550 hover:text-zinc-300'
                }`}
              >
                <FiList className="w-4 h-4" />
              </button>
            </div>

            {/* Sorting Select */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="name-asc">Sort Name (A-Z)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="qty-desc">Quantity: High to Low</option>
            </select>
          </div>
        </div>

        {/* Faceted Select Boxes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 pt-3 border-t border-zinc-800/60">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All</option>
              {categories.map((c, i) => (
                <option key={i} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Color</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All</option>
              {colors.map((c, i) => (
                <option key={i} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>

          {/* Fabric */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Fabric</label>
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All</option>
              {fabrics.map((f, i) => (
                <option key={i} value={f} className="capitalize">{f}</option>
              ))}
            </select>
          </div>

          {/* GSM */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">GSM Weight</label>
            <select
              value={selectedGsm}
              onChange={(e) => setSelectedGsm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">All</option>
              {gsms.map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500">Supplier</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none truncate"
            >
              <option value="">All</option>
              {suppliers.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-1 col-span-2 flex items-center space-x-2">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 block">Min Price</label>
              <input
                type="number"
                placeholder="₹ Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 block">Max Price</label>
              <input
                type="number"
                placeholder="₹ Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(search || selectedCategory || selectedColor || selectedSupplier || selectedFabric || selectedSeason || selectedGsm || priceMin || priceMax) && (
          <div className="flex justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Main listings */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
          <FiSearch className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-base font-semibold text-white">No products match current filters</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">Try resetting search terms or adjusting the price range variables.</p>
          <Button variant="secondary" size="sm" onClick={clearFilters} className="mt-5">
            Reset Filters
          </Button>
        </Card>
      ) : layoutMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {currentData.map((item) => {
            const fabric = item.description?.match(/cotton|fleece|polyester|linen/i)?.[0] || 'Cotton';
            const gsm = item.description?.match(/\b(\d+)\s*gsm\b/i)?.[0] || '220 GSM';
            const isOutOfStock = item.quantity === 0;

            return (
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg group relative flex flex-col justify-between"
              >
                {/* Visual placeholder color shirt */}
                <div className="aspect-square bg-zinc-950 flex items-center justify-center relative border-b border-zinc-850 overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : null}
                  <div 
                    className="w-24 h-24 rounded-full opacity-65 group-hover:scale-110 transition-transform duration-300 filter blur-xs absolute"
                    style={{ backgroundColor: item.color || '#3b82f6', zIndex: item.image_url ? -1 : 1 }}
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <Badge variant="danger">Out of Stock</Badge>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-semibold font-mono">{item.sku}</span>
                    <h4 className="text-sm font-semibold text-white tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-zinc-400 capitalize">{fabric} ({gsm})</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-zinc-850">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Supplier:</span>
                      <span className="text-zinc-300 font-medium truncate max-w-[120px]">{item.suppliers?.company_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Color:</span>
                      <span className="text-zinc-300 font-medium capitalize">{item.color || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-base font-bold text-white font-mono">
                        ₹{parseFloat(item.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-zinc-500">{item.quantity} units</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {currentData.map((item) => {
            const fabric = item.description?.match(/cotton|fleece|polyester|linen/i)?.[0] || 'Cotton';
            const gsm = item.description?.match(/\b(\d+)\s*gsm\b/i)?.[0] || '220 GSM';
            const isOutOfStock = item.quantity === 0;

            return (
              <motion.div
                whileHover={{ x: 3 }}
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="w-12 h-12 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : null}
                    <div 
                      className="w-7 h-7 rounded-full opacity-60 absolute" 
                      style={{ backgroundColor: item.color || '#3b82f6', zIndex: item.image_url ? -1 : 1 }}
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <span className="text-[8px] font-bold text-red-400">OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] text-zinc-500 font-mono block">{item.sku}</span>
                    <h4 className="text-sm font-semibold text-white truncate">{item.name}</h4>
                    <p className="text-xs text-zinc-400 capitalize mt-0.5">{fabric} • {gsm} • {item.color}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  <div className="text-right hidden md:block">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Supplier</span>
                    <span className="text-xs text-zinc-300 font-medium">{item.suppliers?.company_name || 'N/A'}</span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Stock Quantity</span>
                    <span className="text-xs text-zinc-350">{item.quantity} units</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-white font-mono block">
                      ₹{parseFloat(item.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-zinc-550 font-mono block">ID: {item.id.slice(0, 8)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-end pt-4">
          <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-450 hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Prev
            </button>
            {(() => {
              const windowSize = 5;
              const half = Math.floor(windowSize / 2);
              let start = Math.max(1, currentPage - half);
              let end = Math.min(totalPages, start + windowSize - 1);
              if (end - start + 1 < windowSize) {
                start = Math.max(1, end - windowSize + 1);
              }
              const pages = [];
              for (let i = start; i <= end; i++) {
                pages.push(i);
              }
              return (
                <>
                  {start > 1 && (
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="relative inline-flex items-center px-4 py-2 border text-xs font-semibold bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 cursor-pointer"
                    >
                      1..
                    </button>
                  )}
                  {pages.map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`relative inline-flex items-center px-4 py-2 border text-xs font-semibold transition-colors cursor-pointer ${
                        currentPage === p
                          ? 'bg-primary border-primary text-white z-10'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {end < totalPages && (
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="relative inline-flex items-center px-4 py-2 border text-xs font-semibold bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 cursor-pointer"
                    >
                      ..{totalPages}
                    </button>
                  )}
                </>
              );
            })()}
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
    </motion.div>
  );
};

export default ProductSearch;
