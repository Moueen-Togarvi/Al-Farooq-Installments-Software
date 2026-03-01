<section class="space-y-4">
  <h2 class="text-xl font-semibold">Installment Plan Creation</h2>

  <form class="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
    <label class="field"><span>Select Customer</span><select><option>Choose customer</option></select></label>
    <label class="field"><span>Select Product</span><select><option>Choose product</option></select></label>
    <label class="field"><span>Down Payment</span><input type="number" placeholder="10000" /></label>
    <label class="field"><span>Total Amount</span><input type="number" placeholder="65000" /></label>
    <label class="field"><span>Profit Calculation</span><input type="number" placeholder="15000" /></label>
    <label class="field"><span>Duration</span><select><option>6 Months</option><option>12 Months</option><option>18 Months</option></select></label>
    <label class="field sm:col-span-2"><span>Monthly Due Date</span><input type="date" /></label>
    <button class="btn sm:col-span-2" type="button">Auto-Generate Installment Schedule</button>
  </form>
</section>
