"use client"

import { useState, useEffect } from "react"

export function isMobile(): boolean {
  if (typeof window === "undefined") return false

  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)")
    setMobile(mediaQuery.matches)

    const handleResize = (e: MediaQueryListEvent) => {
      setMobile(e.matches)
    }

    mediaQuery.addEventListener("change", handleResize)

    return () => {
      mediaQuery.removeEventListener("change", handleResize)
    }
  }, [])

  return mobile
}

