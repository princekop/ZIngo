"use client"

import React from "react"

type ShinyButtonProps = {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  type?: "button" | "submit" | "reset"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  title?: string
  disabled?: boolean
}

const sizeMap: Record<NonNullable<ShinyButtonProps["size"]>, { pad: string; text: string; shardTopH: string; shardMidH: string }> = {
  xs: { pad: "py-1.5 px-3", text: "text-[11px]", shardTopH: "h-[14%]", shardMidH: "h-[40%]" },
  sm: { pad: "py-2 px-3.5", text: "text-xs", shardTopH: "h-[16%]", shardMidH: "h-[50%]" },
  md: { pad: "py-3 px-5", text: "text-sm", shardTopH: "h-[18%]", shardMidH: "h-[60%]" },
  lg: { pad: "py-4 px-6", text: "text-base", shardTopH: "h-[20%]", shardMidH: "h-[70%]" },
  xl: { pad: "py-5 px-8", text: "text-lg", shardTopH: "h-[22%]", shardMidH: "h-[80%]" },
}

export default function ShinyButton({
  children,
  onClick,
  className = "",
  type = "button",
  size = "md",
  title,
  disabled,
}: ShinyButtonProps) {
  const s = sizeMap[size]
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        // container
        "relative cursor-pointer inline-flex justify-center items-center select-none",
        s.pad,
        s.text,
        "uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group",
        "outline-offset-4 focus:outline focus:outline-2 focus:outline-white focus:outline-offset-4 overflow-hidden",
        disabled ? "opacity-50 pointer-events-none" : "hover:scale-[1.02] active:scale-[0.99]",
        // colors
        "text-white",
        className,
      ].join(" ")}
    >
      <span className="relative z-20 inline-flex items-center gap-2">{children}</span>
      {/* shimmer */}
      <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-white/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
      {/* corner shards */}
      <span className={`w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute ${s.shardTopH} rounded-tl-lg border-l-2 border-t-2 top-0 left-0`} />
      <span className={`w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute group-hover:h-[90%] ${s.shardMidH} rounded-tr-lg border-r-2 border-t-2 top-0 right-0`} />
      <span className={`w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute ${s.shardMidH} group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0`} />
      <span className={`w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#D4EDF9] absolute ${s.shardTopH} rounded-br-lg border-r-2 border-b-2 right-0 bottom-0`} />
    </button>
  )
}
