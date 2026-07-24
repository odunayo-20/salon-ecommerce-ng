"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Loader2, Plus, Trash2, Save, Ban, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScheduleStylists, useScheduleData, useSaveSchedule, useDeleteBlockedTime } from "@/hooks/queries";

interface AvailSlot { id?: string; dayOfWeek: number; startTime: string; endTime: string; isBreak: boolean; }
interface BlockedSlot { id: string; date: string; startTime: string | null; endTime: string | null; reason: string | null; }

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyDay = (day: number): AvailSlot[] => [
  { dayOfWeek: day, startTime: "09:00", endTime: "12:00", isBreak: false },
  { dayOfWeek: day, startTime: "12:00", endTime: "13:00", isBreak: true },
  { dayOfWeek: day, startTime: "13:00", endTime: "17:00", isBreak: false },
];

export default function AdminSchedulesPage() {
  const [selectedStylist, setSelectedStylist] = useState("");
  const [availability, setAvailability] = useState<Record<number, AvailSlot[]>>({});
  const [blockedTimes, setBlockedTimes] = useState<BlockedSlot[]>([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockStart, setNewBlockStart] = useState("");
  const [newBlockEnd, setNewBlockEnd] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [addingBlock, setAddingBlock] = useState(false);

  const { data: stylistsData } = useScheduleStylists();
  const stylists = stylistsData?.stylists || [];

  const { data: scheduleData, isLoading: loadingSchedule } = useScheduleData(selectedStylist);

  const saveSchedule = useSaveSchedule();
  const deleteBlockedTime = useDeleteBlockedTime(selectedStylist);

  useEffect(() => {
    if (scheduleData) {
      const grouped: Record<number, AvailSlot[]> = {};
      for (let d = 0; d <= 6; d++) grouped[d] = [];
      for (const a of scheduleData.availability || []) {
        grouped[a.dayOfWeek].push(a);
      }
      for (const d of Object.keys(grouped)) {
        grouped[Number(d)].sort((a: AvailSlot, b: AvailSlot) => a.startTime.localeCompare(b.startTime));
      }
      setAvailability(grouped);
      setBlockedTimes(scheduleData.blockedTimes || []);
    }
  }, [scheduleData]);

  const toggleDay = (day: number) => {
    setAvailability((prev) => {
      const current = prev[day] || [];
      if (current.length > 0) {
        return { ...prev, [day]: [] };
      }
      return { ...prev, [day]: emptyDay(day) };
    });
  };

  const updateSlot = (day: number, index: number, field: string, value: string | boolean) => {
    setAvailability((prev) => {
      const slots = [...(prev[day] || [])];
      slots[index] = { ...slots[index], [field]: value };
      return { ...prev, [day]: slots };
    });
  };

  const addSlot = (day: number) => {
    setAvailability((prev) => {
      const slots = [...(prev[day] || [])];
      const last = slots[slots.length - 1];
      const start = last ? last.endTime : "09:00";
      slots.push({ dayOfWeek: day, startTime: start, endTime: "17:00", isBreak: false });
      return { ...prev, [day]: slots };
    });
  };

  const removeSlot = (day: number, index: number) => {
    setAvailability((prev) => {
      const slots = [...(prev[day] || [])];
      slots.splice(index, 1);
      return { ...prev, [day]: slots };
    });
  };

  const saveAvailability = async () => {
    if (!selectedStylist) return;
    setError("");
    setSuccess("");
    try {
      const all: AvailSlot[] = [];
      for (const d of Object.keys(availability)) {
        for (const s of availability[Number(d)]) {
          all.push(s);
        }
      }
      await saveSchedule.mutateAsync({ stylistId: selectedStylist, availability: all });
      setSuccess("Schedule saved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to save schedule");
    }
  };

  const addBlockedTime = async () => {
    if (!selectedStylist || !newBlockDate) return;
    setAddingBlock(true);
    setError("");
    try {
      const result = await saveSchedule.mutateAsync({
        stylistId: selectedStylist,
        blockedTime: {
          date: newBlockDate,
          startTime: newBlockStart || undefined,
          endTime: newBlockEnd || undefined,
          reason: newBlockReason || undefined,
        },
      });
      if ((result as Record<string, unknown>)?.blocked) {
        setBlockedTimes((prev) => [...prev, (result as Record<string, unknown>).blocked as BlockedSlot].sort((a, b) => a.date.localeCompare(b.date)));
      }
      setNewBlockDate("");
      setNewBlockStart("");
      setNewBlockEnd("");
      setNewBlockReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add block");
    } finally {
      setAddingBlock(false);
    }
  };

  const removeBlockedTime = async (id: string) => {
    try {
      await deleteBlockedTime.mutateAsync(id);
    } catch {
      setError("Failed to remove block");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-semibold text-charcoal">Stylist Schedules</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage working hours and blocked dates for each stylist</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">Select Stylist</label>
        <select
          value={selectedStylist}
          onChange={(e) => setSelectedStylist(e.target.value)}
          className="w-full max-w-xs bg-white border border-border rounded-lg px-4 py-2.5 min-h-[44px] text-sm text-charcoal focus:outline-none focus:border-gold"
        >
          <option value="">Choose a stylist...</option>
          {stylists.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {selectedStylist && (
        <>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">{error}</div>}
          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl p-4">{success}</div>}

          {loadingSchedule ? (
            <div className="bg-white border border-border rounded-xl p-12 text-center">
              <Loader2 className="h-6 w-6 text-gold animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-charcoal flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold" /> Weekly Schedule
                  </h3>
                  <Button onClick={saveAvailability} disabled={saveSchedule.isPending} className="min-h-[44px] bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase px-6">
                    {saveSchedule.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                    Save
                  </Button>
                </div>

                {[1, 2, 3, 4, 5, 0, 6].map((day) => {
                  const slots = availability[day] || [];
                  const isWorking = slots.length > 0;
                  return (
                    <div key={day} className={cn("border border-border rounded-xl p-4 transition-colors", isWorking ? "bg-white" : "bg-cream/30")}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="min-h-[44px] flex items-center">
                            <button
                              onClick={() => toggleDay(day)}
                              className={cn("w-12 h-7 rounded-full transition-colors relative", isWorking ? "bg-gold" : "bg-gray-200")}
                            >
                              <span className={cn("absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform", isWorking ? "left-[18px]" : "left-0.5")} />
                            </button>
                          </div>
                          <span className={cn("text-sm font-semibold", isWorking ? "text-charcoal" : "text-muted-foreground")}>{DAYS[day]}</span>
                        </div>
                        {isWorking && (
                          <button onClick={() => addSlot(day)} className="min-h-[44px] min-w-[44px] p-2 text-xs text-gold hover:text-gold-dark flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Add Slot
                          </button>
                        )}
                      </div>

                      {isWorking && (
                        <div className="space-y-2 ml-0 sm:ml-[52px]">
                          {slots.map((slot, i) => (
                            <div key={i} className="flex flex-wrap items-center gap-2">
                              {slot.isBreak ? (
                                <Ban className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
                              )}
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateSlot(day, i, "startTime", e.target.value)}
                                className="bg-cream border border-border rounded px-3 py-2.5 min-h-[44px] text-sm text-charcoal focus:outline-none focus:border-gold"
                              />
                              <span className="text-xs text-muted-foreground">to</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateSlot(day, i, "endTime", e.target.value)}
                                className="bg-cream border border-border rounded px-3 py-2.5 min-h-[44px] text-sm text-charcoal focus:outline-none focus:border-gold"
                              />
                              <button
                                onClick={() => updateSlot(day, i, "isBreak", !slot.isBreak)}
                                className={cn("min-h-[44px] min-w-[44px] text-xs px-3 py-2 rounded-full font-semibold transition-colors", slot.isBreak ? "bg-amber-100 text-amber-700" : "bg-cream text-muted-foreground hover:bg-gray-200")}
                              >
                                {slot.isBreak ? "Break" : "Work"}
                              </button>
                              <button onClick={() => removeSlot(day, i)} className="p-2.5 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-red-500 transition-colors flex items-center justify-center">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <h3 className="font-heading font-semibold text-charcoal flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gold" /> Blocked Dates
                </h3>

                <div className="bg-white border border-border rounded-xl p-4 space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-charcoal uppercase tracking-wider mb-1">Date *</label>
                    <input type="date" value={newBlockDate} onChange={(e) => setNewBlockDate(e.target.value)} className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-charcoal focus:outline-none focus:border-gold" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-charcoal uppercase tracking-wider mb-1">Start (optional)</label>
                      <input type="time" value={newBlockStart} onChange={(e) => setNewBlockStart(e.target.value)} className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-charcoal focus:outline-none focus:border-gold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-charcoal uppercase tracking-wider mb-1">End (optional)</label>
                      <input type="time" value={newBlockEnd} onChange={(e) => setNewBlockEnd(e.target.value)} className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-charcoal focus:outline-none focus:border-gold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-charcoal uppercase tracking-wider mb-1">Reason</label>
                    <input type="text" value={newBlockReason} onChange={(e) => setNewBlockReason(e.target.value)} placeholder="e.g. Travel, Vacation" className="w-full bg-cream border border-border rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-charcoal placeholder:text-muted-foreground focus:outline-none focus:border-gold" />
                  </div>
                  <Button onClick={addBlockedTime} disabled={!newBlockDate || addingBlock} className="min-h-[44px] w-full bg-charcoal text-white hover:bg-charcoal-light rounded-full text-xs font-semibold tracking-wider uppercase">
                    {addingBlock ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                    Block Date
                  </Button>
                  {!newBlockStart && !newBlockEnd && newBlockDate && (
                    <p className="text-[10px] text-muted-foreground text-center">No times set — full day will be blocked</p>
                  )}
                </div>

                <div className="space-y-2">
                  {blockedTimes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No blocked dates</p>
                  ) : (
                    blockedTimes.map((b) => (
                      <div key={b.id} className="bg-white border border-border rounded-lg p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-charcoal">{new Date(b.date + "T00:00:00").toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}</p>
                          {b.startTime && b.endTime ? (
                            <p className="text-xs text-muted-foreground">{b.startTime} — {b.endTime}</p>
                          ) : (
                            <p className="text-xs text-amber-600 font-medium">Full day</p>
                          )}
                          {b.reason && <p className="text-xs text-muted-foreground mt-0.5">{b.reason}</p>}
                        </div>
                        <button onClick={() => removeBlockedTime(b.id)} className="p-2.5 min-h-[44px] min-w-[44px] text-muted-foreground hover:text-red-500 transition-colors shrink-0 flex items-center justify-center">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
