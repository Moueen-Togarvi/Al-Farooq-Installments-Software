<section class="space-y-4">
  <h2 class="text-xl font-semibold">Installment Tracking & Payments</h2>

  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full text-sm">
      <thead class="bg-slate-100 text-left text-slate-700">
        <tr>
          <th class="px-3 py-2">Month</th>
          <th class="px-3 py-2">Year</th>
          <th class="px-3 py-2">Installment</th>
          <th class="px-3 py-2">Received</th>
          <th class="px-3 py-2">Pending</th>
          <th class="px-3 py-2">Payment Date</th>
          <th class="px-3 py-2">Fine</th>
          <th class="px-3 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-t border-slate-200">
          <td class="px-3 py-2">Jan</td>
          <td class="px-3 py-2">2026</td>
          <td class="px-3 py-2">PKR 4,583</td>
          <td class="px-3 py-2">PKR 4,583</td>
          <td class="px-3 py-2">PKR 0</td>
          <td class="px-3 py-2">2026-01-05</td>
          <td class="px-3 py-2">PKR 0</td>
          <td class="px-3 py-2"><span class="badge-paid">Paid</span></td>
        </tr>
        <tr class="border-t border-slate-200">
          <td class="px-3 py-2">Feb</td>
          <td class="px-3 py-2">2026</td>
          <td class="px-3 py-2">PKR 4,583</td>
          <td class="px-3 py-2">PKR 2,000</td>
          <td class="px-3 py-2">PKR 2,583</td>
          <td class="px-3 py-2">2026-02-12</td>
          <td class="px-3 py-2">PKR 150</td>
          <td class="px-3 py-2"><span class="badge-partial">Partial</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 class="text-base font-semibold">Record Payment</h3>
    <div class="mt-3 grid gap-3 sm:grid-cols-2">
      <label class="field"><span>Received Amount</span><input type="number" placeholder="2500" /></label>
      <label class="field"><span>Late Fine</span><input type="number" placeholder="150" /></label>
      <label class="field"><span>Signature Upload (Optional)</span><input type="file" accept="image/*" /></label>
      <label class="field"><span>Receipt</span><button class="btn" type="button">Generate / Print PDF</button></label>
    </div>
  </div>
</section>
