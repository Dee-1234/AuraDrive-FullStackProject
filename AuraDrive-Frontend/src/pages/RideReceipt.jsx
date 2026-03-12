import React from 'react';

const RideReceipt = ({ ride, payment, onClose }) => {
    // Safety check to prevent errors if props are temporarily undefined
    if (!ride || !payment) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-8 border-blue-600 animate-in fade-in zoom-in duration-300">
                
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Aura<span className="text-blue-600">Drive</span></h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Official Receipt</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {payment.status || 'PROCESSED'}
                    </span>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <span className="text-slate-500 text-sm font-semibold">Pickup</span>
                        <span className="text-slate-900 text-sm font-bold text-right w-2/3">{ride.pickupLocation}</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <span className="text-slate-500 text-sm font-semibold">Destination</span>
                        <span className="text-slate-900 text-sm font-bold text-right w-2/3">{ride.destination}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-slate-500 text-sm font-semibold">Distance</span>
                        <span className="text-slate-900 text-sm font-bold">{ride.distance || 'N/A'} km</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-slate-500 text-sm font-semibold">Date</span>
                        <span className="text-slate-900 text-sm font-bold">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl mb-8 border border-slate-100">
                    <div className="flex justify-between items-center text-xl font-black text-slate-900">
                        <span>Total Paid</span>
                        <span className="text-blue-600">₹{Number(payment.amount).toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 font-mono break-all uppercase">
                        Ref: {payment.stripePaymentIntentId || 'INTERNAL_TRANS_ID'}
                    </p>
                </div>

                <div className="flex gap-3 no-print">
                    <button 
                        onClick={handlePrint}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Print/Save
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        Done
                    </button>
                </div>

                {/* Print-only footer */}
                <p className="hidden print:block text-center text-[10px] text-slate-400 mt-8">
                    Thank you for choosing AuraDrive. This is a computer-generated receipt.
                </p>
            </div>
        </div>
    );
};

export default RideReceipt;