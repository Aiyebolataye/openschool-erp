"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, TextArea, SelectField } from "@/components/ui/form";
import { MapPin, ClipboardList, ChevronRight, Wrench, Clock, Bus, Users } from "lucide-react";

const kpis = [
  { label: "Routes Active", value: "12", detail: "of 14 routes", detailColor: "green" as const },
  { label: "Buses", value: "18", detail: "2 in maintenance", detailColor: "blue" as const },
  { label: "Drivers", value: "20", detail: "1 on leave", detailColor: "muted" as const },
  { label: "Students on Buses", value: "486", detail: "of 520 daily capacity", detailColor: "blue" as const },
  { label: "Trips Today", value: "42", detail: "3 delayed", detailColor: "orange" as const },
  { label: "Fuel Cost This Month", value: "₦1.24M", detail: "+4% vs last month", detailColor: "orange" as const },
];

const todayTrips = [
  { id: "TP-301", route: "Gwarinpa Line", bus: "Demo 1", driver: "Mr. Chinedu Kalu", departure: "6:45 AM", status: { text: "On time", variant: "green" as const } },
  { id: "TP-302", route: "Kubwa Line", bus: "Demo 2", driver: "Mallam Usman Abdullahi", departure: "6:55 AM", status: { text: "Delayed", variant: "orange" as const } },
  { id: "TP-303", route: "Wuse II / Maitama Line", bus: "Demo 3", driver: "Mr. Emeka Obi", departure: "7:05 AM", status: { text: "On time", variant: "green" as const } },
  { id: "TP-304", route: "Nyanya / Karu Line", bus: "Demo 4", driver: "Mr. Suleiman Musa", departure: "7:15 AM", status: { text: "On time", variant: "green" as const } },
  { id: "TP-305", route: "Bwari / Dutse Line", bus: "Demo 5", driver: "Mr. Joseph Adeyemi", departure: "7:20 AM", status: { text: "Completed", variant: "muted" as const } },
];

const alerts = [
  { id: "al1", icon: "wrench", title: "Demo 5 brake inspection", detail: "Bwari / Dutse Line · out of service after morning trip", time: "30 min ago", tone: { text: "Maintenance", variant: "red" as const } },
  { id: "al2", icon: "wrench", title: "Demo 2 oil service overdue", detail: "Kubwa Line · service due 09 Sep 2026", time: "2h ago", tone: { text: "Maintenance", variant: "orange" as const } },
  { id: "al3", icon: "clock", title: "Kubwa Line departure delayed", detail: "Demo 2 · 25 min behind schedule", time: "1h ago", tone: { text: "Delayed", variant: "orange" as const } },
  { id: "al4", icon: "clock", title: "Nyanya / Karu Line traffic delay", detail: "Demo 4 · cleared, back on schedule", time: "3h ago", tone: { text: "Delayed", variant: "green" as const } },
];

const routeNames = ["Gwarinpa Line", "Kubwa Line", "Wuse II / Maitama Line", "Nyanya / Karu Line", "Bwari / Dutse Line"];
const busOptions = ["Demo 1", "Demo 2", "Demo 3", "Demo 4", "Demo 5"];
const driverOptions = ["Mr. Chinedu Kalu", "Mallam Usman Abdullahi", "Mr. Emeka Obi", "Mr. Suleiman Musa", "Mr. Joseph Adeyemi"];
const departureTimes = ["6:30 AM", "6:45 AM", "7:00 AM", "7:15 AM", "7:30 AM", "2:30 PM", "3:00 PM"];

type TodayTrip = (typeof todayTrips)[number];

export default function TransportManagerDashboardPage() {
  const [routeOpen, setRouteOpen] = useState(false);
  const [tripOpen, setTripOpen] = useState(false);
  const [tripDetail, setTripDetail] = useState<TodayTrip | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [newRoute, setNewRoute] = useState("");
  const [newRouteStops, setNewRouteStops] = useState("");
  const [newRouteBus, setNewRouteBus] = useState("");
  const [newRouteDriver, setNewRouteDriver] = useState("");

  const [tripRoute, setTripRoute] = useState("");
  const [tripBus, setTripBus] = useState("");
  const [tripDriver, setTripDriver] = useState("");
  const [tripDeparture, setTripDeparture] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const saveRoute = () => {
    if (!newRoute.trim() || !newRouteBus || !newRouteDriver || !newRouteStops.trim()) return;
    setRouteOpen(false);
    setNewRoute("");
    setNewRouteStops("");
    setNewRouteBus("");
    setNewRouteDriver("");
    showToast("Route added");
  };

  const saveTrip = () => {
    if (!tripRoute || !tripBus || !tripDriver || !tripDeparture) return;
    setTripOpen(false);
    setTripRoute("");
    setTripBus("");
    setTripDriver("");
    setTripDeparture("");
    showToast("Trip logged");
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <PageHeader
        title="Transport Overview"
        subtitle="Demo Academy transport fleet · 12 active routes · 486 students on buses"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-sm font-semibold text-text-dark mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setRouteOpen(true)}>
            <MapPin className="w-4 h-4" /> Add Route
          </Button>
          <Button variant="secondary" onClick={() => setTripOpen(true)}>
            <ClipboardList className="w-4 h-4" /> Log Trip
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Today&apos;s Trips</h3>
          <Card className="divide-y divide-border-light">
            {todayTrips.map((t) => (
              <button
                key={t.id}
                onClick={() => setTripDetail(t)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-dark">{t.route}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {t.bus} · {t.driver} · {t.departure}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={t.status.variant}>{t.status.text}</Badge>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </div>
              </button>
            ))}
            <Link
              href="/transport-manager/trips"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all trips →
            </Link>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-dark mb-2">Vehicle Alerts</h3>
          <Card className="divide-y divide-border-light">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {a.icon === "wrench" ? (
                      <Wrench className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    )}
                    <p className="text-sm font-medium text-text-dark truncate">{a.title}</p>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{a.detail} · {a.time}</p>
                </div>
                <Badge variant={a.tone.variant}>{a.tone.text}</Badge>
              </div>
            ))}
            <Link
              href="/transport-manager/vehicles"
              className="block text-center text-xs font-medium text-primary hover:underline py-3"
            >
              View all vehicles →
            </Link>
          </Card>
        </div>
      </div>

      <Modal
        open={routeOpen}
        onClose={() => setRouteOpen(false)}
        title="Add Route"
        subtitle="Create a new school bus route"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRouteOpen(false)}>Cancel</Button>
            <Button onClick={saveRoute}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Route Name" required>
            <TextInput
              placeholder="e.g. Kubwa Line"
              value={newRoute}
              onChange={(e) => setNewRoute(e.target.value)}
            />
          </Field>
          <Field label="Stops" required>
            <TextArea
              rows={3}
              placeholder="Enter one stop per line"
              value={newRouteStops}
              onChange={(e) => setNewRouteStops(e.target.value)}
            />
          </Field>
          <SelectField
            label="Assigned Bus"
            required
            placeholder="Select bus"
            options={busOptions}
            value={newRouteBus}
            onChange={(e) => setNewRouteBus(e.target.value)}
          />
          <SelectField
            label="Driver"
            required
            placeholder="Select driver"
            options={driverOptions}
            value={newRouteDriver}
            onChange={(e) => setNewRouteDriver(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={tripOpen}
        onClose={() => setTripOpen(false)}
        title="Log Trip"
        subtitle="Record a trip run for today"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTripOpen(false)}>Cancel</Button>
            <Button onClick={saveTrip}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Route"
            required
            placeholder="Select route"
            options={routeNames}
            value={tripRoute}
            onChange={(e) => setTripRoute(e.target.value)}
          />
          <SelectField
            label="Bus"
            required
            placeholder="Select bus"
            options={busOptions}
            value={tripBus}
            onChange={(e) => setTripBus(e.target.value)}
          />
          <SelectField
            label="Driver"
            required
            placeholder="Select driver"
            options={driverOptions}
            value={tripDriver}
            onChange={(e) => setTripDriver(e.target.value)}
          />
          <SelectField
            label="Departure Time"
            required
            placeholder="Select departure time"
            options={departureTimes}
            value={tripDeparture}
            onChange={(e) => setTripDeparture(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={tripDetail !== null}
        onClose={() => setTripDetail(null)}
        title={tripDetail?.route ?? ""}
        subtitle={tripDetail ? `${tripDetail.id} · departs ${tripDetail.departure}` : undefined}
      >
        {tripDetail && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border-light p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-4 h-4 text-text-muted" />
                <p className="text-sm font-medium text-text-dark">{tripDetail.bus}</p>
              </div>
              <Badge variant={tripDetail.status.variant}>{tripDetail.status.text}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted flex items-center gap-1">
                  <Users className="w-3 h-3" /> Driver
                </p>
                <p className="text-sm font-medium text-text-dark mt-1">{tripDetail.driver}</p>
              </div>
              <div className="rounded-lg border border-border-light p-4">
                <p className="text-xs text-text-muted">Departure</p>
                <p className="text-sm font-medium text-text-dark mt-1">{tripDetail.departure}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green text-white px-5 py-3 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
