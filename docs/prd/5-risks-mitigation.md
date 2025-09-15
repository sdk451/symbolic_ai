# 5. Risks & Mitigation

* **Security (Webhook exposure)**: All demo runs must go through server-side API with secrets.
* **Over-engineering v1**: Keep v1 scope tight (auth, dashboard, demos, consultations). Defer courses/payments to v2.
* **Abuse of demo system**: Rate limits + quotas.
* **Performance (slow demo runs)**: Show progress indicators, async callbacks.
* **Persona mismatch**: Use onboarding segmentation and test messaging per audience.

---
