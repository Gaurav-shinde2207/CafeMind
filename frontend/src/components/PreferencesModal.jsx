import React, { useState } from 'react';
import { X, SlidersHorizontal, Check, Heart, Sparkles } from 'lucide-react';

export default function PreferencesModal({ isOpen, onClose, preferences, onSavePreferences }) {
  if (!isOpen) return null;

  const [dietary, setDietary] = useState(preferences.dietary || 'All');
  const [coffeePreference, setCoffeePreference] = useState(preferences.coffee_preference || 'Mild & creamy');
  const [sweetnessLevel, setSweetnessLevel] = useState(preferences.sweetness_level || 'Normal');
  const [budgetMax, setBudgetMax] = useState(preferences.budget_max || 500);
  const [allergies, setAllergies] = useState(preferences.allergies || 'None');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSavePreferences({
      dietary,
      coffee_preference: coffeePreference,
      sweetness_level: sweetnessLevel,
      budget_max: Number(budgetMax),
      allergies
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cafe-espresso/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-cafe-border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cafe-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cafe-terracottaLight text-cafe-terracotta flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-cafe-espresso">Taste Preferences</h2>
              <p className="text-xs text-cafe-brown">Personalizes Gemini recommendations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-cafe-brown hover:text-cafe-espresso rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
          {/* Dietary Choice */}
          <div>
            <label className="block font-semibold text-cafe-espresso mb-1.5">Dietary Profile</label>
            <div className="grid grid-cols-3 gap-2">
              {['All', 'Vegetarian', 'Vegan'].map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDietary(opt)}
                  className={`py-2 rounded-xl border font-medium text-xs transition-all ${
                    dietary === opt
                      ? 'border-cafe-terracotta bg-cafe-terracotta text-white shadow-sm'
                      : 'border-cafe-border bg-cafe-ivory text-cafe-espresso hover:border-cafe-brown'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Coffee Style */}
          <div>
            <label className="block font-semibold text-cafe-espresso mb-1.5">Coffee Roast & Style</label>
            <select
              value={coffeePreference}
              onChange={(e) => setCoffeePreference(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-cafe-border bg-cafe-ivory text-cafe-espresso focus:outline-none focus:ring-1 focus:ring-cafe-terracotta"
            >
              <option value="Mild & creamy">Mild & creamy (Latte / Cappuccino)</option>
              <option value="Strong & bold">Strong & bold (Double shot / Americano)</option>
              <option value="Chilled & Sweet">Chilled & sweet (Cold Coffee)</option>
              <option value="Traditional Spiced">Traditional spiced (Filter Coffee / Chai)</option>
            </select>
          </div>

          {/* Sweetness */}
          <div>
            <label className="block font-semibold text-cafe-espresso mb-1.5">Preferred Sweetness</label>
            <div className="grid grid-cols-3 gap-2">
              {['No Sugar', 'Less Sweet', 'Normal'].map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setSweetnessLevel(opt)}
                  className={`py-2 rounded-xl border font-medium text-xs transition-all ${
                    sweetnessLevel === opt
                      ? 'border-cafe-terracotta bg-cafe-terracotta text-white shadow-sm'
                      : 'border-cafe-border bg-cafe-ivory text-cafe-espresso hover:border-cafe-brown'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Limit */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-cafe-espresso">Budget Ceiling per Item</label>
              <span className="font-bold text-cafe-terracotta">₹{budgetMax}</span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="20"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full accent-cafe-terracotta"
            />
          </div>

          {/* Allergens */}
          <div>
            <label className="block font-semibold text-cafe-espresso mb-1.5">Allergies to Avoid</label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Dairy, Gluten, Nuts, or None"
              className="w-full p-2.5 rounded-xl border border-cafe-border bg-cafe-ivory text-cafe-espresso focus:outline-none focus:ring-1 focus:ring-cafe-terracotta"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-cafe-terracotta hover:bg-cafe-terracottaDark text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-cafe-terracotta/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving Preferences...' : 'Save & Update AI Profile'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
