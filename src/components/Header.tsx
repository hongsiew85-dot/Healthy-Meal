import { 
  UtensilsCrossed, 
  Dumbbell, 
  ScanLine, 
  PieChart, 
  Bot, 
  ShoppingBag, 
  Sparkles, 
  Flame, 
  Award, 
  Crown 
} from 'lucide-react';
import { UserSubscription } from '../types';

interface HeaderProps {
  activeTab: 'meals' | 'activesg' | 'scanner' | 'tracker' | 'coach';
  onSelectTab: (tab: 'meals' | 'activesg' | 'scanner' | 'tracker' | 'coach') => void;
  cartCount: number;
  onOpenCart: () => void;
  caloriesIn: number;
  caloriesOut: number;
  healthpoints: number;
  subscription: UserSubscription;
  onOpenSubscriptionModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  onOpenCart,
  caloriesIn,
  caloriesOut,
  healthpoints,
  subscription,
  onOpenSubscriptionModal,
}) => {
  const netCalories = caloriesIn - caloriesOut;

  const navItems = [
    { id: 'meals' as const, label: 'Clean Eats', icon: UtensilsCrossed },
    { id: 'activesg' as const, label: 'ActiveSG Courts', icon: Dumbbell },
    { id: 'scanner' as const, label: 'AI Macro Scanner', icon: ScanLine },
    { id: 'tracker' as const, label: 'Daily Balance', icon: PieChart },
    { id: 'coach' as const, label: 'SG Dietitian AI', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top micro-bar for Singapore Healthier SG Status */}
      <div className="bg-[#004d34] text-white text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium tracking-wide">Singapore Healthier SG Partner</span>
            <span className="text-emerald-300" aria-hidden="true">·</span>
            <span className="text-emerald-100 hidden sm:inline">HPB Healthier Choice Symbol (HCS) Compliant</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            {/* NutriPass Membership Pill */}
            <button
              onClick={onOpenSubscriptionModal}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                subscription.tier !== 'free'
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
                  : 'bg-emerald-700/90 hover:bg-emerald-600 text-emerald-100 border border-emerald-500/40'
              }`}
              title="NutriPass Membership & Subscription Fee"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {subscription.tier !== 'free' 
                  ? `${subscription.tier.toUpperCase()} Member · S$0 Delivery` 
                  : 'NutriPass Pro (S$9.90/mo): S$0 Delivery'}
              </span>
            </button>

            <div className="hidden xs:flex items-center gap-1.5 text-emerald-100 border-l border-emerald-700/60 pl-3">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-semibold text-white">{healthpoints}</span>
              <span className="text-emerald-200 hidden md:inline">Healthpoints</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 border-l border-emerald-700/60 pl-3">
              <span className="text-emerald-300">MCP Server:</span>
              <a
                href="/api/mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-emerald-200 hover:text-white font-semibold underline decoration-emerald-500"
                title="NutriBalance MCP Server Endpoint (/api/mcp)"
              >
                /api/mcp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => onSelectTab('meals')}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                  Nutri<span className="text-emerald-700">Active</span>
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                  SG
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Precision Nutrition & ActiveSG Community
              </p>
            </div>
          </div>

          {/* Center Navigation - Segmented clean tabs */}
          <nav className="hidden lg:flex items-center p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-sm shadow-slate-200/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Quick Live Calorie Balance Widget */}
            <button
              onClick={() => onSelectTab('tracker')}
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60 rounded-xl text-xs transition cursor-pointer text-left"
              title="View daily metabolic balance"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-700">
                <Flame className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                  Daily Net Kcal
                </div>
                <div className="font-extrabold text-slate-800 flex items-center gap-1">
                  <span>{netCalories > 0 ? `+${netCalories}` : netCalories} kcal</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    ({caloriesIn} in · {caloriesOut} out)
                  </span>
                </div>
              </div>
            </button>

            {/* NutriPass Membership Trigger */}
            <button
              onClick={onOpenSubscriptionModal}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                subscription.tier !== 'free'
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
              }`}
              title="NutriPass Club Membership and Perks"
            >
              <Crown className={`w-4 h-4 ${subscription.tier !== 'free' ? 'text-amber-500' : 'text-emerald-700'}`} />
              <div className="text-left hidden sm:block">
                <div className="text-[9px] uppercase font-bold text-slate-500 leading-none">Subscription</div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {subscription.tier !== 'free' ? `${subscription.tier.toUpperCase()} Pass` : 'NutriPass S$9.90'}
                </div>
              </div>
              <span className="sm:hidden text-xs">
                {subscription.tier !== 'free' ? 'PRO' : 'Pass'}
              </span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm flex items-center gap-2 shadow-sm shadow-emerald-700/20 active:scale-95 transition cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-100" />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Segmented Scrollable Bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar border-t border-slate-100 -mx-4 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
