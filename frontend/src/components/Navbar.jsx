import React from 'react';
import { Coffee, SlidersHorizontal, ShoppingBag, ShieldCheck, Database, Sparkles, ChefHat } from 'lucide-react';

export default function Navbar({
  activeView,
  setActiveView,
  cartCount,
  setIsCartOpen,
  setIsPrefsOpen,
  setIsChatOpen,
  dbHealth,
  activeOrder
}) {
  const isPostgres = dbHealth?.database?.engine === 'PostgreSQL';
  const isCloudSql = dbHealth?.database?.is_cloud_sql;

  return (
    <header className="sticky top-0 z-40 bg-cafe-ivory/95 backdrop-blur-md border-b border-cafe-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('customer')}>
            <div className="w-11 h-11 rounded-2xl bg-cafe-terracotta flex items-center justify-center text-white shadow-md shadow-cafe-terracotta/20">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-cafe-espresso">CafeMind</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-cafe-terracottaLight text-cafe-terracotta rounded-full border border-cafe-terracotta/20">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-cafe-brown hidden md:block font-light">
                Your café. Your preferences. Your experience.
              </p>
            </div>
          </div>

          {/* Center: View Switcher (Customer vs Staff) */}
          <div className="bg-cafe-cream/80 p-1 rounded-xl flex items-center border border-cafe-border shadow-inner text-xs font-medium">
            <button
              onClick={() => setActiveView('customer')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeView === 'customer'
                  ? 'bg-white text-cafe-espresso shadow-sm font-semibold'
                  : 'text-cafe-brown hover:text-cafe-espresso'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Customer Café</span>
            </button>
            <button
              onClick={() => setActiveView('staff')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeView === 'staff'
                  ? 'bg-cafe-espresso text-white shadow-sm font-semibold'
                  : 'text-cafe-brown hover:text-cafe-espresso'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Staff Dashboard</span>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Database Engine Status Pill */}
            <div 
              title={`Database: ${dbHealth?.database?.database_type || 'Checking...'}`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-cafe-cream text-cafe-espressoLight border border-cafe-border"
            >
              <span className={`w-2 h-2 rounded-full ${dbHealth?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <Database className="w-3 h-3 text-cafe-brown" />
              <span className="font-medium text-[11px]">
                {isCloudSql ? 'Cloud SQL' : isPostgres ? 'PostgreSQL' : 'SQLite DB'}
              </span>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-cafe-terracotta text-white hover:bg-cafe-terracottaDark transition-all shadow-sm shadow-cafe-terracotta/25"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI Concierge</span>
            </button>

            {/* Taste Preferences Button */}
            <button
              onClick={() => setIsPrefsOpen(true)}
              title="Your Taste Preferences"
              className="p-2.5 rounded-xl border border-cafe-border bg-white text-cafe-espresso hover:bg-cafe-cream/60 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-cafe-espresso" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-cafe-border bg-white text-cafe-espresso hover:bg-cafe-cream/60 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-cafe-espresso" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cafe-terracotta text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
