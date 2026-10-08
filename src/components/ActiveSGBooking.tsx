import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, 
  MapPin, 
  Clock, 
  Flame, 
  Check, 
  Calendar, 
  Sparkles, 
  Award,
  ChevronRight,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActiveSGVenue, SportType, TimeSlot, FacilityBooking } from '../types';
import { ACTIVESG_VENUES } from '../data/mockData';

interface ActiveSGBookingProps {
  onConfirmBooking: (booking: FacilityBooking) => void;
}

export const ActiveSGBooking: React.FC<ActiveSGBookingProps> = ({ onConfirmBooking }) => {
  const [selectedSport, setSelectedSport] = useState<SportType>('badminton');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<ActiveSGVenue>(ACTIVESG_VENUES[0]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedCourtNumber, setSelectedCourtNumber] = useState<string>('Court 1');
  const [confirmedBooking, setConfirmedBooking] = useState<FacilityBooking | null>(null);

  // Next 7 days formatted for Singapore
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push({
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-SG', { weekday: 'short' }),
        dateString: d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }),
        fullDate: d.toISOString().split('T')[0],
      });
    }
    return dates;
  }, []);

  const sportsList: { id: SportType; label: string; icon: string; avgBurn: number }[] = [
    { id: 'badminton', label: 'Badminton', icon: '🏸', avgBurn: 460 },
    { id: 'gym', label: 'ActiveSG Gym', icon: '🏋️', avgBurn: 380 },
    { id: 'swimming', label: 'Swimming Pool', icon: '🏊', avgBurn: 540 },
    { id: 'tennis', label: 'Tennis', icon: '🎾', avgBurn: 480 },
    { id: 'table-tennis', label: 'Table Tennis', icon: '🏓', avgBurn: 280 },
    { id: 'squash', label: 'Squash', icon: '🎯', avgBurn: 580 },
  ];

  const regions = ['all', 'Central', 'East', 'West', 'North'];

  const filteredVenues = useMemo(() => {
    return ACTIVESG_VENUES.filter(venue => {
      const supportsSport = venue.sports.includes(selectedSport);
      const matchesRegion = selectedRegion === 'all' || venue.region === selectedRegion;
      return supportsSport && matchesRegion;
    });
  }, [selectedSport, selectedRegion]);

  // Ensure selectedVenue is within filteredVenues
  React.useEffect(() => {
    if (!filteredVenues.some(v => v.id === selectedVenue.id)) {
      if (filteredVenues.length > 0) {
        setSelectedVenue(filteredVenues[0]);
      }
    }
    setSelectedSlot(null);
  }, [filteredVenues]);

  const venueSlots = useMemo(() => {
    if (!selectedVenue || !selectedVenue.slots[selectedSport]) return [];
    return selectedVenue.slots[selectedSport];
  }, [selectedVenue, selectedSport]);

  const handleBookSlot = () => {
    if (!selectedSlot || !selectedVenue) return;

    const bookingRef = `ACTSG-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: FacilityBooking = {
      id: `booking-${Date.now()}`,
      bookingRef,
      venueName: selectedVenue.name,
      sport: selectedSport,
      courtNumber: selectedCourtNumber,
      date: availableDates[selectedDateIndex].fullDate,
      timeSlot: selectedSlot.timeRange,
      isPeak: selectedSlot.isPeak,
      fee: selectedSlot.price,
      estimatedCalorieBurn: selectedVenue.calorieBurnPerHour[selectedSport] || 450,
      createdAt: new Date().toISOString(),
    };

    onConfirmBooking(newBooking);
    setConfirmedBooking(newBooking);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#F59E0B', '#3B82F6'],
      });
    } catch (e) {
      // safe fallback
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* ActiveSG Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f2e22] via-[#005236] to-[#047857] text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/40 text-xs font-semibold text-emerald-200">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>ActiveSG Official Facility Booking Partner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Book ActiveSG Facilities & Balance Your Daily Calories
          </h1>

          <p className="text-emerald-100 text-sm leading-relaxed">
            Reserve Singapore sports halls, gym sessions, and Olympic swimming pools instantly. Every workout session automatically synchronizes with your daily calorie deficit and awards +50 Healthpoints!
          </p>
        </div>

        {/* Ambient glow */}
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
      </div>

      {/* Sport Category Tabs */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Select Sport Category
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {sportsList.map(sport => {
            const isActive = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => {
                  setSelectedSport(sport.id);
                  setSelectedSlot(null);
                }}
                className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30 text-emerald-950 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-2xl mb-1">{sport.icon}</div>
                <div>
                  <div className="text-xs font-bold">{sport.label}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Flame className="w-3 h-3 text-amber-500" />
                    <span>~{sport.avgBurn} kcal/hr</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Filter & Venue Picker Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Venues List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              ActiveSG Sports Centres ({filteredVenues.length})
            </h2>

            {/* Region Filter Pills */}
            <div className="flex items-center gap-1">
              {regions.map(reg => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-lg capitalize transition ${
                    selectedRegion === reg
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredVenues.map(venue => {
              const isSelected = selectedVenue.id === venue.id;
              return (
                <div
                  key={venue.id}
                  onClick={() => {
                    setSelectedVenue(venue);
                    setSelectedSlot(null);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          {venue.region} SG
                        </span>
                        <span className="text-xs text-slate-500">{venue.distanceKm} km away</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{venue.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{venue.mrt}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-extrabold text-amber-700 flex items-center justify-end gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>{venue.calorieBurnPerHour[selectedSport] || 450} kcal</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">estimated burn</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Date & Slot Booking Selector (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 space-y-6 subtle-card-shadow">
          
          {/* Venue Header */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-700">Booking Facility</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedVenue.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedVenue.address}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Opening Hours</span>
                <div className="text-xs font-bold text-slate-700">{selectedVenue.openingHours}</div>
              </div>
            </div>
          </div>

          {/* Date Picker Bar */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select Date</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {availableDates.map((item, idx) => {
                const isSelected = selectedDateIndex === idx;
                return (
                  <button
                    key={item.fullDate}
                    onClick={() => {
                      setSelectedDateIndex(idx);
                      setSelectedSlot(null);
                    }}
                    className={`px-3 py-2 rounded-xl text-center min-w-[76px] transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase">{item.dayName}</div>
                    <div className="text-xs font-extrabold mt-0.5">{item.dateString}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Court / Table Selector */}
          {selectedSport === 'badminton' && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Court Number Preference
              </div>
              <div className="flex flex-wrap gap-2">
                {['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6'].map(court => (
                  <button
                    key={court}
                    onClick={() => setSelectedCourtNumber(court)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedCourtNumber === court
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {court}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hourly Time Slots Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Available Hourly Slots ({venueSlots.length})
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Non-Peak (S$7.40)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Peak (S$9.70)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {venueSlots.map(slot => {
                const isSelected = selectedSlot?.id === slot.id;
                const isFull = slot.availableCourts === 0;

                return (
                  <button
                    key={slot.id}
                    disabled={isFull}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                      isFull
                        ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">{slot.timeRange}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        slot.isPeak ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {slot.isPeak ? 'PEAK' : 'OFF-PEAK'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
                      <span className="font-extrabold text-slate-900">S${slot.price.toFixed(2)}</span>
                      <span className={isFull ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                        {isFull ? 'Sold Out' : `${slot.availableCourts} slots left`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {venueSlots.length === 0 && (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                No scheduled slots for this sport at this facility. Please select another ActiveSG venue.
              </div>
            )}
          </div>

          {/* Calorie Deficit Compensation Preview Banner */}
          {selectedSlot && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs font-bold">
                  ActiveSG Metabolic Calorie Burn: ~{selectedVenue.calorieBurnPerHour[selectedSport]} kcal
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                This {selectedSport} session will burn off approximately ~{selectedVenue.calorieBurnPerHour[selectedSport]} calories, creating an immediate energy deficit. You will also earn <span className="font-bold">+50 Healthpoints</span> upon completion!
              </p>
            </div>
          )}

          {/* Booking Action Bar */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Fee</div>
              <div className="text-xl font-extrabold text-slate-900">
                {selectedSlot ? `S$${selectedSlot.price.toFixed(2)}` : 'Select a Slot'}
              </div>
            </div>

            <button
              disabled={!selectedSlot}
              onClick={handleBookSlot}
              className={`py-3 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                selectedSlot
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Confirm ActiveSG Booking</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">ActiveSG Slot Confirmed!</h3>
              <p className="text-xs text-slate-500">
                Official booking reference: <span className="font-mono font-bold text-emerald-800">{confirmedBooking.bookingRef}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.venueName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sport & Court:</span>
                <span className="font-bold text-slate-900 capitalize">{confirmedBooking.sport} · {confirmedBooking.courtNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Slot:</span>
                <span className="font-bold text-slate-900">{confirmedBooking.date} ({confirmedBooking.timeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Calorie Burn:</span>
                <span className="font-extrabold text-amber-700">~{confirmedBooking.estimatedCalorieBurn} kcal</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                <span className="text-slate-800">Total Paid:</span>
                <span className="text-emerald-800">S${confirmedBooking.fee.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
              <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Earned <strong>+50 Healthpoints</strong>! Synced with your Daily Calorie Tracker.</span>
            </div>

            <button
              onClick={() => setConfirmedBooking(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
