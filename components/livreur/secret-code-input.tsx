"use client";

import { useState } from "react";

type Props = {
  name?: string;
  id?: string;
  disabled?: boolean;
};

/** Champ de saisie strictement limité à 4 chiffres (filtre en temps réel). */
export function SecretCodeInput({ name = "secret_code", id = "secret_code", disabled }: Props) {
  const [value, setValue] = useState("");

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      pattern="\d{4}"
      autoComplete="one-time-code"
      minLength={4}
      maxLength={4}
      placeholder="0000"
      required
      title="Saisissez les 4 chiffres communiqués par le client."
      value={value}
      onChange={(e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
        setValue(digitsOnly);
      }}
      onPaste={(e) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        if (pasted) {
          e.preventDefault();
          setValue(pasted);
        }
      }}
      onBeforeInput={(e) => {
        const ev = e as unknown as InputEvent;
        const data = ev.data ?? "";
        if (data && /\D/.test(data)) {
          e.preventDefault();
        }
      }}
      className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-center font-mono text-2xl font-black tracking-[0.6em] tabular-nums text-slate-900 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
      disabled={disabled}
    />
  );
}
