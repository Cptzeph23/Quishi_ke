"use client";
/**
 * FILE:    frontend/src/components/property/EnquiryForm.tsx
 * PURPOSE: Contact-agent enquiry form shown on property detail page.
 *          Pre-fills name/email for authenticated users. Anonymous submissions allowed.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Send, CheckCircle2, User, Mail, Phone, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { Input }   from "@/components/ui/Input";
import { Button }  from "@/components/ui/Button";
import { enquiriesApi } from "@/lib/api/enquiries";
import { useAuthStore }  from "@/store/authStore";
import { cn } from "@/lib/utils";

const schema = z.object({
  sender_name:  z.string().min(2, "Name is required"),
  sender_email: z.string().email("Enter a valid email"),
  sender_phone: z.string().optional(),
  message:      z.string().min(10, "Please write at least 10 characters"),
});
type FormValues = z.infer<typeof schema>;

const QUICK_MESSAGES = [
  "I'd like to book a viewing.",
  "Is this property still available?",
  "Can you share more details about the lease terms?",
];

interface EnquiryFormProps {
  propertyId:    string;
  propertyTitle: string;
  agentName?:    string;
}

export function EnquiryForm({ propertyId, propertyTitle, agentName }: EnquiryFormProps) {
  const user    = useAuthStore((s) => s.user);
  const [sent,  setSent] = useState(false);

  const { register, handleSubmit, setValue, watch,
          formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sender_name:  user?.full_name  ?? "",
      sender_email: user?.email      ?? "",
      sender_phone: user?.phone      ?? "",
      message:      "",
    },
  });

  const message = watch("message");

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      enquiriesApi.submit({ property: propertyId, ...data }),
    onSuccess: () => setSent(true),
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message?.[0] ??
        "Failed to send enquiry. Please try again.";
      toast.error(msg);
    },
  });

  if (sent) {
    return (
      <div className="card p-6 flex flex-col items-center text-center gap-3 py-10">
        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
        <h3 className="font-semibold text-gray-900">Enquiry sent!</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          {agentName ? `${agentName} will` : "The agent will"} get back to you at{" "}
          <span className="font-medium text-gray-700">{watch("sender_email")}</span> shortly.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-2 text-xs text-brand-600 hover:underline font-medium">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-900">Contact {agentName ?? "the agent"}</h3>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{propertyTitle}</p>
      </div>

      {/* Quick-reply chips */}
      <div className="flex flex-col gap-2">
        {QUICK_MESSAGES.map((qm) => (
          <button key={qm} type="button"
            onClick={() => setValue("message", qm, { shouldDirty: true })}
            className={cn(
              "text-left text-xs px-3 py-2 rounded-lg border transition-colors",
              message === qm
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-gray-200 text-gray-600 hover:border-brand-300"
            )}>
            {qm}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
        <Input label="Your name" leftIcon={<User size={14} />}
          error={errors.sender_name?.message}
          {...register("sender_name")} />

        <Input label="Email address" type="email" leftIcon={<Mail size={14} />}
          error={errors.sender_email?.message}
          {...register("sender_email")} />

        <Input label="Phone number (optional)" type="tel" leftIcon={<Phone size={14} />}
          placeholder="+254 700 000 000"
          {...register("sender_phone")} />

        <div>
          <label className="label flex items-center gap-1.5">
            <MessageSquare size={13} className="text-gray-400" /> Message
          </label>
          <textarea rows={4} placeholder="Tell the agent what you're looking for…"
            className={cn("input resize-none text-sm", errors.message && "border-red-400")}
            {...register("message")} />
          {errors.message && (
            <p className="mt-1.5 text-xs text-red-500">{errors.message.message}</p>
          )}
        </div>

        <Button type="submit" fullWidth loading={mutation.isPending}
          rightIcon={<Send size={14} />}>
          Send enquiry
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Your contact details will only be shared with the listing agent.
        </p>
      </form>
    </div>
  );
}