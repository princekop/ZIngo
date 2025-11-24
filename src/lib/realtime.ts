// Real-time event emitter for live updates
type EventCallback = (data: any) => void

class RealtimeService {
  private listeners: Map<string, Set<EventCallback>> = new Map()
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(url: string) {
    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.emit(message.type, message.data)
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect(url)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }

  private reconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      setTimeout(() => this.connect(url), delay)
    }
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => {
      callback(data)
    })
  }

  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }
}

export const realtimeService = new RealtimeService()

// Hook for React components
export function useRealtime(event: string, callback: EventCallback) {
  return realtimeService.on(event, callback)
}
