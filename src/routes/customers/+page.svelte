<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		Plus, 
		Search, 
		MoreVertical, 
		Trash2, 
		Edit2, 
		UserPlus,
		CheckCircle2,
		XCircle,
		AlertCircle,
		Users
	} from 'lucide-svelte';

	let { data, form } = $props();
	let showAddModal = $state(false);
	let editingCustomer = $state<any>(null);
	let searchQuery = $state('');

	const filteredCustomers = $derived(
		data.customers.filter((c: any) => 
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
			c.cnic.includes(searchQuery) ||
			c.mobile.includes(searchQuery)
		)
	);

	function getStatusColor(status: string) {
		switch (status) {
			case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
			case 'CLOSED': return 'bg-gray-100 text-gray-700 border-gray-200';
			case 'DEFAULTER': return 'bg-red-50 text-red-700 border-red-200';
			default: return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-black text-gray-900 tracking-tight leading-none">Customer Directory</h1>
			<p class="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest leading-none">Manage and monitor all installment clients</p>
		</div>
		<button 
			onclick={() => showAddModal = true}
			class="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
		>
			<UserPlus class="w-4 h-4" />
			Add Customer
		</button>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4">
		<div class="relative flex-1 min-w-[300px]">
			<Search class="absolute left-3 inset-y-0 my-auto w-4 h-4 text-gray-400" />
			<input 
				type="text" 
				placeholder="SEARCH BY NAME, CNIC OR MOBILE..." 
				bind:value={searchQuery}
				class="w-full pl-9 pr-4 py-2 bg-transparent border-transparent focus:ring-0 transition-all outline-none text-gray-900 text-[10px] font-black uppercase tracking-widest h-10 placeholder:text-gray-300"
			/>
		</div>
	</div>

	<!-- Customer List (Responsive Layout) -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
		<!-- Desktop Table View -->
		<div class="hidden md:block overflow-x-auto">
			<table class="w-full text-left border-collapse min-w-[1000px]">
				<thead>
					<tr class="bg-gray-50 border-b border-gray-100">
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Profile</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">CNIC #</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile/Ref</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each filteredCustomers as customer}
						<tr class="hover:bg-gray-50/50 transition-colors group">
							<td class="px-6 py-4">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-white shrink-0 shadow-sm text-xs">
										{customer.name.substring(0, 2).toUpperCase()}
									</div>
									<p class="text-sm font-black text-gray-900">{customer.name}</p>
								</div>
							</td>
							<td class="px-6 py-4">
								<p class="text-xs font-black text-gray-600 tracking-wide">{customer.cnic}</p>
							</td>
							<td class="px-6 py-4">
								<p class="text-xs font-black text-gray-900">{customer.mobile}</p>
								{#if customer.referenceName}
									<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Ref: {customer.referenceName}</p>
								{/if}
							</td>
							<td class="px-6 py-4">
								<p class="text-[10px] font-bold text-gray-500 max-w-[200px] leading-tight truncate">{customer.address}</p>
							</td>
							<td class="px-6 py-4">
								<span class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border {getStatusColor(customer.status)}">
									{customer.status}
								</span>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center justify-center">
									<div class="flex items-center gap-1.5">
										<button 
											onclick={() => editingCustomer = customer}
											class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[9px] font-black uppercase tracking-widest text-blue-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
										>
											<Edit2 class="w-3 h-3" /> Edit
										</button>
										{#if customer._count?.plans === 0}
										<form 
											method="POST" 
											action="?/delete&id={customer.id}" 
											onsubmit={(e) => { if(!confirm('Are you sure you want to delete this customer?')) e.preventDefault(); }} 
											use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'failure') {
														alert(result.data?.error || 'Failed to delete customer.');
													}
												};
											}}
										>
											<button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[9px] font-black uppercase tracking-widest text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm active:scale-95">
												<Trash2 class="w-3 h-3" /> Delete
											</button>
										</form>
										{:else}
										<span class="px-2 py-1 bg-gray-50 text-[8px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 rounded-lg cursor-not-allowed flex items-center gap-1" title="Active installments exist">
											<AlertCircle class="w-2.5 h-2.5" /> Locked
										</span>
										{/if}
									</div>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-6 py-16 text-center">
								<div class="flex flex-col items-center gap-2">
									<Users class="w-10 h-10 text-gray-200 mb-2" />
									<p class="text-gray-400 font-black uppercase tracking-widest text-[10px]">No customers found</p>
									<p class="text-[10px] font-bold text-gray-400">Try adding a new customer or adjusting your search</p>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile Card View -->
		<div class="md:hidden flex flex-col divide-y divide-gray-100">
			{#each filteredCustomers as customer}
				<div class="p-4 space-y-4 bg-white">
					<div class="flex items-start justify-between">
						<div class="flex items-center gap-3">
							<div class="w-10 h-10 rounded-full bg-black flex items-center justify-center font-black text-sm text-white shadow-sm">
								{customer.name.substring(0, 2).toUpperCase()}
							</div>
							<div>
								<p class="text-sm font-black text-gray-900 leading-tight">{customer.name}</p>
								<p class="text-[10px] font-black text-gray-500 mt-0.5 tracking-widest">{customer.mobile}</p>
							</div>
						</div>
						<span class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border {getStatusColor(customer.status)} mt-1">
							{customer.status}
						</span>
					</div>
					
					<div class="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
						<div>
							<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">CNIC #</p>
							<p class="text-xs font-black text-gray-900">{customer.cnic}</p>
						</div>
						{#if customer.referenceName}
						<div>
							<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Reference</p>
							<p class="text-[10px] font-black text-gray-600 truncate">{customer.referenceName}</p>
						</div>
						{/if}
						<div class="col-span-2 mt-1 border-t border-gray-200/60 pt-2">
							<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Address</p>
							<p class="text-[10px] font-bold text-gray-500 leading-snug">{customer.address}</p>
						</div>
					</div>

					<div class="flex items-center justify-between gap-2 pt-1">
						<button 
							onclick={() => editingCustomer = customer}
							class="flex-1 flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
						>
							<Edit2 class="w-3.5 h-3.5" /> Edit Profile
						</button>
						{#if customer._count?.plans === 0}
						<form 
							method="POST" 
							action="?/delete&id={customer.id}" 
							onsubmit={(e) => { if(!confirm('Are you sure you want to delete this customer?')) e.preventDefault(); }} 
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'failure') {
										alert(result.data?.error || 'Failed to delete customer.');
									}
								};
							}}
							class="flex-1"
						>
							<button class="w-full flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest text-red-600 hover:border-red-200 hover:bg-red-50 active:scale-95 transition-all shadow-sm">
								<Trash2 class="w-3.5 h-3.5" /> Delete
							</button>
						</form>
						{:else}
						<div class="flex-1 flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400 cursor-not-allowed">
							<AlertCircle class="w-3.5 h-3.5" /> Active Sale
						</div>
						{/if}
					</div>
				</div>
			{:else}
				<div class="px-6 py-12 text-center">
					<div class="flex flex-col items-center gap-2">
						<Users class="w-10 h-10 text-gray-200 mb-2" />
						<p class="text-gray-400 font-black uppercase tracking-widest text-[10px]">No customers found</p>
						<p class="text-[10px] font-bold text-gray-400">Try adjusting your search</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Add Customer Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0">
				<h2 class="text-lg font-black text-gray-900 tracking-tight">Add New Customer</h2>
				<button 
					onclick={() => showAddModal = false}
					class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors active:scale-95"
				>
					<XCircle class="w-5 h-5" />
				</button>
			</div>

			<form 
				method="POST" 
				action="?/create" 
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							showAddModal = false;
						}
					};
				}}
				class="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
			>
				{#if form?.error}
					<div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200 flex items-center gap-2">
						<AlertCircle class="w-4 h-4 shrink-0" />
						{form.error}
					</div>
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="space-y-1.5">
						<label for="name" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</label>
						<input type="text" name="name" id="name" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
					</div>
					<div class="space-y-1.5">
						<label for="cnic" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">CNIC Number</label>
						<input type="text" name="cnic" id="cnic" placeholder="42101-XXXXXXX-X" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="space-y-1.5">
						<label for="mobile" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mobile Number</label>
						<input type="text" name="mobile" id="mobile" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
					</div>
					<div class="space-y-1.5">
						<label for="referenceName" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reference Name</label>
						<input type="text" name="referenceName" id="referenceName" class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
					</div>
				</div>

				<div class="space-y-1.5">
					<label for="address" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resident Address</label>
					<textarea name="address" id="address" rows="3" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold resize-none"></textarea>
				</div>

				<div class="flex items-center gap-3 pt-4 border-t border-gray-100">
					<button 
						type="button"
						onclick={() => showAddModal = false}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs uppercase tracking-widest active:scale-95"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-[2] px-4 py-2 rounded-lg bg-black text-white shadow-sm hover:bg-gray-800 transition-colors text-xs font-black uppercase tracking-widest active:scale-95"
					>
						Create Account
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Customer Modal -->
{#if editingCustomer}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0">
				<h2 class="text-lg font-black text-gray-900 tracking-tight">Edit Customer Profile</h2>
				<button 
					onclick={() => editingCustomer = null}
					class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors active:scale-95"
				>
					<XCircle class="w-5 h-5" />
				</button>
			</div>

			<form 
				method="POST" 
				action="?/update&id={editingCustomer.id}" 
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							editingCustomer = null;
						} else if (result.type === 'failure') {
							alert(result.data?.error || 'Failed to update customer');
						}
					};
				}}
				class="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
			>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="space-y-1.5">
						<label for="edit_name" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Name</label>
						<input type="text" name="name" id="edit_name" value={editingCustomer.name} required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
					</div>
					<div class="space-y-1.5">
						<label for="edit_cnic" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">CNIC Number</label>
						<input type="text" name="cnic" id="edit_cnic" value={editingCustomer.cnic} required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="space-y-1.5">
						<label for="edit_mobile" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mobile Number</label>
						<input type="text" name="mobile" id="edit_mobile" value={editingCustomer.mobile} required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
					</div>
					<div class="space-y-1.5">
						<label for="edit_referenceName" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reference Name</label>
						<input type="text" name="referenceName" id="edit_referenceName" value={editingCustomer.referenceName || ''} class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
					</div>
				</div>

				<div class="space-y-1.5">
					<label for="edit_address" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resident Address</label>
					<textarea name="address" id="edit_address" rows="3" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold resize-none">{editingCustomer.address}</textarea>
				</div>
                
                <div class="space-y-1.5 border-t border-gray-100 pt-5">
					<label for="edit_status" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer Status</label>
					<select name="status" id="edit_status" value={editingCustomer.status} class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold">
                        <option value="ACTIVE">Active</option>
                        <option value="CLOSED">Closed/Inactive</option>
                        <option value="DEFAULTER">Defaulter</option>
                    </select>
				</div>

				<div class="flex items-center gap-3 pt-4 border-t border-gray-100">
					<button 
						type="button"
						onclick={() => editingCustomer = null}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs uppercase tracking-widest active:scale-95"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-[2] px-4 py-2 rounded-lg bg-black text-white shadow-sm hover:bg-gray-800 transition-colors text-xs font-black uppercase tracking-widest active:scale-95"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
