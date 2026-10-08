import React, { useState } from 'react';
import { Header } from './components/Header';
import { MealOrdering } from './components/MealOrdering';
import { ActiveSGBooking } from './components/ActiveSGBooking';
import { AIFoodScanner } from './components/AIFoodScanner';
import { DailyTracker } from './components/DailyTracker';
import { SGDietitianCoach } from './components/SGDietitianCoach';
import { CartDrawer } from './components/CartDrawer';
import { 
  CartItem, 
  MealItem, 
  FacilityBooking, 
  LoggedMeal, 
  LoggedActivity, 
  MealCustomizationOption 
} from './types';
import { Sparkles, ShieldCheck, Heart, Award, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'meals' | 'activesg' | 'scanner' | 'tracker' | 'coach'>('meals');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [healthpoints, setHealthpoints] = useState(1420);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial logged meals for today
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([
    {
      id: 'init-meal-1',
      title: 'Steamed Kaya Toast (Wholemeal) & Soft-Boiled Eggs',
      source: 'manual',
      calories: 320,
      protein: 16,
      carbs: 38,
      fats: 11,
      time: '08:15 AM',
      nutriGrade: 'A',
      hpbScore: 86,
    },
    {
      id: 'init-meal-2',
      title: 'Kopi-O Kosong (Black Coffee, No Sugar)',
      source: 'manual',
      calories: 5,
      protein: 0,
      carbs: 1,
      fats: 0,
      time: '08:30 AM',
      nutriGrade: 'A',
      hpbScore: 98,
    },
  ]);

  // Initial logged workouts for today
  const [loggedActivities, setLoggedActivities] = useState<LoggedActivity[]>([
    {
      id: 'init-act-1',
      title: 'Morning Park Connector Jog (Bishan-AMK Park)',
      sport: 'running',
      durationMinutes: 25,
      caloriesBurned: 210,
      time: '07:10 AM',
      location: 'Bishan-Ang Mo Kio Park PCN',
    },
  ]);

  const [waterIntakeMl, setWaterIntakeMl] = useState(1000);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Add meal to shopping bag
  const handleAddToCart = (
    meal: MealItem, 
    quantity: number, 
    selectedOptions: { groupName: string; option: MealCustomizationOption }[],
    notes?: string
  ) => {
    let itemTotal = meal.price;
    selectedOptions.forEach(opt => {
      itemTotal += opt.option.extraPrice;
    });
    itemTotal *= quantity;

    setCart(prev => [
      ...prev,
      {
        meal,
        quantity,
        selectedOptions,
        itemTotal,
        notes,
      },
    ]);

    showToast(`Added ${quantity}x "${meal.name}" to bag!`);
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCart(prev => {
      const copy = [...prev];
      const item = copy[index];
      let unitPrice = item.meal.price;
      item.selectedOptions.forEach(o => {
        unitPrice += o.option.extraPrice;
      });
      copy[index] = {
        ...item,
        quantity: newQty,
        itemTotal: unitPrice * newQty,
      };
      return copy;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Checkout complete: logs ordered meals to daily tracker and awards points
  const handleCheckoutComplete = (orderedItems: CartItem[]) => {
    orderedItems.forEach(item => {
      const newMeal: LoggedMeal = {
        id: `order-meal-${Date.now()}-${Math.random()}`,
        title: item.meal.name,
        source: 'order',
        calories: item.meal.nutrition.calories * item.quantity,
        protein: item.meal.nutrition.protein * item.quantity,
        carbs: item.meal.nutrition.carbs * item.quantity,
        fats: item.meal.nutrition.fats * item.quantity,
        time: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
        imageUrl: item.meal.imageUrl,
        nutriGrade: item.meal.nutriGrade,
      };
      setLoggedMeals(prev => [newMeal, ...prev]);
    });

    setHealthpoints(prev => prev + 40);
    showToast('Order confirmed! Meals logged to your Daily Balance.');
  };

  // ActiveSG booking complete: adds to activities, adds points
  const handleConfirmActiveSGBooking = (booking: FacilityBooking) => {
    const newActivity: LoggedActivity = {
      id: `booking-act-${Date.now()}`,
      title: `${booking.sport.toUpperCase()} @ ${booking.venueName} (${booking.courtNumber})`,
      sport: booking.sport,
      durationMinutes: 60,
      caloriesBurned: booking.estimatedCalorieBurn,
      time: booking.timeSlot,
      location: booking.venueName,
    };

    setLoggedActivities(prev => [newActivity, ...prev]);
    setHealthpoints(prev => prev + 50);
    showToast(`ActiveSG booking confirmed! Burn of ~${booking.estimatedCalorieBurn} kcal synced.`);
  };

  // Direct meal log from menu or AI Scanner
  const handleQuickLogMeal = (meal: MealItem) => {
    const newMeal: LoggedMeal = {
      id: `quick-meal-${Date.now()}`,
      title: meal.name,
      source: 'manual',
      calories: meal.nutrition.calories,
      protein: meal.nutrition.protein,
      carbs: meal.nutrition.carbs,
      fats: meal.nutrition.fats,
      time: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      imageUrl: meal.imageUrl,
      nutriGrade: meal.nutriGrade,
    };
    setLoggedMeals(prev => [newMeal, ...prev]);
    setHealthpoints(prev => prev + 15);
    showToast(`Logged "${meal.name}" to Daily Balance! (+15 pts)`);
  };

  const handleLogScannedMeal = (scannedMeal: LoggedMeal) => {
    setLoggedMeals(prev => [scannedMeal, ...prev]);
    setHealthpoints(prev => prev + 25);
    showToast(`Scanned meal "${scannedMeal.title}" logged! (+25 pts)`);
  };

  // Manual workout log
  const handleLogManualActivity = (activity: LoggedActivity) => {
    setLoggedActivities(prev => [activity, ...prev]);
    setHealthpoints(prev => prev + 20);
    showToast(`Logged workout: ${activity.title} (-${activity.caloriesBurned} kcal)`);
  };

  // Water logger
  const handleAddWater = (ml: number) => {
    setWaterIntakeMl(prev => prev + ml);
    showToast(`Added +${ml}ml water intake!`);
  };

  const handleResetWater = () => {
    setWaterIntakeMl(0);
  };

  const handleDeleteMeal = (id: string) => {
    setLoggedMeals(prev => prev.filter(m => m.id !== id));
    showToast('Meal removed from log.');
  };

  const handleDeleteActivity = (id: string) => {
    setLoggedActivities(prev => prev.filter(a => a.id !== id));
    showToast('Activity removed from log.');
  };

  const totalCaloriesIn = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalCaloriesBurned = loggedActivities.reduce((acc, a) => acc + a.caloriesBurned, 0);
  const cartItemsCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] text-[#131b2e] font-['Plus_Jakarta_Sans'] antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={cartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        caloriesIn={totalCaloriesIn}
        caloriesOut={totalCaloriesBurned}
        healthpoints={healthpoints}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'meals' && (
          <MealOrdering
            onAddToCart={handleAddToCart}
            onQuickLogMeal={handleQuickLogMeal}
          />
        )}

        {activeTab === 'activesg' && (
          <ActiveSGBooking
            onConfirmBooking={handleConfirmActiveSGBooking}
          />
        )}

        {activeTab === 'scanner' && (
          <AIFoodScanner
            onLogScannedMeal={handleLogScannedMeal}
          />
        )}

        {activeTab === 'tracker' && (
          <DailyTracker
            loggedMeals={loggedMeals}
            loggedActivities={loggedActivities}
            waterIntakeMl={waterIntakeMl}
            onAddWater={handleAddWater}
            onResetWater={handleResetWater}
            onDeleteMeal={handleDeleteMeal}
            onDeleteActivity={handleDeleteActivity}
            onLogManualActivity={handleLogManualActivity}
            healthpoints={healthpoints}
          />
        )}

        {activeTab === 'coach' && (
          <SGDietitianCoach
            onNavigateToTab={setActiveTab}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckoutComplete={handleCheckoutComplete}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-200 border border-slate-800">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Institutional Singapore Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Nutri<span className="text-emerald-700">Active</span> SG
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Republic of Singapore
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                Empowering Singaporeans to achieve metabolic balance through HPB-certified dietary choices, AI macro precision, and ActiveSG community sports integration.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
              <button 
                onClick={() => setActiveTab('meals')}
                className="hover:text-emerald-700 transition cursor-pointer"
              >
                HPB Clean Eats
              </button>
              <button 
                onClick={() => setActiveTab('activesg')}
                className="hover:text-emerald-700 transition cursor-pointer"
              >
                ActiveSG Bookings
              </button>
              <button 
                onClick={() => setActiveTab('scanner')}
                className="hover:text-emerald-700 transition cursor-pointer"
              >
                AI Macro Vision
              </button>
              <button 
                onClick={() => setActiveTab('tracker')}
                className="hover:text-emerald-700 transition cursor-pointer"
              >
                Daily Balance
              </button>
              <button 
                onClick={() => setActiveTab('coach')}
                className="hover:text-emerald-700 transition cursor-pointer"
              >
                SG Dietitian AI
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div>
              © 2026 NutriActive SG · Compliant with Singapore Health Promotion Board (HPB) Nutritional Guidelines.
            </div>
            <div className="flex items-center gap-4">
              <span>Nutri-Grade Regulation Compliant</span>
              <span aria-hidden="true">·</span>
              <span>Healthier SG Integrated</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
