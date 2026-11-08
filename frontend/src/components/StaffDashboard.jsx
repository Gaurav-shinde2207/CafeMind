import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  Database,
  ArrowRight,
  Filter,
  Star
} from 'lucide-react';
import {
  fetchOrders,
  updateOrderStatus,
  fetchCafeStats,
  fetchFeedbackAnalysis,
  fetchOperationalInsights
} from '../api';

export default function StaffDashboard({ dbHealth }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('cafemind_staff_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const loadData = async () => {
    try {
      const [ordersData, statsData] = await Promise.all([
        fetchOrders(filterStatus),
        fetchCafeStats()
      ]);
      setOrders(ordersData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading staff dashboard data:', err);
    }
  };

  // Poll orders & stats every 4 seconds
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadData();
    } catch (err) {
      console.error('Failed to change status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRunGeminiInsights = async () => {
    setLoadingInsights(true);
    try {
      const [opRes, fbRes] = await Promise.all([
        fetchOperationalInsights(),
        fetchFeedbackAnalysis()
      ]);
      setInsights(opRes);
      setFeedbackSummary(fbRes);
    } catch (err) {
      console.error('Failed to fetch Gemini insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Auto-load initial insights once
  useEffect(() => {
    if (isAuthenticated) {
      handleRunGeminiInsights();
    }
  }, [isAuthenticated]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === '1234') {
      sessionStorage.setItem('cafemind_staff_auth', 'true');
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid access PIN. Try default demo PIN: 1234');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cafemind_staff_auth');
    setIsAuthenticated(false);
    setPinInput('');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-cafe-border shadow-xl space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-cafe-terracottaLight text-cafe-terracotta flex items-center justify-center mx-auto shadow-sm">
          <ChefHat className="w-8 h-8" />
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold text-cafe-espresso">
            Staff Access Verification
          </h2>
          <p className="text-xs text-cafe-brown mt-1">
            Kitchen dispatch and operational insights are restricted to café staff.
          </p>
        </div>

        {pinError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {pinError}
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-left font-semibold text-cafe-espresso mb-1">
              Enter Staff PIN (Demo: 1234)
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              autoFocus
              className="w-full text-center tracking-widest text-lg font-bold p-3 rounded-xl border border-cafe-border bg-cafe-ivory text-cafe-espresso focus:outline-none focus:ring-2 focus:ring-cafe-terracotta"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-cafe-espresso hover:bg-black text-white font-semibold rounded-xl text-xs shadow-md transition-all"
          >
            Authenticate & Open Kitchen Queue
          </button>
        </form>

        <p className="text-[11px] text-cafe-brown/60">
          Demo Passcode: <strong className="text-cafe-espresso">1234</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner & Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cafe-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cafe-espresso">
              Café Operations & Barista Queue
            </h1>
          </div>
          <p className="text-xs text-cafe-brown mt-1">
            Real-time kitchen order dispatching, dynamic wait-time calculation, and AI guest insights.
          </p>
        </div>

        {/* Database & Gemini Health Pill */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl border border-cafe-border shadow-xs flex items-center gap-2.5 text-xs">
            <Database className="w-4 h-4 text-cafe-brown" />
            <div>
              <span className="text-[10px] text-cafe-brown block font-medium">DB Connection</span>
              <span className="font-bold text-cafe-espresso">
                {dbHealth?.database?.database_type || 'Checking...'}
              </span>
            </div>
          </div>

          <button
            onClick={handleRunGeminiInsights}
            disabled={loadingInsights}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-cafe-terracotta hover:bg-cafe-terracottaDark text-white text-xs font-semibold shadow-md shadow-cafe-terracotta/20 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loadingInsights ? 'animate-spin' : ''}`} />
            <span>{loadingInsights ? 'Analyzing...' : 'Refresh Gemini Insights'}</span>
          </button>

          <button
            onClick={handleLogout}
            title="Lock Staff Operations"
            className="px-3 py-3 border border-cafe-border hover:bg-cafe-cream text-cafe-brown rounded-2xl text-xs font-semibold transition-all"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Live Operational Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Queue */}
        <div className="p-5 bg-white rounded-2xl border border-cafe-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-cafe-brown mb-2 font-medium">
            <span>Orders in Kitchen</span>
            <ChefHat className="w-4 h-4 text-cafe-terracotta" />
          </div>
          <span className="text-3xl font-bold text-cafe-espresso">
            {stats?.active_orders_count ?? 0}
          </span>
          <span className="text-[11px] text-cafe-brown/70 block mt-1">
            Pending / In Preparation
          </span>
        </div>

        {/* Average Wait Time */}
        <div className="p-5 bg-white rounded-2xl border border-cafe-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-cafe-brown mb-2 font-medium">
            <span>Current Avg Wait</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-3xl font-bold text-cafe-espresso">
            {stats?.average_wait_minutes ?? 5} <span className="text-base font-normal">mins</span>
          </span>
          <span className="text-[11px] text-cafe-brown/70 block mt-1">
            Auto-calculated from tickets
          </span>
        </div>

        {/* Orders Ready for Pickup */}
        <div className="p-5 bg-white rounded-2xl border border-cafe-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-cafe-brown mb-2 font-medium">
            <span>Ready at Counter</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-bold text-cafe-espresso">
            {stats?.ready_orders ?? 0}
          </span>
          <span className="text-[11px] text-cafe-brown/70 block mt-1">
            Awaiting guest pickup
          </span>
        </div>

        {/* Total Orders Handled */}
        <div className="p-5 bg-white rounded-2xl border border-cafe-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-cafe-brown mb-2 font-medium">
            <span>Total Tickets Today</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-3xl font-bold text-cafe-espresso">
            {stats?.total_orders ?? 0}
          </span>
          <span className="text-[11px] text-cafe-brown/70 block mt-1">
            {stats?.completed_orders ?? 0} completed
          </span>
        </div>

      </div>

      {/* Gemini AI Operational Summary Card */}
      {insights && (
        <div className="p-6 bg-gradient-to-r from-cafe-cream/80 to-cafe-terracottaLight/40 rounded-3xl border border-cafe-terracotta/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cafe-terracotta text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-lg font-bold text-cafe-espresso">
                Gemini Operational Insights & Bottleneck Monitor
              </h2>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cafe-terracotta px-2.5 py-1 bg-white rounded-full border border-cafe-terracotta/20">
              {insights.is_mock ? 'Mock Fallback Mode' : 'Live Gemini 2.5'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-cafe-border/80 space-y-1.5">
              <span className="font-bold text-cafe-espresso flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Kitchen Throughput & Bottleneck Analysis:
              </span>
              <p className="text-cafe-brown leading-relaxed">
                {insights.bottleneck_analysis}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-cafe-border/80 space-y-2">
              <span className="font-bold text-cafe-espresso block text-xs">
                Proactive Staff Actions Recommended:
              </span>
              <ul className="space-y-1">
                {insights.gemini_recommendations.map((rec, rIdx) => (
                  <li key={rIdx} className="text-cafe-brown flex items-start gap-1.5">
                    <span className="text-cafe-terracotta font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Section: Orders Queue & Feedback Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Orders Queue (2 columns wide) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-bold text-cafe-espresso">
              Live Order Tickets ({orders.length})
            </h2>

            <div className="flex items-center gap-1 bg-cafe-cream/80 p-1 rounded-xl border border-cafe-border text-xs">
              {['all', 'pending', 'preparing', 'ready', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    filterStatus === status
                      ? 'bg-white font-bold text-cafe-espresso shadow-xs'
                      : 'text-cafe-brown hover:text-cafe-espresso'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Cards Grid */}
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-cafe-border space-y-2">
              <ChefHat className="w-10 h-10 text-cafe-brown/40 mx-auto" />
              <h3 className="font-serif text-base font-bold text-cafe-espresso">No orders in this view</h3>
              <p className="text-xs text-cafe-brown">All guest tickets have been cleared.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => {
                const isPending = ord.status === 'pending';
                const isPreparing = ord.status === 'preparing';
                const isReady = ord.status === 'ready';
                const isCompleted = ord.status === 'completed';

                return (
                  <div
                    key={ord.id}
                    className="p-5 bg-white rounded-2xl border border-cafe-border shadow-xs hover:border-cafe-terracotta/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Ticket header */}
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 bg-cafe-cream rounded-md text-cafe-espresso">
                          #{ord.order_number}
                        </span>
                        <span className="font-serif font-bold text-sm text-cafe-espresso">
                          {ord.customer_name}
                        </span>
                        {ord.customer_phone && (
                          <span className="text-[11px] text-cafe-brown">
                            ({ord.customer_phone})
                          </span>
                        )}
                        
                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-100 text-amber-800'
                              : isPreparing
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : isReady
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      {/* Item list */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {ord.items.map((it, iIdx) => (
                          <span
                            key={iIdx}
                            className="bg-cafe-ivory px-2.5 py-1 rounded-lg border border-cafe-border/80 text-cafe-espresso font-medium"
                          >
                            <span className="font-bold text-cafe-terracotta">{it.quantity}x</span> {it.item_name}
                            {it.customization && (
                              <span className="text-cafe-brown/80 italic text-[10px] ml-1">
                                ({it.customization})
                              </span>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Special instructions */}
                      {ord.special_instructions && (
                        <p className="text-[11px] text-cafe-brown italic">
                          Note: "{ord.special_instructions}"
                        </p>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center gap-4 text-[10px] text-cafe-brown/80 pt-1">
                        <span>Ordered: {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>Total: <strong className="text-cafe-espresso">₹{ord.total_amount}</strong></span>
                        <span>Est Wait: <strong>{ord.estimated_wait_minutes}m</strong></span>
                      </div>
                    </div>

                    {/* Action Status Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && (
                        <button
                          onClick={() => handleStatusChange(ord.id, 'preparing')}
                          disabled={updatingId === ord.id}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                        >
                          Start Prep
                        </button>
                      )}

                      {isPreparing && (
                        <button
                          onClick={() => handleStatusChange(ord.id, 'ready')}
                          disabled={updatingId === ord.id}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                        >
                          Mark Ready
                        </button>
                      )}

                      {isReady && (
                        <button
                          onClick={() => handleStatusChange(ord.id, 'completed')}
                          disabled={updatingId === ord.id}
                          className="px-3.5 py-2 bg-cafe-espresso hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
                        >
                          Complete
                        </button>
                      )}

                      {!isCompleted && ord.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(ord.id, 'cancelled')}
                          disabled={updatingId === ord.id}
                          className="p-2 text-cafe-brown/60 hover:text-red-600 text-xs rounded-xl"
                          title="Cancel ticket"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Customer Feedback & Sentiment Analysis */}
        <div className="space-y-6">
          
          {/* Feedback Sentiment Summary */}
          <div className="p-6 bg-white rounded-3xl border border-cafe-border shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cafe-terracotta" />
              <h3 className="font-serif text-lg font-bold text-cafe-espresso">
                Guest Sentiment & Reviews
              </h3>
            </div>

            {feedbackSummary && (
              <div className="space-y-3 text-xs">
                {/* Rating score badge */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="text-xl font-bold text-amber-900">
                      {feedbackSummary.average_rating}
                    </span>
                    <span className="text-amber-800 text-[10px]">/ 5.0</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800">
                    {feedbackSummary.total_reviews} Reviews
                  </span>
                </div>

                {/* Sentiment breakdown */}
                <p className="text-cafe-brown leading-relaxed italic">
                  "{feedbackSummary.sentiment_breakdown}"
                </p>

                {/* Themes */}
                <div>
                  <span className="font-bold text-cafe-espresso block mb-1.5">Key Themes Identified:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {feedbackSummary.key_themes.map((th, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 bg-cafe-ivory text-cafe-espresso rounded-lg border border-cafe-border text-[11px]"
                      >
                        {th}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-cafe-border/60">
                  <span className="font-bold text-cafe-espresso block mb-1.5">Hospitality Action Items:</span>
                  <ul className="space-y-1 text-cafe-brown">
                    {feedbackSummary.suggested_actions.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-1">
                        <span className="text-cafe-terracotta">›</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Popular Items breakdown */}
          {stats?.popular_items && (
            <div className="p-6 bg-white rounded-3xl border border-cafe-border shadow-xs space-y-3">
              <h3 className="font-serif text-base font-bold text-cafe-espresso">
                Top Ordered Products Today
              </h3>
              <div className="divide-y divide-cafe-border/60">
                {stats.popular_items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center text-xs">
                    <span className="font-medium text-cafe-espresso">
                      {idx + 1}. {it.name}
                    </span>
                    <span className="font-bold text-cafe-terracotta">
                      {it.sold} orders
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
