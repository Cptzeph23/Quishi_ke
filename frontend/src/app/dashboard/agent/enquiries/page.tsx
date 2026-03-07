"use client";
/**
 * FILE:    dashboard/agent/enquiries/page.tsx
 * PURPOSE: Agent enquiries inbox — view and update status of all enquiries
 *          on their listings.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Mail, Phone, Clock, ChevronDown } from "lucide-react";
import { Navbar }    from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DataTable } from "@/components/dashboard/DataTable";
import { Badge }     from "@/components/ui/Badge";
import { enquiriesApi, type Enquiry } from "@/lib/api/enquiries";
import { timeAgo, cn } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  new:      "bg-blue-50  text-blue-700  border-blue-100",
  read:     "bg-gray-50  text-gray-600  border-gray-200",
  replied:  "bg-green-50 text-green-700 border-green-100",
  archived: "bg-red-50   text-red-600   border-red-100",
};

export default function AgentEnquiriesPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["enquiries", filter],
    queryFn:  () => enquiriesApi.list(filter !== "all" ? { status: filter } : {}),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Enquiry["status"] }) =>
      enquiriesApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["enquiries"] });
      toast.success("Status updated.");
    },
  });

  const columns = [
    {
      key: "from", header: "From",
      render: (e: Enquiry) => (
        <div>
          <p className="font-medium text-sm text-gray-900">{e.sender_name}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Mail size={10} />{e.sender_email}
          </p>
          {e.sender_phone && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Phone size={10} />{e.sender_phone}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "property", header: "Property",
      render: (e: Enquiry) => (
        <p className="text-sm text-gray-700 line-clamp-1">{e.property_title}</p>
      ),
    },
    {
      key: "message", header: "Message",
      render: (e: Enquiry) => (
        <p className="text-sm text-gray-500 line-clamp-2 max-w-xs">{e.message}</p>
      ),
    },
    {
      key: "status", header: "Status", width: "w-36",
      render: (e: Enquiry) => (
        <div className="relative" onClick={(ev) => ev.stopPropagation()}>
          <select
            value={e.status}
            onChange={(ev) => statusMutation.mutate({
              id: e.id, status: ev.target.value as Enquiry["status"]
            })}
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full border appearance-none",
              "cursor-pointer focus:outline-none pr-6",
              STATUS_COLORS[e.status]
            )}
          >
            {["new","read","replied","archived"].map((s) => (
              <option key={s} value={s} className="capitalize bg-white text-gray-700">{s}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>
      ),
    },
    {
      key: "time", header: "Received", width: "w-28",
      render: (e: Enquiry) => (
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={10} />{timeAgo(e.created_at)}
        </span>
      ),
    },
    {
      key: "reply", header: "", width: "w-24",
      render: (e: Enquiry) => (
        <a href={`mailto:${e.sender_email}?subject=Re: ${encodeURIComponent(e.property_title)}`}
          onClick={(ev) => ev.stopPropagation()}
          className="text-xs text-brand-600 hover:underline font-medium flex items-center gap-1">
          <Mail size={11} /> Reply
        </a>
      ),
    },
  ];

  const counts = {
    all:      data?.count ?? 0,
    new:      data?.results.filter((e) => e.status === "new").length     ?? 0,
    replied:  data?.results.filter((e) => e.status === "replied").length ?? 0,
  };

  return (
    <AuthGuard role={["agent","admin"]}>
      <div className="min-h-screen bg-[#FAFAF8]">
        <Navbar />
        <main className="page-container py-8 space-y-6">

          <div>
            <h1 className="heading-section flex items-center gap-2">
              <MessageSquare size={22} className="text-brand-500" />
              Enquiries
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Messages from prospective tenants and buyers.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {[
              { key: "all",     label: `All (${counts.all})` },
              { key: "new",     label: `New (${counts.new})` },
              { key: "read",    label: "Read" },
              { key: "replied", label: `Replied (${counts.replied})` },
              { key: "archived",label: "Archived" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px capitalize",
                  filter === key
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}>
                {label}
              </button>
            ))}
          </div>

          <DataTable
            columns={columns}
            data={data?.results ?? []}
            isLoading={isLoading}
            rowKey={(e) => e.id}
            emptyMessage="No enquiries yet. They'll appear here when buyers contact you."
          />
        </main>
      </div>
    </AuthGuard>
  );
}