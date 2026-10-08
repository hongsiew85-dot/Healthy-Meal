import React, { useState } from 'react';
import { 
  Flame, 
  UtensilsCrossed, 
  Dumbbell, 
  Droplet, 
  Plus, 
  Award, 
  Trash2, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { LoggedMeal, LoggedActivity } from '../types';

interface DailyTrackerProps {
  loggedMeals: LoggedMeal[];
  loggedActivities: LoggedActivity[];
  waterIntakeMl: number;
  onAddWater: (ml: number) => void;
  onResetWater: () => void;
  onDeleteMeal: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onLogManualActivity: (activity: LoggedActivity) => void;
  healthpoints: number;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({
  loggedMeals,
  loggedActivities,
  waterIntakeMl,
  onAddWater,
  onResetWater,
  onDeleteMeal,
  onDeleteActivity,
  onLogManualActivity,
  healthpoints,
}) => {
  const [showManualActivityModal, setShowManualActivityModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('Jogging at Marina Bay');
  const [manualSport, setManualSport] = useState('running');
  const [manualDuration, setManualDuration] = useState(30);
  const [manualCalories, setManualCalories] = useState(240);

  // Calorie calculations
  const totalCaloriesIn = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalCaloriesBurned = loggedActivities.reduce((acc, a) => acc + a.caloriesBurned, 0);
  const calorieTarget = 2000;
  const netCalories = totalCaloriesIn - totalCaloriesBurned;

  // Macro totals
  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFats = loggedMeals.reduce((acc, m) => acc + m.fats, 0);

  const proteinTarget = 130; // grams
  const carbsTarget = 210;   // grams
  const fatsTarget = 55;     // grams
  const waterTarget = 2000;  // ml

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const newAct: LoggedActivity = {
      id: `act-${Date.now()}`,
      title: manualTitle,
      sport: manualSport,
      durationMinutes: Number(manualDuration),
      caloriesBurned: Number(manualCalories),
      time: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
    };
    onLogManualActivity(newAct);
    setShowManualActivityModal(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Daily Balance Headline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 subtle-card-shadow space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Singapore Healthier SG Active Ledger · Today</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Daily Energy & Metabolic Balance
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-[10px] text-amber-800 uppercase font-bold">Healthpoints</div>
                <div className="text-sm font-extrabold text-amber-950">{healthpoints} pts</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-[10px] text-emerald-800 uppercase font-bold">Active Streak</div>
                <div className="text-sm font-extrabold text-emerald-950">5 Days 🔥</div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy Equation 3-Card Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Calories In */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Calories In (Diet)</span>
              <UtensilsCrossed className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {totalCaloriesIn} <span className="text-xs font-normal text-slate-500">/ {calorieTarget} kcal</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalCaloriesIn / calorieTarget) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500">
              {calorieTarget - totalCaloriesIn > 0 
                ? `${calorieTarget - totalCaloriesIn} kcal remaining to budget` 
                : `${Math.abs(calorieTarget - totalCaloriesIn)} kcal over base budget`}
            </div>
          </div>

          {/* Calories Out (Active Burn) */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase">ActiveSG & Workouts</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-900">
              -{totalCaloriesBurned} <span className="text-xs font-normal text-amber-700">kcal burned</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalCaloriesBurned / 600) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] text-amber-700">
              Target active expenditure: 500+ kcal daily
            </div>
          </div>

          {/* Net Deficit */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase">Net Metabolic Balance</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-950">
              {netCalories > 0 ? `+${netCalories}` : netCalories} <span className="text-xs font-normal text-emerald-700">kcal net</span>
            </div>
            <div className="text-xs text-emerald-800 font-medium leading-relaxed">
              {netCalories <= 1600 
                ? 'Healthy calorie deficit maintained! Optimal for body recomposition and energy stability.' 
                : 'Balanced intake. Great day to book an evening ActiveSG court session.'}
            </div>
          </div>

        </div>

        {/* Macronutrient Targets Progress Bars */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Macronutrient Target Progress
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Protein */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-800">Protein (Lean Tissue)</span>
                <span className="font-extrabold text-slate-900">{totalProtein}g / {proteinTarget}g</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalProtein / proteinTarget) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500">
                {Math.round((totalProtein / proteinTarget) * 100)}% of daily protein requirement
              </div>
            </div>

            {/* Carbs */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Carbohydrates (Wholegrains)</span>
                <span className="font-extrabold text-slate-900">{totalCarbs}g / {carbsTarget}g</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-slate-700 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalCarbs / carbsTarget) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500">
                {Math.round((totalCarbs / carbsTarget) * 100)}% of daily carbohydrate target
              </div>
            </div>

            {/* Fats */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Healthy Fats</span>
                <span className="font-extrabold text-slate-900">{totalFats}g / {fatsTarget}g</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalFats / fatsTarget) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500">
                {Math.round((totalFats / fatsTarget) * 100)}% of daily fat allowance
              </div>
            </div>

          </div>
        </div>

        {/* Water Intake Tracker */}
        <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <Droplet className="w-4 h-4 text-blue-600" />
              <span>Singapore Tropical Hydration Tracker</span>
            </div>
            <div className="text-xl font-extrabold text-blue-950">
              {waterIntakeMl} ml <span className="text-xs font-normal text-blue-700">/ {waterTarget} ml goal</span>
            </div>
            <p className="text-[11px] text-blue-700">
              Staying hydrated combats tropical heat exhaustion during ActiveSG sports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddWater(250)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 ml (1 Cup)</span>
            </button>
            <button
              onClick={() => onAddWater(500)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 ml Bottle</span>
            </button>
            <button
              onClick={onResetWater}
              className="px-2.5 py-2 border border-blue-200 hover:bg-blue-100/50 text-blue-800 rounded-xl text-xs transition cursor-pointer"
              title="Reset today's water"
            >
              Reset
            </button>
          </div>
        </div>

      </div>

      {/* Logged Activity & Meal History Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Logged Meals History */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 subtle-card-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>Meals Logged Today ({loggedMeals.length})</span>
            </h2>
            <span className="text-xs font-bold text-slate-700">{totalCaloriesIn} kcal total</span>
          </div>

          <div className="space-y-2.5">
            {loggedMeals.map((meal) => (
              <div 
                key={meal.id}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{meal.title}</span>
                    {meal.nutriGrade && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                        Grade {meal.nutriGrade}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {meal.time} · {meal.calories} kcal · {meal.protein}g P · {meal.carbs}g C · {meal.fats}g F
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                  title="Remove entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {loggedMeals.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                No meals logged today yet. Browse Clean Eats or snap a photo with AI Macro Scanner!
              </div>
            )}
          </div>
        </div>

        {/* Right: ActiveSG Sessions & Workout History */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 subtle-card-shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-amber-500" />
              <span>Active Workouts ({loggedActivities.length})</span>
            </h2>
            <button
              onClick={() => setShowManualActivityModal(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {loggedActivities.map((act) => (
              <div 
                key={act.id}
                className="p-3.5 rounded-2xl border border-slate-100 bg-amber-50/30 flex items-center justify-between gap-3 group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{act.title}</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                      {act.durationMinutes} mins
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {act.time} {act.location ? `· ${act.location}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-amber-700">
                    -{act.caloriesBurned} kcal
                  </span>
                  <button
                    onClick={() => onDeleteActivity(act.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                    title="Remove activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {loggedActivities.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                No activities logged today yet. Book an ActiveSG court or log a workout!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Manual Activity Log Modal */}
      {showManualActivityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateActivity}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <h3 className="text-base font-bold text-slate-900">Log Outdoor or Gym Workout</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Workout Name</label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Duration (Minutes)</label>
                <input
                  type="number"
                  value={manualDuration}
                  onChange={(e) => {
                    const dur = Number(e.target.value);
                    setManualDuration(dur);
                    setManualCalories(Math.round(dur * 8));
                  }}
                  required
                  min={5}
                  max={300}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Est. Calories Burned</label>
                <input
                  type="number"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(Number(e.target.value))}
                  required
                  min={10}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowManualActivityModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
              >
                Save Workout
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
