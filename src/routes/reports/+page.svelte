<section class="space-y-4">
  <h2 class="text-xl font-semibold">Reports</h2>

  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#each ['Customer Ledger', 'Installment History', 'Daily Collection', 'Monthly Collection', 'Defaulter List', 'Profit Report'] as report}
      <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 class="font-semibold">{report}</h3>
        <p class="mt-1 text-sm text-slate-600">View and export in Excel or PDF format.</p>
        <div class="mt-3 flex gap-2">
          <button class="btn" type="button">Export Excel</button>
          <button class="btn" type="button">Export PDF</button>
        </div>
      </article>
    {/each}
  </div>
</section>
