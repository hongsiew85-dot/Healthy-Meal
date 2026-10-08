import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Flame, 
  ShieldCheck, 
  RotateCcw, 
  Scan, 
  ArrowRight,
  Info,
  CheckCircle2,
  FileText,
  Barcode,
  ExternalLink,
  Loader2,
  Search
} from 'lucide-react';
import { FoodScanAnalysis, LoggedMeal } from '../types';
import { analyzeFoodWithGemini } from '../services/geminiService';
import { PRESET_FOOD_SCANS } from '../data/mockData';
import { fetchOpenFoodFactsProduct } from '../services/openFoodFactsService';

interface AIFoodScannerProps {
  onLogScannedMeal: (meal: LoggedMeal) => void;
}

export const AIFoodScanner: React.FC<AIFoodScannerProps> = ({ onLogScannedMeal }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodScanAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'presets' | 'text' | 'barcode'>('camera');
  const [barcodeInput, setBarcodeInput] = useState('737628064502');
  const [justLogged, setJustLogged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = [
    { id: 'chicken_rice', label: 'Hainanese Chicken Rice (Breast)', icon: '🍗', preview: PRESET_FOOD_SCANS.chicken_rice },
    { id: 'lei_cha', label: 'Hakka Thunder Tea Rice (Lei Cha)', icon: '🍵', preview: PRESET_FOOD_SCANS.lei_cha },
    { id: 'yong_tau_foo', label: 'Clear Soup Yong Tau Foo (YTF)', icon: '🥬', preview: PRESET_FOOD_SCANS.yong_tau_foo },
    { id: 'fish_soup', label: 'Sliced Batang Fish Soup', icon: '🐟', preview: PRESET_FOOD_SCANS.fish_soup },
    { id: 'thai_peanut_noodles', label: 'Thai Peanut Rice Noodles (Open Food Facts #737628064502)', icon: '🍜', preview: PRESET_FOOD_SCANS.thai_peanut_noodles },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        runScan(reader.result as string, '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateCameraCapture = (dishName: string, presetData: FoodScanAnalysis) => {
    setIsScanning(true);
    setJustLogged(false);
    setSelectedImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');

    setTimeout(() => {
      setAnalysisResult(presetData);
      setIsScanning(false);
    }, 1200);
  };

  const runScan = async (imgData?: string, textDesc?: string) => {
    setIsScanning(true);
    setJustLogged(false);
    try {
      const res = await analyzeFoodWithGemini(imgData, textDesc);
      setAnalysisResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeLookup = async (barcodeToFetch: string) => {
    if (!barcodeToFetch.trim()) return;
    setIsScanning(true);
    setJustLogged(false);
    try {
      const res = await fetchOpenFoodFactsProduct(barcodeToFetch);
      if (res) {
        setSelectedImage(res.meal.imageUrl);
        setAnalysisResult(res.scanAnalysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    runScan(undefined, inputText);
  };

  const handleLogToDiary = () => {
    if (!analysisResult) return;
    const newMeal: LoggedMeal = {
      id: `meal-scan-${Date.now()}`,
      title: analysisResult.foodName,
      source: 'scan',
      calories: analysisResult.calories,
      protein: analysisResult.protein,
      carbs: analysisResult.carbs,
      fats: analysisResult.fats,
      time: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      imageUrl: selectedImage || undefined,
      nutriGrade: analysisResult.nutriGrade,
      hpbScore: analysisResult.hpbHealthierChoiceScore,
    };
    onLogScannedMeal(newMeal);
    setJustLogged(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Scanner Title Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#024e35] via-[#006948] to-[#10b981] text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/40 text-xs font-semibold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Multimodal Vision Powered by Gemini 3.8</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            AI Food & Macro Scanner for Singapore Dishes
          </h1>

          <p className="text-emerald-100 text-sm leading-relaxed">
            Snap a photo or describe any meal at Singapore hawker centres or restaurants. Our clinical AI estimates calories, macros, Nutri-Grade, and provides HPB dietary hacks to save unwanted sodium and calories.
          </p>
        </div>
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera & Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Popular SG Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Describe Meal</span>
          </button>

          <button
            onClick={() => setActiveTab('barcode')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'barcode'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-4 h-4 text-emerald-600" />
            <span>Open Food Facts Barcode</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Camera / Upload / Presets Stage (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {activeTab === 'camera' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 subtle-card-shadow text-center">
              
              {/* Camera Viewfinder Mockup */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center text-white p-4 group">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Scanned Food"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-emerald-400">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="text-xs text-slate-300">
                      Position food inside the frame
                    </div>
                  </div>
                )}

                {/* Viewfinder Target HUD Graphic */}
                <div className="absolute inset-4 border border-emerald-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>

                {/* Scanning Laser Animation */}
                {isScanning && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                    <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_#10B981] animate-pulse" />
                    <div className="absolute text-xs font-mono font-bold tracking-widest text-emerald-300 uppercase bg-slate-950/80 px-3 py-1 rounded-full">
                      Analyzing Nutrition with Gemini...
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Upload Photo</span>
                </button>

                <button
                  onClick={() => handleSimulateCameraCapture('Lei Cha', PRESET_FOOD_SCANS.lei_cha)}
                  className="p-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <Scan className="w-4 h-4" />
                  <span>Snap Demo Photo</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Supports JPG, PNG, WebP up to 10MB</span>
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 subtle-card-shadow">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select a Popular Singapore Hawker Dish
              </h3>
              <div className="space-y-2.5">
                {samplePresets.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSimulateCameraCapture(item.label, item.preview)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 text-left transition flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.preview.calories} kcal · {item.preview.protein}g protein · Nutri-Grade {item.preview.nutriGrade}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 subtle-card-shadow">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Type What You Ate
              </h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. 1 plate steamed chicken breast rice with chili, brown rice, extra cucumber, and clear broth"
                rows={4}
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isScanning}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze Meal with Gemini</span>
              </button>
            </form>
          )}

          {activeTab === 'barcode' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 subtle-card-shadow">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Open Food Facts Barcode Scanner
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Connects live to <span className="font-mono text-emerald-800 font-semibold">https://world.openfoodfacts.org/api/v2/product/{'{barcode}'}.json</span> to fetch certified nutritional databases, ingredients, and Nutri-Scores.
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  Barcode Number (UPC / EAN)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="e.g. 737628064502"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                  <button
                    onClick={() => handleBarcodeLookup(barcodeInput)}
                    disabled={isScanning || !barcodeInput.trim()}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                  >
                    {isScanning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>Lookup</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Quick Verification Presets
                </span>
                <button
                  onClick={() => {
                    setBarcodeInput('737628064502');
                    handleBarcodeLookup('737628064502');
                  }}
                  className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-left transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>Thai Peanut Rice Noodle Kit</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-white px-1 rounded border border-emerald-200">
                        #737628064502
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Simply Asia / Thai Kitchen · 385 kcal · Nutri-Grade D
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <a
                  href="https://world.openfoodfacts.org/product/737628064502"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-500"
                >
                  Inspect API source on OpenFoodFacts.org
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Nutrition & Clinical Health Breakdown (7 cols) */}
        <div className="lg:col-span-7">
          {analysisResult ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-6 subtle-card-shadow animate-in fade-in duration-300">
              
              {/* Header with Dish Name & Score */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        analysisResult.nutriGrade === 'A'
                          ? 'bg-[#007A3D] text-white'
                          : 'bg-[#6EC800] text-slate-900'
                      }`}
                    >
                      Nutri-Grade {analysisResult.nutriGrade}
                    </span>
                    <span className="text-xs text-slate-500">
                      AI Confidence: {(analysisResult.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {analysisResult.foodName}
                  </h2>
                </div>

                <div className="text-left sm:text-right bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-2.5 px-3.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">HPB Health Score</span>
                  <div className="text-lg font-extrabold text-emerald-900 flex items-center gap-1 sm:justify-end">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>{analysisResult.hpbHealthierChoiceScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Big Macro Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[11px] font-medium text-slate-500">Calories</div>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {analysisResult.calories} <span className="text-xs font-normal">kcal</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="text-[11px] font-bold text-emerald-800">Protein</div>
                  <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
                    {analysisResult.protein}g
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[11px] font-medium text-slate-500">Carbs</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-0.5">
                    {analysisResult.carbs}g
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[11px] font-medium text-slate-500">Fats</div>
                  <div className="text-xl font-extrabold text-slate-800 mt-0.5">
                    {analysisResult.fats}g
                  </div>
                </div>
              </div>

              {/* Secondary Nutrient Details: Fiber & Sodium */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Dietary Fiber:</span>
                  <span className="font-bold text-emerald-700">{analysisResult.fiber}g</span>
                  <span className="text-[11px] text-slate-400">(HPB rec: 20-25g/day)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Estimated Sodium:</span>
                  <span className={`font-bold ${analysisResult.sodium > 800 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {analysisResult.sodium}mg
                  </span>
                  <span className="text-[11px] text-slate-400">(HPB limit: 2000mg/day)</span>
                </div>
              </div>

              {/* Detected Ingredients */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ingredients Identified
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
                  {analysisResult.ingredientsDetected.map((ing, i) => (
                    <span key={i} className="bg-slate-100 px-2.5 py-1 rounded-lg">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Analysis */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Nutritional Evaluation
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {analysisResult.healthAnalysis}
                </p>
              </div>

              {/* Dietitian Smart Ordering Tips */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Singapore Dietitian Ordering Hacks</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {analysisResult.dietitianSuggestions.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Log to Diary CTA */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Logging updates your daily calorie balance & macro goals.
                </div>

                <button
                  onClick={handleLogToDiary}
                  disabled={justLogged}
                  className={`py-3 px-6 rounded-2xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
                    justLogged
                      ? 'bg-emerald-100 text-emerald-900 cursor-default'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 active:scale-95'
                  }`}
                >
                  {justLogged ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Logged to Diary</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Log to Daily Diary</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-4 subtle-card-shadow">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Scan className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Food Analyzed Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Take a photo, select an iconic Singapore preset from the left panel, or type what you ate to see calories, macros, and HPB ratings.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
