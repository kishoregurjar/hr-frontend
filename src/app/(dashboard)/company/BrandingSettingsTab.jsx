"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Palette,
  Upload,
  Trash2,
  Check,
  Globe,
  Loader2,
  Eye,
  ShieldCheck,
  Building2,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  getCompanyBranding,
  updateCompanyBranding,
  uploadCompanyFavicon,
  deleteCompanyFavicon,
} from "@/lib/api/company";

const PRESET_BRAND_COLORS = [
  { name: "Corporate Blue", hex: "#1877F2" },
  { name: "Indigo Slate", hex: "#4F46E5" },
  { name: "Emerald Pro", hex: "#059669" },
  { name: "Modern Violet", hex: "#7C3AED" },
  { name: "Crimson Rose", hex: "#E11D48" },
  { name: "Warm Amber", hex: "#EA580C" },
  { name: "Midnight Dark", hex: "#0F172A" },
];

export default function BrandingSettingsTab({ company }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const [brandColor, setBrandColor] = useState("#1877F2");
  const [accentColor, setAccentColor] = useState("#059669");
  const [brandTagline, setBrandTagline] = useState("");
  const [showPoweredByHireQuest, setShowPoweredByHireQuest] = useState(true);
  const [faviconUrl, setFaviconUrl] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadBranding = async () => {
      try {
        setLoading(true);
        const data = await getCompanyBranding();
        if (mounted && data) {
          if (data.brandColor) setBrandColor(data.brandColor);
          if (data.accentColor) setAccentColor(data.accentColor);
          if (data.brandTagline) setBrandTagline(data.brandTagline);
          if (typeof data.showPoweredByHireQuest === "boolean") {
            setShowPoweredByHireQuest(data.showPoweredByHireQuest);
          }
          if (data.faviconUrl) setFaviconUrl(data.faviconUrl);
        }
      } catch (err) {
        console.warn("Could not load initial branding config:", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadBranding();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        brandColor: brandColor?.trim() || null,
        accentColor: accentColor?.trim() || null,
        brandTagline: brandTagline?.trim() || null,
        showPoweredByHireQuest,
      };

      const res = await updateCompanyBranding(payload);
      toast.success("White-label branding saved successfully!");
      if (res) {
        if (res.brandColor !== undefined) setBrandColor(res.brandColor || "#1877F2");
        if (res.accentColor !== undefined) setAccentColor(res.accentColor || "#059669");
        if (res.brandTagline !== undefined) setBrandTagline(res.brandTagline || "");
        if (typeof res.showPoweredByHireQuest === "boolean") {
          setShowPoweredByHireQuest(res.showPoweredByHireQuest);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 512 * 1024) {
      toast.error("Favicon file size must be less than 512 KB");
      return;
    }

    try {
      setUploadingFavicon(true);
      const res = await uploadCompanyFavicon(file);
      toast.success("Favicon updated successfully!");
      if (res?.faviconUrl) {
        setFaviconUrl(res.faviconUrl);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Favicon upload failed");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleDeleteFavicon = async () => {
    try {
      setUploadingFavicon(true);
      await deleteCompanyFavicon();
      setFaviconUrl(null);
      toast.success("Favicon removed successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to remove favicon");
    } finally {
      setUploadingFavicon(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const effectiveCompanyName = company?.name || "Company";
  const effectiveLogoUrl = company?.logoUrl || null;
  const companySlug = company?.slug || "company";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── Left Column: Configuration Controls (7 cols) ── */}
      <div className="lg:col-span-7 space-y-6">
        {/* Banner */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  White-Label Branding Suite
                </h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-600 text-white tracking-wider">
                  Pro / Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Transform candidate assessments with your proprietary corporate identity. Customize brand colors, upload a custom browser favicon, define your recruiting tagline, and remove HireQuest platform watermarks.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Primary Brand Color */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Palette className="h-4 w-4 text-blue-600" />
                Primary Brand Color
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Applied to primary buttons, active steps, headers, and exam focus elements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                {brandColor}
              </span>
              <div
                className="h-7 w-7 rounded-lg border shadow-xs"
                style={{ backgroundColor: brandColor }}
              />
            </div>
          </div>

          {/* Preset Swatches */}
          <div className="flex items-center gap-2.5 flex-wrap pt-1">
            {PRESET_BRAND_COLORS.map((preset) => {
              const isSelected = brandColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setBrandColor(preset.hex)}
                  className={`h-9 px-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-slate-900 border-transparent shadow-xs"
                      : "hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full shadow-inner inline-block"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-slate-900 ml-0.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Custom Hex Input */}
          <div className="flex items-center gap-3 pt-2">
            <label className="text-xs font-semibold text-slate-600">Custom Hex:</label>
            <div className="relative flex items-center">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value.toUpperCase())}
                className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
            </div>
            <input
              type="text"
              value={brandColor}
              maxLength={7}
              placeholder="#1877F2"
              onChange={(e) => setBrandColor(e.target.value.toUpperCase())}
              className="h-9 w-32 font-mono text-xs font-bold uppercase px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* 2. Secondary / Accent Color */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Palette className="h-4 w-4 text-emerald-600" />
                Secondary Accent Color
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Highlights badges, success indicators, and secondary controls.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                {accentColor}
              </span>
              <div
                className="h-7 w-7 rounded-lg border shadow-xs"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value.toUpperCase())}
              className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
            />
            <input
              type="text"
              value={accentColor}
              maxLength={7}
              placeholder="#059669"
              onChange={(e) => setAccentColor(e.target.value.toUpperCase())}
              className="h-9 w-32 font-mono text-xs font-bold uppercase px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* 3. Custom Favicon */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              Custom Browser Favicon
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Appears on the candidate's browser tab during testing instead of platform defaults.
            </p>
          </div>

          <div className="flex items-center gap-5 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            {faviconUrl ? (
              <div className="relative group">
                <img
                  src={faviconUrl}
                  alt="Company Favicon"
                  className="h-12 w-12 rounded-lg object-contain bg-white p-1.5 border shadow-xs"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                None
              </div>
            )}

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/x-icon, image/png, image/webp"
                    onChange={handleFaviconUpload}
                    disabled={uploadingFavicon}
                    className="hidden"
                  />
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs cursor-pointer">
                    {uploadingFavicon ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-blue-600" />
                    )}
                    <span>{faviconUrl ? "Change Favicon" : "Upload Favicon"}</span>
                  </div>
                </label>

                {faviconUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteFavicon}
                    disabled={uploadingFavicon}
                    className="text-rose-600 hover:bg-rose-50 text-xs font-bold h-8 px-2.5"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Accepted: .ico, .png, .webp (Max 512 KB, recommended: 32x32 or 64x64 px)
              </p>
            </div>
          </div>
        </div>

        {/* 4. Brand Tagline */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">
              Brand Tagline / Slogan
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              {brandTagline.length}/120
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Rendered beneath your company name on candidate landing screens and instructions.
          </p>
          <input
            type="text"
            value={brandTagline}
            maxLength={120}
            onChange={(e) => setBrandTagline(e.target.value)}
            placeholder="e.g. Empowering World-Class Engineering Talent"
            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          />
        </div>

        {/* 5. "Powered by HireQuest" Removal Switch */}
        <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">
                  Full White-Label Mode
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    !showPoweredByHireQuest
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {!showPoweredByHireQuest ? "100% White-Labeled" : "Platform Badge Visible"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When enabled, all HireQuest engine badges, links, and footer watermarks are completely removed from the candidate test portal, scorecards, and emails.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!showPoweredByHireQuest}
                onCheckedChange={(checked) => setShowPoweredByHireQuest(!checked)}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Branding Settings...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Save White-Label Branding</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Right Column: Real-Time Live Preview Mockup (5 cols) ── */}
      <div className="lg:col-span-5 sticky top-6 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-blue-600" />
            Live Candidate Portal Preview
          </h4>
          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Real-Time Sync
          </span>
        </div>

        {/* Browser Mockup Container */}
        <div className="rounded-2xl border-2 border-slate-300/80 bg-white shadow-xl overflow-hidden font-sans">
          {/* Top Browser Bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-3.5 py-2.5 flex items-center gap-2">
            {/* Window Dots */}
            <div className="flex items-center gap-1.5 mr-2">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>

            {/* Mock Tab */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-t-lg border-t border-x border-slate-200 text-[11px] font-bold text-slate-700 shadow-xs max-w-[180px] truncate">
              {faviconUrl ? (
                <img src={faviconUrl} alt="Favicon" className="h-3.5 w-3.5 object-contain rounded-xs" />
              ) : (
                <div
                  className="h-3 w-3 rounded-xs shrink-0"
                  style={{ backgroundColor: brandColor }}
                />
              )}
              <span className="truncate">{effectiveCompanyName} | Evaluation</span>
            </div>

            {/* Address Bar */}
            <div className="flex-1 bg-white rounded-md px-2 py-0.5 text-[10px] text-slate-400 font-mono truncate border border-slate-200 text-center">
              eval.{companySlug}.hirequest.app/test
            </div>
          </div>

          {/* Viewport Content */}
          <div className="p-5 space-y-5 bg-white">
            {/* Header Area */}
            <div
              className="pb-4 border-b-2 flex items-center gap-3 transition-colors"
              style={{ borderBottomColor: brandColor }}
            >
              {effectiveLogoUrl ? (
                <img
                  src={effectiveLogoUrl}
                  alt={effectiveCompanyName}
                  className="h-10 w-10 rounded-xl object-contain bg-slate-50 p-1.5 border shadow-xs"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: brandColor }}
                >
                  {effectiveCompanyName[0]?.toUpperCase()}
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <span>{effectiveCompanyName}</span>
                  <span className="text-emerald-600 font-black">• VERIFIED</span>
                </div>
                {brandTagline ? (
                  <p className="text-[11px] font-semibold text-slate-700 line-clamp-1 italic">
                    {brandTagline}
                  </p>
                ) : (
                  <p className="text-[11px] font-semibold text-slate-700">
                    Candidate Evaluation Portal
                  </p>
                )}
              </div>
            </div>

            {/* Mock Step Welcome Card */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  1
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Welcome to {effectiveCompanyName}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                You have been invited to complete the Technical & Cognitive Assessment. Please confirm your details to begin.
              </p>

              <div className="pt-2">
                <div
                  className="w-full py-2 px-4 rounded-lg text-white font-bold text-xs text-center shadow-xs cursor-default transition-all"
                  style={{ backgroundColor: brandColor }}
                >
                  Start Assessment Now
                </div>
              </div>
            </div>

            {/* Footer Watermark Indicator */}
            <div className="pt-2 text-center border-t border-slate-100">
              {showPoweredByHireQuest ? (
                <p className="text-[10px] text-slate-400 font-medium">
                  Powered by <span className="font-bold text-slate-600">HireQuest</span> Screening Engine
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 font-medium">
                  {effectiveCompanyName} Confidential & Proprietary Evaluation System
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/80 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Changes saved here are instantly reflected across all active candidate invitation links, test rooms, and automated notification emails.
          </span>
        </div>
      </div>
    </div>
  );
}

