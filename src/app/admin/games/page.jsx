"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Gamepad2,
  Brain,
  Sliders,
  Sparkles,
  Search,
  RefreshCw,
  Clock,
  Gauge,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  getAdminGames,
  toggleGameStatus,
  getCompanyGames,
  toggleCompanyGameStatus,
  bulkToggleCompanyGameStatus,
  getAdminCompanies,
} from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminGamesPage() {
  const [games, setGames] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("GLOBAL");
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]); // Multi-select array
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [showCompanyListPopover, setShowCompanyListPopover] = useState(false);

  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const list = await getAdminCompanies();
        setCompanies(list || []);
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    };
    fetchCompanies();
  }, []);

  const fetchGames = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      let list = [];
      if (isMultiMode && selectedCompanyIds.length > 0) {
        // Fetch company specific configs for the first selected company in batch context
        list = await getCompanyGames(selectedCompanyIds[0]);
      } else if (selectedCompanyId === "GLOBAL" || isMultiMode) {
        list = await getAdminGames();
      } else {
        list = await getCompanyGames(selectedCompanyId);
      }
      setGames(list);
      if (showToast) {
        toast.success("Game catalog refreshed successfully");
      }
    } catch (err) {
      console.error("Failed to load games:", err);
      toast.error("Failed to load games catalog");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchGames();
  }, [selectedCompanyId, isMultiMode, selectedCompanyIds]);

  useEffect(() => {
    const handleStatusChange = () => {
      fetchGames();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("gameStatusChanged", handleStatusChange);
      window.addEventListener("GAME_STATUS_UPDATED", handleStatusChange);
    }

    let bc;
    try {
      bc = new BroadcastChannel("hirequest_realtime");
      bc.onmessage = (event) => {
        if (event.data?.type === "GAME_STATUS_CHANGED" || event.data?.type === "GAME_STATUS_UPDATED") {
          fetchGames();
        }
      };
    } catch {}

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("gameStatusChanged", handleStatusChange);
        window.removeEventListener("GAME_STATUS_UPDATED", handleStatusChange);
      }
      if (bc) bc.close();
    };
  }, [selectedCompanyId, isMultiMode, selectedCompanyIds]);

  const isGameActiveInScope = (game) => {
    if (isMultiMode) {
      if (game.companyStatus !== undefined) {
        return game.companyStatus === "Active" || game.companyStatus === "ACTIVE";
      }
      if (game.isCompanyActive !== undefined) {
        return Boolean(game.isCompanyActive);
      }
      return game.isActive !== undefined ? Boolean(game.isActive) : game.status === "ACTIVE";
    }

    if (selectedCompanyId === "GLOBAL") {
      return game.isActive !== undefined ? Boolean(game.isActive) : game.status === "ACTIVE";
    }
    return game.isCompanyActive !== undefined
      ? Boolean(game.isCompanyActive)
      : (game.companyStatus === "Active" || game.companyStatus === "ACTIVE");
  };

  const handleScopeChange = (e) => {
    const val = e.target.value;
    if (val === "MULTI") {
      setIsMultiMode(true);
      setSelectedCompanyId("MULTI");
      setShowCompanyListPopover(true);
    } else {
      setIsMultiMode(false);
      setSelectedCompanyId(val);
      setShowCompanyListPopover(false);
    }
  };

  const toggleSelectCompanyId = (cId) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    );
  };

  const toggleSelectAllCompanies = () => {
    if (selectedCompanyIds.length === companies.length) {
      setSelectedCompanyIds([]);
    } else {
      setSelectedCompanyIds(companies.map((c) => c.id));
    }
  };

  const handleBulkToggleStatus = async (game, targetStatus) => {
    const gameId = game.id || game.code;
    if (selectedCompanyIds.length === 0) {
      toast.error("Please select at least 1 company from the checkbox list!");
      return;
    }

    const nextIsActive = targetStatus === "Active";
    const nextStatusText = nextIsActive ? "ACTIVE" : "INACTIVE";

    setTogglingId(gameId);

    // Immediate Optimistic UI Update across all state
    setGames((prev) =>
      prev.map((g) => {
        if ((g.id && g.id === gameId) || (g.code && g.code === gameId)) {
          return {
            ...g,
            isActive: nextIsActive,
            isCompanyActive: nextIsActive,
            status: nextStatusText,
            companyStatus: targetStatus,
          };
        }
        return g;
      })
    );

    try {
      const res = await bulkToggleCompanyGameStatus(
        selectedCompanyIds,
        gameId,
        targetStatus
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gameStatusChanged"));
        window.dispatchEvent(new Event("GAME_STATUS_UPDATED"));
        try {
          const bc = new BroadcastChannel("hirequest_realtime");
          bc.postMessage({ type: "GAME_STATUS_CHANGED" });
          bc.postMessage({ type: "GAME_STATUS_UPDATED" });
          bc.close();
        } catch {}
      }

      toast.success(
        `${game.name || game.title} is now ${targetStatus === "Active" ? "Enabled" : "Disabled"} for ${selectedCompanyIds.length} companies!`,
        {
          description: `Updated status to ${targetStatus} across ${selectedCompanyIds.length} selected organizations.`,
        }
      );
    } catch (err) {
      console.error("Bulk toggle error:", err);
      toast.error(`Failed to bulk update ${game.name || "game"} status`);
      fetchGames(); // Revert on error
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleStatus = async (game) => {
    const gameId = game.id || game.code;
    const isGlobal = selectedCompanyId === "GLOBAL";
    
    const currentIsActive = isGameActiveInScope(game);
    const nextIsActive = !currentIsActive;
    const nextStatusText = nextIsActive ? "ACTIVE" : "INACTIVE";

    setTogglingId(gameId);

    // Optimistic UI Update
    setGames((prev) =>
      prev.map((g) => {
        if ((g.id && g.id === gameId) || (g.code && g.code === gameId)) {
          return {
            ...g,
            isActive: isGlobal ? nextIsActive : g.isActive,
            isCompanyActive: nextIsActive,
            status: isGlobal ? nextStatusText : g.status,
            companyStatus: nextIsActive ? "Active" : "Inactive",
          };
        }
        return g;
      })
    );

    try {
      if (isGlobal) {
        await toggleGameStatus(gameId, nextIsActive);
      } else {
        await toggleCompanyGameStatus(selectedCompanyId, gameId, nextIsActive ? "Active" : "Inactive");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gameStatusChanged"));
        try {
          const bc = new BroadcastChannel("hirequest_realtime");
          bc.postMessage({ type: "GAME_STATUS_CHANGED", companyId: selectedCompanyId });
          bc.close();
        } catch {}
      }
      
      const compName = companies.find((c) => c.id === selectedCompanyId)?.name || "Company";
      toast.success(
        `${game.name || game.title || "Game"} is now ${nextIsActive ? "Enabled" : "Disabled"}`,
        {
          description: isGlobal
            ? nextIsActive
              ? "This game is now active across all company assessment creators."
              : "This game has been disabled globally."
            : nextIsActive
              ? `Enabled specifically for ${compName}.`
              : `Disabled specifically for ${compName}.`,
        }
      );
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error(`Failed to update ${game.name || "game"} status`);
      // Revert optimistic update
      setGames((prev) =>
        prev.map((g) => {
          if ((g.id && g.id === gameId) || (g.code && g.code === gameId)) {
            return {
              ...g,
              isActive: g.isActive,
              isCompanyActive: currentIsActive,
              companyStatus: currentIsActive ? "Active" : "Inactive",
            };
          }
          return g;
        })
      );
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = useMemo(() => {
    return games.filter((g) => isGameActiveInScope(g)).length;
  }, [games, selectedCompanyId]);

  const inactiveCount = games.length - activeCount;

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const isActive = isGameActiveInScope(game);
      
      // Status filter
      if (statusFilter === "ACTIVE" && !isActive) return false;
      if (statusFilter === "INACTIVE" && isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const name = (game.name || game.title || "").toLowerCase();
        const code = (game.code || game.id || "").toLowerCase();
        const skill = (game.skill || "").toLowerCase();
        const category = (game.category || "").toLowerCase();
        const desc = (game.description || "").toLowerCase();
        return (
          name.includes(query) ||
          code.includes(query) ||
          skill.includes(query) ||
          category.includes(query) ||
          desc.includes(query)
        );
      }

      return true;
    });
  }, [games, statusFilter, searchQuery, selectedCompanyId]);

  return (
    <>
      <AdminHeader
        title="Cognitive Games Management"
        subtitle="Global platform game engine catalog, activation controls & competency mapping."
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* ── Top Metric Banner ── */}
        <div className="rounded-2xl border bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Brain className="h-5 w-5" />
              </div>
              <h2 className="font-extrabold text-lg tracking-tight">
                Global Cognitive Game Engines
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Super Admin master controls for all cognitive game modules. Disabling a game globally prevents recruiters from adding it to assessments and restricts candidate playback.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1.5 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
              {activeCount} Active
            </Badge>
            {inactiveCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1.5 text-xs font-semibold">
                <XCircle className="h-3.5 w-3.5 mr-1 text-amber-400" />
                {inactiveCount} Disabled
              </Badge>
            )}
          </div>
        </div>

        {/* ── Filter Bar & Actions ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border shadow-2xs">
          {/* Company Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Target Scope:</span>
            <select
              value={isMultiMode ? "MULTI" : selectedCompanyId}
              onChange={handleScopeChange}
              className="h-9 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="GLOBAL">🌐 Global Platform Controls (All Companies)</option>
              <option value="MULTI">☑️ Multi-Company Selection Mode (Bulk Batch)</option>
              <optgroup label="Single Company Controls">
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏢 Company: {c.name || c.slug}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50/50 border-slate-200"
            />
          </div>

          {/* Filter Pills & Refresh */}
          <div className="flex items-center gap-2">

            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All ({games.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "ACTIVE"
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "INACTIVE"
                    ? "bg-white text-rose-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Disabled ({inactiveCount})
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchGames(true)}
              disabled={refreshing || loading}
              className="h-9 px-3 gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Multi-Company Selection Panel ── */}
        {isMultiMode && (
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Multi-Company Batch Licensing
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select 1 or more companies to bulk update game access permissions in batch.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSelectAllCompanies}
                  className="h-8 text-xs font-semibold bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer"
                >
                  {selectedCompanyIds.length === companies.length ? "Deselect All" : `Select All (${companies.length})`}
                </Button>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 text-xs font-semibold">
                  {selectedCompanyIds.length} / {companies.length} Selected
                </Badge>
              </div>
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {companies.map((c) => {
                const isChecked = selectedCompanyIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    onClick={() => toggleSelectCompanyId(c.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      isChecked
                        ? "bg-blue-950/80 border-blue-500/50 text-white shadow-2xs"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <div className="truncate">
                      <p className="font-semibold truncate leading-snug">{c.name || c.slug}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{c.domain || c.id}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedCompanyIds.length === 0 && (
              <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl flex items-center gap-2">
                ⚠️ Please select at least one company above to enable or disable games for them.
              </p>
            )}
          </div>
        )}

        {/* ── Games Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-12 bg-slate-100 rounded w-full" />
                <div className="h-8 bg-slate-100 rounded w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGames.map((game) => {
              const gameId = game.id || game.code;
              const isActive = isGameActiveInScope(game);
              const isToggling = togglingId === gameId;

              return (
                <div
                  key={gameId}
                  className={`rounded-2xl border bg-white p-5 shadow-2xs flex flex-col justify-between transition-all duration-200 ${
                    isActive
                      ? "border-slate-200 hover:border-blue-500/50 hover:shadow-md"
                      : "border-slate-200 bg-slate-50/70 opacity-75"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-base shadow-2xs shrink-0 transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "bg-slate-200 text-slate-500 border border-slate-300"
                          }`}
                        >
                          <Gamepad2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 leading-snug">
                            {game.name || game.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400 font-semibold uppercase">
                              {game.code || game.slug || game.id}
                            </span>
                            <span className="text-slate-300 text-xs">•</span>
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {game.duration ? `${game.duration} mins` : game.averagePlayTime || "5-8 mins"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge
                        className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-200 text-slate-600 border-slate-300"
                        }`}
                      >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[32px]">
                      {game.description || "Cognitive skill measurement game."}
                    </p>

                    {/* Meta Chips */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Competency:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                          {game.skill || "Logical Deduction & Focus"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Difficulty:</span>
                        <span className="font-semibold text-slate-700">
                          {game.difficulty || "Adaptive (Medium)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedGame(game)}
                      className="text-xs font-semibold gap-1.5 h-8 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Sliders className="h-3.5 w-3.5 text-slate-400" />
                      Details
                    </Button>

                    {isMultiMode ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          disabled={isToggling || selectedCompanyIds.length === 0}
                          onClick={() => handleBulkToggleStatus(game, "Active")}
                          className="text-xs font-semibold h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            `Bulk Enable (${selectedCompanyIds.length})`
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isToggling || selectedCompanyIds.length === 0}
                          onClick={() => handleBulkToggleStatus(game, "Inactive")}
                          className="text-xs font-semibold h-8 px-2.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            `Bulk Disable (${selectedCompanyIds.length})`
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant={isActive ? "outline" : "default"}
                        disabled={isToggling}
                        onClick={() => handleToggleStatus(game)}
                        className={`text-xs font-semibold h-8 min-w-[96px] cursor-pointer transition-all ${
                          isActive
                            ? "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isActive ? (
                          "Disable"
                        ) : (
                          "Enable"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed bg-white shadow-2xs space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">No matching games found</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Try adjusting your search query or status filter.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
              className="text-xs font-semibold"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* ── Game Details / Config Modal ── */}
        {selectedGame && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      {selectedGame.name || selectedGame.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      {selectedGame.code || selectedGame.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4 text-xs text-slate-700">
                <div className="space-y-1">
                  <span className="font-bold text-slate-900 text-xs">Description:</span>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedGame.description || "Cognitive problem solving engine."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 font-semibold text-[11px]">Primary Skill:</span>
                    <p className="font-bold text-slate-800 text-xs">
                      {selectedGame.skill || "Problem Solving & Speed"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 font-semibold text-[11px]">Category:</span>
                    <p className="font-bold text-slate-800 text-xs">
                      {selectedGame.category || "COGNITIVE"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 font-semibold text-[11px]">Scoring Metric:</span>
                    <p className="font-bold text-slate-800 text-xs">
                      {selectedGame.scoringMetric || "Accuracy & Time Taken"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                    <span className="text-slate-400 font-semibold text-[11px]">Status:</span>
                    <p
                      className={`font-bold text-xs ${
                        (selectedGame.isActive !== undefined ? selectedGame.isActive : selectedGame.status === "ACTIVE")
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {(selectedGame.isActive !== undefined ? selectedGame.isActive : selectedGame.status === "ACTIVE")
                        ? "Active Platform-Wide"
                        : "Disabled"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedGame(null)}
                  className="text-xs font-semibold cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    handleToggleStatus(selectedGame);
                    setSelectedGame(null);
                  }}
                  className={`text-xs font-semibold cursor-pointer ${
                    (selectedGame.isActive !== undefined ? selectedGame.isActive : selectedGame.status === "ACTIVE")
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {(selectedGame.isActive !== undefined ? selectedGame.isActive : selectedGame.status === "ACTIVE")
                    ? "Disable Game"
                    : "Enable Game"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
