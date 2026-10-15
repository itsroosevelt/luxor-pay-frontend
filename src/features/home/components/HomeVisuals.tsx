'use client';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

const BLUE = '#60A5FA';
const DEEP = '#2563EB';

const FLOW_PERIOD = 6;
const GATE = { x: 200, y: 150 };
const MERCHANT_X = 340;
const PATH_STEPS = 9;
const GREEN = '#34D399';

const FLOW_TOKENS = [
    { symbol: 'USDC', color: '#3B82F6', amount: '+$24.50', rowY: 76, offset: 0 },
    { symbol: 'SOL', color: '#A78BFA', amount: '+$112.00', rowY: 150, offset: FLOW_PERIOD / 3 },
    { symbol: '$LXR', color: '#F97316', amount: '+$8.90', rowY: 224, offset: (FLOW_PERIOD / 3) * 2 },
];

/** Points of the quadratic curve a coin follows from its customer to the gateway. */
function coinPath(rowY: number) {
    const p0 = { x: 84, y: rowY };
    const p1 = { x: 132, y: rowY };
    const p2 = { x: 160, y: GATE.y };
    return Array.from({ length: PATH_STEPS }, (_, i) => {
        const t = i / (PATH_STEPS - 1);
        const m = 1 - t;
        return {
            x: m * m * p0.x + 2 * m * t * p1.x + t * t * p2.x,
            y: m * m * p0.y + 2 * m * t * p1.y + t * t * p2.y,
        };
    });
}

/** Keyframes for one coin trip: waits invisible, travels the curve, is absorbed, waits for the next loop. */
function tripFrames(rowY: number) {
    const path = coinPath(rowY);
    const end = path[path.length - 1];
    const travel = path.map((_, i) => 0.05 + (0.27 * i) / (path.length - 1));
    return {
        x: [path[0].x, ...path.map((p) => p.x), end.x, end.x],
        y: [path[0].y, ...path.map((p) => p.y), end.y, end.y],
        opacity: [0, ...path.map(() => 1), 0, 0],
        times: [0, ...travel, 0.35, 1],
    };
}

function Coin({ token, tail = 0 }: { token: (typeof FLOW_TOKENS)[number]; tail?: number }) {
    const f = tripFrames(token.rowY);
    const lag = tail * 0.055;
    const fade = tail === 0 ? 1 : tail === 1 ? 0.5 : 0.25;
    return (
        <motion.g
            initial={{ x: f.x[0], y: f.y[0], opacity: 0 }}
            animate={{ x: f.x, y: f.y, opacity: f.opacity.map((o) => o * fade) }}
            transition={{ duration: FLOW_PERIOD, delay: token.offset + lag, repeat: Infinity, ease: 'linear', times: f.times }}
        >
            {tail === 0 ? (
                <>
                    <circle r="10" fill={token.color} opacity="0.22" />
                    <circle r="7" fill="#0A0A0A" stroke={token.color} strokeWidth="1.4" />
                    <circle r="2.4" fill={token.color} />
                </>
            ) : (
                <circle r={4 - tail} fill={token.color} />
            )}
        </motion.g>
    );
}

/**
 * Three customers pay in different tokens. Each coin flies along a curve into the Sterling gateway
 * (which pulses on absorption) and a settled chip is released to the merchant, who confirms the amount.
 */
export function PaymentFlowVisual() {
    return (
        <svg viewBox="0 0 400 300" className="w-full h-full" role="img" aria-label="Customers paying in different tokens through the Sterling gateway to a merchant">
            <defs>
                <linearGradient id="flow-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={BLUE} />
                    <stop offset="100%" stopColor={DEEP} />
                </linearGradient>
                <radialGradient id="flow-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={DEEP} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
                </radialGradient>
                <radialGradient id="flow-warm" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F97316" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                </radialGradient>
                <pattern id="flow-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.10)" />
                </pattern>
                <radialGradient id="flow-fade" cx="50%" cy="50%" r="60%">
                    <stop offset="40%" stopColor="#fff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <mask id="flow-mask">
                    <rect width="400" height="300" fill="url(#flow-fade)" />
                </mask>
            </defs>

            {/* Ambient: faint dotted grid + blue core glow + warm accent behind the merchant */}
            <rect width="400" height="300" fill="url(#flow-dots)" mask="url(#flow-mask)" />
            <circle cx={GATE.x} cy={GATE.y} r="150" fill="url(#flow-glow)" />
            <circle cx={MERCHANT_X} cy="230" r="120" fill="url(#flow-warm)" />

            {/* Rails (dashes drift in the direction of travel) */}
            {FLOW_TOKENS.map((t) => {
                const pts = coinPath(t.rowY);
                const d = `M${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
                return (
                    <motion.path
                        key={`rail-${t.symbol}`}
                        d={d}
                        fill="none"
                        stroke="rgba(255,255,255,0.14)"
                        strokeWidth="1.2"
                        strokeDasharray="3 7"
                        animate={{ strokeDashoffset: [0, -20] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                    />
                );
            })}
            <motion.line
                x1="238" y1={GATE.y} x2="300" y2={GATE.y}
                stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" strokeDasharray="3 7"
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />

            {/* Customers */}
            {FLOW_TOKENS.map((t) => (
                <g key={`cust-${t.symbol}`}>
                    <motion.circle
                        cx="60" cy={t.rowY} r="18" fill="none" stroke={t.color} strokeWidth="1.2"
                        style={{ originX: '60px', originY: `${t.rowY}px`, transformBox: 'view-box' }}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: [0.8, 0, 0], scale: [1, 1.7, 1.7] }}
                        transition={{ duration: FLOW_PERIOD, delay: t.offset, repeat: Infinity, ease: 'easeOut', times: [0, 0.1, 1] }}
                    />
                    <circle cx="60" cy={t.rowY} r="18" fill="#0A0A0A" stroke="rgba(255,255,255,0.22)" />
                    <rect x="51" y={t.rowY - 6} width="18" height="12" rx="3" fill="none" stroke="#fff" strokeWidth="1.2" />
                    <circle cx="65" cy={t.rowY} r="1.6" fill={t.color} />
                    <text x="60" y={t.rowY + 31} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.45)" fontFamily="monospace">{t.symbol}</text>
                </g>
            ))}

            {/* Sterling gateway */}
            <g>
                {FLOW_TOKENS.map((t) => (
                    <motion.polygon
                        key={`pulse-${t.symbol}`}
                        points="200,108 236,129 236,171 200,192 164,171 164,129"
                        fill="none" stroke={t.color} strokeWidth="1.4"
                        style={{ originX: `${GATE.x}px`, originY: `${GATE.y}px`, transformBox: 'view-box' }}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: [0, 0, 0.8, 0, 0], scale: [1, 1, 1, 1.55, 1.55] }}
                        transition={{ duration: FLOW_PERIOD, delay: t.offset, repeat: Infinity, ease: 'easeOut', times: [0, 0.3, 0.33, 0.5, 1] }}
                    />
                ))}
                <motion.circle
                    cx={GATE.x} cy={GATE.y} r="54" fill="none" stroke="rgba(96,165,250,0.35)" strokeWidth="1" strokeDasharray="2 8"
                    style={{ originX: `${GATE.x}px`, originY: `${GATE.y}px`, transformBox: 'view-box' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                />
                <polygon points="200,108 236,129 236,171 200,192 164,171 164,129" fill="#0A0A0A" stroke="url(#flow-g)" strokeWidth="2" />
                <motion.image
                    href="/brand/sterling-logo.png"
                    x={GATE.x - 24}
                    y={GATE.y - 24}
                    width="48"
                    height="48"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ originX: `${GATE.x}px`, originY: `${GATE.y}px`, transformBox: 'view-box' }}
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <text x={GATE.x} y="216" textAnchor="middle" fontSize="11" fill="#fff" fontFamily="sans-serif" fontWeight="500">Sterling</text>
                <text x={GATE.x} y="230" textAnchor="middle" fontSize="8" fill={BLUE} fontFamily="monospace">~400ms settlement</text>
            </g>

            {/* Merchant */}
            <g>
                {FLOW_TOKENS.map((t) => (
                    <motion.circle
                        key={`mring-${t.symbol}`}
                        cx={MERCHANT_X} cy={GATE.y} r="30" fill="none" stroke={GREEN} strokeWidth="1.2"
                        style={{ originX: `${MERCHANT_X}px`, originY: `${GATE.y}px`, transformBox: 'view-box' }}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{ opacity: [0, 0, 0.7, 0, 0], scale: [1, 1, 1, 1.5, 1.5] }}
                        transition={{ duration: FLOW_PERIOD, delay: t.offset, repeat: Infinity, ease: 'easeOut', times: [0, 0.6, 0.62, 0.78, 1] }}
                    />
                ))}
                <circle cx={MERCHANT_X} cy={GATE.y} r="30" fill="#0A0A0A" stroke="rgba(255,255,255,0.25)" />
                <path d="M326 146 l4 -12 h20 l4 12 z M328 146 v16 h24 v-16 M336 162 v-8 h8 v8" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                <text x={MERCHANT_X} y="200" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="sans-serif">Merchant</text>

                {FLOW_TOKENS.map((t) => (
                    <motion.text
                        key={`amt-${t.symbol}`}
                        x={MERCHANT_X} textAnchor="middle" fontSize="11" fontWeight="600" fill={GREEN} fontFamily="monospace"
                        initial={{ opacity: 0, y: 112 }}
                        animate={{ opacity: [0, 0, 1, 1, 0, 0], y: [112, 112, 108, 98, 92, 92] }}
                        transition={{ duration: FLOW_PERIOD, delay: t.offset, repeat: Infinity, ease: 'easeOut', times: [0, 0.6, 0.65, 0.82, 0.93, 1] }}
                    >
                        {t.amount}
                    </motion.text>
                ))}
            </g>

            {/* Coins in flight: drawn last so the nodes never hide them */}
            {FLOW_TOKENS.map((t) => (
                <g key={`fly-${t.symbol}`}>
                    <Coin token={t} tail={3} />
                    <Coin token={t} tail={2} />
                    <Coin token={t} tail={1} />
                    <Coin token={t} />
                    <motion.g
                        initial={{ x: 256, opacity: 0 }}
                        animate={{ x: [256, 256, 256, 282, 282, 282], opacity: [0, 0, 1, 1, 0, 0] }}
                        transition={{ duration: FLOW_PERIOD, delay: t.offset, repeat: Infinity, ease: 'easeInOut', times: [0, 0.35, 0.39, 0.58, 0.61, 1] }}
                    >
                        <rect x="-20" y="141" width="40" height="18" rx="9" fill="#0A0A0A" stroke={GREEN} strokeWidth="1" />
                        <circle cx="-11" cy="150" r="3" fill={t.color} />
                        <text x="4" y="153" textAnchor="middle" fontSize="8" fill="#fff" fontFamily="monospace">USDC</text>
                    </motion.g>
                </g>
            ))}
        </svg>
    );
}

const LOGO_SRC = '/brand/sterling-logo.png';
const FORMED_MS = 9000;
const SCATTERED_MS = 2200;
const SAMPLE_SIZE = 230;
const EDGE_THRESHOLD = 14;

interface Dust {
    x: number;
    y: number;
    tx: number;
    ty: number;
    sx: number;
    sy: number;
    vx: number;
    vy: number;
    ease: number;
    size: number;
    color: string;
    phase: number;
    edge: boolean;
}

/** Stardust that drifts freely, gathers into the Sterling mark, then disperses and gathers again. */
export function LogoParticleVisual() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inView = useInView(wrapRef, { amount: 0.25 });

    useEffect(() => {
        if (!inView) return;
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!wrap || !canvas || !ctx) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const pointer = { x: -9999, y: -9999 };
        let dust: Dust[] = [];
        let samples: { u: number; v: number; color: string; edge: boolean }[] = [];
        let width = 0;
        let height = 0;
        let raf = 0;
        let cancelled = false;
        const start = performance.now();

        const layout = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = wrap.clientWidth;
            height = wrap.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const size = Math.min(width, height) * 0.8;
            const left = (width - size) / 2;
            const top = (height - size) / 2;
            dust = samples.map((p) => {
                const tx = left + p.u * size;
                const ty = top + p.v * size;
                const sx = Math.random() * width;
                const sy = Math.random() * height;
                return {
                    x: reduceMotion ? tx : sx,
                    y: reduceMotion ? ty : sy,
                    tx,
                    ty,
                    sx,
                    sy,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    ease: 0.05 + Math.random() * 0.06,
                    size: p.edge ? 0.7 + Math.random() * 0.5 : 0.8 + Math.random() * 0.8,
                    color: p.color,
                    phase: Math.random() * Math.PI * 2,
                    edge: p.edge,
                };
            });
        };

        let last = start;
        const frame = (now: number) => {
            const t = now - start;
            const steps = Math.min(4, Math.max(0.5, (now - last) / 16.7));
            last = now;
            const cycle = (t % (FORMED_MS + SCATTERED_MS));
            const formed = reduceMotion || cycle < FORMED_MS;

            ctx.clearRect(0, 0, width, height);
            for (const d of dust) {
                let gx: number;
                let gy: number;
                if (formed) {
                    gx = d.tx + Math.sin(t / 900 + d.phase) * 0.9;
                    gy = d.ty + Math.cos(t / 1100 + d.phase) * 0.9;
                } else {
                    d.sx += d.vx;
                    d.sy += d.vy;
                    if (d.sx < 0 || d.sx > width) d.vx *= -1;
                    if (d.sy < 0 || d.sy > height) d.vy *= -1;
                    gx = d.sx;
                    gy = d.sy;
                }

                if (!reduceMotion) {
                    const dx = d.x - pointer.x;
                    const dy = d.y - pointer.y;
                    const dist2 = dx * dx + dy * dy;
                    if (dist2 < 3600) {
                        const dist = Math.sqrt(dist2) || 1;
                        const push = (60 - dist) / 60;
                        d.x += (dx / dist) * push * 6;
                        d.y += (dy / dist) * push * 6;
                    }
                    const k = 1 - Math.pow(1 - d.ease, steps);
                    d.x += (gx - d.x) * k;
                    d.y += (gy - d.y) * k;
                }

                ctx.globalAlpha = formed ? (d.edge ? 0.9 : 0.55) : 0.4;
                ctx.fillStyle = formed ? d.color : '#ffffff';
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            if (!reduceMotion) raf = requestAnimationFrame(frame);
        };

        const onMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;
        };
        const onLeave = () => {
            pointer.x = -9999;
            pointer.y = -9999;
        };

        const img = new Image();
        img.onload = () => {
            if (cancelled) return;
            const off = document.createElement('canvas');
            off.width = SAMPLE_SIZE;
            off.height = SAMPLE_SIZE;
            const octx = off.getContext('2d', { willReadFrequently: true });
            if (!octx) return;
            octx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
            const { data } = octx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
            const idx = (x: number, y: number) => (y * SAMPLE_SIZE + x) * 4;
            const isSolid = (x: number, y: number) => {
                if (x < 0 || y < 0 || x >= SAMPLE_SIZE || y >= SAMPLE_SIZE) return false;
                const i = idx(x, y);
                return data[i + 3] >= 128 && !(data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235);
            };
            const lum = (x: number, y: number) => {
                const i = idx(Math.min(SAMPLE_SIZE - 1, Math.max(0, x)), Math.min(SAMPLE_SIZE - 1, Math.max(0, y)));
                return 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            };
            const found: typeof samples = [];
            for (let y = 0; y < SAMPLE_SIZE; y++) {
                for (let x = 0; x < SAMPLE_SIZE; x++) {
                    if (!isSolid(x, y)) continue;
                    const silhouette = !isSolid(x - 1, y) || !isSolid(x + 1, y) || !isSolid(x, y - 1) || !isSolid(x, y + 1);
                    const gradient = Math.abs(lum(x + 1, y) - lum(x - 1, y)) + Math.abs(lum(x, y + 1) - lum(x, y - 1));
                    const isEdge = silhouette || gradient > EDGE_THRESHOLD;
                    // Outlines are dense and bright so the ribbons read clearly; the body stays a faint haze.
                    if (isEdge ? Math.random() > 0.68 : Math.random() > 0.09) continue;
                    const i = idx(x, y);
                    const mix = isEdge ? 0.25 : 0;
                    const r = Math.round(data[i] + (255 - data[i]) * mix);
                    const g = Math.round(data[i + 1] + (255 - data[i + 1]) * mix);
                    const b = Math.round(data[i + 2] + (255 - data[i + 2]) * mix);
                    found.push({
                        u: (x + 0.5 + (Math.random() - 0.5) * 0.6) / SAMPLE_SIZE,
                        v: (y + 0.5 + (Math.random() - 0.5) * 0.6) / SAMPLE_SIZE,
                        color: `rgb(${r},${g},${b})`,
                        edge: isEdge,
                    });
                }
            }
            samples = found;
            layout();
            raf = requestAnimationFrame(frame);
        };
        img.src = LOGO_SRC;

        const observer = new ResizeObserver(() => {
            if (samples.length) layout();
        });
        observer.observe(wrap);
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerleave', onLeave);

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            observer.disconnect();
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerleave', onLeave);
        };
    }, [inView]);

    return (
        <div ref={wrapRef} className="relative w-full h-full" role="img" aria-label="Sterling mark formed by drifting particles">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.22),transparent_62%)]" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}
