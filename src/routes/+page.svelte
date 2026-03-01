<script lang="ts">
  import KpiCard from '$lib/components/KpiCard.svelte';

  const kpis = [
    { label: 'Total Customers', value: '1,248', hint: 'Active + Closed + Defaulters' },
    { label: 'Active Installment Plans', value: '412', hint: 'Across all categories' },
    { label: 'Total Received Amount', value: 'PKR 12,480,000', hint: 'All-time collection' },
    { label: 'Total Pending Amount', value: 'PKR 3,420,000', hint: 'Outstanding balance' },
    { label: "Today's Due Installments", value: '34', hint: 'Need collection follow-up' },
    { label: 'Overdue Customers', value: '27', hint: 'Marked as potential defaulters' },
    { label: 'Monthly Income', value: 'PKR 1,050,000', hint: 'Current month realized income' }
  ];
</script>

<section class="space-y-4">
  <h2 class="text-xl font-semibold">Dashboard</h2>

  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {#each kpis as item}
      <KpiCard {...item} />
    {/each}
  </div>

  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 class="text-base font-semibold">Today&apos;s Action List</h3>
    <ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
      <li>Call 10 overdue customers and log response in recovery notes.</li>
      <li>Verify partial payments and print pending receipts.</li>
      <li>Review defaulter list and apply fine waiver where approved.</li>
    </ul>
  </section>
</section>
