"use client"

import dynamic from "next/dynamic"

const ReelsViewer = dynamic(() => import("../components/ReelsViewer"), { ssr: false })

export default function ReelsPage() {
  return (
    <div className="flex justify-center">
      <ReelsViewer />
    </div>
  )
}
