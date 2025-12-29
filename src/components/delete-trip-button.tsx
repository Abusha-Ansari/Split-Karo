'use client'

import { deleteTrip } from '@/app/trips/[id]/actions'

export default function DeleteTripButton({ tripId, tripName }: { tripId: string, tripName: string }) {
    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
            await deleteTrip(tripId)
        }
    }

    return (
        <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
        >
            Delete Trip
        </button>
    )
}
