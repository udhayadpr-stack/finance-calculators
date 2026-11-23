export function CalculatorNotice({ error, children }) {
    return <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        {error && <p role="alert" className="mb-2 font-semibold text-rose-600 dark:text-rose-400">{error}</p>}
        {children}
    </div>;
}
