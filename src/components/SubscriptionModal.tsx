import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Crown, 
  ShieldCheck, 
  Flame, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard,
  Zap,
  Percent,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionPlan, SubscriptionTier, BillingCycle, UserSubscription } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/mockData';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: UserSubscription;
  onUpdateSubscription: (newSub: UserSubscription) => void;
  onToast: (msg: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentSubscription,
  onUpdateSubscription,
  onToast,
}) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(currentSubscription.billingCycle || 'monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    currentSubscription.tier === 'free' ? 'pro' : currentSubscription.tier
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paynow' | 'card' | 'grabpay'>('paynow');

  if (!isOpen) return null;

  const handleSelectPlan = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  const handleConfirmSubscription = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      if (selectedTier === 'free') {
        onUpdateSubscription({
          tier: 'free',
          billingCycle: 'monthly',
          status: 'free',
          startDate: new Date().toISOString().split('T')[0],
          renewalDate: '',
          feeSgd: 0,
          savingsTotalSgd: currentSubscription.savingsTotalSgd,
          autoRenew: false,
        });
        onToast('Switched to NutriActive Free plan');
        onClose();
        return;
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedTier);
      const fee = billingCycle === 'annual' 
        ? (plan?.priceAnnualMonthly || (selectedTier === 'club' ? 800 : 69)) * 12 
        : (plan?.priceMonthly || (selectedTier === 'club' ? 1000 : 89));

      const renewal = new Date();
      if (billingCycle === 'annual') {
        renewal.setFullYear(renewal.getFullYear() + 1);
      } else {
        renewal.setMonth(renewal.getMonth() + 1);
      }

      onUpdateSubscription({
        tier: selectedTier,
        billingCycle,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        renewalDate: renewal.toISOString().split('T')[0],
        feeSgd: fee,
        savingsTotalSgd: currentSubscription.savingsTotalSgd + 45.00,
        autoRenew: true,
      });

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#059669', '#10B981', '#34D399', '#F59E0B'],
        });
      } catch (e) {}

      onToast(`Welcome to ${plan?.name}! S$0 Free delivery and subscriber perks now active.`);
      onClose();
    }, 600);
  };

  const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedTier);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-emerald-100 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white relative flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">NutriPass SG Membership</h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Pro S$89/mo · Teams S$1,000/mo
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Free islandwide clean meal delivery, court sniper alerts, active sports credits & 2-3x Healthier SG Healthpoints
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="mt-5 flex items-center justify-center">
            <div className="bg-emerald-950/60 p-1 rounded-2xl inline-flex items-center border border-white/10">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Subscription Status Bar if active */}
        {currentSubscription.tier !== 'free' && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Active Plan: <strong className="capitalize font-bold text-emerald-950">{currentSubscription.tier} Pass</strong> ({currentSubscription.billingCycle})
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">Renews on {currentSubscription.renewalDate || 'Next month'}</span>
            </div>
            <div className="font-semibold text-emerald-700 hidden sm:block">
              Total Saved: S${currentSubscription.savingsTotalSgd.toFixed(2)}
            </div>
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = selectedTier === plan.id;
              const isCurrent = currentSubscription.tier === plan.id;
              const priceDisplay = billingCycle === 'annual' && plan.priceAnnualMonthly > 0
                ? plan.priceAnnualMonthly
                : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative border ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{plan.badge}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">{plan.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {plan.description}
                    </p>

                    {/* Price Display */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">
                          {priceDisplay === 0 ? 'S$0' : `S$${priceDisplay.toFixed(2)}`}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          / month
                        </span>
                      </div>
                      {billingCycle === 'annual' && plan.priceMonthly > 0 && (
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          Billed S${(plan.priceAnnualMonthly * 12).toFixed(2)}/yr (save 20%)
                        </div>
                      )}
                    </div>

                    {/* Perks List */}
                    <div className="mt-4 space-y-2">
                      {plan.perks.map((perk, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Radio / Selection Indicator */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Singapore ROI Calculator Pill */}
          <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <strong className="font-bold text-slate-900 block">
                  Why Members & Sports Teams Choose NutriPass:
                </strong>
                <span className="text-slate-600">
                  Individual Pro (S$89/mo) saves over <strong>S$80.00 in monthly delivery fees</strong> and <strong>S$45.00 in meal discounts</strong>, while Teams & Club (S$1,000/mo) includes <strong>S$250 in ActiveSG credits</strong> + group meal catering for 25 athletes!
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-500">Estimated Value</div>
              <div className="text-base font-black text-emerald-800">
                {selectedTier === 'club' ? '+S$1,450 / mo' : '+S$125.00 / mo'}
              </div>
            </div>
          </div>

          {/* Payment Method Selector if upgrading */}
          {selectedTier !== 'free' && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Select Singapore Payment Method:</span>
                <span className="text-[11px] text-slate-500 font-normal">Encrypted & HPB Healthier SG Compliant</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paynow')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'paynow'
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-extrabold shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>PayNow SG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Credit / Debit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('grabpay')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    paymentMethod === 'grabpay'
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-extrabold shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>GrabPay</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500">
            {selectedTier === 'free' ? (
              <span>Downgrading to Free Tier stops all subscriber discounts immediately.</span>
            ) : (
              <span>
                14-day risk-free trial. Cancel anytime with 1 click in your profile.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmSubscription}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm shadow-emerald-700/20 cursor-pointer transition active:scale-95"
            >
              {isProcessing ? (
                <span>Processing...</span>
              ) : selectedTier === 'free' ? (
                <span>Confirm Switch to Free</span>
              ) : currentSubscription.tier === selectedTier ? (
                <span>Keep Current Plan</span>
              ) : (
                <>
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>
                    Activate {selectedPlanData?.name} (
                    {billingCycle === 'annual'
                      ? `S$${((selectedPlanData?.priceAnnualMonthly || (selectedTier === 'club' ? 800 : 69)) * 12).toFixed(2)}/yr`
                      : `S$${(selectedPlanData?.priceMonthly || (selectedTier === 'club' ? 1000 : 89)).toFixed(2)}/mo`}
                    )
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
