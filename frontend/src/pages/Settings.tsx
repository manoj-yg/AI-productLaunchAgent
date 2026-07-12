import { useState } from "react"
import { motion } from "framer-motion"
import { Save, ShieldCheck, HelpCircle, Key, Link, Settings as SettingsIcon, MessageSquare } from "lucide-react"
import { useLaunchStore } from "../store/useLaunchStore"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select } from "../components/ui/select"
import { Button } from "../components/ui/button"

export default function Settings() {
  const { settings, updateSettings } = useLaunchStore()

  // Form local state
  const [shopifyShopUrl, setShopifyShopUrl] = useState(settings.shopifyShopUrl)
  const [shopifyAccessToken, setShopifyAccessToken] = useState(settings.shopifyAccessToken)
  const [defaultLanguage, setDefaultLanguage] = useState(settings.defaultLanguage)
  const [brandVoice, setBrandVoice] = useState(settings.brandVoice)
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor)

  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Save to Zustand store
    updateSettings({
      shopifyShopUrl,
      shopifyAccessToken,
      defaultLanguage,
      brandVoice,
      primaryColor
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
          <span>Platform Customization</span>
        </h1>
        <p className="text-sm text-slate-500 font-light">Configure shop connection channels, Gemini guidelines, and tone preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Shopify Channels Card */}
        <Card className="glass-panel">
          <CardHeader className="border-b border-slate-900 pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Link className="w-4 h-4 text-primary" />
              <span>Shopify Channel Setup</span>
            </CardTitle>
            <CardDescription>Enter details to connect the launch platform to your shop storefront.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Shopify Admin URL</label>
                <Input
                  required
                  type="text"
                  placeholder="shopname.myshopify.com"
                  value={shopifyShopUrl}
                  onChange={(e) => setShopifyShopUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Shopify Admin API Token</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-600">
                    <Key className="w-4 h-4" />
                  </span>
                  <Input
                    required
                    type="password"
                    placeholder="shpat_********************"
                    value={shopifyAccessToken}
                    onChange={(e) => setShopifyAccessToken(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Prompting Guidelines */}
        <Card className="glass-panel">
          <CardHeader className="border-b border-slate-900 pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Gemini Tone Guidelines</span>
            </CardTitle>
            <CardDescription>Customize prompts rules and core models used during copy conversions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Brand Tone of Voice</label>
                <Select value={brandVoice} onChange={(e) => setBrandVoice(e.target.value as any)}>
                  <option value="playful">Playful & Friendly</option>
                  <option value="professional">Professional & Informative</option>
                  <option value="bold">Bold & Creative</option>
                  <option value="luxurious">Luxurious & Elegant</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Output Language</label>
                <Select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)}>
                  <option value="en">English (US)</option>
                  <option value="es">Spanish (ES)</option>
                  <option value="fr">French (FR)</option>
                  <option value="de">German (DE)</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding preferences */}
        <Card className="glass-panel">
          <CardHeader className="border-b border-slate-900 pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4 text-primary" />
              <span>General Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Primary Branding Color Code</label>
              <div className="flex space-x-3 items-center">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 border border-slate-800 rounded bg-slate-950 cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono text-xs w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button and confirmations */}
        <div className="flex items-center space-x-4 justify-end">
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-green-500 font-semibold"
            >
              ✓ Configurations updated successfully
            </motion.span>
          )}

          <Button type="submit" variant="glow" className="flex items-center space-x-2 w-40">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </Button>
        </div>

      </form>
    </div>
  )
}
