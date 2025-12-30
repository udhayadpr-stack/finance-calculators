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
import { ThemeToggle } from './components/ui/ThemeToggle';

import PFCalculator from './components/calculators/PFCalculator';
import GratuityCalculator from './components/calculators/GratuityCalculator';
import EMICalculator from './components/calculators/EMICalculator';
import MFCalculator from './components/calculators/MFCalculator';
import ForeclosureCalculator from './components/calculators/ForeclosureCalculator';

function NavTab({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-gray-900 text-white shadow-lg shadow-gray-200 dark:bg-white dark:text-gray-900 dark:shadow-none"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-slate-800"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}

function TopNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        {/* Header Layout: Stacked on mobile, Row on Desktop */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">

          {/* Header Row (Logo + Toggle) */}
          <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-1 ring-white/20">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-gray-100 tracking-tight font-display">FinCalc</span>
            </div>
            {/* Show Toggle on Mobile here, Desktop here too? */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>

          {/* Desktop Actions Wrapper */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
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

            {/* Desktop Toggle */}
            <div className="hidden md:block">
              <ThemeToggle />
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans flex flex-col transition-colors duration-300">
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


