export function scheduleCSV(rows) {
    const header = 'Month,Payment (INR),Principal (INR),Interest (INR),Balance (INR)';
    return [header, ...rows.map(row => [row.month, ...['payment', 'principal', 'interest', 'balance'].map(key => row[key].toFixed(2))].join(','))].join('\r\n');
}

export function downloadSchedule(rows) {
    const url = URL.createObjectURL(new Blob([scheduleCSV(rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'loan-amortization.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
