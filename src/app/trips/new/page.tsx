import { createTrip } from '../actions'

export default function NewTripPage() {
    return (
        <div className="container mx-auto p-4 py-12">
            <div className="max-w-md mx-auto glass-card">
                <h1 className="text-2xl font-bold mb-6 text-white text-center">Create New Trip</h1>
                <form action={createTrip as any} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-200">Trip Name</label>
                        <input type="text" name="name" id="name" required className="glass-input mt-1 w-full text-slate-900" placeholder="e.g. Summer Roadtrip" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-200">Description</label>
                        <textarea name="description" id="description" className="glass-input mt-1 w-full text-slate-900 h-24 resize-none" placeholder="What's this trip about?"></textarea>
                    </div>
                    <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-slate-200">Currency</label>
                        <select name="currency" id="currency" className="glass-input mt-1 w-full text-slate-900 appearance-none bg-white/50">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="INR">INR (₹)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary w-full mt-4">
                        Create Trip
                    </button>
                </form>
            </div>
        </div>
    )
}
