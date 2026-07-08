import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Loader';
import { Table } from '../components/Table';
import { 
  FiDatabase, 
  FiSend, 
  FiCopy, 
  FiCheck, 
  FiDownload, 
  FiUser, 
  FiCpu, 
  FiInfo, 
  FiAlertCircle 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export const NaturalLanguageSQL = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeSQL, setActiveSQL] = useState('');
  const [activeRows, setActiveRows] = useState([]);
  const [copied, setCopied] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const presetPrompts = [
    { text: 'Show blue shirts', query: 'Show all shirts with blue color' },
    { text: 'Find cotton hoodies', query: 'Show all hoodies made from cotton' },
    { text: 'Supplier with highest revenue', query: 'Find the supplier who generated the highest invoice revenue' }
  ];

  const handleSend = async (customQuery) => {
    const queryToSend = customQuery || question;
    if (!queryToSend.trim()) return;

    setLoading(true);
    setQuestion('');

    // Append user message
    const userMessage = { sender: 'user', text: queryToSend, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const data = await apiService.askNaturalLanguageQuery(queryToSend);
      
      // Append AI response
      const aiMessage = {
        sender: 'ai',
        sql: data.generatedSQL,
        rows: data.rows || [],
        answer: data.answer || 'No text answer generated.',
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);

      if (data.generatedSQL) {
        setActiveSQL(data.generatedSQL);
      }
      if (data.rows && data.rows.length > 0) {
        setActiveRows(data.rows);
      } else {
        setActiveRows([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not complete query. Check OpenRouter key or network.');
      
      setChatHistory(prev => [...prev, {
        sender: 'ai',
        error: true,
        text: 'Error processing natural language query. Ensure database is online and OpenRouter key is set in Settings.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySQL = (sql) => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    toast.success('SQL Query copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = (rows, index) => {
    if (!rows || rows.length === 0) return;

    // Build CSV string
    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(','), // header row
      ...rows.map(row => 
        headers.map(fieldName => {
          const val = row[fieldName];
          // Handle string commas by wrapping in quotes
          if (typeof val === 'string') {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      )
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `query_results_${index + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Download initiated!');
  };

  // Simulated Typing Animation Component
  const TypingText = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(prev => prev + text.charAt(index));
        index++;
        if (index >= text.length) {
          clearInterval(interval);
        }
      }, 10); // typing speed
      return () => clearInterval(interval);
    }, [text]);

    return <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{displayedText}</p>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 flex flex-col h-[calc(100vh-8rem)]"
    >
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FiDatabase className="w-6 h-6 text-primary" />
          <span>Natural Language SQL Console</span>
        </h1>
        <p className="text-sm text-zinc-400 mt-1">Query the ERP Postgres database in natural language using Vanna AI RAG pipeline</p>
      </div>

      {/* Main chat and suggestions */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Chat History */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-zinc-850 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner">
                  <FiDatabase className="w-6 h-6 text-zinc-550" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Ask anything about Finished Goods, Suppliers, Invoices...</h4>
                  <p className="text-xs text-zinc-650 max-w-sm mt-1">
                    Your request is automatically translated to SQL, executed against Supabase, and summarized by LLM models.
                  </p>
                </div>
              </div>
            )}

            {chatHistory.map((msg, index) => (
              <div key={index} className="space-y-4">
                {/* User Message */}
                {msg.sender === 'user' && (
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-primary/10 border border-primary/20 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[70%]">
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-[9px] text-zinc-500 block text-right mt-1.5">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-zinc-850 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-400">
                      <FiUser className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* AI Message */}
                {msg.sender === 'ai' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-primary">
                      <FiCpu className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-4 max-w-[90%]">
                      {msg.error ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl rounded-tl-none px-4 py-2.5">
                          <p className="text-sm flex items-center">
                            <FiAlertCircle className="w-4 h-4 mr-2" />
                            {msg.text}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Answer summary */}
                          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
                            <TypingText text={msg.answer} />
                          </div>

                          {/* Code SQL Block */}
                          {msg.sql && (
                            <div className="bg-zinc-950/70 border border-zinc-900 rounded-xl overflow-hidden">
                              <div className="flex justify-between items-center bg-zinc-950 px-4 py-2 border-b border-zinc-900 text-xs">
                                <span className="text-zinc-500 font-mono">Generated SQL Query</span>
                                <button
                                  onClick={() => handleCopySQL(msg.sql)}
                                  className="text-zinc-400 hover:text-white flex items-center space-x-1.5 cursor-pointer"
                                >
                                  {copied ? <FiCheck className="w-3.5 h-3.5 text-success" /> : <FiCopy className="w-3.5 h-3.5" />}
                                  <span>{copied ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <pre className="p-4 overflow-x-auto text-xs text-blue-400 font-mono">
                                <code>{msg.sql}</code>
                              </pre>
                            </div>
                          )}

                          {/* Rows Execution Table */}
                          {msg.rows && msg.rows.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] uppercase font-bold text-zinc-550">
                                  Result Set ({msg.rows.length} rows)
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadCSV(msg.rows, index)}
                                  icon={FiDownload}
                                  className="h-7 text-xs"
                                >
                                  Download CSV
                                </Button>
                              </div>
                              
                              {/* Horizontal scroll database output table */}
                              <div className="border border-zinc-900 rounded-xl overflow-x-auto bg-zinc-950/20 max-h-[250px]">
                                <table className="min-w-full divide-y divide-zinc-900 font-mono text-[11px]">
                                  <thead className="bg-zinc-950/70 sticky top-0">
                                    <tr>
                                      {Object.keys(msg.rows[0]).map((key) => (
                                        <th key={key} className="px-4 py-2 text-left text-zinc-500 font-medium whitespace-nowrap">
                                          {key}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-900 bg-transparent text-zinc-300">
                                    {msg.rows.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-zinc-950/40">
                                        {Object.values(row).map((val, cIdx) => (
                                          <td key={cIdx} className="px-4 py-2 whitespace-nowrap">
                                            {val === null || val === undefined ? 'NULL' : String(val)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : msg.sql ? (
                            <div className="flex items-center space-x-2 text-xs text-zinc-500 px-1 bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                              <FiInfo className="w-4 h-4 text-zinc-650" />
                              <span>Query executed successfully but returned empty result set.</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                      
                      <span className="text-[9px] text-zinc-500 block mt-1.5 pl-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-primary animate-pulse">
                  <FiCpu className="w-4 h-4" />
                </div>
                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl rounded-tl-none px-5 py-4 flex items-center space-x-2">
                  <span className="text-zinc-500 text-xs animate-pulse">AI is parsing schema models...</span>
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-dot-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-dot-bounce" style={{ animationDelay: '200ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-dot-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Area */}
          <div className="p-4 border-t border-zinc-900 bg-zinc-950/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask SQL generation like: 'Show total products in stock'"
                disabled={loading}
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!question.trim() || loading}
                icon={FiSend}
                className="px-4.5 py-3 rounded-xl cursor-pointer"
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Preset prompts */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col space-y-4">
          <Card className="p-5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Suggested Queries</h3>
            <div className="space-y-2">
              {presetPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  disabled={loading}
                  className="w-full text-left bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-xl p-3 text-xs text-zinc-350 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <p className="font-semibold text-white">{p.text}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 italic">"{p.query}"</p>
                </button>
              ))}
            </div>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-zinc-900 to-zinc-950/30">
            <h4 className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
              <FiInfo className="w-4 h-4 text-primary" />
              <span>Vanna.js RAG Engine</span>
            </h4>
            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
              Vanna is trained on DDL statements, schemas, comments, and reference SQL select cases. If the generated SQL fails, you can sync or train Vanna in Settings.
            </p>
          </Card>
        </div>

      </div>
    </motion.div>
  );
};

export default NaturalLanguageSQL;
