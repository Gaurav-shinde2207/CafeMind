import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ShoppingBag, Clock } from 'lucide-react';

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  cartItems,
  onConfirmOrder,
  isPlacing
}) {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('Gaurav');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [error, setError] = useState('');

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please provide your name for the order ticket.');
      return;
    }
    setError('');

    const itemsPayload = cartItems.map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      customization: item.customization || null
    }));

    onConfirmOrder({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      items: itemsPayload,
      special_instructions: specialInstructions.trim() || null
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cafe-espresso/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-cafe-border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cafe-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cafe-terracottaLight text-cafe-terracotta flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-cafe-espresso">Confirm Your Order</h2>
              <p className="text-xs text-cafe-brown">Order requires explicit customer confirmation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-cafe-brown hover:text-cafe-espresso rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          
          {/* Itemized Review */}
          <div className="bg-cafe-ivory p-3.5 rounded-2xl border border-cafe-border space-y-2 max-h-48 overflow-y-auto">
            <span className="text-[11px] font-semibold text-cafe-brown uppercase tracking-wider block">
              Itemized Order Summary:
            </span>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-cafe-espresso">
                <span className="font-medium">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold text-cafe-brown">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
            <div className="border-t border-cafe-border/80 pt-2 flex justify-between items-center font-bold text-sm text-cafe-espresso">
              <span>Total Payable</span>
              <span className="text-cafe-terracotta text-base">₹{totalAmount}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-cafe-espresso mb-1">
                Customer Name <span className="text-cafe-terracotta">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Gaurav"
                className="w-full p-2.5 rounded-xl border border-cafe-border bg-cafe-ivory text-cafe-espresso focus:outline-none focus:ring-1 focus:ring-cafe-terracotta"
              />
            </div>
            <div>
              <label className="block font-semibold text-cafe-espresso mb-1">
                Phone / Table No.
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. Table 4 or +91 98765..."
                className="w-full p-2.5 rounded-xl border border-cafe-border bg-cafe-ivory text-cafe-espresso focus:outline-none focus:ring-1 focus:ring-cafe-terracotta"
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block font-semibold text-cafe-espresso mb-1">
              Barista & Kitchen Notes (Optional)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra hot milk, less sugar, bring water"
              className="w-full p-2.5 rounded-xl border border-cafe-border bg-cafe-ivory text-cafe-espresso focus:outline-none focus:ring-1 focus:ring-cafe-terracotta"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-[11px] leading-relaxed">
              Upon confirmation, your ticket will be routed to the live barista queue with a dynamic preparation timer.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-cafe-border text-cafe-brown font-semibold rounded-xl text-xs hover:bg-cafe-ivory transition-colors"
            >
              Back to Menu
            </button>
            <button
              type="submit"
              disabled={isPlacing}
              className="flex-1 py-3 bg-cafe-terracotta hover:bg-cafe-terracottaDark text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-cafe-terracotta/25 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isPlacing ? 'Placing Ticket...' : 'Confirm & Send to Kitchen'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
