"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from 'react';

type ImageItem =
  | string
  | {
      src: string;
      alt?: string;
      price?: number;
      description?: string;
      slug?: string;
    };

type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  price?: number;
  description?: string;
  slug?: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

const DEFAULT_IMAGES: ImageItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art'
  }
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 16
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool: ImageItem[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-2, 0, 2];
  const oddYs = [-1, 1];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) return [];

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') return { src: image, alt: '', price: 0, description: '', slug: '' };
    return { 
      src: image.src || '', 
      alt: image.alt || '',
      price: image.price || 0,
      description: image.description || '',
      slug: image.slug || ''
    };
  });

  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
    price: usedImages[i].price,
    description: usedImages[i].description,
    slug: usedImages[i].slug,
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#120F17',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '400px',
  openedImageHeight = '400px',
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const lastDragEndAt = useRef(0);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);

  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);

  const applyTransform = (xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
      const minDim = Math.min(w, h), maxDim = Math.max(w, h), aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case 'min': basis = minDim; break;
        case 'max': basis = maxDim; break;
        case 'width': basis = w; break;
        case 'height': basis = h; break;
        default: basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      radius = Math.min(radius, h * 1.35);
      radius = clamp(radius, minRadius, maxRadius);
      
      root.style.setProperty('--radius', `${Math.round(radius)}px`);
      root.style.setProperty('--viewer-pad', `${Math.max(8, Math.round(minDim * padFactor))}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, fitBasis, minRadius, maxRadius, padFactor, overlayBlurColor, grayscale, imageBorderRadius, openedImageBorderRadius]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(() => {
    const d = clamp(dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const step = () => {
      velocityRef.current.x *= frictionMul;
      velocityRef.current.y *= frictionMul;
      if (Math.abs(velocityRef.current.x) < 0.01 && Math.abs(velocityRef.current.y) < 0.01) {
        inertiaRAF.current = null;
        return;
      }
      const nextX = clamp(rotationRef.current.x - velocityRef.current.y / 15, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotationRef.current.y + velocityRef.current.x / 15);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF.current = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF.current = requestAnimationFrame(step);
  }, [dragDampening, maxVerticalRotationDeg, stopInertia]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (focusedElRef.current || openingRef.current) return;
    stopInertia();
    draggingRef.current = true;
    movedRef.current = false;
    startRotRef.current = { ...rotationRef.current };
    startPosRef.current = { x: e.clientX, y: e.clientY };
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = performance.now();
    velocityRef.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !startPosRef.current) return;
    const dxTotal = e.clientX - startPosRef.current.x;
    const dyTotal = e.clientY - startPosRef.current.y;
    if (!movedRef.current && dxTotal * dxTotal + dyTotal * dyTotal > 16) movedRef.current = true;

    const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
    const nextY = startRotRef.current.y + dxTotal / dragSensitivity;
    rotationRef.current = { x: nextX, y: nextY };
    applyTransform(nextX, nextY);

    const now = performance.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current.x = (e.clientX - lastPosRef.current.x) / dt * 16;
      velocityRef.current.y = (e.clientY - lastPosRef.current.y) / dt * 16;
    }
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (movedRef.current) {
      lastDragEndAt.current = performance.now();
      startInertia();
    }
    startPosRef.current = null;
  };

  const openItemFromElement = (el: HTMLElement) => {
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    const parent = el.parentElement as HTMLElement;
    focusedElRef.current = el;
    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotationRef.current.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - rotationRef.current.x;
    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
    
    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference opacity-0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);
    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef.current?.getBoundingClientRect();
    const frameR = frameRef.current?.getBoundingClientRect();

    if (!mainR || !frameR) {
      openingRef.current = false;
      focusedElRef.current = null;
      parent.removeChild(refDiv);
      return;
    }

    originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
    el.style.visibility = 'hidden';
    
    // Get product data from the item
    const itemIndex = parseInt(parent.dataset.index || "0");
    const item = items[itemIndex];

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.cssText = `position:absolute; left:${frameR.left - mainR.left}px; top:${frameR.top - mainR.top}px; width:${frameR.width}px; height:${frameR.height}px; opacity:0; z-index:30; will-change:transform,opacity; transform-origin:top left; transition:transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease; border-radius:${openedImageBorderRadius}; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.5); background:#000;`;
    
    const img = document.createElement('img');
    img.src = item.src;
    img.style.cssText = `width:100%; height:100%; object-fit:cover; transition: transform 0.5s ease; filter:${grayscale ? 'grayscale(1)' : 'none'};`;
    overlay.appendChild(img);

    // Info Panel (Glassmorphism)
    if (item.alt || item.price) {
      const info = document.createElement('div');
      info.className = 'enlarge-info';
      info.style.cssText = `position:absolute; bottom:0; left:0; right:0; padding:2.5rem 2rem 2rem; background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%); color:white; opacity:0; transform:translateY(20px); transition:opacity 400ms 200ms ease, transform 400ms 200ms ease; display:flex; flex-direction:column; gap:0.5rem;`;
      
      const title = document.createElement('h3');
      title.innerText = item.alt;
      title.style.cssText = `font-size:1.75rem; font-weight:bold; margin:0; font-family:var(--font-display, inherit);`;
      
      const priceContainer = document.createElement('div');
      priceContainer.style.cssText = `display:flex; align-items:center; gap:0.75rem;`;
      
      const price = document.createElement('span');
      // Simple manual formatting to avoid heavy imports in pure DOM part if possible, 
      // but let's assume we can use a basic formatter or the value directly.
      price.innerText = item.price ? `${item.price.toLocaleString()} FCFA` : '';
      price.style.cssText = `font-size:1.25rem; color:#fbbf24; font-weight:600;`;
      priceContainer.appendChild(price);

      const badge = document.createElement('span');
      badge.innerText = 'En stock';
      badge.style.cssText = `font-size:0.7rem; text-transform:uppercase; letter-spacing:0.05em; background:rgba(16, 185, 129, 0.2); color:#10b981; padding:0.2rem 0.5rem; border-radius:4px; border:1px solid rgba(16, 185, 129, 0.3);`;
      priceContainer.appendChild(badge);

      const desc = document.createElement('p');
      desc.innerText = item.description || '';
      desc.style.cssText = `font-size:0.95rem; opacity:0.9; line-height:1.6; margin:0.5rem 0 1rem; max-width:90%; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;`;

      const actions = document.createElement('div');
      actions.style.cssText = `display:flex; gap:1rem; margin-top:0.5rem;`;
      
      const viewBtn = document.createElement('a');
      viewBtn.href = `/produit/${item.slug}`;
      viewBtn.innerText = 'Voir le produit';
      viewBtn.style.cssText = `background:white; color:black; padding:0.6rem 1.25rem; border-radius:99px; font-size:0.875rem; font-weight:600; text-decoration:none; transition:transform 0.2s;`;
      viewBtn.onmouseenter = () => viewBtn.style.transform = 'scale(1.05)';
      viewBtn.onmouseleave = () => viewBtn.style.transform = 'scale(1)';

      actions.appendChild(viewBtn);

      info.appendChild(title);
      info.appendChild(priceContainer);
      info.appendChild(desc);
      info.appendChild(actions);
      overlay.appendChild(info);
      
      // Add a close button
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = `position:absolute; top:1.5rem; right:1.5rem; width:2.5rem; height:2.5rem; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; font-size:1.2rem; cursor:pointer; backdrop-filter:blur(10px); z-index:40; transition:background 0.2s;`;
      closeBtn.onmouseenter = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
      closeBtn.onmouseleave = () => closeBtn.style.background = 'rgba(255,255,255,0.1)';
      overlay.appendChild(closeBtn);
    }

    viewerRef.current!.appendChild(overlay);
    
    const tx0 = tileR.left - frameR.left, ty0 = tileR.top - frameR.top;
    const sx0 = tileR.width / frameR.width, sy0 = tileR.height / frameR.height;
    overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${sx0}, ${sy0})`;
    
    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      const info = overlay.querySelector('.enlarge-info') as HTMLElement;
      if (info) {
        info.style.opacity = '1';
        info.style.transform = 'translateY(0)';
      }
      rootRef.current?.setAttribute('data-enlarging', 'true');
    }, 16);
  };

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement as HTMLElement;
      const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement | null;
      if (!overlay) return;
      const refDiv = parent.querySelector('.item__image--reference') as HTMLElement | null;
      overlay.remove();
      if (refDiv) refDiv.remove();
      parent.style.setProperty('--rot-y-delta', `0deg`);
      parent.style.setProperty('--rot-x-delta', `0deg`);
      el.style.visibility = '';
      focusedElRef.current = null;
      rootRef.current?.removeAttribute('data-enlarging');
      openingRef.current = false;
    };
    scrim.addEventListener('click', close);
    return () => scrim.removeEventListener('click', close);
  }, []);

  const cssStyles = `
    .sphere-root { --radius: 600px; --viewer-pad: 72px; --circ: calc(var(--radius) * 3.14); --rot-y: calc((360deg / var(--segments-x)) / 2); --rot-x: calc((360deg / var(--segments-y)) / 2); --item-width: calc(var(--circ) / var(--segments-x)); --item-height: calc(var(--circ) / var(--segments-y)); }
    .sphere-root * { box-sizing: border-box; }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    .stage { width: 100%; height: 100%; display: grid; place-items: center; position: absolute; inset: 0; margin: auto; perspective: calc(var(--radius) * 2); perspective-origin: 50% 50%; }
    .sphere { transform: translateZ(calc(var(--radius) * -1)); will-change: transform; position: absolute; }
    .sphere-item { width: calc(var(--item-width) * var(--item-size-x)); height: calc(var(--item-height) * var(--item-size-y)); position: absolute; top: -999px; bottom: -999px; left: -999px; right: -999px; margin: auto; transform-origin: 50% 50%; backface-visibility: hidden; transition: transform 300ms; transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) translateZ(var(--radius)); }
    .sphere-root[data-enlarging="true"] .scrim { opacity: 1 !important; pointer-events: all !important; }
    .item__image { position: absolute; inset: 10px; border-radius: var(--tile-radius, 12px); overflow: hidden; cursor: pointer; backface-visibility: hidden; transition: transform 300ms; transform: translateZ(0); }
    .item__image--reference { position: absolute; inset: 10px; pointer-events: none; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div ref={rootRef} className="sphere-root relative w-full h-full" style={{ ['--segments-x' as any]: segments, ['--segments-y' as any]: segments } as any}>
        <main
          ref={mainRef}
          className="absolute inset-0 grid place-items-center overflow-hidden select-none bg-transparent"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => (
                <div key={`${it.x},${it.y},${i}`} className="sphere-item absolute m-auto" data-index={i} data-src={it.src} data-offset-x={it.x} data-offset-y={it.y} data-size-x={it.sizeX} data-size-y={it.sizeY} style={{ ['--offset-x' as any]: it.x, ['--offset-y' as any]: it.y, ['--item-size-x' as any]: it.sizeX, ['--item-size-y' as any]: it.sizeY } as any}>
                  <div className="item__image absolute block overflow-hidden cursor-pointer bg-gray-200 transition-transform duration-300 hover:scale-105" onClick={e => { if (!movedRef.current && performance.now() - lastDragEndAt.current > 80) openItemFromElement(e.currentTarget as HTMLElement); }} style={{ inset: '10px', borderRadius: `var(--tile-radius, ${imageBorderRadius})` }}>
                    <img
                      src={it.src}
                      draggable={false}
                      alt={it.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover pointer-events-none"
                      style={{ filter: `var(--image-filter, ${grayscale ? 'grayscale(1)' : 'none'})` }}
                      onError={(event) => {
                        event.currentTarget.src =
                          "https://images.unsplash.com/photo-1586892477838-2b96e85e0f96?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 m-auto z-[3] pointer-events-none" style={{ backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)` }} />
          <div className="absolute inset-0 m-auto z-[3] pointer-events-none" style={{ maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`, backdropFilter: 'blur(3px)' }} />
          <div ref={viewerRef} className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center" style={{ padding: 'var(--viewer-pad)' }}>
            <div ref={scrimRef} className="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-500" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(3px)' }} />
            <div ref={frameRef} className="viewer-frame h-full aspect-square flex" style={{ borderRadius: `var(--enlarge-radius, ${openedImageBorderRadius})` }} />
          </div>
        </main>
      </div>
    </>
  );
}
