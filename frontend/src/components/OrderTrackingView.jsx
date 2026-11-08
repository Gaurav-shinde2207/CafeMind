import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChefHat, Sparkles, Star, Send, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchOrderById, submitFeedback } from '../api';

export default function OrderTrackingView({ orderId, orderNumber, onBackToMenu }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Poll order status every 3.5 seconds
  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      try {
        const idToQuery = orderNumber || orderId;
        const data = await fetchOrderById(idToQuery);
        if (isMounted) {
          setOrder(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching order update:', err);
      }
    };

    loadOrder();
    const interval = setInterval(loadOrder, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, orderNumber]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim() || !order) return;
    setSubmittingFeedback(true);
    try {
      await submitFeedback({
        order_id: order.id,
        customer_name: order.customer_name,
        rating: feedbackRating,
        comment: feedbackComment.trim()
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-cafe-terracotta mx-auto" />
        <p className="text-sm font-medium text-cafe-espresso">Fetching live kitchen ticket...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-4 bg-white rounded-3xl border border-cafe-border">
        <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
        <h3 className="font-serif text-lg font-bold">Ticket Not Found</h3>
        <p className="text-xs text-cafe-brown">We could not locate this order ticket.</p>
        <button
          onClick={onBackToMenu}
          className="px-4 py-2 bg-cafe-terracotta text-white rounded-xl text-xs font-semibold"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Ticket Received', desc: 'Queued for barista' },
    { key: 'preparing', label: 'In Preparation', desc: 'Brewing & crafting' },
    { key: 'ready', label: 'Ready for Pickup', desc: 'At barista counter' },
    { key: 'completed', label: 'Completed', desc: 'Enjoy your coffee!' }
  ];

  const statusOrder = ['pending', 'preparing', 'ready', 'completed'];
  const currentStepIndex = statusOrder.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Bar Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 text-xs font-semibold text-cafe-brown hover:text-cafe-espresso transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore More Menu</span>
        </button>

        <span className="text-[11px] font-mono font-bold px-3 py-1 bg-white border border-cafe-border rounded-full text-cafe-espresso shadow-xs">
          Ticket #{order.order_number}
        </span>
      </div>

      {/* Hero ETA Card */}
      <div className="bg-gradient-to-br from-cafe-cream to-cafe-ivory p-6 sm:p-8 rounded-3xl border border-cafe-border shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cafe-terracotta">
                Live Kitchen Dispatch
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cafe-espresso mt-1">
              Order {order.status === 'ready' ? 'Ready!' : order.status === 'completed' ? 'Completed' : 'in Progress'}
            </h2>
            <p className="text-xs text-cafe-brown mt-1">
              Prepared for <span className="font-bold text-cafe-espresso">{order.customer_name}</span>
            </p>
          </div>

          {/* Dynamic ETA Pill */}
          <div className="p-4 bg-white rounded-2xl border border-cafe-border shadow-sm flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cafe-terracottaLight text-cafe-terracotta flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-cafe-brown block font-medium uppercase tracking-wider">
                Estimated Wait
              </span>
              <span className="text-xl font-bold text-cafe-espresso">
                {order.status === 'ready' || order.status === 'completed'
                  ? '0 mins (Ready)'
                  : `${order.estimated_wait_minutes} mins`}
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Progress */}
        <div className="pt-2">
          <div className="grid grid-cols-4 gap-2 text-center">
            {steps.map((st, idx) => {
              const isDone = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={st.key} className="space-y-2">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-cafe-terracotta text-white ring-4 ring-cafe-terracotta/20 scale-105'
                          : isDone
                          ? 'bg-cafe-sage text-white'
                          : 'bg-white border border-cafe-border text-cafe-brown/60'
                      }`}
                    >
                      {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold leading-tight ${isCurrent ? 'text-cafe-espresso' : 'text-cafe-brown'}`}>
                      {st.label}
                    </h4>
                    <p className="text-[10px] text-cafe-brown/70 hidden sm:block">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ticket Details & Items */}
      <div className="bg-white p-6 rounded-3xl border border-cafe-border shadow-sm space-y-4">
        <h3 className="font-serif text-base font-bold text-cafe-espresso pb-2 border-b border-cafe-border">
          Order Items & Special Requests
        </h3>
        <div className="divide-y divide-cafe-border/60">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-cafe-espresso">{item.quantity}x {item.item_name}</span>
                {item.customization && (
                  <p className="text-[10px] text-cafe-brown italic">{item.customization}</p>
                )}
              </div>
              <span className="font-semibold text-cafe-espresso">₹{item.item_total}</span>
            </div>
          ))}
        </div>
        {order.special_instructions && (
          <div className="p-3 bg-cafe-ivory rounded-xl text-xs text-cafe-brown border border-cafe-border/80">
            <span className="font-semibold text-cafe-espresso block mb-0.5">Kitchen Note:</span>
            {order.special_instructions}
          </div>
        )}
        <div className="border-t border-cafe-border pt-3 flex justify-between items-center text-sm font-bold text-cafe-espresso">
          <span>Total Paid (INR)</span>
          <span className="text-base text-cafe-terracotta">₹{order.total_amount}</span>
        </div>
      </div>

      {/* Feedback Prompt once Ready / Completed */}
      {(order.status === 'ready' || order.status === 'completed') && (
        <div className="bg-white p-6 rounded-3xl border border-cafe-border shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cafe-terracotta" />
            <h3 className="font-serif text-base font-bold text-cafe-espresso">
              How was your experience today?
            </h3>
          </div>

          {feedbackSubmitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>Thank you! Your feedback has been sent directly to our café team and Gemini insights engine.</span>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              {/* Star Rating */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-cafe-brown ml-2">
                  {feedbackRating} of 5 Stars
                </span>
              </div>

              {/* Feedback Comment */}
              <textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Tell us about the coffee flavor, wait time, or café vibe..."
                rows="2"
                required
                className="w-full p-3 rounded-2xl border border-cafe-border bg-cafe-ivory text-xs text-cafe-espresso focus:outline-none focus:ring-1 focus:ring-cafe-terracotta"
              />

              <button
                type="submit"
                disabled={submittingFeedback || !feedbackComment.trim()}
                className="px-4 py-2 bg-cafe-terracotta hover:bg-cafe-terracottaDark text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-cafe-terracotta/20 disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingFeedback ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
