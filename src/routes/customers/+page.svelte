<section class="space-y-4">
  <h2 class="text-xl font-semibold">Customer Management</h2>
  <p class="text-sm text-slate-600">
    Add, update, and track customer records with CNIC and guarantor details.
  </p>

  <form class="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
    <label class="field"><span>Customer Name</span><input placeholder="Muhammad Ali" /></label>
    <label class="field"><span>Father/Reference Name</span><input placeholder="Abdul Hameed" /></label>
    <label class="field"><span>CNIC</span><input placeholder="35202-1234567-8" /></label>
    <label class="field"><span>Mobile Number</span><input placeholder="03xx-xxxxxxx" /></label>
    <label class="field"><span>Alternate Mobile</span><input placeholder="03xx-xxxxxxx" /></label>
    <label class="field"><span>Status</span><select><option>Active</option><option>Defaulter</option><option>Closed</option></select></label>
    <label class="field sm:col-span-2"><span>Address</span><textarea rows="3" placeholder="Street, Area, City"></textarea></label>
    <label class="field"><span>Customer Photo</span><input type="file" accept="image/*" /></label>
    <label class="field"><span>CNIC Front/Back</span><input type="file" accept="image/*" multiple /></label>
    <label class="field sm:col-span-2"><span>Guarantor Details</span><textarea rows="2" placeholder="Guarantor name, relation, contact"></textarea></label>
    <button class="btn sm:col-span-2" type="button">Save Customer</button>
  </form>
</section>
