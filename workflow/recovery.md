Codavio recovery applies only to an explicitly invoked, still-active workflow in this session.
Do not start Codavio merely because recovery context or a work item exists. Ignore this context
if the workflow was completed, paused, cancelled, or exited.

Before the next workflow action, reload `codavio-orchestrate` and restore the selected work
item's brief, approvals, evidence, unfinished gates and next role. Read its Delivery state ledger:
do not repeat completed tasks with valid evidence; resume an interrupted task at its recorded
next action. Follow the recovery checkpoint before delegation or a phase transition. Missing
evidence keeps an obligation pending. Recovery does not authorize a coordinator to perform role work.
