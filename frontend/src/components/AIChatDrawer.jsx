import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Plus, ShoppingBag, CornerDownLeft, RefreshCw } from 'lucide-react';
import { sendChatMessage } from '../api';

export default function AIChatDrawer({
  isOpen,
  onClose,
  menuItems,
  onAddToCart,
  userPreferences,
  onAddMultipleToCart
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I'm your CafeMind AI Concierge. Tell me what you're craving, any dietary restrictions, or your budget, and I'll find the perfect match from our freshly made menu.",
      recommendedIds: [1, 7, 5], // default popular items: Cappuccino, Paneer Sandwich, Matcha Latte
      draftOrder: null,
      isMock: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', text: userText }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const historyPayload = newHistory.map(m => ({
        role: m.role,
        content: m.text
      }));

      const res = await sendChatMessage(userText, historyPayload, userPreferences);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          recommendedIds: res.recommended_item_ids || [],
          draftOrder: res.draft_order || null,
          extractedPrefs: res.extracted_preferences || null,
          isMock: res.is_mock
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "I'm having a brief connection pause, but here are our signature café beverages while we reconnect!",
          recommendedIds: [1, 3, 6],
          draftOrder: null,
          isMock: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedItems = (ids) => {
    if (!ids || !ids.length) return [];
    return ids
      .map(id => menuItems.find(item => item.id === id))
      .filter(Boolean);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-cafe-espresso/40 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-cafe-ivory h-full shadow-2xl flex flex-col border-l border-cafe-border animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-cafe-border bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cafe-terracotta to-cafe-accent flex items-center justify-center text-white shadow-sm shadow-cafe-terracotta/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-cafe-espresso text-base">CafeMind AI Concierge</h2>
              </div>
              <p className="text-[11px] text-cafe-brown">
                Trained on our active kitchen menu & allergen guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cafe-brown hover:text-cafe-espresso hover:bg-cafe-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-cafe-cream/50 border-b border-cafe-border flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-cafe-brown font-semibold whitespace-nowrap">Try:</span>
          {[
            "Vegan breakfast under ₹300",
            "Best iced coffee for hot day",
            "What has less caffeine?",
            "Paneer sandwich & filter coffee"
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(prompt);
              }}
              className="px-2.5 py-1 rounded-full bg-white border border-cafe-border text-cafe-espresso hover:border-cafe-terracotta hover:text-cafe-terracotta whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const recItems = !isUser ? getRecommendedItems(msg.recommendedIds) : [];

            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-cafe-terracotta text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-cafe-terracotta text-white rounded-br-none shadow-sm'
                        : 'bg-white text-cafe-espresso rounded-bl-none border border-cafe-border shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {!isUser && msg.isMock && (
                      <span className="inline-block mt-1 text-[10px] text-cafe-brown/70 italic">
                        (Concierge Test Mode)
                      </span>
                    )}
                  </div>

                  {/* Extracted preferences tag if any */}
                  {!isUser && msg.extractedPrefs && Object.values(msg.extractedPrefs).some(Boolean) && (
                    <div className="flex flex-wrap gap-1 px-1">
                      {msg.extractedPrefs.dietary && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Diet: {msg.extractedPrefs.dietary}
                        </span>
                      )}
                      {msg.extractedPrefs.budget_max && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Budget: ≤ ₹{msg.extractedPrefs.budget_max}
                        </span>
                      )}
                      {msg.extractedPrefs.flavor_preference && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          Profile: {msg.extractedPrefs.flavor_preference}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Detected Draft Order Banner */}
                  {!isUser && msg.draftOrder && msg.draftOrder.length > 0 && (
                    <div className="p-3 bg-cafe-terracottaLight rounded-xl border border-cafe-terracotta/30 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-cafe-terracotta flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Order Items Detected
                        </span>
                        <span className="text-[10px] text-cafe-brown">Confirmation Required</span>
                      </div>
                      <div className="space-y-1 mb-2.5">
                        {msg.draftOrder.map((draft, dIdx) => (
                          <div key={dIdx} className="flex justify-between text-cafe-espresso font-medium text-[11px]">
                            <span>{draft.quantity}x {draft.item_name}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => onAddMultipleToCart(msg.draftOrder)}
                        className="w-full py-1.5 bg-cafe-terracotta text-white font-semibold rounded-lg text-xs hover:bg-cafe-terracottaDark transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Items to Order Tray</span>
                      </button>
                    </div>
                  )}

                  {/* Recommended Menu Cards */}
                  {!isUser && recItems.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[11px] font-semibold text-cafe-brown tracking-wide uppercase px-1">
                        Curated Recommendations:
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {recItems.map(item => (
                          <div
                            key={item.id}
                            className="p-2.5 bg-white rounded-xl border border-cafe-border flex items-center justify-between hover:border-cafe-terracotta/40 transition-colors shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover bg-cafe-sand/50"
                              />
                              <div>
                                <h4 className="font-serif font-bold text-xs text-cafe-espresso">
                                  {item.name}
                                </h4>
                                <p className="text-[10px] text-cafe-brown line-clamp-1">
                                  {item.description}
                                </p>
                                <span className="text-xs font-bold text-cafe-terracotta">
                                  ₹{item.price}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onAddToCart(item)}
                              className="px-2.5 py-1.5 bg-cafe-cream hover:bg-cafe-terracotta hover:text-white text-cafe-espresso rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-cafe-espresso text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-cafe-brown italic">
              <div className="w-8 h-8 rounded-full bg-cafe-terracotta text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white rounded-2xl rounded-bl-none border border-cafe-border flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cafe-terracotta" />
                <span>Gemini is reading menu & calculating flavor pairing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-cafe-border flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for recommendations, calories, or say 'Add 2 Chai'..."
            className="flex-1 bg-cafe-cream/60 border border-cafe-border rounded-xl px-3.5 py-2.5 text-xs text-cafe-espresso focus:outline-none focus:ring-1 focus:ring-cafe-terracotta placeholder:text-cafe-brown/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-cafe-terracotta text-white hover:bg-cafe-terracottaDark disabled:opacity-40 transition-all shrink-0 shadow-sm shadow-cafe-terracotta/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
