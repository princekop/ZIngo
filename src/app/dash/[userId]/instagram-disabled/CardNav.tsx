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
  ease = "power3.out",
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
        const wasVisible = contentEl.style.visibility
        const wasPointerEvents = contentEl.style.pointerEvents
        const wasPosition = contentEl.style.position
        const wasHeight = contentEl.style.height

        contentEl.style.visibility = "visible"
        contentEl.style.pointerEvents = "auto"
        contentEl.style.position = "static"
        contentEl.style.height = "auto"
        contentEl.offsetHeight
        const topBar = 60
        const padding = 16
        const contentHeight = contentEl.scrollHeight

        contentEl.style.visibility = wasVisible
        contentEl.style.pointerEvents = wasPointerEvents
        contentEl.style.position = wasPosition
        contentEl.style.height = wasHeight

        return topBar + contentHeight + padding
      }
    }
    return 260
  }

  useLayoutEffect(() => {
    // initialize height
    const navEl = navRef.current
    if (navEl) {
      navEl.style.height = "60px"
      navEl.style.overflow = "hidden"
      navEl.style.transition = "height 400ms ease"
    }
    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t))
      timeoutsRef.current = []
    }
  }, [ease, JSON.stringify(items)])

  useLayoutEffect(() => {
    const handleResize = () => {
      const navEl = navRef.current
      if (!navEl) return
      if (isExpanded) {
        navEl.style.height = `${calculateHeight()}px`
      } else {
        navEl.style.height = "60px"
      }
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

    // simple stagger: fade-in cards when opening
    if (next) {
      cardsRef.current.forEach((el, i) => {
        if (!el) return
        el.style.opacity = "0"
        el.style.transform = "translateY(12px)"
        el.style.transition = "opacity 300ms ease, transform 300ms ease"
        const t = window.setTimeout(() => {
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
        }, 80 * i + 80)
        timeoutsRef.current.push(t)
      })
    }
  }

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el
  }

  return (
    <div className={`card-nav-container absolute left-1/2 -translate-x-1/2 w-[92%] max-w-[900px] z-[99] top-[1.1rem] md:top-[1.6rem] ${className}`}>
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""} block h-[60px] p-0 rounded-xl shadow-md relative overflow-hidden will-change-[height] border border-white/10 bg-gradient-to-br from-black via-zinc-900 to-zinc-800`}
        style={{ color: menuColor || "#e5e7eb" }}
      >
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            tabIndex={0}
          >
            <div className={`hamburger-line w-[30px] h-[2px] bg-sky-400 transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""} group-hover:opacity-80`} />
            <div className={`hamburger-line w-[30px] h-[2px] bg-sky-400 transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""} group-hover:opacity-80`} />
          </div>

          <div className="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt={logoAlt} className="logo h-[28px]" />
          </div>

          <button
            type="button"
            className="card-nav-cta-button hidden md:inline-flex border border-white/10 rounded-[calc(0.75rem-0.2rem)] px-4 h-full font-medium cursor-pointer transition-colors duration-300 bg-sky-500/90 hover:bg-sky-500 text-black"
          >
            Get Started
          </button>
        </div>

        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] ${isExpanded ? "visible pointer-events-auto" : "invisible pointer-events-none"} md:flex-row md:items-end md:gap-[12px]`}
          aria-hidden={!isExpanded}
        >
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%] border border-white/10"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px]">
                {item.label}
              </div>
              <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
                {item.links?.map((lnk, i) => (
                  <a
                    key={`${lnk.label}-${i}`}
                    className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-80 text-[15px] md:text-[16px]"
                    href={lnk.href || "#"}
                    aria-label={lnk.ariaLabel || lnk.label}
                  >
                    <ArrowUpRight className="nav-card-link-icon shrink-0 h-4 w-4" aria-hidden="true" />
                    {lnk.label}
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
