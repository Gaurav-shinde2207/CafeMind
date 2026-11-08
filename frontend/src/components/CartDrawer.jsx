import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToConfirm
}) {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-cafe-espresso/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-cafe-border animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-cafe-border flex items-center justify-between bg-cafe-ivory">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cafe-terracotta" />
            <h2 className="font-serif font-bold text-cafe-espresso text-base">Your Order Tray</h2>
            <span className="px-2 py-0.5 rounded-full bg-cafe-terracottaLight text-cafe-terracotta text-xs font-bold">
              {totalItemsCount}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-cafe-brown hover:text-cafe-espresso hover:bg-cafe-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-cafe-border">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-cafe-cream flex items-center justify-center text-cafe-brown">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-serif text-base font-bold text-cafe-espresso">Your tray is empty</h3>
              <p className="text-xs text-cafe-brown max-w-xs">
                Explore our handcrafted brews and delicious bakery treats or ask our AI Concierge.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-cafe-sand/50"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-xs text-cafe-espresso">{item.name}</h4>
                    <span className="text-xs font-semibold text-cafe-terracotta">₹{item.price}</span>
                    {item.customization && (
                      <p className="text-[10px] text-cafe-brown italic">{item.customization}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-cafe-border rounded-lg bg-cafe-ivory overflow-hidden text-xs">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 text-cafe-espresso hover:bg-cafe-cream"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 font-bold text-cafe-espresso">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-cafe-espresso hover:bg-cafe-cream"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-cafe-brown/60 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-cafe-ivory border-t border-cafe-border space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cafe-brown">Estimated Prep Time</span>
              <span className="font-semibold text-cafe-espresso">~ 8-12 mins</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold border-t border-cafe-border/60 pt-2">
              <span className="text-cafe-espresso">Subtotal (INR)</span>
              <span className="text-base text-cafe-terracotta">₹{totalAmount}</span>
            </div>

            <button
              onClick={onProceedToConfirm}
              className="w-full py-3 bg-cafe-terracotta hover:bg-cafe-terracottaDark text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-cafe-terracotta/25 transition-all"
            >
              <span>Review & Confirm Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
