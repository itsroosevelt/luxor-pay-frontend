'use client';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type ShapeType = 'heart' | 'brackets' | 'circle' | null;

function GlobalParticles({ activeShape, mousePos, isVisible }: { activeShape: ShapeType, mousePos: { x: number, y: number } | null, isVisible: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isVisible) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const particleCount = 4500; // Aún más partículas para una densidad extrema

        const generateShapePoints = (w: number, h: number, type: ShapeType) => {
            const points: { x: number, y: number }[] = [];
            if (!type) return points;

            const centerX = mousePos ? mousePos.x : w / 2;
            const centerY = mousePos ? mousePos.y : h / 2;

            if (type === 'heart') {
                const addLine = (x1: number, y1: number, x2: number, y2: number, density: number) => {
                    const dx = x2 - x1, dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const count = Math.max(2, Math.floor(len * density));
                    for (let i = 0; i <= count; i++) {
                        const cx = x1 + dx * (i / count);
                        const cy = y1 + dy * (i / count);
                        for (let j = 0; j < 18; j++) {
                            const r = Math.sqrt(Math.random()) * 45; // Grosor del trazo 90px
                            const angle = Math.random() * Math.PI * 2;
                            points.push({
                                x: centerX + cx + Math.cos(angle) * r,
                                y: centerY + cy + Math.sin(angle) * r
                            });
                        }
                    }
                };

                const addArc = (cx: number, cy: number, rPath: number, startAngle: number, endAngle: number, density: number) => {
                    const len = Math.abs(endAngle - startAngle) * rPath;
                    const count = Math.max(2, Math.floor(len * density));
                    for (let i = 0; i <= count; i++) {
                        const t = startAngle + (endAngle - startAngle) * (i / count);
                        const bx = cx + Math.cos(t) * rPath;
                        const by = cy + Math.sin(t) * rPath;
                        for (let j = 0; j < 18; j++) {
                            const r = Math.sqrt(Math.random()) * 45; // Grosor en arcos idéntico
                            const angle = Math.random() * Math.PI * 2;
                            points.push({
                                x: centerX + bx + Math.cos(angle) * r,
                                y: centerY + by + Math.sin(angle) * r
                            });
                        }
                    }
                };

                const size = 190; // Corazón un poco más grande
                const d = 0.6; // density
                const offsetY = 25; // Desplazado hacia abajo para estar más centrado con el texto

                // Geometría clásica del corazón (bordes inferiores rectos, V perfecta)
                addLine(0, size + offsetY, -size, 0 + offsetY, d);
                addLine(size, 0 + offsetY, 0, size + offsetY, d);

                // Arcos superiores semicirculares perfectos apuntando hacia arriba y hacia afuera
                const R = Math.sqrt(2) * size / 2;
                addArc(-size / 2, -size / 2 + offsetY, R, -5 * Math.PI / 4, -Math.PI / 4, d); // Izquierdo
                addArc(size / 2, -size / 2 + offsetY, R, -3 * Math.PI / 4, Math.PI / 4, d);  // Derecho
            } else if (type === 'brackets') {
                const addLine = (x1: number, y1: number, x2: number, y2: number, density: number) => {
                    const dx = x2 - x1, dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const count = Math.max(2, Math.floor(len * density));
                    for (let i = 0; i <= count; i++) {
                        // Trazo grueso en la línea idéntico al pincel del corazón
                        for (let j = 0; j < 6; j++) {
                            const r = Math.sqrt(Math.random()) * 40; // Cepillo circular sólido
                            const angle = Math.random() * Math.PI * 2;
                            points.push({
                                x: x1 + dx * (i / count) + Math.cos(angle) * r,
                                y: y1 + dy * (i / count) + Math.sin(angle) * r
                            });
                        }
                    }
                };

                // Hacer los corchetes grandes para igualar a las esferas
                const size = 200, width = 100, th = 50, d = 0.5;

                // Left Bracket
                const lx = centerX - size + 20;
                addLine(lx + width, centerY - size - th, lx - th, centerY - size - th, d);
                addLine(lx - th, centerY - size - th, lx - th, centerY - 60, d);
                addLine(lx - th, centerY - 60, lx - th - 40, centerY - 20, d);
                addLine(lx - th - 40, centerY - 20, lx - th - 40, centerY + 20, d);
                addLine(lx - th - 40, centerY + 20, lx - th, centerY + 60, d);
                addLine(lx - th, centerY + 60, lx - th, centerY + size + th, d);
                addLine(lx - th, centerY + size + th, lx + width, centerY + size + th, d);
                addLine(lx + width, centerY - size, lx, centerY - size, d);
                addLine(lx, centerY - size, lx, centerY - 40, d);
                addLine(lx, centerY - 40, lx - 30, centerY - 10, d);
                addLine(lx - 30, centerY - 10, lx - 30, centerY + 10, d);
                addLine(lx - 30, centerY + 10, lx, centerY + 40, d);
                addLine(lx, centerY + 40, lx, centerY + size, d);
                addLine(lx, centerY + size, lx + width, centerY + size, d);
                addLine(lx + width, centerY - size - th, lx + width, centerY - size, d);
                addLine(lx + width, centerY + size + th, lx + width, centerY + size, d);

                // Right Bracket
                const rx = centerX + size - 20;
                addLine(rx - width, centerY - size - th, rx + th, centerY - size - th, d);
                addLine(rx + th, centerY - size - th, rx + th, centerY - 60, d);
                addLine(rx + th, centerY - 60, rx + th + 40, centerY - 20, d);
                addLine(rx + th + 40, centerY - 20, rx + th + 40, centerY + 20, d);
                addLine(rx + th + 40, centerY + 20, rx + th, centerY + 60, d);
                addLine(rx + th, centerY + 60, rx + th, centerY + size + th, d);
                addLine(rx + th, centerY + size + th, rx - width, centerY + size + th, d);
                addLine(rx - width, centerY - size, rx, centerY - size, d);
                addLine(rx, centerY - size, rx, centerY - 40, d);
                addLine(rx, centerY - 40, rx + 30, centerY - 10, d);
                addLine(rx + 30, centerY - 10, rx + 30, centerY + 10, d);
                addLine(rx + 30, centerY + 10, rx, centerY + 40, d);
                addLine(rx, centerY + 40, rx, centerY + size, d);
                addLine(rx, centerY + size, rx - width, centerY + size, d);
                addLine(rx - width, centerY - size - th, rx - width, centerY - size, d);
                addLine(rx - width, centerY + size + th, rx - width, centerY + size, d);

            } else if (type === 'circle') {
                const hexRadius = 200; // Distancia desde el centro reducida
                const sphereRadius = 70; // Esferas más pequeñas

                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 2;
                    const bx = centerX + Math.cos(angle) * hexRadius;
                    const by = centerY + Math.sin(angle) * hexRadius;

                    for (let t = 0; t < Math.PI * 2; t += 0.05) {
                        // Trazo grueso circular para las esferas
                        for (let j = 0; j < 4; j++) {
                            const r = Math.sqrt(Math.random()) * 30; // Grosor sólido aumentado
                            const jitterAngle = Math.random() * Math.PI * 2;
                            const jx = Math.cos(jitterAngle) * r;
                            const jy = Math.sin(jitterAngle) * r;

                            // Exterior
                            points.push({ x: bx + Math.cos(t) * sphereRadius + jx, y: by + Math.sin(t) * sphereRadius + jy });
                            // Longitud
                            points.push({ x: bx + Math.cos(t) * (sphereRadius * 0.4) + jx, y: by + Math.sin(t) * sphereRadius + jy });
                            // Latitud
                            points.push({ x: bx + Math.cos(t) * sphereRadius + jx, y: by + Math.sin(t) * (sphereRadius * 0.3) + jy });
                        }
                    }
                }
            }
            return points;
        };

        class Particle {
            x: number;
            y: number;
            baseX: number;
            baseY: number;
            targetX: number;
            targetY: number;
            size: number;
            color: string;
            opacity: number;
            fixedId: number;
            vx: number;
            vy: number;
            jitterX: number;
            jitterY: number;

            constructor(w: number, h: number, id: number) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                // Distribute base pos across the whole screen initially
                this.baseX = this.x;
                this.baseY = this.y;
                this.targetX = this.x;
                this.targetY = this.y;
                this.fixedId = id;
                this.size = Math.random() * 1.0 + 0.3; // White stardust
                this.color = '#ffffff';
                this.opacity = Math.random() * 0.2 + 0.05;
                this.vx = (Math.random() - 0.5) * 0.3;
                this.vy = (Math.random() - 0.5) * 0.3;
                this.jitterX = (Math.random() - 0.5) * 15;
                this.jitterY = (Math.random() - 0.5) * 15;
            }

            draw() {
                if (!ctx) return;
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update(targetPoints: { x: number, y: number }[], totalParticles: number) {
                if (activeShape && targetPoints.length > 0) {
                    // Mapeo perfecto: Distribuye todas las partículas equitativamente sobre todos los puntos del target arrays
                    const pointIdx = Math.floor((this.fixedId / totalParticles) * targetPoints.length) % targetPoints.length;
                    const target = targetPoints[pointIdx];
                    this.targetX = target.x + this.jitterX;
                    this.targetY = target.y + this.jitterY;
                    this.opacity = Math.random() * 0.4 + 0.3; // Más brillantes cuando forman figuras

                    // Velocidad de agrupamiento 
                    this.x += (this.targetX - this.x) * 0.05;
                    this.y += (this.targetY - this.y) * 0.05;
                } else {
                    this.targetX = this.baseX;
                    this.targetY = this.baseY;
                    this.opacity = Math.random() * 0.15 + 0.05;
                    this.baseX += this.vx;
                    this.baseY += this.vy;

                    // Bounce off walls for base positions
                    if (this.baseX < 0 || this.baseX > canvas!.width) this.vx *= -1;
                    if (this.baseY < 0 || this.baseY > canvas!.height) this.vy *= -1;

                    // Vuelta calmada
                    this.x += (this.targetX - this.x) * 0.02;
                    this.y += (this.targetY - this.y) * 0.02;
                }
            }
        }

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            init();
        };

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height, i));
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const targets = generateShapePoints(canvas.width, canvas.height, activeShape);
            particles.forEach(p => {
                p.update(targets, particleCount);
                p.draw();
            });
            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [activeShape, mousePos, isVisible]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

export function BracketsSection() {
    const [hoveredSide, setHoveredSide] = useState<string | null>(null);
    const [centerPos, setCenterPos] = useState<{ x: number, y: number } | null>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const isVisible = useInView(sectionRef, { amount: 0.1 });

    const categories = [
        { 
            key: 'customers', 
            shape: 'heart' as ShapeType, 
            style: 'bg-zinc-800 text-white',
            badge: "Global Customers",
            title: "Premium Access",
            subtitle: "Access to abundance and the premium treatment you deserve.",
            btn: "Join the elite"
        },
        { 
            key: 'builders', 
            shape: 'brackets' as ShapeType, 
            style: 'bg-white text-black',
            badge: "Builders and Freelancers",
            title: "Elite Infrastructure",
            subtitle: "Your talent deserves an infrastructure at its level.",
            btn: "Start building"
        },
        { 
            key: 'merchants', 
            shape: 'circle' as ShapeType, 
            style: 'bg-white/10 text-white border border-white/10',
            badge: "Merchants and Corporations",
            title: "Global Market",
            subtitle: "Transform how your company interacts with the global market.",
            btn: "Scale now"
        }
    ];

    // Buscamos la forma activa dependiendo del hover
    const activeShape = hoveredSide ? categories.find(c => c.key === hoveredSide)?.shape || null : null;

    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, key: string) => {
        setHoveredSide(key);
        if (sectionRef.current) {
            const sectionRect = sectionRef.current.getBoundingClientRect();
            const childRect = e.currentTarget.getBoundingClientRect();
            setCenterPos({
                x: childRect.left - sectionRect.left + (childRect.width / 2),
                y: childRect.top - sectionRect.top + (childRect.height / 2)
            });
        }
    };

    return (
        <section
            ref={sectionRef}
            className="py-32 md:py-48 px-6 md:px-16 bg-black border-t border-white/5 relative overflow-hidden min-h-[600px] flex items-center"
            onMouseLeave={() => {
                setHoveredSide(null);
                setCenterPos(null);
            }}
        >

            {/* Canvas global de fondo para TODA la sección */}
            <GlobalParticles activeShape={activeShape} mousePos={centerPos} isVisible={isVisible} />

            <motion.div 
                initial={{ opacity: 0, scale: 0.85, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 relative z-10 w-full"
            >
                {categories.map((cat) => (
                    <div
                        key={cat.key}
                        onMouseEnter={(e) => handleMouseEnter(e, cat.key)}
                        className="group flex flex-col items-center justify-center text-center py-12 px-6 transition-all duration-500 cursor-pointer"
                    >
                        <div className={`space-y-6 transition-opacity duration-500 ${hoveredSide && hoveredSide !== cat.key ? 'opacity-30' : 'opacity-100'}`}>
                            <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-medium font-sans block">
                                {cat.badge}
                            </span>
                            <h3 className="text-2xl md:text-3xl font-normal text-white tracking-tight">
                                {cat.title}
                            </h3>
                            <p className="text-zinc-500 text-xs md:text-sm max-w-[240px] mx-auto leading-relaxed font-sans mt-4">
                                {cat.subtitle}
                            </p>
                            <div className="pt-4">
                                <button 
                                    suppressHydrationWarning
                                    className={`${cat.style} px-7 py-2.5 rounded-full text-[11px] font-medium transition-all duration-300 hover:scale-105 active:scale-95 font-sans pointer-events-auto`}>
                                    {cat.btn}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>
        </section>
    );
}

