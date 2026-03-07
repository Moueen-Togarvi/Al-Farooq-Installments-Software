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
		XCircle
	} from 'lucide-svelte';

	let { data, form } = $props();
	let showAddModal = $state(false);
	let editingProduct = $state<any>(null);
	let productToDelete = $state<any>(null);
	let searchQuery = $state('');

	let sellingPrice = $state<number>(0);
	let editSellingPrice = $state<number>(0);

	const filteredProducts = $derived(
		data.products.filter((p: any) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.category.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
	}

	function openEditModal(product: any) {
		editingProduct = { ...product };
		editSellingPrice = Number(product.cashPrice || 0);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-black text-gray-900 tracking-tight leading-none">Product Catalog</h1>
			<p class="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest leading-none">Manage electronics, furniture, and pricing</p>
		</div>
		<button 
			onclick={() => showAddModal = true}
			class="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
		>
			<PackagePlus class="w-4 h-4" />
			Add Product
		</button>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4">
		<div class="relative flex-1 min-w-[300px]">
			<Search class="absolute left-3 inset-y-0 my-auto w-4 h-4 text-gray-400" />
			<input 
				type="text" 
				placeholder="SEARCH PRODUCTS BY NAME OR CATEGORY..." 
				bind:value={searchQuery}
				class="w-full pl-9 pr-4 py-2 bg-transparent border-transparent focus:ring-0 transition-all outline-none text-gray-900 text-[10px] font-black uppercase tracking-widest h-10 placeholder:text-gray-300"
			/>
		</div>
	</div>

	<!-- Product List (Responsive Layout) -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
		<!-- Desktop Table View -->
		<div class="hidden md:block overflow-x-auto">
			<table class="w-full text-left border-collapse min-w-[1000px]">
				<thead>
					<tr class="bg-gray-50 border-b border-gray-100">
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Info</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
						<th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-50">
					{#each filteredProducts as product}
						<tr class="hover:bg-gray-50/50 transition-colors group">
							<td class="px-6 py-4">
								<div class="space-y-1">
									<h3 class="text-sm font-black text-gray-900">{product.name}</h3>
									<span class="inline-block px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
										{product.category}
									</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 w-fit">
									<div class="flex flex-col">
										<span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Selling Price</span>
										<span class="text-sm font-black text-emerald-600 leading-none">{formatCurrency(product.cashPrice)}</span>
									</div>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center justify-center">
									<div class="flex items-center gap-1.5">
										<button
											onclick={() => openEditModal(product)}
											class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[9px] font-black uppercase tracking-widest text-blue-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
										>
											<Edit2 class="w-3 h-3" /> Edit
										</button>
										<button 
											onclick={() => productToDelete = product}
											class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[9px] font-black uppercase tracking-widest text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm active:scale-95"
										>
											<Trash2 class="w-3 h-3" /> Delete
										</button>
									</div>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="3" class="px-6 py-16 text-center">
								<div class="flex flex-col items-center gap-2">
									<Tag class="w-10 h-10 text-gray-200 mb-2" />
									<p class="text-gray-400 font-black uppercase tracking-widest text-[10px]">No products cataloged</p>
									<p class="text-[10px] font-bold text-gray-400">Start by adding your first product to the gallery</p>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile Card View -->
		<div class="md:hidden flex flex-col divide-y divide-gray-100">
			{#each filteredProducts as product}
				<div class="p-4 space-y-4 bg-white">
					<div class="flex flex-col gap-3">
						<div class="flex items-start justify-between">
							<div>
								<h3 class="text-sm font-black text-gray-900 leading-tight">{product.name}</h3>
								<span class="inline-block mt-1 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
									{product.category}
								</span>
							</div>
						</div>

						<div class="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50">
							<div class="flex-1 flex flex-col">
								<span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Selling Price</span>
								<span class="text-sm font-black text-emerald-600 leading-none">{formatCurrency(product.cashPrice)}</span>
							</div>
						</div>
					</div>

					<div class="flex items-center justify-between gap-2 pt-1">
						<button
							onclick={() => openEditModal(product)}
							class="flex-1 flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
						>
							<Edit2 class="w-3.5 h-3.5" /> Edit Mode
						</button>
						<button 
							onclick={() => productToDelete = product}
							class="flex-1 flex justify-center items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest text-red-600 hover:border-red-200 hover:bg-red-50 active:scale-95 transition-all shadow-sm"
						>
							<Trash2 class="w-3.5 h-3.5" /> Delete
						</button>
					</div>
				</div>
			{:else}
				<div class="px-6 py-12 text-center">
					<div class="flex flex-col items-center gap-2">
						<Tag class="w-10 h-10 text-gray-200 mb-2" />
						<p class="text-gray-400 font-black uppercase tracking-widest text-[10px]">No products cataloged</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- Add Product Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
				<h2 class="text-lg font-black text-gray-900 tracking-tight">New Product Configuration</h2>
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
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success' || result.type === 'redirect') {
							showAddModal = false;
							sellingPrice = 0;
						} else if (result.type === 'failure') {
							alert(result.data?.error || 'Failed to create product');
						}
					};
				}}
				class="flex-1 overflow-y-auto p-6 space-y-6"
			>
				{#if form?.error}
					<div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200 flex items-center gap-2">
						<AlertCircle class="w-4 h-4 shrink-0" />
						{form.error}
					</div>
				{/if}

				<!-- Basic Info -->
				<div class="space-y-4">
					<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-2">
						<Info class="w-4 h-4" />
						<span class="text-sm font-bold uppercase tracking-widest text-gray-500">Basic Information</span>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div class="space-y-1.5">
							<label for="name" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Name</label>
							<input type="text" name="name" id="name" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
						</div>
						<div class="space-y-1.5">
							<label for="category" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
							<select name="category" id="category" class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold appearance-none cursor-pointer">
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
						<span class="text-sm font-bold uppercase tracking-widest text-gray-500">Pricing & Calculations</span>
					</div>

					<div class="grid grid-cols-1 gap-5">
						<div class="space-y-1.5">
							<label for="cashPrice" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selling Price</label>
							<input
								type="number"
								name="cashPrice"
								id="cashPrice"
								bind:value={sellingPrice}
								min="1"
								required
								class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold"
							/>
						</div>
					</div>
				</div>

				<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3 mt-auto rounded-b-xl">
					<button 
						type="button"
						onclick={() => showAddModal = false}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs uppercase tracking-widest active:scale-95"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-[2] px-4 py-2 bg-black text-white font-black rounded-lg shadow-sm hover:bg-gray-800 transition-colors text-xs uppercase tracking-widest active:scale-95"
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
		<div class="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
			<div class="px-6 py-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
				<h2 class="text-lg font-black text-gray-900 tracking-tight">Edit Product Configuration</h2>
				<button
					onclick={() => editingProduct = null}
					class="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors active:scale-95"
				>
					<XCircle class="w-5 h-5" />
				</button>
			</div>

			<form
				method="POST"
				action="?/update&id={editingProduct.id}"
				use:enhance={() => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success' || result.type === 'redirect') {
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
						<span class="text-sm font-bold uppercase tracking-widest text-gray-500">Basic Information</span>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div class="space-y-1.5">
							<label for="edit_name" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Name</label>
							<input type="text" name="name" id="edit_name" bind:value={editingProduct.name} required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" />
						</div>
						<div class="space-y-1.5">
							<label for="edit_category" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
							<select name="category" id="edit_category" bind:value={editingProduct.category} class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold appearance-none cursor-pointer">
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
						<span class="text-sm font-bold uppercase tracking-widest text-gray-500">Pricing & Calculations</span>
					</div>

					<div class="grid grid-cols-1 gap-5">
						<div class="space-y-1.5">
							<label for="edit_cashPrice" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selling Price</label>
							<input
								type="number"
								name="cashPrice"
								id="edit_cashPrice"
								bind:value={editSellingPrice}
								min="1"
								required
								class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold"
							/>
						</div>
					</div>
				</div>

				<!-- Action Bar inside Modal content flow -->
				<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3 mt-auto rounded-b-xl">
					<button 
						type="button"
						onclick={() => editingProduct = null}
						class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs uppercase tracking-widest active:scale-95"
					>
						Cancel
					</button>
					<button 
						type="submit"
						class="flex-[2] px-4 py-2 bg-black text-white font-black rounded-lg shadow-sm hover:bg-gray-800 transition-colors text-xs uppercase tracking-widest active:scale-95"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if productToDelete}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col p-6 text-center transform transition-all">
			<div class="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
				<AlertCircle class="w-6 h-6 text-red-600" />
			</div>
			<h2 class="text-xl font-black text-gray-900 tracking-tight mb-2">Delete Product</h2>
			<p class="text-sm font-bold text-gray-500 mb-6">Are you sure you want to delete <span class="text-gray-900">"{productToDelete.name}"</span>? This action cannot be undone.</p>
			
			<div class="flex items-center gap-3">
				<button 
					type="button"
					onclick={() => productToDelete = null}
					class="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs uppercase tracking-widest active:scale-95"
				>
					Cancel
				</button>
				<form 
					method="POST" 
					action="?/delete&id={productToDelete.id}" 
					class="flex-1"
					use:enhance={() => {
						return async ({ result, update }) => {
							await update();
							if (result.type === 'success' || result.type === 'redirect') {
								productToDelete = null;
							} else if (result.type === 'failure') {
								alert(result.data?.error || 'Failed to delete product.');
								productToDelete = null;
							}
						};
					}}
				>
					<button 
						type="submit"
						class="w-full px-4 py-2.5 bg-red-600 text-white font-black rounded-xl shadow-sm hover:bg-red-700 transition-colors text-xs uppercase tracking-widest active:scale-95"
					>
						Delete
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
