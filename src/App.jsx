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
        "flex flex-col md:flex-row items-center justify-center md:gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl transition-all duration-300 min-w-[80px] md:min-w-0 flex-shrink-0 relative group",
        active
          ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
          : "text-gray-500 hover:text-primary hover:bg-white bg-transparent border border-transparent hover:border-gray-100"
      )}
    >
      <Icon className={clsx("w-6 h-6 md:w-5 md:h-5 mb-1 md:mb-0 transition-colors", active ? "text-white" : "text-gray-400 group-hover:text-primary")} />
      <span className={clsx("text-[10px] md:text-sm font-bold text-center leading-tight tracking-wide", active ? "text-white" : "text-gray-500 group-hover:text-gray-900")}>{label}</span>

      {/* Active Indicator Dot for mobile mostly */}
      {!active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity md:hidden"></span>}
    </Link>
  );
}

function TopNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        {/* Header Layout: Stacked on mobile, Row on Desktop */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">

          {/* Header Logo */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-1 ring-white/20">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight font-display">FinCalc</span>
          </div>

          {/* Scrollable Tabs - Fixed Padding and Overflow */}
          <div className="w-full md:w-auto overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
            <div className="flex md:justify-end gap-2 pr-4 md:pr-0 min-w-max">
              <NavTab to="/" icon={CreditCard} label="Salary" active={path === '/'} />
              <NavTab to="/pf" icon={PiggyBank} label="EPF" active={path === '/pf'} />
              <NavTab to="/gratuity" icon={Award} label="Gratuity" active={path === '/gratuity'} />
              <NavTab to="/emi" icon={Home} label="EMI" active={path === '/emi'} />
              <NavTab to="/mf" icon={TrendingUp} label="SIP/MF" active={path === '/mf'} />
              <NavTab to="/foreclosure" icon={X} label="Foreclosure" active={path === '/foreclosure'} />
            </div>
          </div>

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


