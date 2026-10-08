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
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, MealItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onCheckoutComplete: (meals: CartItem[]) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutComplete,
}) => {
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'activesg_pickup'>('delivery');
  const [address, setAddress] = useState('Marina Bay Financial Centre Tower 2, #18-01');
  const [activeSGPickupVenue, setActiveSGPickupVenue] = useState('Bishan ActiveSG Sports Hall Concierge');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);
  const deliveryFee = deliveryType === 'activesg_pickup' ? 0 : subtotal >= 30 ? 0 : 3.50;
  const discount = promoApplied ? 3.00 : 0;
  const finalTotal = Math.max(0, subtotal + deliveryFee - discount);
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

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#34D399', '#F59E0B'],
      });
    } catch (e) {}

    onCheckoutComplete(cart);
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
                <span>+40 Healthpoints Earned!</span>
              </div>
              <div className="text-[11px] text-emerald-700">
                Added {totalCalories} kcal & {totalProtein}g protein to today’s balance.
              </div>
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

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>S${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `S$${deliveryFee.toFixed(2)}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Healthier SG Discount</span>
                  <span>-S${discount.toFixed(2)}</span>
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
