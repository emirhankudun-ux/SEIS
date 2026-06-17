"use client";

import { type FormEvent, useState } from "react";

import type { LocalizedDictionary, ServiceItem } from "@seis/content";

type BriefState = "idle" | "sending" | "sent" | "error";

export function BriefIntakeForm({
  dictionary,
  services
}: {
  dictionary: LocalizedDictionary;
  services: ServiceItem[];
}) {
  const [briefState, setBriefState] = useState<BriefState>("idle");
  const isSending = briefState === "sending";
  const statusMessage =
    briefState === "sending" ? dictionary.briefSending :
    briefState === "sent" ? dictionary.briefAccepted :
    briefState === "error" ? dictionary.briefError :
    "";

  async function submitBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSending) return;

    const formElement = event.currentTarget;
    setBriefState("sending");
    const form = new FormData(formElement);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch("/api/briefs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => null);

    setBriefState(response?.ok ? "sent" : "error");
    if (response?.ok) {
      formElement.reset();
    }
  }

  function resetStatusOnEdit() {
    if (briefState === "sent" || briefState === "error") {
      setBriefState("idle");
    }
  }

  return (
    <form
      aria-busy={isSending}
      className="brief-form"
      id="brief-form"
      onChange={resetStatusOnEdit}
      onSubmit={submitBrief}
    >
      <h3>{dictionary.briefTitle}</h3>
      <fieldset className="brief-fieldset" disabled={isSending}>
        <legend className="sr-only">{dictionary.briefTitle}</legend>
        <div className="form-grid">
          <label>
            <span>{dictionary.briefName}</span>
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            <span>{dictionary.briefEmail}</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            <span>{dictionary.briefService}</span>
            <select name="service" defaultValue="ui-ux">
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.title}</option>
              ))}
            </select>
          </label>
          <label>
            <span>{dictionary.briefTimeline}</span>
            <input name="timeline" placeholder={dictionary.briefTimelinePlaceholder} />
          </label>
          <label>
            <span>{dictionary.briefBudget}</span>
            <input name="budget" placeholder={dictionary.briefBudgetPlaceholder} />
          </label>
          <label>
            <span>{dictionary.briefPriority}</span>
            <select name="priority" defaultValue="calm">
              <option value="calm">{dictionary.briefPriorityCalm}</option>
              <option value="near">{dictionary.briefPriorityNear}</option>
              <option value="urgent">{dictionary.briefPriorityUrgent}</option>
            </select>
          </label>
        </div>
        <label>
          <span>{dictionary.briefScope}</span>
          <input name="scope" placeholder={dictionary.briefScopePlaceholder} />
        </label>
        <label>
          <span>{dictionary.briefMessage}</span>
          <textarea name="goal" required minLength={12} rows={5} />
        </label>
      </fieldset>
      <button
        aria-describedby="brief-form-status"
        className="primary-link"
        type="submit"
        disabled={isSending}
      >
        {isSending ? dictionary.briefSending : dictionary.briefSubmit}
      </button>
      <p
        className="form-status"
        data-state={briefState}
        id="brief-form-status"
        role="status"
        aria-live="polite"
      >
        {statusMessage}
      </p>
    </form>
  );
}
