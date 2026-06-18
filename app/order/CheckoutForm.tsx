"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderCheckoutSchema, type OrderCheckoutInput } from "@/lib/validations";
import { submitCheckoutOrder } from "@/lib/actions/checkoutActions";

// ── Types ─────────────────────────────────────────────────────────────────────

type Prefill = {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  zip: string;
};

type Props = {
  scheduleId: string;
  dishName: string;
  price: number;
  deliveryDate: string;
  prefill?: Prefill;
};

type Confirmed = {
  orderNumber: string;
  quantity: number;
  total: number;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDeliveryDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

function inputClass(hasError: boolean): string {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 outline-none transition-colors",
    hasError
      ? "border-red-400 bg-red-50 focus:ring-1 focus:ring-red-400"
      : "border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900",
  ].join(" ");
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

function Label({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-neutral-700">
      {children}
      {optional && (
        <span className="ml-1 font-normal text-neutral-400">(optional)</span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-500">{message}</p>;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-xl bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Placing order…" : "Place Order"}
    </button>
  );
}

// ── Confirmation view ─────────────────────────────────────────────────────────

function ConfirmationView({
  orderNumber,
  dishName,
  deliveryDate,
  quantity,
  total,
}: Confirmed & { dishName: string; deliveryDate: string }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <svg
          className="h-10 w-10 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900">
        Order Confirmed
      </h1>
      <p className="mb-8 text-neutral-500">We will confirm shortly.</p>

      <div className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 px-6 py-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-neutral-400">
          Order Number
        </p>
        <p className="font-mono text-2xl font-bold tracking-tight text-neutral-900">
          {orderNumber}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-left">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Dish</span>
            <span className="font-medium text-neutral-900">{dishName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Delivery date</span>
            <span className="font-medium text-neutral-900">
              {formatDeliveryDate(deliveryDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Quantity</span>
            <span className="font-medium text-neutral-900">{quantity}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-100 pt-3">
            <span className="font-bold text-neutral-900">Total</span>
            <span className="font-bold text-neutral-900">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function CheckoutForm({
  scheduleId,
  dishName,
  price,
  deliveryDate,
  prefill,
}: Props) {
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OrderCheckoutInput>({
    resolver: zodResolver(OrderCheckoutSchema),
    defaultValues: {
      scheduleId,
      quantity: 1,
      timeSlot: "early",
      stripePaymentMethodId: "mock_pm_test",
      customerName: prefill?.name ?? "",
      customerPhone: prefill?.phone ?? "",
      customerEmail: prefill?.email ?? "",
      deliveryStreet: prefill?.street ?? "",
      deliveryCity: prefill?.city ?? "",
      deliveryZip: prefill?.zip ?? "",
    },
  });

  const quantity = watch("quantity");
  const safeQty = !quantity || isNaN(Number(quantity)) ? 1 : Number(quantity);
  const total = price * safeQty;

  async function onSubmit(data: OrderCheckoutInput) {
    setServerError(null);
    const res = await submitCheckoutOrder(data);
    if (res.success) {
      setConfirmed({ orderNumber: res.orderNumber, quantity: data.quantity, total });
    } else {
      setServerError(res.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (confirmed) {
    return (
      <ConfirmationView
        {...confirmed}
        dishName={dishName}
        deliveryDate={deliveryDate}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Hidden fields */}
      <input type="hidden" {...register("scheduleId")} />
      <input type="hidden" {...register("stripePaymentMethodId")} />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* ── Left column: form sections ──────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          {/* 1. Customer Details */}
          <SectionCard title="Customer Details">
            <div className="flex flex-col gap-4">
              <div>
                <Label>Full Name</Label>
                <input
                  {...register("customerName")}
                  placeholder="Jane Smith"
                  autoComplete="name"
                  className={inputClass(!!errors.customerName)}
                />
                <FieldError message={errors.customerName?.message} />
              </div>
              <div>
                <Label>Phone Number</Label>
                <input
                  {...register("customerPhone")}
                  type="tel"
                  placeholder="+1 555 000 0000"
                  autoComplete="tel"
                  className={inputClass(!!errors.customerPhone)}
                />
                <FieldError message={errors.customerPhone?.message} />
              </div>
              <div>
                <Label optional>Email</Label>
                <input
                  {...register("customerEmail")}
                  type="email"
                  placeholder="jane@example.com"
                  autoComplete="email"
                  className={inputClass(!!errors.customerEmail)}
                />
                <FieldError message={errors.customerEmail?.message} />
              </div>
            </div>
          </SectionCard>

          {/* 2. Delivery Address */}
          <SectionCard title="Delivery Address">
            <div className="flex flex-col gap-4">
              <div>
                <Label>Street Address</Label>
                <input
                  {...register("deliveryStreet")}
                  placeholder="123 Main St"
                  autoComplete="street-address"
                  className={inputClass(!!errors.deliveryStreet)}
                />
                <FieldError message={errors.deliveryStreet?.message} />
              </div>
              <div className="grid grid-cols-[1fr_7rem] gap-3">
                <div>
                  <Label>City</Label>
                  <input
                    {...register("deliveryCity")}
                    placeholder="Overland Park"
                    autoComplete="address-level2"
                    className={inputClass(!!errors.deliveryCity)}
                  />
                  <FieldError message={errors.deliveryCity?.message} />
                </div>
                <div>
                  <Label>ZIP</Label>
                  <input
                    {...register("deliveryZip")}
                    placeholder="66221"
                    maxLength={5}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className={inputClass(!!errors.deliveryZip)}
                  />
                  <FieldError message={errors.deliveryZip?.message} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 3. Order Details */}
          <SectionCard title="Order Details">
            <div className="flex flex-col gap-4">
              <div>
                <Label>
                  Quantity{" "}
                  <span className="font-normal text-neutral-400">(1–15)</span>
                </Label>
                <input
                  {...register("quantity", { valueAsNumber: true })}
                  type="number"
                  min={1}
                  max={15}
                  className={inputClass(!!errors.quantity)}
                />
                <FieldError message={errors.quantity?.message} />
              </div>
              <div>
                <Label>Delivery Time</Label>
                <select
                  {...register("timeSlot")}
                  className={inputClass(!!errors.timeSlot) + " cursor-pointer"}
                >
                  <option value="early">6:30 PM – 7:30 PM</option>
                  <option value="late">7:30 PM – 8:30 PM</option>
                </select>
                <FieldError message={errors.timeSlot?.message} />
              </div>
            </div>
          </SectionCard>

          {/* 4. Payment (mock) */}
          <SectionCard title="Payment">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
                <span className="text-base">⚠</span>
                <p className="text-xs font-medium text-amber-700">
                  Test mode — no charge will be made
                </p>
              </div>
              <div>
                <Label>Card Number</Label>
                <input
                  value="4242 4242 4242 4242"
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm tracking-widest text-neutral-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Expiry</Label>
                  <input
                    value="12 / 29"
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-400"
                  />
                </div>
                <div>
                  <Label>CVV</Label>
                  <input
                    value="•••"
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-400"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Submit (desktop only — mobile submit lives in the summary panel) */}
          <div className="hidden lg:block">
            <SubmitButton loading={isSubmitting} />
          </div>
        </div>

        {/* ── Right column: order summary ──────────────────────────────── */}
        <div className="lg:sticky lg:top-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Order Summary
            </h2>

            {/* Locked dish info */}
            <div className="mb-5 rounded-xl bg-neutral-50 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-900">{dishName}</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {formatDeliveryDate(deliveryDate)}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Unit price</span>
                <span className="text-neutral-900">${price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Quantity</span>
                <span className="text-neutral-900">{safeQty}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-neutral-100 pt-3">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="font-bold text-neutral-900">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit (mobile) */}
            <div className="mt-6 lg:hidden">
              <SubmitButton loading={isSubmitting} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
