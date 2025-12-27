import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingUp,
  Home,
  X,
  Award
} from 'lucide-react';
import clsx from 'clsx';

import InHandSalaryCalculator from './components/calculators/InHandSalary';
import PFCalculator from './components/calculators/PFCalculator';
import EMICalculator from './components/calculators/EMICalculator';
import MFCalculator from './components/calculators/MFCalculator';
import ForeclosureCalculator from './components/calculators/ForeclosureCalculator';
import GratuityCalculator from './components/calculators/GratuityCalculator';


function NavTab({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={clsx(
        "flex flex-col md:flex-row items-center justify-center md:gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl transition-all duration-200 min-w-[80px] md:min-w-0 flex-shrink-0",
        active
          ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 bg-white border border-gray-100"
      )}
    >
      <Icon className={clsx("w-6 h-6 md:w-5 md:h-5 mb-1 md:mb-0", active ? "text-white" : "text-gray-400")} />
      <span className="text-[10px] md:text-sm font-bold text-center leading-tight">{label}</span>
    </Link>
  );
}

function TopNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="sticky top-0 z-50 bg-gray-50/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Header Logo */}
        <div className="flex items-center gap-2 mb-4 md:mb-0 md:absolute md:left-6 md:top-4">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">FinCalc</span>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex md:justify-center overflow-x-auto pb-2 md:pb-0 gap-3 hide-scrollbar -mx-4 px-4 md:mx-0">
          <NavTab to="/" icon={CreditCard} label="Salary" active={path === '/'} />
          <NavTab to="/pf" icon={PiggyBank} label="EPF" active={path === '/pf'} />
          <NavTab to="/gratuity" icon={Award} label="Gratuity" active={path === '/gratuity'} />
          <NavTab to="/emi" icon={Home} label="EMI" active={path === '/emi'} />
          <NavTab to="/mf" icon={TrendingUp} label="SIP/MF" active={path === '/mf'} />
          <NavTab to="/foreclosure" icon={X} label="Foreclosure" active={path === '/foreclosure'} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
        <TopNav />
        
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
          <Routes>
            <Route path="/" element={<InHandSalaryCalculator />} />
            <Route path="/pf" element={<PFCalculator />} />
            <Route path="/gratuity" element={<GratuityCalculator />} />
            <Route path="/emi" element={<EMICalculator />} />
            <Route path="/mf" element={<MFCalculator />} />
            <Route path="/foreclosure" element={<ForeclosureCalculator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

 
