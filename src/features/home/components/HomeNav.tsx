'use client';

import { ChevronDown, Globe, Menu, X, Users, Cpu, Compass, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import { ECOSYSTEM_ITEMS } from '@/features/home/lib/ecosystem-items';
import { NAV_GROUPS, type NavGroup, type NavLink } from '@/features/home/lib/nav-config';

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const panelVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: EASE, staggerChildren: 0.04, delayChildren: 0.04 },
  },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.14 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
};

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]';

const GITHUB_PATH =
  'M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z';

/** Internal routes/anchors use next/link; external ones open in a new tab. */
function SmartLink({
  link,
  className,
  onNavigate,
  children,
}: {
  link: NavLink;
  className?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onNavigate}>
        {children}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}

function EcosystemIcon({ icon, size }: { icon: 'users' | 'cpu' | 'compass' | 'github'; size: number }) {
  if (icon === 'users') return <Users size={size} strokeWidth={1.8} />;
  if (icon === 'cpu') return <Cpu size={size} strokeWidth={1.8} />;
  if (icon === 'compass') return <Compass size={size} strokeWidth={1.8} />;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d={GITHUB_PATH} />
    </svg>
  );
}

function DropdownTrigger({
  label,
  isOpen,
  onToggle,
  onEnter,
  panelId,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  onEnter: () => void;
  panelId: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      aria-haspopup="true"
      aria-expanded={isOpen}
      aria-controls={panelId}
      className={`flex items-center gap-1 py-2 transition-colors rounded-md ${FOCUS_RING} ${isOpen ? 'text-white' : 'hover:text-white'}`}
    >
      {label}
      <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
}

function GroupPanel({
  group,
  align,
  onNavigate,
}: {
  group: NavGroup;
  align: 'left' | 'right';
  onNavigate: () => void;
}) {
  const multi = group.columns.length > 1;
  return (
    <motion.div
      id={`nav-panel-${group.key}`}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ transformOrigin: align === 'right' ? 'top right' : 'top left' }}
      className={`absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-1 ${group.panelWidth} rounded-2xl border border-white/10 bg-black/95 p-4 shadow-xl backdrop-blur-xl`}
    >
      <div className={multi ? 'grid grid-cols-2 gap-4' : 'grid gap-1'}>
        {group.columns.map((col, ci) => (
          <div key={ci} className={multi ? 'space-y-2' : 'grid gap-1'}>
            {col.title && (
              <motion.div variants={itemVariants} className="text-xs font-normal text-gray-500 uppercase tracking-wider">
                {col.title}
              </motion.div>
            )}
            <div className="grid gap-1">
              {col.links.map((link) => (
                <motion.div key={link.name} variants={itemVariants}>
                  <SmartLink
                    link={link}
                    onNavigate={onNavigate}
                    className={`group block rounded-lg p-2 hover:bg-white/5 transition-colors ${FOCUS_RING}`}
                  >
                    <div
                      className={`${link.desc ? 'text-sm font-medium text-white' : 'text-sm text-gray-300 group-hover:text-white'} transition-colors ${link.desc ? 'group-hover:text-blue-400' : ''} flex items-center gap-1.5`}
                    >
                      {link.name}
                      {link.external && (
                        <ExternalLink size={11} className="opacity-0 -translate-x-1 transition-all group-hover:opacity-70 group-hover:translate-x-0" />
                      )}
                    </div>
                    {link.desc && <div className="text-xs text-gray-400 mt-0.5">{link.desc}</div>}
                  </SmartLink>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EcosystemMegaMenu({ onEnter, onLeave, onNavigate }: { onEnter: () => void; onLeave: () => void; onNavigate: () => void }) {
  return (
    <motion.div
      id="nav-panel-ecosystem"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ transformOrigin: 'top center' }}
      className="hidden md:block absolute top-full left-0 w-full bg-black/95 border-b border-white/10 shadow-2xl backdrop-blur-2xl max-h-[calc(100vh-64px)] overflow-y-auto"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col lg:flex-row gap-8">
        <motion.div variants={itemVariants} className="w-full lg:w-72 xl:w-80 shrink-0 pr-0 lg:pr-8 lg:border-r border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-medium text-white tracking-tight mb-2 font-sans">Sterling Ecosystem</h3>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-body">
              Explore how Sterling is transforming real-world liquidity through advanced blockchain technology.
            </p>
          </div>
          <div className="mt-8 pt-2">
            <a
              href="https://luxorstandard.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className={`text-sky-400 hover:text-sky-300 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors group rounded ${FOCUS_RING}`}
            >
              <span>VIEW MORE DETAILS</span>
              <ExternalLink size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </motion.div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5">
          {ECOSYSTEM_ITEMS.map((item) => (
            <motion.a
              key={item.title}
              variants={itemVariants}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              onClick={onNavigate}
              className={`flex items-center gap-3.5 p-2 rounded-xl transition-all hover:bg-white/[0.05] border border-transparent hover:border-white/10 group ${FOCUS_RING}`}
            >
              {item.image ? (
                <img src={item.image} alt="" className="w-11 h-11 rounded-xl object-contain shrink-0 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <div className="w-11 h-11 flex items-center justify-center shrink-0 text-sky-400 group-hover:text-sky-300 transition-colors">
                  {item.icon && <EcosystemIcon icon={item.icon} size={26} />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold text-white/90 leading-tight uppercase tracking-wider group-hover:text-white transition-colors">
                  {item.title}
                </div>
                {item.desc && <div className="text-[11px] text-gray-400 mt-0.5 leading-tight font-body">{item.desc}</div>}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MobileAccordion({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-white/5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex items-center justify-between w-full hover:text-white transition-colors py-2 rounded ${FOCUS_RING}`}
      >
        <span>{label}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HomeNav() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const openDropdown = useCallback((name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  }, []);

  const scheduleClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 200);
  }, []);

  const closeAll = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, []);

  const toggleDropdown = (name: string) => {
    clearTimer();
    setActiveDropdown((cur) => (cur === name ? null : name));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [closeAll]);

  const group = (key: string) => NAV_GROUPS.find((g) => g.key === key)!;

  const renderGroup = (key: string, align: 'left' | 'right' = 'left') => {
    const g = group(key);
    return (
      <div className="relative" onMouseEnter={() => openDropdown(g.key)}>
        <DropdownTrigger
          label={g.label}
          isOpen={activeDropdown === g.key}
          onToggle={() => toggleDropdown(g.key)}
          onEnter={() => openDropdown(g.key)}
          panelId={`nav-panel-${g.key}`}
        />
        <AnimatePresence>
          {activeDropdown === g.key && <GroupPanel group={g} align={align} onNavigate={closeAll} />}
        </AnimatePresence>
      </div>
    );
  };

  const navOpaque = activeDropdown !== null || mobileMenuOpen;

  return (
    <>
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.25, duration: 0.8 }}
        aria-label="Main"
        className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          navOpaque ? 'bg-black/95 border-white/10' : scrolled ? 'bg-black/70 border-white/10 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.8)]' : 'bg-transparent border-white/5'
        }`}
        onMouseLeave={scheduleClose}
      >
        <div className={`flex items-center justify-between px-8 transition-[padding] duration-300 ${scrolled ? 'py-2' : 'py-3'}`}>
          <div className="flex items-center gap-12">
            <Link href="/" className={`text-xl font-normal tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity rounded ${FOCUS_RING}`}>
              <img
                src="/brand/sterling-logo.png"
                alt=""
                className="h-10 w-10 object-contain"
              />
              <span>Sterling</span>
            </Link>

            <div className="hidden md:flex gap-6 text-sm font-normal text-gray-400 items-center">
              {renderGroup('products')}

              <div className="relative" onMouseEnter={() => openDropdown('ecosystem')}>
                <DropdownTrigger
                  label="Ecosystem"
                  isOpen={activeDropdown === 'ecosystem'}
                  onToggle={() => toggleDropdown('ecosystem')}
                  onEnter={() => openDropdown('ecosystem')}
                  panelId="nav-panel-ecosystem"
                />
              </div>

              {renderGroup('solutions')}
              {renderGroup('developers')}

              {renderGroup('resources', 'right')}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <button type="button" aria-label="Language" className={`text-gray-400 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full ${FOCUS_RING}`}>
                <Globe size={18} />
              </button>

              <Link href="/login" className={`rounded-full ${FOCUS_RING}`}>
                <span className="inline-block px-9 py-1 text-sm font-normal text-white bg-transparent border border-white/20 rounded-full hover:bg-white/5 hover:border-white/40 transition-colors font-sans">
                  Sign In
                </span>
              </Link>

              <Link href="/login?register=true" className={`rounded-full ${FOCUS_RING}`}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block px-9 py-1 text-sm font-normal bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-full transition-colors shadow-lg shadow-blue-500/20 font-sans"
                >
                  Sign Up
                </motion.span>
              </Link>
            </div>

            <button
              type="button"
              className={`md:hidden text-gray-400 hover:text-white transition-colors p-2 flex items-center justify-center rounded-full ${FOCUS_RING}`}
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileMenuOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeDropdown === 'ecosystem' && (
            <EcosystemMegaMenu onEnter={() => openDropdown('ecosystem')} onLeave={scheduleClose} onNavigate={closeAll} />
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed inset-x-0 top-[60px] bottom-0 overflow-y-auto bg-black/95 border-b border-white/10 backdrop-blur-xl z-40 md:hidden p-6 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4 text-base font-normal text-gray-300">
              {(['products', 'solutions', 'developers'] as const).map((key) => {
                const g = group(key);
                return (
                  <MobileAccordion
                    key={key}
                    label={g.label}
                    isOpen={mobileSection === key}
                    onToggle={() => setMobileSection((cur) => (cur === key ? null : key))}
                  >
                    <div className="grid gap-1 pt-1 pb-3 pl-2">
                      {g.columns.flatMap((c) => c.links).map((link) => (
                        <SmartLink
                          key={link.name}
                          link={link}
                          onNavigate={closeAll}
                          className={`block rounded-lg p-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 ${FOCUS_RING}`}
                        >
                          {link.name}
                        </SmartLink>
                      ))}
                    </div>
                  </MobileAccordion>
                );
              })}

              <MobileAccordion
                label="Ecosystem"
                isOpen={mobileSection === 'ecosystem'}
                onToggle={() => setMobileSection((cur) => (cur === 'ecosystem' ? null : 'ecosystem'))}
              >
                <div className="grid grid-cols-1 gap-2 pt-2 pb-3 pl-2 max-h-72 overflow-y-auto">
                  {ECOSYSTEM_ITEMS.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      onClick={closeAll}
                      className={`flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 text-xs text-gray-300 hover:text-white ${FOCUS_RING}`}
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="w-6 h-6 rounded-md object-contain shrink-0" />
                      ) : (
                        <span className="w-6 h-6 flex items-center justify-center text-sky-400 shrink-0">
                          {item.icon && <EcosystemIcon icon={item.icon} size={16} />}
                        </span>
                      )}
                      <span className="truncate">{item.title}</span>
                    </a>
                  ))}
                </div>
              </MobileAccordion>

              <MobileAccordion
                label={group('resources').label}
                isOpen={mobileSection === 'resources'}
                onToggle={() => setMobileSection((cur) => (cur === 'resources' ? null : 'resources'))}
              >
                <div className="grid gap-1 pt-1 pb-3 pl-2">
                  {group('resources').columns.flatMap((c) => c.links).map((link) => (
                    <SmartLink
                      key={link.name}
                      link={link}
                      onNavigate={closeAll}
                      className={`block rounded-lg p-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 ${FOCUS_RING}`}
                    >
                      {link.name}
                    </SmartLink>
                  ))}
                </div>
              </MobileAccordion>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login" onClick={closeAll} className={`w-full rounded-full ${FOCUS_RING}`}>
                <span className="block text-center w-full py-2.5 text-sm font-normal text-white bg-transparent border border-white/20 rounded-full hover:bg-white/5 transition-colors">
                  Sign In
                </span>
              </Link>
              <Link href="/login?register=true" onClick={closeAll} className={`w-full rounded-full ${FOCUS_RING}`}>
                <span className="block text-center w-full py-2.5 text-sm font-normal bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-full transition-colors shadow-lg shadow-blue-500/20">
                  Sign Up
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
