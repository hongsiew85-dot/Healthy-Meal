import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Tag, 
  Crown 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, MealItem, UserSubscription } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckoutComplete: (meals: CartItem[], subscribedInCheckout?: boolean) => void;
  subscription: UserSubscription;
  onUpdateSubscription: (newSub: UserSubscription) => void;
  onOpenSubscriptionModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutComplete,
  subscription,
  onUpdateSubscription,
  onOpenSubscriptionModal,
}) => {
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'activesg_pickup'>('delivery');
  const [address, setAddress] = useState('Marina Bay Financial Centre Tower 2, #18-01');
  const [activeSGPickupVenue, setActiveSGPickupVenue] = useState('Bishan ActiveSG Sports Hall Concierge');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);
  const [subscribeAtCheckout, setSubscribeAtCheckout] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
  const isSubscriber = subscription.tier !== 'free' || subscribeAtCheckout;
  const subscriberMealDiscount = isSubscriber ? subtotal * 0.10 : 0;
  const deliveryFee = deliveryType === 'activesg_pickup' || isSubscriber ? 0 : subtotal >= 30 ? 0 : 3.50;
  const subscriptionAddonFee = subscribeAtCheckout ? 9.90 : 0;
  const promoDiscount = promoApplied ? 3.00 : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee + subscriptionAddonFee - promoDiscount - subscriberMealDiscount);
  const totalCalories = cart.reduce((acc, item) => acc + (item.meal.nutrition.calories * item.quantity), 0);
  const totalProtein = cart.reduce((acc, item) => acc + (item.meal.nutrition.protein * item.quantity), 0);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'HEALTHIERSG' || promoCode.trim().toUpperCase() === 'ACTIVESG') {
      setPromoApplied(true);
    }
  };

  const handleCheckout = () => {
    const orderId = `SG-NUTRI-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderComplete(orderId);

    if (subscribeAtCheckout) {
      const renewal = new Date();
      renewal.setMonth(renewal.getMonth() + 1);
      onUpdateSubscription({
        tier: 'pro',
        billingCycle: 'monthly',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        renewalDate: renewal.toISOString().split('T')[0],
        feeSgd: 9.90,
        savingsTotalSgd: subscription.savingsTotalSgd + 3.50 + subscriberMealDiscount,
        autoRenew: true,
      });
    }

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#34D399', '#F59E0B'],
      });
    } catch (e) {}

    onCheckoutComplete(cart, subscribeAtCheckout);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">Your NutriActive Bag</h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {orderComplete ? (
          /* Order Confirmation View */
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Order Confirmed!</h3>
            <p className="text-xs text-slate-500">
              Order Ref: <span className="font-mono font-bold text-emerald-800">{orderComplete}</span>
            </p>
            <p className="text-xs text-slate-600 max-w-xs">
              Your HPB-certified meals are being freshly prepared and dispatched. All nutrients have been logged to your Daily Tracker!
            </p>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 w-full space-y-1">
              <div className="font-bold flex items-center justify-center gap-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>+{isSubscriber ? 80 : 40} Healthpoints Earned! {isSubscriber && '(2x NutriPass Multiplier)'}</span>
              </div>
              <div className="text-[11px] text-emerald-700">
                Added {totalCalories} kcal & {totalProtein}g protein to today’s balance.
              </div>
              {subscribeAtCheckout && (
                <div className="text-[11px] text-amber-800 font-bold pt-1 border-t border-emerald-200/60 flex items-center justify-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>NutriPass Pro Activated (S$9.90/mo)! S$0 delivery forever.</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setOrderComplete(null);
                onClearCart();
                onClose();
              }}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-2xl transition cursor-pointer mt-4"
            >
              Continue Exploring
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Bag */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">Your bag is empty</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Explore our menu of HPB Healthier Choice hawker dishes and clean bowls to fuel your active day.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition cursor-pointer"
            >
              Browse Clean Eats
            </button>
          </div>
        ) : (
          /* Cart Items and Checkout Details */
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Delivery vs ActiveSG Collection Segment */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Fulfillment Method
              </div>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    deliveryType === 'delivery'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Islandwide Delivery
                </button>
                <button
                  onClick={() => setDeliveryType('activesg_pickup')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    deliveryType === 'activesg_pickup'
                      ? 'bg-white text-emerald-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ActiveSG Counter (Free)
                </button>
              </div>

              {deliveryType === 'delivery' ? (
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Delivery Address</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ActiveSG Pick-up Venue</span>
                  </label>
                  <select
                    value={activeSGPickupVenue}
                    onChange={(e) => setActiveSGPickupVenue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Bishan ActiveSG Sports Hall Concierge">Bishan ActiveSG Sports Hall Concierge</option>
                    <option value="Pasir Ris ActiveSG Sports Complex">Pasir Ris ActiveSG Sports Complex</option>
                    <option value="Heartbeat@Bedok Level 2 Sports Desk">Heartbeat@Bedok Level 2 Sports Desk</option>
                    <option value="Jurong East ActiveSG Sports Centre">Jurong East ActiveSG Sports Centre</option>
                    <option value="Our Tampines Hub ActiveSG Counter">Our Tampines Hub ActiveSG Counter</option>
                  </select>
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Order Items
              </div>
              {cart.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{item.meal.name}</h4>
                      <p className="text-[11px] text-slate-500">{item.meal.hawkerStallOrBrand}</p>
                      
                      {/* Selected Customizations */}
                      {item.selectedOptions.length > 0 && (
                        <div className="text-[10px] text-emerald-800 space-y-0.5 pt-1">
                          {item.selectedOptions.map((opt, oIdx) => (
                            <div key={oIdx}>
                              • {opt.groupName}: {opt.option.name}
                            </div>
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <div className="text-[10px] text-slate-500 italic">
                          Note: "{item.notes}"
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-slate-200">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-slate-900">
                      S${item.itemTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Promo Code</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Try 'HEALTHIERSG' (S$3 Off)"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs uppercase"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Promo code applied: S$3.00 off!</span>
                </div>
              )}
            </div>

            {/* Nutritional Summary in Bag */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-emerald-950">Nutritional Intake in Bag:</div>
              <div className="text-emerald-800">
                {totalCalories} kcal · {totalProtein}g protein · HPB Healthier Choice
              </div>
            </div>

            {/* NutriPass Subscription In-Cart Opt-in / Active Status */}
            {subscription.tier === 'free' ? (
              <div className={`p-3.5 rounded-2xl border transition-all ${
                subscribeAtCheckout 
                  ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300' 
                  : 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50'
              }`}>
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">NutriPass Pro Membership</span>
                        <span className="text-[10px] font-extrabold bg-emerald-700 text-white px-1.5 py-0.2 rounded">
                          S$9.90/mo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Save <strong>S$3.50 delivery fee</strong> immediately, plus get <strong>10% off meals</strong> and unlimited AI scans!
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="subscribe-checkout-opt"
                    checked={subscribeAtCheckout}
                    onChange={(e) => setSubscribeAtCheckout(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 mt-1 cursor-pointer"
                  />
                </div>
                <div className="mt-2 text-[11px] font-bold text-emerald-800 flex items-center justify-between pt-2 border-t border-emerald-200/50">
                  <label htmlFor="subscribe-checkout-opt" className="cursor-pointer">
                    {subscribeAtCheckout ? '✓ NutriPass Pro Subscription Fee included' : '+ Add S$9.90/mo subscription to order'}
                  </label>
                  <button
                    type="button"
                    onClick={onOpenSubscriptionModal}
                    className="text-amber-800 underline hover:text-black cursor-pointer font-bold"
                  >
                    View All Plans
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs flex items-center justify-between text-amber-950">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold capitalize">{subscription.tier} Pass Active</span>
                    <p className="text-[10px] text-amber-800">S$0 Free Delivery & 10% subscriber discount applied</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenSubscriptionModal}
                  className="text-[11px] font-bold text-amber-900 underline hover:text-black cursor-pointer"
                >
                  Manage
                </button>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span>S${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span>Delivery Fee</span>
                  {isSubscriber && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      NutriPass S$0
                    </span>
                  )}
                </span>
                <span>{deliveryFee === 0 ? 'FREE' : `S$${deliveryFee.toFixed(2)}`}</span>
              </div>

              {subscribeAtCheckout && (
                <div className="flex justify-between text-amber-950 font-bold bg-amber-100/70 px-2.5 py-1.5 rounded-xl border border-amber-200">
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                    <span>NutriPass Pro Subscription Fee</span>
                  </span>
                  <span>+S$9.90</span>
                </div>
              )}

              {subscriberMealDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>NutriPass 10% Subscriber Meal Discount</span>
                  <span>-S${subscriberMealDiscount.toFixed(2)}</span>
                </div>
              )}

              {promoApplied && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Healthier SG Discount (HEALTHIERSG)</span>
                  <span>-S$3.00</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Included 9% Singapore GST</span>
                <span>S${((finalTotal * 0.09) / 1.09).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Final Total</span>
                <span>S${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-98 transition cursor-pointer"
            >
              <span>Place Order & Log to Balance</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
