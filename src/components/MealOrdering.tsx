import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Check, 
  Sparkles, 
  SlidersHorizontal, 
  MapPin, 
  Clock, 
  Award, 
  Leaf, 
  Flame, 
  X, 
  UtensilsCrossed, 
  Barcode, 
  ExternalLink 
} from 'lucide-react';
import { MealItem, DietaryGoal, CartItem, MealCustomizationOption } from '../types';
import { HEALTHY_MEALS } from '../data/mockData';

interface MealOrderingProps {
  onAddToCart: (meal: MealItem, quantity: number, selectedOptions: { groupName: string; option: MealCustomizationOption }[], notes?: string) => void;
  onQuickLogMeal: (meal: MealItem) => void;
}

export const MealOrdering: React.FC<MealOrderingProps> = ({ onAddToCart, onQuickLogMeal }) => {
  const [mealsList, setMealsList] = useState<MealItem[]>(HEALTHY_MEALS);
  const [selectedGoal, setSelectedGoal] = useState<DietaryGoal>('all');
  const [customizingMeal, setCustomizingMeal] = useState<MealItem | null>(null);
  
  // Customization state
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, MealCustomizationOption>>({});
  const [notes, setNotes] = useState('');
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null);

  const filterTabs: { id: DietaryGoal; label: string }[] = [
    { id: 'all', label: 'All Healthy Eats' },
    { id: 'high-protein', label: 'High Protein (30g+)' },
    { id: 'hpb-certified', label: 'HPB Healthier Choice' },
    { id: 'wholegrain', label: 'Higher in Wholegrains' },
    { id: 'low-sodium', label: 'Lower in Sodium' },
    { id: 'keto', label: 'Low Carb / Keto' },
    { id: 'vegetarian', label: 'Plant-Based / Veg' },
    { id: 'halal', label: 'Halal-Certified' },
  ];

  const filteredMeals = useMemo(() => {
    return mealsList.filter(meal => {
      return selectedGoal === 'all' || meal.tags.includes(selectedGoal);
    });
  }, [mealsList, selectedGoal]);

  const handleOpenCustomize = (meal: MealItem) => {
    setCustomizingMeal(meal);
    setQuantity(1);
    setNotes('');

    // Pre-select defaults for required groups
    const defaults: Record<string, MealCustomizationOption> = {};
    if (meal.customizations) {
      meal.customizations.forEach(group => {
        if (group.required && group.options.length > 0) {
          defaults[group.name] = group.options[0];
        }
      });
    }
    setSelectedOptions(defaults);
  };

  const handleSelectOption = (groupName: string, option: MealCustomizationOption) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupName]: option,
    }));
  };

  // Calculate customized totals
  const currentPrice = useMemo(() => {
    if (!customizingMeal) return 0;
    let price = customizingMeal.price;
    Object.values(selectedOptions).forEach(opt => {
      price += opt.extraPrice;
    });
    return price * quantity;
  }, [customizingMeal, selectedOptions, quantity]);

  const currentCalories = useMemo(() => {
    if (!customizingMeal) return 0;
    let cals = customizingMeal.nutrition.calories;
    Object.values(selectedOptions).forEach(opt => {
      if (opt.extraCalories) cals += opt.extraCalories;
    });
    return cals;
  }, [customizingMeal, selectedOptions]);

  const currentProtein = useMemo(() => {
    if (!customizingMeal) return 0;
    let prot = customizingMeal.nutrition.protein;
    Object.values(selectedOptions).forEach(opt => {
      if (opt.extraProtein) prot += opt.extraProtein;
    });
    return prot;
  }, [customizingMeal, selectedOptions]);

  const handleConfirmAddToCart = () => {
    if (!customizingMeal) return;
    const formattedSelected = Object.entries(selectedOptions).map(([groupName, option]) => ({
      groupName,
      option,
    }));

    onAddToCart(customizingMeal, quantity, formattedSelected, notes);
    setCustomizingMeal(null);
  };

  const handleQuickAdd = (meal: MealItem) => {
    if (meal.customizations && meal.customizations.length > 0) {
      handleOpenCustomize(meal);
    } else {
      onAddToCart(meal, 1, []);
    }
  };

  const handleQuickLog = (meal: MealItem) => {
    onQuickLogMeal(meal);
    setJustLoggedId(meal.id);
    setTimeout(() => setJustLoggedId(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#005137] via-[#006948] to-[#047857] text-white p-6 sm:p-10 shadow-xl shadow-emerald-950/10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Health Promotion Board (HPB) Verified Partners</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Nourish Your Body With Singapore’s Healthiest Clean Bowls
          </h1>

          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Order authentic lower-sodium, wholegrain hawker classics and macro-optimized post-workout bowls delivered straight to your home, office, or ActiveSG sports hall.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-emerald-200">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Full Macro Breakdown</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Nutri-Grade A & B Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>CBD & Islandwide SG Express</span>
            </div>
          </div>
        </div>

        {/* Ambient biophilic decoration */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* Open Food Facts Live Integration Box */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-4 sm:p-4.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <Barcode className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Open Food Facts Verified Integration</span>
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                Barcode 737628064502
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Thai Kitchen Peanut Rice Noodles verified directly from Open Food Facts API with full ingredients & Nutri-Grade.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const noodleMeal = mealsList.find(m => m.barcode === '737628064502');
            if (noodleMeal) handleOpenCustomize(noodleMeal);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Customize Noodle Kit</span>
        </button>
      </div>

      {/* Segmented Dietary Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {filterTabs.map(tab => {
            const isActive = selectedGoal === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedGoal(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeals.map((meal) => {
          return (
            <div
              key={meal.id}
              className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden subtle-card-shadow hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Nutri-Grade Official Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span 
                      className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold shadow-sm ${
                        meal.nutriGrade === 'A' 
                          ? 'bg-[#007A3D] text-white' 
                          : meal.nutriGrade === 'B'
                          ? 'bg-[#6EC800] text-slate-900'
                          : 'bg-[#FFB81C] text-slate-900'
                      }`}
                      title={`Singapore Nutri-Grade: ${meal.nutriGrade}`}
                    >
                      Nutri-Grade {meal.nutriGrade}
                    </span>

                    <span className="bg-white/95 backdrop-blur-sm text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm border border-emerald-100">
                      ★ {meal.rating}
                    </span>
                  </div>

                  {/* Prep time */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-300" />
                    <span>{meal.prepTimeMins} mins</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3">
                  
                  {/* Location & Stall Metadata (Zero-pill text) */}
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="font-medium text-slate-700">{meal.hawkerStallOrBrand}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{meal.location}</span>
                  </div>

                  {/* Dish Name */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition">
                    {meal.name}
                  </h3>

                  {/* Open Food Facts Verified indicator */}
                  {meal.isOpenFoodFactsVerified && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
                      <Barcode className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold">Open Food Facts Verified</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{meal.barcode}</span>
                      {meal.openFoodFactsUrl && (
                        <a
                          href={meal.openFoodFactsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 font-bold"
                          title="View on OpenFoodFacts.org"
                        >
                          <span>OFF</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* HPB Health Claim (Clean typography) */}
                  <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <Leaf className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">{meal.hpbClaim}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {meal.description}
                  </p>

                  {/* Macro Nutrient Breakdown Grid */}
                  <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Calories</div>
                      <div className="text-xs font-extrabold text-slate-900">{meal.nutrition.calories} <span className="text-[9px] font-normal">kcal</span></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Protein</div>
                      <div className="text-xs font-extrabold text-emerald-700">{meal.nutrition.protein}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Carbs</div>
                      <div className="text-xs font-extrabold text-slate-700">{meal.nutrition.carbs}g</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">Fats</div>
                      <div className="text-xs font-extrabold text-slate-700">{meal.nutrition.fats}g</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Price</div>
                  <div className="text-lg font-extrabold text-slate-900">
                    S${meal.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Log to Today's Diary */}
                  <button
                    onClick={() => handleQuickLog(meal)}
                    className="px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    title="Log directly to Daily Balance without ordering"
                  >
                    {justLoggedId === meal.id ? (
                      <span className="text-emerald-700 flex items-center gap-1 font-bold">
                        <Check className="w-3.5 h-3.5" /> Logged
                      </span>
                    ) : (
                      'Log Meal'
                    )}
                  </button>

                  {/* Order / Customize CTA */}
                  <button
                    onClick={() => handleQuickAdd(meal)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{meal.customizations ? 'Customize' : 'Add'}</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {filteredMeals.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No dishes match this dietary goal</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try selecting "All Healthy Eats" to view all HPB-approved Singapore dishes and Open Food Facts items.
          </p>
          <button
            onClick={() => {
              setSelectedGoal('all');
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Customization Modal Sheet */}
      {customizingMeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{customizingMeal.name}</h3>
                <p className="text-xs text-slate-500">{customizingMeal.hawkerStallOrBrand}</p>
              </div>
              <button 
                onClick={() => setCustomizingMeal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Dynamic Macro Gauge */}
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-900 font-bold">Customized Nutrition:</span>
                  <div className="text-slate-600 mt-0.5">
                    {currentCalories} kcal · <span className="font-bold text-emerald-800">{currentProtein}g Protein</span> · {customizingMeal.nutrition.carbs}g Carbs · {customizingMeal.nutrition.fats}g Fats
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold">Nutri-Grade</span>
                  <div className="font-extrabold text-emerald-900 text-sm">Grade {customizingMeal.nutriGrade}</div>
                </div>
              </div>

              {/* Customization Groups */}
              {customizingMeal.customizations?.map((group) => (
                <div key={group.name} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {group.name}
                    </h4>
                    {group.required && (
                      <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {group.options.map((option) => {
                      const isSelected = selectedOptions[group.name]?.id === option.id;
                      return (
                        <div
                          key={option.id}
                          onClick={() => handleSelectOption(group.name, option)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 ring-1 ring-emerald-600/30'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-medium">{option.name}</span>
                          </div>
                          <span className="text-xs font-bold">
                            {option.extraPrice === 0 ? 'Free' : `+S$${option.extraPrice.toFixed(2)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Dietary Notes (e.g. Chili on side, no sauce)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Less oil, separate soup bowl, extra cucumber..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-800">Quantity</span>
                <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    -
                  </button>
                  <span className="text-xs font-extrabold w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Checkout Bar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Price</div>
                <div className="text-lg font-extrabold text-slate-900">
                  S${currentPrice.toFixed(2)}
                </div>
              </div>

              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition cursor-pointer"
              >
                <span>Add to Bag</span>
                <span aria-hidden="true">·</span>
                <span>S${currentPrice.toFixed(2)}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
