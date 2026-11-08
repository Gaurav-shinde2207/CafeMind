import React from 'react';
import { Plus, Clock, Sparkles, Check } from 'lucide-react';

export default function MenuItemCard({ item, onAddToCart, isInCart }) {
  const isVegetarian = item.dietary_tags.includes('Vegetarian');
  const isVegan = item.dietary_tags.includes('Vegan');
  const isGlutenFree = item.dietary_tags.includes('Gluten-Free');

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-cafe-border hover:border-cafe-terracotta/40 transition-all duration-300 hover:shadow-xl hover:shadow-cafe-espresso/5 flex flex-col">
      {/* Image container */}
      <div className="relative h-48 w-full overflow-hidden bg-cafe-sand/40">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Popular Tag */}
        {item.is_popular && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-md text-cafe-terracotta rounded-full text-[11px] font-bold shadow-sm border border-cafe-terracotta/20">
            <Sparkles className="w-3 h-3 text-cafe-terracotta" />
            <span>Guest Favorite</span>
          </div>
        )}

        {/* Preparation Time */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-cafe-espresso/80 backdrop-blur-md text-white rounded-lg text-[11px] font-medium">
          <Clock className="w-3 h-3 text-cafe-accent" />
          <span>{item.prep_time_minutes} min</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Dietary Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span className="text-[11px] font-medium text-cafe-brown tracking-wide uppercase">
              {item.category}
            </span>
            <span className="text-cafe-border">•</span>
            {isVegan ? (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                🌱 Vegan
              </span>
            ) : isVegetarian ? (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                🟢 Veg
              </span>
            ) : null}
            {isGlutenFree && (
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                🌾 GF
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-serif text-lg font-bold text-cafe-espresso group-hover:text-cafe-terracotta transition-colors">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-cafe-brown/80 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Allergens warning */}
          {item.allergens && item.allergens !== 'None' && (
            <p className="text-[10px] text-cafe-brown/60 mt-2 italic">
              Allergens: {item.allergens}
            </p>
          )}
        </div>

        {/* Price & Add Action */}
        <div className="mt-4 pt-3 border-t border-cafe-border/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-cafe-brown font-medium">INR</span>
            <span className="text-xl font-bold text-cafe-espresso ml-1">₹{item.price}</span>
          </div>

          <button
            onClick={() => onAddToCart(item)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isInCart
                ? 'bg-cafe-sage text-white shadow-sm'
                : 'bg-cafe-terracotta text-white hover:bg-cafe-terracottaDark shadow-sm shadow-cafe-terracotta/20 active:scale-95'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
