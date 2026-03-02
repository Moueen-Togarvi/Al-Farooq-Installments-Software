<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		ArrowLeft, 
		User, 
		Package, 
		Calendar, 
		Clock, 
		DollarSign, 
		Info, 
		AlertCircle,
		CheckCircle2,
		XCircle
	} from 'lucide-svelte';

	let { data, form } = $props();

	let selectedCustomerId = $state('');
	let selectedProductId = $state('');
	let startDate = $state(new Date().toISOString().split('T')[0]);
	let customDuration = $state(0);
	let customDownPayment = $state(0);

	const selectedProduct = $derived(data.products.find((p: any) => p.id === selectedProductId));
	const selectedCustomer = $derived(data.customers.find((c: any) => c.id === selectedCustomerId));

	const duration = $derived(customDuration || (selectedProduct?.durationMonths ?? 12));
	const totalAmount = $derived(selectedProduct ? parseFloat(selectedProduct.installmentPrice) : 0);
	const downPayment = $derived(customDownPayment || (selectedProduct ? parseFloat(selectedProduct.downPayment) : 0));
	const remainingBalance = $derived(totalAmount - downPayment);
	const monthlyAmount = $derived(duration > 0 ? remainingBalance / duration : 0);

	let customSchedule = $state<{serial: number, date: string, amount: number}[]>([]);
	let manuallyEdited = $state(false);

	$effect(() => {
		// Only auto-generate if the user hasn't started manually overriding amounts/dates
		if (selectedProduct && startDate && !manuallyEdited) {
			let newSchedule = [];
			const start = new Date(startDate);
			const limit = Math.min(duration, 36);
			for (let i = 1; i <= limit; i++) {
				const dueDate = new Date(start);
				dueDate.setMonth(dueDate.getMonth() + i);
				newSchedule.push({
					serial: i,
					date: dueDate.toISOString().split('T')[0],
					amount: Math.round(monthlyAmount)
				});
			}
			customSchedule = newSchedule;
		}
	});

	function handleManualEdit() {
		manuallyEdited = true;
	}

	function resetSchedule() {
		manuallyEdited = false;
		// Re-trigger the $effect by forcing a read
		const _ = startDate + monthlyAmount;
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount);
	}
</script>

<div class="max-w-5xl mx-auto space-y-6">
	<!-- Header -->
	<div class="flex items-center gap-4">
		<a href="/installments" class="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black transition-all shadow-sm active:scale-95">
			<ArrowLeft class="w-5 h-5" />
		</a>
		<div>
			<h1 class="text-2xl font-black text-gray-900 tracking-tight leading-none">Create New Sale</h1>
			<p class="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest leading-none">Installment Plan Configurator</p>
		</div>
	</div>

	<form method="POST" use:enhance class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Left: Selection & Options -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Customer Selection -->
			<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
				<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3 mb-5">
					<User class="w-4 h-4" />
					<span class="text-sm font-semibold">Step 1: Select Customer</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
					<div class="space-y-2">
						<label for="customerId" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Choose Customer</label>
						<select 
							name="customerId" 
							id="customerId" 
							bind:value={selectedCustomerId}
							required 
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm appearance-none cursor-pointer"
						>
							<option value="">Select a customer...</option>
							{#each data.customers as customer}
								<option value={customer.id}>{customer.name} - {customer.cnic}</option>
							{/each}
						</select>
					</div>
					{#if selectedCustomer}
						<div class="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 shadow-sm">
							<div class="w-12 h-12 rounded-full bg-black flex items-center justify-center font-black text-white shadow-sm shrink-0 text-sm">
								{selectedCustomer.name.substring(0, 2).toUpperCase()}
							</div>
							<div class="space-y-1 overflow-hidden">
								<p class="text-sm font-black text-gray-900 truncate">{selectedCustomer.name}</p>
								<p class="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">{selectedCustomer.mobile}</p>
								<p class="text-[10px] text-gray-500 font-bold truncate leading-none">{selectedCustomer.address}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Product Selection -->
			<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
				<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3 mb-5">
					<Package class="w-4 h-4" />
					<span class="text-sm font-semibold">Step 2: Select Product</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
					<div class="space-y-2">
						<label for="productId" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Choose Product</label>
						<select 
							name="productId" 
							id="productId" 
							bind:value={selectedProductId}
							required 
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm appearance-none cursor-pointer"
						>
							<option value="">Select a product...</option>
							{#each data.products as product}
								<option value={product.id}>{product.name} ({product.category})</option>
							{/each}
						</select>
					</div>
					{#if selectedProduct}
						<div class="grid grid-cols-2 gap-3 w-full animate-in fade-in slide-in-from-left-4">
							<div class="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
								<p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Installment Price</p>
								<p class="text-sm font-black text-gray-900">{formatCurrency(selectedProduct.installmentPrice)}</p>
							</div>
							<div class="bg-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center">
								<p class="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Calculated Profit</p>
								<p class="text-sm font-black text-emerald-700">{formatCurrency(selectedProduct.profit)}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Plan Configuration -->
			<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
				<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3 mb-5">
					<Clock class="w-4 h-4" />
					<span class="text-sm font-semibold">Step 3: Plan Setup</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
					<div class="space-y-2">
						<label for="startDate" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Agreement Date</label>
						<input 
							type="date" 
							name="startDate" 
							id="startDate" 
							bind:value={startDate}
							required 
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" 
						/>
					</div>
					<div class="space-y-2">
						<label for="durationMonths" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration (Months)</label>
						<input 
							type="number" 
							name="durationMonths" 
							id="durationMonths" 
							bind:value={customDuration}
							placeholder={selectedProduct?.durationMonths?.toString() ?? "12"}
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" 
						/>
					</div>
					<div class="space-y-2">
						<label for="downPayment" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Advance Payment</label>
						<input 
							type="number" 
							name="downPayment" 
							id="downPayment" 
							bind:value={customDownPayment}
							placeholder={selectedProduct?.downPayment?.toString() ?? "0"}
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" 
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Right: Summary & Preview -->
		<div class="space-y-6">
			<div class="bg-gray-900 rounded-xl p-6 text-white shadow-xl sticky top-28">
				<h3 class="text-xs font-black mb-5 border-b border-gray-700/50 pb-3 uppercase tracking-widest">Sale Summary</h3>
				
				<div class="space-y-4">
					<div class="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-inner">
						<span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Installment Total</span>
						<span class="text-sm font-black">{formatCurrency(totalAmount)}</span>
					</div>
					<div class="flex justify-between items-center px-2 py-1">
						<span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Advance Payment</span>
						<span class="text-xs font-black text-red-400">-{formatCurrency(downPayment)}</span>
					</div>
					<div class="flex justify-between items-center border-t border-gray-700/50 pt-4 px-2">
						<span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance to Pay</span>
						<span class="text-lg font-black text-white">{formatCurrency(remainingBalance)}</span>
					</div>
					<div class="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700 mt-6 text-center shadow-inner">
						<p class="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1.5">Monthly Installment</p>
						<p class="text-xl font-black text-white">{formatCurrency(monthlyAmount)}</p>
						<p class="text-[9px] font-bold text-gray-500 mt-2 uppercase tracking-widest">For {duration} months</p>
					</div>
				</div>

				<button 
					type="submit"
					class="w-full mt-8 py-3.5 bg-white text-black font-black uppercase tracking-widest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-gray-100 active:scale-95 transition-all text-[10px] flex items-center justify-center gap-2"
				>
					<CheckCircle2 class="w-4 h-4" /> Finalize Sale
				</button>
			</div>

			<!-- Custom Schedule JSON -->
			<input type="hidden" name="customSchedule" value={JSON.stringify(customSchedule)} />

			<!-- Schedule Editor -->
			{#if customSchedule.length > 0}
				<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
					<div class="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
						<h3 class="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
							<Calendar class="w-3.5 h-3.5 text-gray-500" />
							Schedule ({customSchedule.length}m)
						</h3>
						{#if manuallyEdited}
							<button 
								type="button" 
								onclick={resetSchedule}
								class="px-2 py-1 bg-gray-50 text-gray-600 rounded text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors border border-gray-200 active:scale-95 shadow-sm"
							>
								Reset
							</button>
						{/if}
					</div>
					
					<div class="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
						{#each customSchedule as item, i}
							<div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border {manuallyEdited ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'} transition-colors shadow-sm">
								<div class="w-7 h-7 bg-white border border-gray-200 rounded flex items-center justify-center font-black text-gray-400 shrink-0 text-[10px] shadow-sm">
									{item.serial}
								</div>
								<div class="flex-1">
									<input 
										type="date" 
										bind:value={customSchedule[i].date}
										oninput={handleManualEdit}
										class="w-full bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-700 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 p-1.5 transition-all"
									/>
								</div>
								<div class="flex-1">
									<input 
										type="number" 
										bind:value={customSchedule[i].amount}
										oninput={handleManualEdit}
										class="w-full text-right bg-white border border-gray-300 rounded text-[10px] font-bold text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 p-1.5 transition-all"
									/>
								</div>
							</div>
						{/each}
					</div>
					
					<!-- Validation warning if sum mismatches balance -->
					{#if Math.abs(customSchedule.reduce((sum, item) => sum + Number(item.amount), 0) - remainingBalance) > 10}
						<div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 shadow-sm">
							<AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
							<div>
								<p class="text-[9px] font-black text-red-700 uppercase tracking-widest">Mismatch</p>
								<p class="text-[10px] font-bold text-red-600 mt-0.5 leading-tight">
									Sum ({formatCurrency(customSchedule.reduce((sum, item) => sum + Number(item.amount), 0))}) 
									≠ Balance ({formatCurrency(remainingBalance)}).
								</p>
							</div>
						</div>
					{:else if manuallyEdited}
						<div class="mt-4 p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
							<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Matches balance
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</form>
</div>
