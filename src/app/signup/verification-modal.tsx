"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/modal"

export default function VerificationModal({ message }: { message?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (message) {
            setIsOpen(true)
        }
    }, [message])

    const handleClose = () => {
        setIsOpen(false)
        router.push("/login")
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Account Created"
            footer={
                <button
                    onClick={handleClose}
                    className="btn-primary w-full sm:w-auto"
                >
                    OK
                </button>
            }
        >
            <p>{message}</p>
        </Modal>
    )
}
