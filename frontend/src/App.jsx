import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Sparkles,
  Search,
  Filter,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Heart,
  Check,
  RefreshCw
} from 'lucide-react';
import Navbar from './components/Navbar';
import MenuItemCard from './components/MenuItemCard';
import AIChatDrawer from './components/AIChatDrawer';
import PreferencesModal from './components/PreferencesModal';
import CartDrawer from './components/CartDrawer';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import OrderTrackingView from './components/OrderTrackingView';
import StaffDashboard from './components/StaffDashboard';
import {
  fetchMenu,
  fetchHealth,
  fetchPreferences,
  savePreferences,
  createOrder
} from './api';

export default function App() {
  const [activeView, setActiveView] = useState('customer'); // 'customer' or 'staff'
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Active tracked order (after placement)
  const [activeOrder, setActiveOrder] = useState(null);
  const [showTracking, setShowTracking] = useState(false);

  // AI & Preferences
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    customer_id: 'guest_user_1',
    dietary: 'All',
    coffee_preference: 'Mild & creamy',
    sweetness_level: 'Normal',
    budget_max: 500,
    allergies: 'None'
  });

  // DB Health
  const [dbHealth, setDbHealth] = useState(null);

  // Load menu items
  const loadMenu = async () => {
    try {
      setLoadingMenu(true);
      const data = await fetchMenu({
        category: selectedCategory,
        dietary: selectedDietary,
        search: searchQuery
      });
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [selectedCategory, selectedDietary, searchQuery]);

  // Load initial health & preferences
  useEffect(() => {
    const initApp = async () => {
      try {
        const [health, prefs] = await Promise.all([
          fetchHealth(),
          fetchPreferences('guest_user_1')
        ]);
        setDbHealth(health);
        if (prefs) setUserPreferences(prefs);
      } catch (err) {
        console.error('Initial setup error:', err);
      }
    };
    initApp();
  }, []);

  // Cart Handlers
  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleAddMultipleToCart = (draftItems) => {
    setCart((prev) => {
      let updated = [...prev];
      for (const draft of draftItems) {
        const fullItem = menuItems.find((m) => m.id === draft.menu_item_id);
        if (fullItem) {
          const existingIndex = updated.findIndex((i) => i.id === fullItem.id);
          if (existingIndex > -1) {
            updated[existingIndex].quantity += draft.quantity;
          } else {
            updated.push({
              ...fullItem,
              quantity: draft.quantity,
              customization: draft.customization || null
            });
          }
        }
      }
      return updated;
    });
    setIsChatOpen(false);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)));
  };

  const handleRemoveItem = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Order Placement (Confirmed)
  const handleConfirmOrder = async (orderPayload) => {
    setIsPlacingOrder(true);
    try {
      const placedOrder = await createOrder(orderPayload);
      setActiveOrder(placedOrder);
      setCart([]);
      setIsConfirmOpen(false);
      setIsCartOpen(false);
      setShowTracking(true);
    } catch (err) {
      alert(`Order creation failed: ${err.message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Save Preferences
  const handleSavePreferences = async (newPrefs) => {
    try {
      const saved = await savePreferences({
        ...newPrefs,
        customer_id: 'guest_user_1'
      });
      setUserPreferences(saved);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const categories = ['All', 'Coffee', 'Tea & Beverages', 'Food & Sandwiches', 'Bakery & Desserts'];
  const dietaryFilters = ['All', 'Vegetarian', 'Vegan', 'Gluten-Free'];

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-cafe-ivory text-cafe-espresso flex flex-col font-sans">
      
      {/* Global Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={cartTotalCount}
        setIsCartOpen={setIsCartOpen}
        setIsPrefsOpen={setIsPrefsOpen}
        setIsChatOpen={setIsChatOpen}
        dbHealth={dbHealth}
        activeOrder={activeOrder}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'staff' ? (
          <StaffDashboard dbHealth={dbHealth} />
        ) : showTracking && activeOrder ? (
          <OrderTrackingView
            orderId={activeOrder.id}
            orderNumber={activeOrder.order_number}
            onBackToMenu={() => setShowTracking(false)}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Active Ticket Banner if user placed order and returned to menu */}
            {activeOrder && !showTracking && (
              <div
                onClick={() => setShowTracking(true)}
                className="cursor-pointer bg-gradient-to-r from-cafe-cream to-white p-4 rounded-2xl border border-cafe-terracotta/40 shadow-sm flex items-center justify-between hover:border-cafe-terracotta transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cafe-terracotta text-white flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cafe-espresso">
                      Your Order #{activeOrder.order_number} is in the works!
                    </span>
                    <span className="text-[11px] text-cafe-brown block">
                      Estimated wait: {activeOrder.estimated_wait_minutes} mins • Click to track live status
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-cafe-terracotta">
                  <span>Track Status</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D1E18] to-[#4A3228] text-white p-8 sm:p-12 shadow-xl shadow-cafe-espresso/10">
              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold tracking-wider uppercase text-cafe-accent border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  Google Gemini Powered
                </span>
                
                <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                  Your café. Your preferences. Your experience.
                </h1>

                <p className="text-sm sm:text-base text-cafe-sand/90 font-light leading-relaxed">
                  Welcome to CafeMind. Discover single-origin coffees, handcrafted artisanal teas, and gourmet sourdough sandwiches tailored specifically to your taste profile.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-cafe-terracotta hover:bg-cafe-terracottaDark text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cafe-terracotta/30 transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ask Gemini Concierge</span>
                  </button>

                  <button
                    onClick={() => setIsPrefsOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-cafe-accent" />
                    <span>Personalize Taste</span>
                  </button>
                </div>
              </div>

              {/* Decorative Accent Background Glow */}
              <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-20 pointer-events-none bg-radial from-cafe-accent to-transparent" />
            </section>

            {/* Filter & Search Bar */}
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cafe-brown" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search coffee, avocado toast, chai..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-cafe-border text-xs text-cafe-espresso focus:outline-none focus:ring-1 focus:ring-cafe-terracotta shadow-xs placeholder:text-cafe-brown/60"
                  />
                </div>

                {/* Dietary Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-[11px] font-semibold text-cafe-brown uppercase tracking-wider mr-1">
                    Diet:
                  </span>
                  {dietaryFilters.map((diet) => (
                    <button
                      key={diet}
                      onClick={() => setSelectedDietary(diet)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                        selectedDietary === diet
                          ? 'bg-cafe-espresso text-white border-cafe-espresso shadow-xs'
                          : 'bg-white border-cafe-border text-cafe-espresso hover:bg-cafe-cream'
                      }`}
                    >
                      {diet}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-cafe-border">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`pb-2.5 px-3 font-semibold whitespace-nowrap border-b-2 transition-all ${
                      selectedCategory === cat
                        ? 'border-cafe-terracotta text-cafe-terracotta'
                        : 'border-transparent text-cafe-brown hover:text-cafe-espresso'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            {/* Menu Items Grid */}
            <section>
              {loadingMenu ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="h-80 rounded-2xl bg-cafe-cream animate-shimmer" />
                  ))}
                </div>
              ) : menuItems.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-cafe-border space-y-3">
                  <Coffee className="w-10 h-10 text-cafe-brown/40 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-cafe-espresso">No dishes matched your filter</h3>
                  <p className="text-xs text-cafe-brown">
                    Try relaxing dietary filters or ask our AI Concierge for recommendations.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedDietary('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-cafe-terracotta text-white rounded-xl text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                      isInCart={cart.some((c) => c.id === item.id)}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>

      {/* Slide-over Drawers & Modals */}
      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        menuItems={menuItems}
        onAddToCart={handleAddToCart}
        onAddMultipleToCart={handleAddMultipleToCart}
        userPreferences={userPreferences}
      />

      <PreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
        preferences={userPreferences}
        onSavePreferences={handleSavePreferences}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToConfirm={() => {
          setIsCartOpen(false);
          setIsConfirmOpen(true);
        }}
      />

      <OrderConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        cartItems={cart}
        onConfirmOrder={handleConfirmOrder}
        isPlacing={isPlacingOrder}
      />

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-cafe-border py-8 text-center text-xs text-cafe-brown">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-cafe-terracotta" />
            <span className="font-serif font-bold text-cafe-espresso">CafeMind</span>
            <span>• Google Hack2Skill 90-Minute Autonomous Build</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>React + Vite + Tailwind CSS</span>
            <span>•</span>
            <span>Google GenAI SDK</span>
            <span>•</span>
            <span>Cloud SQL PostgreSQL</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
