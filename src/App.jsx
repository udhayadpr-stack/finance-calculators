import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingUp,
  Home,
  Menu,
  X,
  Award
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

import InHandSalaryCalculator from './components/calculators/InHandSalary';
import PFCalculator from './components/calculators/PFCalculator';
import EMICalculator from './components/calculators/EMICalculator';
import MFCalculator from './components/calculators/MFCalculator';
import ForeclosureCalculator from './components/calculators/ForeclosureCalculator';
import GratuityCalculator from './components/calculators/GratuityCalculator';


function NavItem({ to, icon: Icon, label, active }) {
  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active
          ? "bg-primary text-white shadow-md shadow-primary/30"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Icon className={clsx("w-5 h-5", active ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
      <span className="font-semibold text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />}
    </Link>
  );
}

function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary font-bold text-xl tracking-tight">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Landmark className="w-6 h-6" />
            </div>
            FinCalc
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
          <div className="px-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calculators</div>
          <NavItem to="/" icon={CreditCard} label="Salary Architect" active={path === '/'} />
          <NavItem to="/pf" icon={PiggyBank} label="EPF Calculator" active={path === '/pf'} />
          <NavItem to="/gratuity" icon={Award} label="Gratuity" active={path === '/gratuity'} />
          <NavItem to="/emi" icon={Home} label="EMI Calculator" active={path === '/emi'} />
          <NavItem to="/mf" icon={TrendingUp} label="Mutual Funds" active={path === '/mf'} />
          <NavItem to="/foreclosure" icon={X} label="Foreclosure" active={path === '/foreclosure'} />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 text-white p-5 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="text-xs font-bold text-gray-400 mb-1">PRO TIP</div>
              <p className="text-sm font-medium leading-relaxed opacity-90">Save up to ₹46,800 in taxes using NPS Tier 1.</p>
            </div>
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          </div>
        </div>
      </aside>
    </>
  );
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex font-sans">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 h-16 sticky top-0 z-30">
            <div className="font-bold text-lg text-gray-900">FinCalc</div>
            <button onClick={() => setMobileOpen(true)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100">
              <Menu className="w-6 h-6" />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
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
      </div>
    </Router>
  );
}

export default App;
