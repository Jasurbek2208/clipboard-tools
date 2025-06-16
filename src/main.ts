export interface CopyOptions {
  type?: 'text' | 'html' | 'link' | 'url' | 'image';
  showToast?: boolean;
  toastDuration?: number;
  secureTTL?: number; // ms
  onSuccess?: () => void;
  onError?: (error?: unknown) => void;
  appendTimestamp?: boolean;
  includeHost?: boolean;
  htmlFallbackText?: string;
  i18n?: Record<string, string>; // localization
  ariaLive?: boolean;
}

type EventName = 'copy' | 'paste' | 'cut'

class ClipboardTools {
  private liveRegion: HTMLElement | null = null;
  private listeners: Partial<Record<EventName, Function[]>> = {};

  constructor() {
    this.createLiveRegion()
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.style.position = 'absolute'
    this.liveRegion.style.width = '1px'
    this.liveRegion.style.height = '1px'
    this.liveRegion.style.overflow = 'hidden'
    this.liveRegion.style.clip = 'rect(1px,1px,1px,1px)'
    this.liveRegion.style.clipPath = 'inset(50%)'
    this.liveRegion.style.margin = '-1px'
    this.liveRegion.style.border = '0'
    document.body.appendChild(this.liveRegion)
  }

  private announce(message: string) {
    if (this.liveRegion) {
      this.liveRegion.textContent = ''
      setTimeout(() => {
        if(this.liveRegion) this.liveRegion.textContent = message
      }, 100)
    }
  }

  on(event: EventName, cb: Function) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event]!.push(cb)
  }

  off(event: EventName, cb: Function) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event]!.filter(f => f !== cb)
  }

  private emit(event: EventName, ...args: any[]) {
    this.listeners[event]?.forEach(cb => cb(...args))
  }

  private fallbackCopyText(text: string): boolean {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.top = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)
      return successful
    } catch (err) {
      console.error('Fallback copy failed:', err)
      return false
    }
  }

  async copy(value: string, options: CopyOptions = {}): Promise<void> {
    const {
      type = 'text',
      showToast = true,
      toastDuration = 3000,
      secureTTL,
      onSuccess = () => showToast && this.showToast('Copied!'),
      onError = (err) => showToast && this.showToast('Copy failed'),
      appendTimestamp = false,
      includeHost = true,
      htmlFallbackText = '',
      i18n = { copied: 'Copied!', failed: 'Copy failed' },
      ariaLive = true,
    } = options

    let dataToCopy = value

    if (type === 'link') {
      const encoded = encodeURIComponent(value)
      dataToCopy = `${includeHost ? window.location.origin : ''}${window.location.pathname}#:~:text=${encoded}`
    } else if (type === 'url') {
      dataToCopy = window.location.href
    }

    if (appendTimestamp) {
      const ts = new Date().toISOString()
      dataToCopy += `?t=${ts}`
    }

    try {
      if (type === 'html') {
        if (navigator.clipboard?.write) {
          const blob = new Blob([value], { type: 'text/html' })
          const clipboardItem = new ClipboardItem({ 'text/html': blob })
          await navigator.clipboard.write([clipboardItem])
        } else {
          this.fallbackCopyText(htmlFallbackText || value)
        }
      } else if (type === 'image') {
        // You may add image copying logic here
        throw new Error('Image copy not implemented yet')
      } else {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(dataToCopy)
        } else {
          const fallbackSuccess = this.fallbackCopyText(dataToCopy)
          if (!fallbackSuccess) throw new Error('Clipboard fallback failed')
        }
      }

      this.emit('copy', dataToCopy)
      if (ariaLive) this.announce(i18n.copied)
      onSuccess()

      if (secureTTL) {
        setTimeout(() => {
          navigator.clipboard.writeText('').catch(console.warn)
        }, secureTTL)
      }
    } catch (err) {
      this.emit('copy', null, err)
      if (ariaLive) this.announce(i18n.failed)
      console.error('Clipboard error:', err)
      onError(err)
    }
  }

  async paste(): Promise<string | null> {
    try {
      const text = await navigator.clipboard.readText()
      this.emit('paste', text)
      return text || null
    } catch (err) {
      this.emit('paste', null, err)
      console.error('Paste failed:', err)
      return null
    }
  }

  async cut(element: HTMLInputElement | HTMLTextAreaElement): Promise<boolean> {
    try {
      if (!element) throw new Error('Element not provided')
      element.select()
      const successful = document.execCommand('cut')
      this.emit('cut', element.value)
      return successful
    } catch (err) {
      this.emit('cut', null, err)
      console.error('Cut failed:', err)
      return false
    }
  }

  private showToast(message: string): void {
    // Minimal toast, extendable to your preferred UI framework
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.position = 'fixed'
    toast.style.bottom = '20px'
    toast.style.left = '50%'
    toast.style.transform = 'translateX(-50%)'
    toast.style.backgroundColor = '#333'
    toast.style.color = '#fff'
    toast.style.padding = '10px 20px'
    toast.style.borderRadius = '5px'
    toast.style.zIndex = '9999'
    toast.style.opacity = '0.9'
    document.body.appendChild(toast)
    setTimeout(() => document.body.removeChild(toast), 3000)
  }
}

export const clipboard = new ClipboardTools()