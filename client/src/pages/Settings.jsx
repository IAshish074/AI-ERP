import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { apiService } from '../services/api';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { Spinner } from '../components/Loader';
import { 
  FiSettings, 
  FiKey, 
  FiActivity, 
  FiRefreshCw, 
  FiDatabase, 
  FiCpu, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiServer
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { openRouterKey, setOpenRouterKey, statuses, loading: checkingHealth, runHealthCheck } = useSettings();
  const [localKey, setLocalKey] = useState(openRouterKey);
  const [syncing, setSyncing] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const serverRootUrl = apiUrl.replace(/\/api$/, '');

  const handleSaveKey = () => {
    setOpenRouterKey(localKey);
    toast.success('OpenRouter API Key saved successfully');
    runHealthCheck();
  };

  const handleSyncTypesense = async () => {
    setSyncing(true);
    const toastId = toast.loading('Syncing Supabase products to Typesense indexes...');
    try {
      await apiService.syncAllProductsToTypesense();
      toast.success('Typesense catalog sync completed successfully', { id: toastId });
    } catch (error) {
      toast.error('Sync failed. Check backend logs.', { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success">Active</Badge>;
      case 'unhealthy':
        return <Badge variant="danger">Disconnected</Badge>;
      case 'loading':
        return <Badge variant="warning">Checking...</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <FiCheckCircle className="w-5 h-5 text-success" />;
      case 'unhealthy':
        return <FiAlertTriangle className="w-5 h-5 text-red-500" />;
      case 'loading':
        return <Spinner size="sm" className="w-5 h-5 text-amber-500" />;
      default:
        return <FiActivity className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FiSettings className="w-6 h-6 text-primary" />
          <span>System Settings</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Configure credentials and view AI ERP service statuses</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Keys */}
        <Card glow className="space-y-6">
          <CardHeader className="mb-0 border-b-0 pb-0">
            <div className="flex items-center space-x-2">
              <FiKey className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-white">Credentials</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="OpenRouter API Key"
              type="password"
              placeholder="sk-or-v1-..."
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              className="text-xs"
            />
            <p className="text-xs text-zinc-500">
              Your OpenRouter API Key is stored securely in your browser's local storage and is used to power the Text-to-SQL AI queries.
            </p>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveKey} disabled={localKey === openRouterKey}>
                Save Credentials
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Right Side: Statuses */}
        <Card className="space-y-6">
          <CardHeader className="mb-0 border-b-0 pb-0 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiActivity className="w-5 h-5 text-success" />
              <h3 className="text-base font-semibold text-white">Service Health</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={runHealthCheck}
              disabled={checkingHealth}
              icon={FiRefreshCw}
              className={checkingHealth ? 'animate-spin' : ''}
            >
              Refresh
            </Button>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Status list */}
            <div className="divide-y divide-zinc-800/60">
              {/* Server */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <FiServer className="w-5 h-5 text-zinc-400" />
                  <div>
                    <span className="text-sm font-medium text-white block">ERP Core API</span>
                    <span className="text-[10px] text-zinc-550 block">{serverRootUrl}</span>
                  </div>
                </div>
                {getStatusBadge(statuses.server)}
              </div>

              {/* Supabase */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <FiDatabase className="w-5 h-5 text-zinc-400" />
                  <div>
                    <span className="text-sm font-medium text-white block">Supabase SQL DB</span>
                    <span className="text-[10px] text-zinc-500 block">PostgreSQL instance storage</span>
                  </div>
                </div>
                {getStatusBadge(statuses.supabase)}
              </div>

              {/* Typesense */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <FiCpu className="w-5 h-5 text-zinc-400" />
                  <div>
                    <span className="text-sm font-medium text-white block">Typesense Vector search</span>
                    <span className="text-[10px] text-zinc-500 block">Fuzzy + Vector index storage</span>
                  </div>
                </div>
                {getStatusBadge(statuses.typesense)}
              </div>

              {/* Vanna */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <FiCpu className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-white block">Vanna Text-to-SQL</span>
                    <span className="text-[10px] text-zinc-500 block">LLM prompt generator agent</span>
                  </div>
                </div>
                {getStatusBadge(statuses.vanna)}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sync catalog */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Sync Catalog Search Indexes</h4>
            <p className="text-xs text-zinc-500 mt-1">
              Bulk sync finished goods from Supabase database to Typesense vector search clusters. Necessary when modifying database records manually.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleSyncTypesense}
            disabled={syncing}
            icon={FiRefreshCw}
            className={syncing ? 'animate-spin' : ''}
          >
            {syncing ? 'Syncing...' : 'Sync Search Indexes'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default Settings;
