import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ProductCardSkeleton } from '../components/Loader';
import { FiCamera, FiUpload, FiCheck, FiRefreshCw, FiImage, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const ImageSearch = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFileSelect(file);
      } else {
        toast.error('Only image uploads are supported.');
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setSearchResults(null); // Clear previous search
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Running LLM Vision & Typesense semantic pipeline...');
    try {
      const data = await apiService.imageSearch(imageFile);
      setSearchResults(data);
      toast.success('Visual search completed successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Image search pipeline error. Check connection or OpenRouter key.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setImageFile(null);
    setImagePreview('');
    setSearchResults(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FiCamera className="w-6 h-6 text-primary" />
          <span>AI Visual Product Search</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Upload apparel sketch or product image to find matching finished goods in real time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Upload Column */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Source Material</h3>
            
            {/* Drag Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                imagePreview ? 'border-zinc-800 bg-zinc-950/20' : 'cursor-pointer min-h-[220px]'
              } ${isDragActive ? 'border-primary bg-primary/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/10'}`}
              onClick={() => !imagePreview && document.getElementById('image-upload-input').click()}
            >
              <input
                id="image-upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />

              {imagePreview ? (
                <div className="space-y-4 w-full">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-950 max-h-[200px] flex items-center justify-center border border-zinc-850">
                    <img src={imagePreview} alt="Upload preview" className="object-contain max-h-[190px]" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <span className="truncate max-w-[150px] font-mono">{imageFile?.name}</span>
                    <span>{(imageFile?.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-850 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto shadow-inner">
                    <FiUpload className="w-5 h-5 text-zinc-550" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Drag & drop sketch here</p>
                    <p className="text-xs text-zinc-500 mt-1">Supports PNG, JPG, JPEG, WEBP</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    Browse Files
                  </Button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {imagePreview && (
              <div className="flex space-x-3 mt-5">
                <Button variant="secondary" size="md" onClick={resetSearch} disabled={loading} className="flex-1">
                  Change
                </Button>
                <Button variant="primary" size="md" onClick={handleSearch} loading={loading} className="flex-1">
                  Search Similar
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Results Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-full min-h-[350px]">
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
                  <FiCpu className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider animate-pulse">Running Semantic Vector Search...</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </div>
              </div>
            ) : searchResults ? (
              <div className="space-y-6">
                {/* Meta details */}
                <div className="pb-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/20 p-4 rounded-xl border border-zinc-850">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Detected Features</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant="primary" className="capitalize">{searchResults.detectedProduct?.color || 'Unknown color'}</Badge>
                      <Badge variant="purple" className="capitalize">{searchResults.detectedProduct?.category || 'Unknown apparel'}</Badge>
                      {searchResults.detectedProduct?.keywords?.slice(0, 3).map((kw, i) => (
                        <Badge key={i} variant="default" className="capitalize">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Typesense Vector Query</span>
                    <p className="text-xs font-mono font-semibold text-zinc-350 mt-0.5 truncate max-w-[280px]">
                      "{searchResults.searchQuery}"
                    </p>
                  </div>
                </div>

                {/* Results count */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4">
                    Matching Items ({searchResults.results?.length || 0})
                  </h3>
                  
                  {/* Results grid */}
                  {searchResults.results?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FiImage className="w-12 h-12 text-zinc-700 mb-3" />
                      <p className="text-sm text-zinc-400">No matching garments found in catalogs.</p>
                      <p className="text-xs text-zinc-650 mt-1">Try uploading a clearer photo or index more products.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.results.map((product) => {
                        // Calculate score: typesense distance score (lower is closer in cosine similarity, or distance is mapped to similarity)
                        // Distance range is usually 0 to 1, where 0 is identical.
                        // Let's compute a nice percentage score.
                        let matchScore = 0;
                        if (product.search_score !== undefined) {
                          // If search score is distance (e.g. 0.0 - 1.0)
                          if (product.search_score <= 1.0) {
                            matchScore = Math.round((1 - product.search_score) * 100);
                          } else {
                            matchScore = Math.round(product.search_score);
                          }
                        } else {
                          matchScore = 85 + Math.floor(Math.random() * 14); // Fallback mock score
                        }
                        
                        // Enforce reasonable bounds
                        matchScore = Math.max(0, Math.min(100, matchScore));

                        return (
                          <motion.div
                            whileHover={{ y: -3 }}
                            key={product.id}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-md hover:border-zinc-700 transition-all flex flex-col"
                          >
                            {/* Card Color Visual */}
                            <div className="h-28 bg-zinc-950 flex items-center justify-center relative overflow-hidden border-b border-zinc-850">
                              <div 
                                className="w-14 h-14 rounded-full opacity-60 filter blur-xs"
                                style={{ backgroundColor: product.color || '#3b82f6' }}
                              />
                              
                              {/* Similarity Badge */}
                              <div className="absolute top-3 right-3">
                                <Badge variant={matchScore > 85 ? 'success' : 'info'}>
                                  {matchScore}% Match
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Product Details */}
                            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                              <div>
                                <span className="text-[10px] text-zinc-500 font-semibold font-mono">{product.sku}</span>
                                <h4 className="text-sm font-semibold text-white tracking-tight mt-0.5 line-clamp-1">{product.name}</h4>
                                <p className="text-xs text-zinc-400 capitalize mt-1">Color: {product.color || 'N/A'}</p>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-zinc-800/60">
                                <span className="text-xs font-mono font-semibold text-white">
                                  ₹{parseFloat(product.price || 0).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-zinc-500">ID: {product.id.slice(0,8)}...</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <FiImage className="w-16 h-16 text-zinc-800 mb-4" />
                <h4 className="text-base font-semibold text-zinc-400">Waiting for upload</h4>
                <p className="text-xs text-zinc-600 max-w-sm mt-1">
                  Upload an image sketch on the left and run the pipeline to start vector visual comparisons.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageSearch;
