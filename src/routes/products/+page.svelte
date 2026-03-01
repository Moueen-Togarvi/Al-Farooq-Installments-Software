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
			<h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">Product Catalog</h1>
			<p class="text-sm text-slate-500 font-medium">Manage electronics, furniture, and pricing</p>
		</div>
		<button 
			onclick={() => showAddModal = true}
			class="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
		>
			<PackagePlus class="w-5 h-5" />
			Add Product
		</button>
	</div>

	<!-- Search & Filters -->
	<div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
		<div class="relative flex-1">
			<Search class="absolute left-4 inset-y-0 my-auto w-5 h-5 text-slate-400" />
			<input 
				type="text" 
				placeholder="Search products by name or category..." 
				bind:value={searchQuery}
				class="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-700 font-medium h-12"
			/>
		</div>
	</div>

	<!-- Product Grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
		{#each filteredProducts as product}
			<div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
				<div class="p-6 space-y-4 flex-1">
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<span class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100">
								{product.category}
							</span>
							<h3 class="text-lg font-extrabold text-slate-800 line-clamp-1">{product.name}</h3>
						</div>
						<div class="flex items-center gap-1">
							<form method="POST" action="?/delete&id={product.id}" use:enhance>
								<button class="p-2 rounded-xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
									<Trash2 class="w-4 h-4" />
								</button>
							</form>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
							<p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cash Price</p>
							<p class="text-sm font-black text-slate-700">{formatCurrency(product.cashPrice)}</p>
						</div>
						<div class="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/30">
							<p class="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Installment Price</p>
							<p class="text-sm font-black text-blue-700">{formatCurrency(product.installmentPrice)}</p>
						</div>
					</div>

					<div class="space-y-2.5 py-2">
						<div class="flex justify-between items-center text-xs font-semibold">
							<span class="text-slate-400">Down Payment</span>
							<span class="text-slate-700">{formatCurrency(product.downPayment)}</span>
						</div>
						<div class="flex justify-between items-center text-xs font-semibold">
							<span class="text-slate-400">Monthly Installment</span>
							<span class="text-blue-600 font-bold">{formatCurrency(product.monthlyAmount)} / mo</span>
						</div>
						<div class="flex justify-between items-center text-xs font-semibold">
							<span class="text-slate-400">Duration</span>
							<span class="text-slate-700">{product.durationMonths} Months</span>
						</div>
					</div>
				</div>
				
				<div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
					<div class="flex flex-col">
						<span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Profit</span>
						<span class="text-sm font-black text-emerald-600 leading-none">{formatCurrency(product.profit)}</span>
					</div>
					<button class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">
						Edit Details
					</button>
				</div>
			</div>
		{:else}
			<div class="col-span-full py-24 text-center">
				<div class="flex flex-col items-center gap-4">
					<div class="bg-slate-50 p-6 rounded-full">
						<Tag class="w-10 h-10 text-slate-200" />
					</div>
					<div class="space-y-1">
						<p class="text-slate-400 font-bold text-lg">No products cataloged</p>
						<p class="text-sm text-slate-300 font-medium">Start by adding your first product to the gallery</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Add Product Modal -->
{#if showAddModal}
	<div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
		<div class="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden h-[90vh] flex flex-col">
			<div class="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
				<h2 class="text-xl font-extrabold text-slate-800">New Product Configuration</h2>
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
				use:enhance 
				class="flex-1 overflow-y-auto p-8 space-y-8"
			>
				{#if form?.error}
					<div class="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
						<AlertCircle class="w-5 h-5" />
						{form.error}
					</div>
				{/if}

				<!-- Basic Info -->
				<div class="space-y-6">
					<div class="flex items-center gap-2 text-blue-600">
						<Info class="w-4 h-4" />
						<span class="text-xs font-black uppercase tracking-widest">Basic Information</span>
					</div>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="name" class="text-xs font-black text-slate-500 uppercase tracking-tighter ml-1">Product Name</label>
							<input type="text" name="name" id="name" required class="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-bold" />
						</div>
						<div class="space-y-2">
							<label for="category" class="text-xs font-black text-slate-500 uppercase tracking-tighter ml-1">Category</label>
							<select name="category" id="category" class="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold appearance-none cursor-pointer">
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
				<div class="space-y-6">
					<div class="flex items-center gap-2 text-emerald-600">
						<DollarSign class="w-4 h-4" />
						<span class="text-xs font-black uppercase tracking-widest">Pricing & Calculations</span>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						<div class="space-y-2">
							<label for="purchasePrice" class="text-xs font-black text-slate-500 uppercase tracking-tighter ml-1">Purchase Price</label>
							<input type="number" name="purchasePrice" id="purchasePrice" bind:value={purchasePrice} required class="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-700 font-bold" />
						</div>
						<div class="space-y-2">
							<label for="cashPrice" class="text-xs font-black text-slate-500 uppercase tracking-tighter ml-1">Cash Selling Price</label>
							<input type="number" name="cashPrice" id="cashPrice" bind:value={cashPrice} required class="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-700 font-bold" />
						</div>
						<div class="space-y-2">
							<label for="installmentPrice" class="text-xs font-black text-slate-500 uppercase tracking-tighter ml-1">Installment Price</label>
							<input type="number" name="installmentPrice" id="installmentPrice" bind:value={installmentPrice} required class="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-bold" />
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div class="space-y-2">
							<label for="downPayment" class="text-xs font-black text-slate-500 uppercase tracking-tighter ml-1">Minimum Down Payment</label>
							<input type="number" name="downPayment" id="downPayment" bind:value={downPayment} required class="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold" />
						</div>
						<div class="space-y-2">
							<label for="durationMonths" class="text-xs font-black text-slate-500 uppercase tracking-tighter ml-1">Standard Duration (Months)</label>
							<input type="number" name="durationMonths" id="durationMonths" bind:value={durationMonths} required class="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold" />
						</div>
					</div>
				</div>

				<!-- Live Preview Calculations -->
				<div class="bg-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-200">
					<div class="grid grid-cols-2 gap-8">
						<div>
							<p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Projected Profit</p>
							<p class="text-3xl font-black mt-2">{formatCurrency(profit)}</p>
							<p class="text-[10px] font-bold text-blue-100 mt-1 italic">Based on installment price</p>
						</div>
						<div class="text-right">
							<p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Monthly Installment</p>
							<p class="text-3xl font-black mt-2">{formatCurrency(monthlyAmount)}</p>
							<p class="text-[10px] font-bold text-blue-100 mt-1 italic">Calculated automatically</p>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-4 py-4 shrink-0">
					<button 
						type="button"
						onclick={() => showAddModal = false}
						class="flex-1 px-8 py-5 rounded-3xl bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
					>
						Discard
					</button>
					<button 
						type="submit"
						class="flex-[2] px-8 py-5 rounded-3xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
					>
						Register Product
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
