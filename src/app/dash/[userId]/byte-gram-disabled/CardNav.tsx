"use client"

import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"

export type CardNavLink = {
  label: string
  href?: string
  ariaLabel?: string
}

export type CardNavItem = {
  label: string
  bgColor: string
  textColor: string
  links: CardNavLink[]
}

export interface CardNavProps {
  logo: string
  logoAlt?: string
  items: CardNavItem[]
  className?: string
  ease?: string
  baseColor?: string
  menuColor?: string
  buttonBgColor?: string
  buttonTextColor?: string
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  className = "",
  ease = "cubic-bezier(.2,.9,.3,1)",
  baseColor = "#0b0b0b",
  menuColor = "#e5e7eb",
  buttonBgColor = "#0ea5e9",
  buttonTextColor = "#000",
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const timeoutsRef = useRef<number[]>([])

  const calculateHeight = () => {
    const navEl = navRef.current
    if (!navEl) return 260
    const isMobile = window.matchMedia("(max-width: 768px)").matches
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement
      if (contentEl) {
        const prev = { vis: contentEl.style.visibility, pe: contentEl.style.pointerEvents, pos: contentEl.style.position, h: contentEl.style.height }
        contentEl.style.visibility = "visible"; contentEl.style.pointerEvents = "auto"; contentEl.style.position = "static"; contentEl.style.height = "auto"
        contentEl.offsetHeight
        const topBar = 60; const padding = 16; const contentHeight = contentEl.scrollHeight
        contentEl.style.visibility = prev.vis; contentEl.style.pointerEvents = prev.pe; contentEl.style.position = prev.pos; contentEl.style.height = prev.h
        return topBar + contentHeight + padding
      }
    }
    return 260
  }

  useLayoutEffect(() => {
    const navEl = navRef.current
    if (navEl) {
      navEl.style.height = "60px"
      navEl.style.overflow = "hidden"
      navEl.style.transition = "height 320ms cubic-bezier(.2,.9,.3,1)"
    }
    return () => { timeoutsRef.current.forEach((t) => window.clearTimeout(t)); timeoutsRef.current = [] }
  }, [ease, JSON.stringify(items)])

  useLayoutEffect(() => {
    const handleResize = () => {
      const navEl = navRef.current
      if (!navEl) return
      navEl.style.height = isExpanded ? `${calculateHeight()}px` : "60px"
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isExpanded])

  const toggleMenu = () => {
    const navEl = navRef.current
    if (!navEl) return
    const next = !isExpanded
    setIsHamburgerOpen(next)
    setIsExpanded(next)
    navEl.style.height = next ? `${calculateHeight()}px` : "60px"
    if (next) {
      cardsRef.current.forEach((el, i) => {
        if (!el) return
        el.style.opacity = "0"; el.style.transform = "translateY(12px)"; el.style.transition = "opacity 300ms, transform 300ms"
        const t = window.setTimeout(() => { el.style.opacity = "1"; el.style.transform = "translateY(0)" }, 80 * i + 80)
        timeoutsRef.current.push(t)
      })
    }
  }

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => { if (el) cardsRef.current[i] = el }

  return (
    <div className={`absolute left-1/2 -translate-x-1/2 w-[92%] max-w-[900px] z-[99] top-6 md:top-8 ${className}`}>
      <nav ref={navRef} className="block h-[60px] p-0 rounded-xl relative overflow-hidden border border-white/10 bg-gradient-to-br from-black via-zinc-900 to-zinc-800" style={{ color: menuColor }}>
        <div className="absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
          <div className={`group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px]`} onClick={toggleMenu} role="button" aria-label={isExpanded ? 'Close menu' : 'Open menu'}>
            <div className={`w-[30px] h-[2px] bg-sky-400 transition duration-300 ${isHamburgerOpen ? 'translate-y-[4px] rotate-45' : ''}`} />
            <div className={`w-[30px] h-[2px] bg-sky-400 transition duration-300 ${isHamburgerOpen ? '-translate-y-[4px] -rotate-45' : ''}`} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt={logoAlt} className="h-[28px]" />
          <button type="button" className="hidden md:inline-flex border border-white/10 rounded-lg px-4 h-full font-medium bg-sky-500/90 hover:bg-sky-500 text-black">Create</button>
        </div>
        <div className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 md:flex-row md:items-end md:gap-3 ${isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`} aria-hidden={!isExpanded}>
          {(items || []).slice(0,3).map((item, idx) => (
            <div key={`${item.label}-${idx}`} className="relative flex flex-col gap-2 px-4 py-3 rounded-lg min-w-0 flex-1 h-auto md:h-full border border-white/10" ref={setCardRef(idx)} style={{ backgroundColor: item.bgColor, color: item.textColor }}>
              <div className="tracking-tight text-[18px] md:text-[20px]">{item.label}</div>
              <div className="mt-auto flex flex-col gap-1">
                {item.links?.map((lnk, i) => (
                  <a key={`${lnk.label}-${i}`} href={lnk.href || '#'} aria-label={lnk.ariaLabel || lnk.label} className="inline-flex items-center gap-1.5 hover:opacity-80">
                    <ArrowUpRight className="h-4 w-4" />{lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default CardNav
