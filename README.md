# Tool Management System — Colegio Agropecuario San Carlos
A navigable **UI/UX prototype designed in Figma** to manage the full lifecycle of school tools: reservations, loans, returns, and reporting — built for an agricultural technical high school.
---

## Project Overview
This project is a **non-coded UI/UX design** that proposes a digital solution to replace the informal, manual controls used to manage tools at the school. It covers everything from planning (reservations) to auditing (reports), including the daily flow of loans and returns.
---

## Problem It Solves

Educational institutions that work with field tools face recurring issues:
- No real control over tool availability by date and time block.
- Conflicts between teachers due to unstructured reservations.
- Lost tools or returns in poor condition with no traceability.
- Difficulty assigning responsibility per tool and per student.
- No reliable reports for auditing, maintenance, or decision-making.
---

## User Roles

| Role | Access |
|------|--------|
| **Administrator** | Catalogs, users, system settings, audit logs |
| **Teacher** | Reservations, opening and closing loans, own reports |
| **Warehouse Keeper** | Tool delivery, returns, incident registration |
---

## Screens Designed

1. **Login** — Role-based authentication (Administrator / Teacher)
2. **Dashboard** — Daily summary: reservations, open loans, recent incidents, availability
3. **Tool Inventory** — Table with search and filters by type/status
4. **Create Reservation** — Date, time block (Full Day / Morning / Afternoon) and tools by type/quantity
5. **Reservation Detail** — View, edit, cancel and status
6. **Open Loan** — From an existing reservation or manually
7. **Tool Delivery** — Assign a tool to a student within the loan
8. **Return & Verification** — Mark status: OK or report an incident (type + description)
9. **Loan Settlement** — Validate pending items and confirm closure
10. **Reports & Analytics** — Multiple reports with filters (availability, usage, incidents, loans)
---

## Business Rules Reflected in the UI

- Time block is always: **Full Day / Morning / Afternoon**.
- When reserving, real-time availability is shown (e.g. *"Available: 12 / Requested: 8"*).
- A reservation blocks quantities, but the loan can be adjusted when formalized.
- **A loan cannot be settled** if any tools have no return or status registered.
- Returned tools are set to *Available* (OK) or *Under Repair / Decommissioned* (incident).
---
## Design Details

- **Tool:** Figma (free plan)
- **Color palette:** Institutional green (`#3a5a1c` and variants) on light neutral backgrounds
- **Components:** Buttons, inputs, status badges, modals, tables, metric cards
- **Context imagery:** Agricultural photography used as section banners
---

## How to View the Prototype
1. Open the file in [Figma](https://figma.com).
2. Select the **"Login"** screen as the starting point.
3. Press ▶ **Present** to launch the navigable prototype.
4. Demo credentials:
   - **Administrator:** `admin` / `admin123`
   - **Teacher:** any name / `prof123`
---

## Author
> Paulina Rojas — @paulina-rc
