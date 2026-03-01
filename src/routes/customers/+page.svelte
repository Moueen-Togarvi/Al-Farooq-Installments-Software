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
			<h1 class="text-2xl font-bold text-gray-900 tracking-tight">Customer Directory</h1>
			<p class="text-sm text-gray-500 font-medium mt-1">Manage and monitor all installment clients</p>
		</div>
		<button 
			onclick={() => showAddModal = true}
			class="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
		>
			<UserPlus class="w-4 h-4" />
			Add Customer
		</button>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
		<div class="relative flex-1">
			<Search class="absolute left-3 inset-y-0 my-auto w-5 h-5 text-gray-400" />
			<input 
				type="text" 
				placeholder="Search by name, CNIC or mobile..." 
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2 bg-transparent border-transparent focus:ring-0 transition-all outline-none text-gray-900 font-medium h-10"
			/>
		</div>
	</div>

	<!-- Customer Grid/Table -->
	<div class="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-x-auto">
		<table class="w-full text-left border-collapse min-w-[1000px]">
			<thead>
				<tr class="bg-gray-50 border-b-2 border-gray-200">
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer Profile</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">CNIC #</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Mobile/Ref</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Full Address</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
					<th class="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y-2 divide-gray-100">
				{#each filteredCustomers as customer}
					<tr class="hover:bg-gray-50 transition-colors group">
						<td class="px-6 py-4">
							<div class="flex items-center gap-4">
								<div class="w-10 h-10 rounded-full bg-black flex items-center justify-center font-black text-white shrink-0 shadow-sm">
									{customer.name.substring(0, 2).toUpperCase()}
								</div>
								<p class="text-sm font-black text-black">{customer.name}</p>
							</div>
						</td>
						<td class="px-6 py-4">
							<p class="text-sm font-black text-gray-700 tracking-wide">{customer.cnic}</p>
						</td>
						<td class="px-6 py-4">
							<p class="text-sm font-black text-gray-700">{customer.mobile}</p>
							{#if customer.referenceName}
								<p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Ref: {customer.referenceName}</p>
							{/if}
						</td>
						<td class="px-6 py-4">
							<p class="text-xs font-bold text-gray-600 max-w-[200px] leading-tight">{customer.address}</p>
						</td>
						<td class="px-6 py-4">
							<span class="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border {getStatusColor(customer.status)}">
								{customer.status}
							</span>
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center justify-center">
								<div class="flex items-center gap-1 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
									<button 
										onclick={() => editingCustomer = customer}
										class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-[10px] font-black uppercase tracking-wider text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
									>
										<Edit2 class="w-3.5 h-3.5" /> Edit
									</button>
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
										<button class="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-[10px] font-black uppercase tracking-wider text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-colors shadow-sm">
											<Trash2 class="w-3.5 h-3.5" /> Delete
										</button>
									</form>
								</div>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="px-6 py-16 text-center">
							<div class="flex flex-col items-center gap-2">
								<Users class="w-10 h-10 text-gray-300 mb-2" />
								<p class="text-black font-black uppercase tracking-widest text-sm">No customers found</p>
								<p class="text-xs font-bold text-gray-500">Try adding a new customer or adjusting your search</p>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Add Customer Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200 overflow-hidden transform transition-all">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0">
				<h2 class="text-lg font-semibold text-gray-900">Add New Customer</h2>
				<button 
					onclick={() => showAddModal = false}
					class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
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
					<div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200 flex items-center gap-2">
						<AlertCircle class="w-4 h-4 shrink-0" />
						{form.error}
					</div>
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="space-y-1.5">
						<label for="name" class="text-sm font-medium text-gray-700">Full Name</label>
						<input type="text" name="name" id="name" required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
					</div>
					<div class="space-y-1.5">
						<label for="cnic" class="text-sm font-medium text-gray-700">CNIC Number</label>
						<input type="text" name="cnic" id="cnic" placeholder="42101-XXXXXXX-X" required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="space-y-1.5">
						<label for="mobile" class="text-sm font-medium text-gray-700">Mobile Number</label>
						<input type="text" name="mobile" id="mobile" required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
					</div>
					<div class="space-y-1.5">
						<label for="referenceName" class="text-sm font-medium text-gray-700">Reference Name</label>
						<input type="text" name="referenceName" id="referenceName" class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
					</div>
				</div>

				<div class="space-y-1.5">
					<label for="address" class="text-sm font-medium text-gray-700">Resident Address</label>
					<textarea name="address" id="address" rows="3" required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm resize-none"></textarea>
				</div>

				<div class="flex items-center gap-3 pt-4 border-t border-gray-100">
					<button 
						type="button"
						onclick={() => showAddModal = false}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-[2] px-4 py-2 rounded-lg bg-gray-900 text-white font-medium shadow-sm hover:bg-gray-800 transition-colors text-sm"
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
		<div class="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200 overflow-hidden transform transition-all">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0">
				<h2 class="text-lg font-semibold text-gray-900">Edit Customer Profile</h2>
				<button 
					onclick={() => editingCustomer = null}
					class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
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
						<label for="edit_name" class="text-sm font-medium text-gray-700">Full Name</label>
						<input type="text" name="name" id="edit_name" value={editingCustomer.name} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
					</div>
					<div class="space-y-1.5">
						<label for="edit_cnic" class="text-sm font-medium text-gray-700">CNIC Number</label>
						<input type="text" name="cnic" id="edit_cnic" value={editingCustomer.cnic} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div class="space-y-1.5">
						<label for="edit_mobile" class="text-sm font-medium text-gray-700">Mobile Number</label>
						<input type="text" name="mobile" id="edit_mobile" value={editingCustomer.mobile} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
					</div>
					<div class="space-y-1.5">
						<label for="edit_referenceName" class="text-sm font-medium text-gray-700">Reference Name</label>
						<input type="text" name="referenceName" id="edit_referenceName" value={editingCustomer.referenceName || ''} class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
					</div>
				</div>

				<div class="space-y-1.5">
					<label for="edit_address" class="text-sm font-medium text-gray-700">Resident Address</label>
					<textarea name="address" id="edit_address" rows="3" required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm resize-none">{editingCustomer.address}</textarea>
				</div>
                
                <div class="space-y-1.5 border-t border-gray-100 pt-5">
					<label for="edit_status" class="text-sm font-medium text-gray-700">Customer Status</label>
					<select name="status" id="edit_status" value={editingCustomer.status} class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm">
                        <option value="ACTIVE">Active</option>
                        <option value="CLOSED">Closed/Inactive</option>
                        <option value="DEFAULTER">Defaulter</option>
                    </select>
				</div>

				<div class="flex items-center gap-3 pt-4 border-t border-gray-100">
					<button 
						type="button"
						onclick={() => editingCustomer = null}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-[2] px-4 py-2 rounded-lg bg-gray-900 text-white font-medium shadow-sm hover:bg-gray-800 transition-colors text-sm"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
