# Platform Configuration Requirements

## Purpose

The Platform Configuration module allows administrators to configure platform-wide operational settings without requiring code changes or redeployment. It serves as the single source of truth for all tuneable parameters that govern platform behavior, ensuring consistent and predictable operations across all tenants and services.

---

## Configurable Settings

### Financial Settings

| Setting | Description | Default |
|---|---|---|
| Vendor Commission Percentage | Percentage of each transaction paid to the vendor | — |
| Courier Commission Percentage | Percentage of each transaction paid to the courier | — |

### Delivery Settings

| Setting | Description | Default |
|---|---|---|
| Maximum Active Deliveries Per Courier | Number of concurrent deliveries a courier may handle | 3 |
| Delivery Verification Code Length | Number of digits in the delivery verification code | 4 |

### Order & Vendor Settings

| Setting | Description | Default |
|---|---|---|
| Vendor Order Acceptance Timeout | Time window within which a vendor must accept or decline an order | — |

### Security Settings

| Setting | Description | Default |
|---|---|---|
| Maximum Appeal Attempts | Number of times a user may appeal an account restriction | 3 |
| Maximum Failed Login Attempts | Number of failed logins before account lockout | 5 |
| Account Lockout Duration | Duration of account lockout after exceeding failed login threshold | 15 minutes |

### Marketing Settings

| Setting | Description | Default |
|---|---|---|
| Advertisement Enabled | Whether advertisements are displayed across the platform | Off |
| Advertisement Schedule | Time windows during which advertisements are active | — |
| Promo Code Usage Limit | Maximum number of times a promo code can be redeemed | — |
| Promo Code Validity Period | Start and end dates during which a promo code is active | — |
| Promo Code Minimum Order Value | Minimum order total required to apply a promo code | — |

---

## Business Rules

1. **Administrators Only.** Only administrators with the appropriate permissions may modify platform configuration.
2. **Forward-Looking Application.** Configuration changes apply only to new transactions unless explicitly stated otherwise. Existing in-progress transactions retain the values that were active at the time they were created.
3. **Audit Trail.** Every configuration change must be recorded in the audit log, including the previous value, the new value, the administrator who made the change, and the timestamp.
4. **No Hardcoded Fallbacks.** The platform must always use configured values. Under no circumstances should the system fall back to hardcoded values when a configuration setting exists.
5. **Sensible Defaults.** The system must provide sensible default values for every configurable setting so the platform is operational out of the box without manual configuration.

---

## Future Configuration Options

The following settings are planned for future releases and are not part of the initial implementation:

- **Notification Settings** — control email, SMS, and push notification behaviour across the platform.
- **Payment Settings** — configure payment gateways, settlement cycles, and currency options.
- **Feature Toggles** — enable or disable platform features per tenant or globally.
- **Rate Limiting** — control API rate limits and request throttling thresholds.
- **Branding Settings** — configure platform branding elements such as logos, colours, and email templates.
