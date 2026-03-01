<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		Plus, 
		Search, 
		Trash2, 
		Edit2, 
		PackagePlus,
		DollarSign,
		Tag,
		Info,
		AlertCircle,
		XCircle,
		TrendingUp
	} from 'lucide-svelte';

	let { data, form } = $props();
	let showAddModal = $state(false);
	let editingProduct = $state<any>(null);
	let searchQuery = $state('');

	// Form logic
	let purchasePrice = $state(0);
	let cashPrice = $state(0);
	let installmentPrice = $state(0);
	let downPayment = $state(0);
	let durationMonths = $state(12);

	let profit = $derived(installmentPrice - purchasePrice);
	let monthlyAmount = $derived(durationMonths > 0 ? (installmentPrice - downPayment) / durationMonths : 0);

	const filteredProducts = $derived(
		data.products.filter((p: any) => 
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
			p.category.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-gray-900 tracking-tight">Product Catalog</h1>
			<p class="text-sm text-gray-500 font-medium mt-1">Manage electronics, furniture, and pricing</p>
		</div>
		<button 
			onclick={() => showAddModal = true}
			class="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
		>
			<PackagePlus class="w-4 h-4" />
			Add Product
		</button>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
		<div class="relative flex-1">
			<Search class="absolute left-3 inset-y-0 my-auto w-5 h-5 text-gray-400" />
			<input 
				type="text" 
				placeholder="Search products by name or category..." 
				bind:value={searchQuery}
				class="w-full pl-10 pr-4 py-2 bg-transparent border-transparent focus:ring-0 transition-all outline-none text-gray-900 font-medium h-10"
			/>
		</div>
	</div>

	<!-- Product Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left border-collapse min-w-[1000px]">
				<thead>
					<tr class="bg-gray-50 border-b border-gray-200">
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Info</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing Engine</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Terms</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Calculated Profit</th>
						<th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each filteredProducts as product}
						<tr class="hover:bg-gray-50/50 transition-colors group">
							<td class="px-6 py-4">
								<div class="space-y-1">
									<h3 class="text-sm font-bold text-gray-900">{product.name}</h3>
									<span class="inline-block px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200">
										{product.category}
									</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="space-y-0.5">
									<p class="text-xs font-medium text-gray-500">Cash: <span class="font-bold text-gray-900">{formatCurrency(product.cashPrice)}</span></p>
									<p class="text-xs font-medium text-gray-500">Plan: <span class="font-bold text-gray-900">{formatCurrency(product.installmentPrice)}</span></p>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="space-y-0.5">
									<p class="text-xs font-medium text-gray-500">Advance: <span class="font-bold text-gray-900">{formatCurrency(product.downPayment)}</span></p>
									<p class="text-xs font-medium text-gray-500">{product.durationMonths}mo &times; <span class="font-bold text-gray-900">{formatCurrency(product.monthlyAmount)}</span></p>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center gap-2">
									<TrendingUp class="w-4 h-4 text-gray-500" />
									<span class="text-sm font-bold text-gray-900">{formatCurrency(product.profit)}</span>
								</div>
							</td>
							<td class="px-6 py-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button 
										onclick={() => {
											editingProduct = { ...product };
											purchasePrice = product.purchasePrice;
											cashPrice = product.cashPrice;
											installmentPrice = product.installmentPrice;
											downPayment = product.downPayment;
											durationMonths = product.durationMonths;
										}}
										class="p-2 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
									>
										<Edit2 class="w-4 h-4" />
									</button>
									<form 
										method="POST" 
										action="?/delete&id={product.id}" 
										onsubmit={(e) => { if(!confirm('Are you sure you want to delete this product?')) e.preventDefault(); }} 
										use:enhance={() => {
											return async ({ result }) => {
												if (result.type === 'failure') {
													alert(result.data?.error || 'Failed to delete product.');
												}
											};
										}}
									>
										<button class="p-2 rounded-md hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-400 hover:text-red-600 transition-colors">
											<Trash2 class="w-4 h-4" />
										</button>
									</form>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-6 py-16 text-center">
								<div class="flex flex-col items-center gap-2">
									<Tag class="w-8 h-8 text-gray-300 mb-2" />
									<p class="text-gray-900 font-medium text-sm">No products cataloged</p>
									<p class="text-xs text-gray-500">Start by adding your first product to the gallery</p>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Add Product Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
				<h2 class="text-lg font-semibold text-gray-900">New Product Configuration</h2>
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
				use:enhance 
				class="flex-1 overflow-y-auto p-6 space-y-6"
			>
				{#if form?.error}
					<div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200 flex items-center gap-2">
						<AlertCircle class="w-4 h-4 shrink-0" />
						{form.error}
					</div>
				{/if}

				<!-- Basic Info -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
						<Info class="w-4 h-4" />
						<span class="text-sm font-semibold">Basic Information</span>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div class="space-y-1.5">
							<label for="name" class="text-sm font-medium text-gray-700">Product Name</label>
							<input type="text" name="name" id="name" required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
						<div class="space-y-1.5">
							<label for="category" class="text-sm font-medium text-gray-700">Category</label>
							<select name="category" id="category" class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm appearance-none cursor-pointer">
								<option value="Electronics">Electronics</option>
								<option value="Furniture">Furniture</option>
								<option value="Appliances">Appliances</option>
								<option value="Mobile Phones">Mobile Phones</option>
								<option value="Other">Other</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Pricing Section -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
						<DollarSign class="w-4 h-4" />
						<span class="text-sm font-semibold">Pricing & Calculations</span>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						<div class="space-y-1.5">
							<label for="purchasePrice" class="text-sm font-medium text-gray-700">Purchase Price</label>
							<input type="number" name="purchasePrice" id="purchasePrice" bind:value={purchasePrice} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
						<div class="space-y-1.5">
							<label for="cashPrice" class="text-sm font-medium text-gray-700">Cash Selling Price</label>
							<input type="number" name="cashPrice" id="cashPrice" bind:value={cashPrice} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
						<div class="space-y-1.5">
							<label for="installmentPrice" class="text-sm font-medium text-gray-700">Installment Price</label>
							<input type="number" name="installmentPrice" id="installmentPrice" bind:value={installmentPrice} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<div class="space-y-1.5">
							<label for="downPayment" class="text-sm font-medium text-gray-700">Minimum Advance Payment</label>
							<input type="number" name="downPayment" id="downPayment" bind:value={downPayment} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
						<div class="space-y-1.5">
							<label for="durationMonths" class="text-sm font-medium text-gray-700">Standard Duration (Months)</label>
							<input type="number" name="durationMonths" id="durationMonths" bind:value={durationMonths} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
					</div>
				</div>

				<!-- Live Preview Calculations -->
				<div class="bg-gray-900 rounded-xl p-6 text-white shadow-md">
					<div class="grid grid-cols-2 gap-6">
						<div>
							<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Projected Profit</p>
							<p class="text-2xl font-bold mt-1">{formatCurrency(profit)}</p>
						</div>
						<div class="text-right">
							<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Installment</p>
							<p class="text-2xl font-bold mt-1">{formatCurrency(monthlyAmount)}</p>
						</div>
					</div>
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
						class="flex-[2] px-4 py-2 bg-gray-900 text-white font-medium rounded-lg shadow-sm hover:bg-gray-800 transition-colors text-sm"
					>
						Register Product
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Product Modal -->
{#if editingProduct}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
				<h2 class="text-lg font-semibold text-gray-900">Edit Product Configuration</h2>
				<button 
					onclick={() => editingProduct = null}
					class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
				>
					<XCircle class="w-5 h-5" />
				</button>
			</div>

			<form 
				method="POST" 
				action="?/update&id={editingProduct.id}" 
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							editingProduct = null;
						} else if (result.type === 'failure') {
							alert(result.data?.error || 'Failed to update product');
						}
					};
				}}
				class="flex-1 overflow-y-auto p-6 space-y-6"
			>
				<!-- Basic Info -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
						<Info class="w-4 h-4" />
						<span class="text-sm font-semibold">Basic Information</span>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div class="space-y-1.5">
							<label for="edit_name" class="text-sm font-medium text-gray-700">Product Name</label>
							<input type="text" name="name" id="edit_name" bind:value={editingProduct.name} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
						<div class="space-y-1.5">
							<label for="edit_category" class="text-sm font-medium text-gray-700">Category</label>
							<select name="category" id="edit_category" bind:value={editingProduct.category} class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm appearance-none cursor-pointer">
								<option value="Electronics">Electronics</option>
								<option value="Furniture">Furniture</option>
								<option value="Appliances">Appliances</option>
								<option value="Mobile Phones">Mobile Phones</option>
								<option value="Other">Other</option>
							</select>
						</div>
					</div>
				</div>

				<!-- Pricing Section -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
						<DollarSign class="w-4 h-4" />
						<span class="text-sm font-semibold">Pricing & Calculations</span>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
						<div class="space-y-1.5">
							<label for="edit_purchasePrice" class="text-sm font-medium text-gray-700">Purchase Price</label>
							<input type="number" name="purchasePrice" id="edit_purchasePrice" bind:value={purchasePrice} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
						<div class="space-y-1.5">
							<label for="edit_cashPrice" class="text-sm font-medium text-gray-700">Cash Selling Price</label>
							<input type="number" name="cashPrice" id="edit_cashPrice" bind:value={cashPrice} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
						<div class="space-y-1.5">
							<label for="edit_installmentPrice" class="text-sm font-medium text-gray-700">Installment Price</label>
							<input type="number" name="installmentPrice" id="edit_installmentPrice" bind:value={installmentPrice} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
						<div class="space-y-1.5">
							<label for="edit_downPayment" class="text-sm font-medium text-gray-700">Minimum Advance Payment</label>
							<input type="number" name="downPayment" id="edit_downPayment" bind:value={downPayment} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
						<div class="space-y-1.5">
							<label for="edit_durationMonths" class="text-sm font-medium text-gray-700">Standard Duration (Months)</label>
							<input type="number" name="durationMonths" id="edit_durationMonths" bind:value={durationMonths} required class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm" />
						</div>
					</div>
				</div>

				<div class="flex items-center gap-3 pt-4 border-t border-gray-100">
					<button 
						type="button"
						onclick={() => editingProduct = null}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-[2] px-4 py-2 bg-gray-900 text-white font-medium rounded-lg shadow-sm hover:bg-gray-800 transition-colors text-sm"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
