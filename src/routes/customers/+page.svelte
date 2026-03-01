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
			case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
			case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-200';
			case 'DEFAULTER': return 'bg-red-50 text-red-600 border-red-100';
			default: return 'bg-slate-100 text-slate-600 border-slate-200';
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Customer Directory</h1>
			<p class="text-sm text-slate-500 font-medium">Manage and monitor all installment clients</p>
		</div>
		<button 
			onclick={() => showAddModal = true}
			class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
		>
			<UserPlus class="w-5 h-5" />
			Add Customer
		</button>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
		<div class="relative flex-1">
			<Search class="absolute left-4 inset-y-0 my-auto w-5 h-5 text-slate-400" />
			<input 
				type="text" 
				placeholder="Search by name, CNIC or mobile..." 
				bind:value={searchQuery}
				class="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-700 font-medium h-12"
			/>
		</div>
	</div>

	<!-- Customer Grid/Table -->
	<div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse">
				<thead>
					<tr class="bg-slate-50/50 border-b border-slate-100">
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer Info</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">CNIC & Mobile</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
						<th class="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each filteredCustomers as customer}
						<tr class="hover:bg-slate-50/50 transition-colors group">
							<td class="px-6 py-5">
								<div class="flex items-center gap-4">
									<div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 shadow-sm border-2 border-white">
										{customer.name.substring(0, 2).toUpperCase()}
									</div>
									<div>
										<p class="font-bold text-slate-800">{customer.name}</p>
										<p class="text-xs text-slate-400 font-medium">{customer.address}</p>
									</div>
								</div>
							</td>
							<td class="px-6 py-5">
								<div class="space-y-1">
									<p class="text-sm font-bold text-slate-700 tracking-tight">{customer.cnic}</p>
									<p class="text-xs text-slate-500 font-medium">{customer.mobile}</p>
								</div>
							</td>
							<td class="px-6 py-5">
								<span class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border {getStatusColor(customer.status)}">
									{customer.status}
								</span>
							</td>
							<td class="px-6 py-5">
								<div class="flex items-center gap-2">
									<button class="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 text-slate-400 hover:text-blue-600 transition-all">
										<Edit2 class="w-4 h-4" />
									</button>
									<form method="POST" action="?/delete&id={customer.id}" use:enhance>
										<button class="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 text-slate-400 hover:text-red-500 transition-all">
											<Trash2 class="w-4 h-4" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="4" class="px-6 py-20 text-center">
								<div class="flex flex-col items-center gap-3">
									<div class="bg-slate-50 p-4 rounded-full">
										<Users class="w-8 h-8 text-slate-300" />
									</div>
									<p class="text-slate-400 font-bold">No customers found</p>
									<p class="text-sm text-slate-300 font-medium">Try adding a new customer or adjusting your search</p>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Add Customer Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
			<div class="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0">
				<h2 class="text-xl font-extrabold text-slate-800">Add New Customer</h2>
				<button 
					onclick={() => showAddModal = false}
					class="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"
				>
					<XCircle class="w-6 h-6" />
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
				class="p-8 space-y-6 max-h-[70vh] overflow-y-auto"
			>
				{#if form?.error}
					<div class="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
						<AlertCircle class="w-5 h-5" />
						{form.error}
					</div>
				{/if}

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-2">
						<label for="name" class="text-sm font-bold text-slate-700 ml-1">Full Name</label>
						<input type="text" name="name" id="name" required class="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700" />
					</div>
					<div class="space-y-2">
						<label for="cnic" class="text-sm font-bold text-slate-700 ml-1">CNIC Number</label>
						<input type="text" name="cnic" id="cnic" placeholder="42101-XXXXXXX-X" required class="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700" />
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="space-y-2">
						<label for="mobile" class="text-sm font-bold text-slate-700 ml-1">Mobile Number</label>
						<input type="text" name="mobile" id="mobile" required class="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700" />
					</div>
					<div class="space-y-2">
						<label for="referenceName" class="text-sm font-bold text-slate-700 ml-1">Reference Name</label>
						<input type="text" name="referenceName" id="referenceName" class="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700" />
					</div>
				</div>

				<div class="space-y-2">
					<label for="address" class="text-sm font-bold text-slate-700 ml-1">Resident Address</label>
					<textarea name="address" id="address" rows="3" required class="w-full px-4 py-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 resize-none"></textarea>
				</div>

				<div class="flex items-center gap-4 pt-4">
					<button 
						type="button"
						onclick={() => showAddModal = false}
						class="flex-1 px-6 py-3.5 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-[2] px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
					>
						Create Account
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
