'use client';

/**
 * Looping render of the Sterling payment flow: customers pay in USDC / SOL / $LXR,
 * the gateway settles, and the merchant receives USDC. Muted and inline so it autoplays everywhere.
 */
export function PaymentFlowVideo() {
    return (
        <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/videos/sterling-payment-flow-poster.jpg"
            aria-label="Customers paying in different tokens through the Sterling gateway to a merchant"
            className="absolute inset-0 w-full h-full object-cover object-center"
        >
            <source src="/videos/sterling-payment-flow.mp4" type="video/mp4" />
        </video>
    );
}
