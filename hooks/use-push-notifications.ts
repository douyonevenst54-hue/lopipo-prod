"use client"

import { useEffect, useState } from "react"

export function usePushNotifications(uid: string | null) {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const subscribe = async () => {
    if (!uid || !supported) return

    try {
      // Request permission
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== "granted") {
        console.log("[v0] Notification permission denied")
        return
      }

      // Register service worker
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      })

      // Get push subscription
      let subscription = await reg.pushManager.getSubscription()

      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })
      }

      // Send subscription to server
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, subscription: subscription.toJSON() }),
      })

      if (res.ok) {
        setSubscribed(true)
        console.log("[v0] Successfully subscribed to push notifications")
      }
    } catch (error) {
      console.error("[v0] Push subscription error:", error)
    }
  }

  return { supported, subscribed, permission, subscribe }
}
