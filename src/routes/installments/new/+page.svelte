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
	let customerSearchQuery = $state('');
	let showCustomerDropdown = $state(false);
	
	let startDate = $state(new Date().toISOString().split('T')[0]);
	let customDuration = $state<number | null>(null);
	let customDownPayment = $state<number | null>(null);
	let customTotalAmount = $state<number | null>(null);

	const selectedProduct = $derived(data.products.find((p: any) => p.id === selectedProductId));
	const selectedCustomer = $derived(data.customers.find((c: any) => c.id === selectedCustomerId));
	
	const filteredCustomers = $derived(
		customerSearchQuery 
			? data.customers.filter((c: any) => 
				c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
				c.cnic.includes(customerSearchQuery) ||
				c.mobile.includes(customerSearchQuery)
			  )
			: data.customers
	);

	const duration = $derived(customDuration ?? ((selectedProduct?.durationMonths && selectedProduct.durationMonths > 1) ? selectedProduct.durationMonths : 12));
	
	const defaultTotal = $derived(
		selectedProduct 
			? (Number(selectedProduct.installmentPrice) > 0 
				? Number(selectedProduct.installmentPrice) 
				: Number(selectedProduct.cashPrice || 0)) 
			: 0
	);
	
	const totalAmount = $derived(customTotalAmount ?? defaultTotal);
	const downPayment = $derived(customDownPayment ?? 0);
	const remainingBalance = $derived(totalAmount - downPayment);
	const monthlyAmount = $derived(duration > 0 ? remainingBalance / duration : 0);

	let customSchedule = $state<{serial: number, date: string, amount: number}[]>([]);
	let manuallyEdited = $state(false);

	$effect(() => {
		// Only auto-generate if the user hasn't started manually overriding amounts/dates
		if (selectedProduct && startDate && totalAmount > 0 && !manuallyEdited) {
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
					<div class="space-y-2 relative">
						<label for="customerSearch" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Search Customer</label>
						<!-- Hidden input for actual form submission -->
						<input type="hidden" name="customerId" bind:value={selectedCustomerId} required />
						
						<input 
							type="text"
							id="customerSearch"
							placeholder="Search by name, CNIC or mobile..."
							bind:value={customerSearchQuery}
							onfocus={() => showCustomerDropdown = true}
							onblur={() => setTimeout(() => showCustomerDropdown = false, 200)}
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold placeholder-gray-400"
						/>
						
						{#if showCustomerDropdown && filteredCustomers.length > 0}
							<div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
								{#each filteredCustomers as customer}
									<button 
										type="button"
										class="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 focus:bg-gray-50 outline-none transition-colors last:border-0"
										onclick={() => {
											selectedCustomerId = customer.id;
											customerSearchQuery = `${customer.name} - ${customer.cnic}`;
											showCustomerDropdown = false;
										}}
									>
										<p class="text-sm font-black text-gray-900 truncate">{customer.name}</p>
										<p class="text-[10px] text-gray-500 font-bold truncate mt-0.5">{customer.cnic} • {customer.mobile}</p>
									</button>
								{/each}
							</div>
						{/if}
						{#if showCustomerDropdown && filteredCustomers.length === 0}
							<div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-4 text-center">
								<p class="text-xs font-bold text-gray-500">No customers found</p>
							</div>
						{/if}
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
						<!-- Hidden input carries totalAmount to the server -->
						<input type="hidden" name="totalAmount" value={totalAmount} />
						<div class="grid grid-cols-2 gap-3 w-full animate-in fade-in slide-in-from-left-4">
							<div class="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
								<p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Installment Price</p>
								<p class="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(totalAmount)}</p>
								<p class="text-[9px] font-bold text-gray-400 mt-2 flex items-center gap-1">
									<span class="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"></span>
									From product price
								</p>
							</div>
							<div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center">
								<p class="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-2">Calculated Profit</p>
								<p class="text-xl font-black text-emerald-700">{formatCurrency(totalAmount - parseFloat(selectedProduct.cashPrice || '0'))}</p>
								<p class="text-[9px] font-bold text-emerald-600/60 mt-2">Over sale price</p>
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
					<div class="space-y-2">
						<label for="durationMonths" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration (Months)</label>
						<input 
							type="number" 
							name="durationMonths" 
							id="durationMonths" 
							bind:value={customDuration}
							placeholder={(selectedProduct?.durationMonths && selectedProduct.durationMonths > 1) ? selectedProduct.durationMonths.toString() : "12"}
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold" 
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Right: Summary & Preview -->
		<div class="space-y-6">
			<div class="bg-[#0b1120] rounded-[24px] p-8 text-white shadow-2xl sticky top-6 ring-1 ring-white/10">
				<h3 class="text-[10px] font-black mb-8 border-b border-white/10 pb-4 uppercase tracking-[0.3em] text-white/50">Sale Summary</h3>
				
				<div class="space-y-6">
					<div class="flex justify-between items-center group">
						<span class="text-[10px] font-black text-white/40 uppercase tracking-widest transition-colors group-hover:text-white/60">Installment Total</span>
						<span class="text-base font-black tracking-tight">{formatCurrency(totalAmount)}</span>
					</div>
					<div class="flex justify-between items-center group">
						<span class="text-[10px] font-black text-white/40 uppercase tracking-widest transition-colors group-hover:text-white/60">Advance Payment</span>
						<span class="text-sm font-black text-[#ff5a5a] tracking-tight">-{formatCurrency(downPayment)}</span>
					</div>
					<div class="flex justify-between items-center border-t border-white/10 pt-6">
						<span class="text-[10px] font-black text-white/50 uppercase tracking-widest">Balance to Pay</span>
						<span class="text-xl font-black text-white tracking-tight">{formatCurrency(remainingBalance)}</span>
					</div>
					
					<div class="relative overflow-hidden bg-gradient-to-br from-[#131b2f] to-[#0d1425] p-6 rounded-2xl border border-white/5 mt-8 text-center shadow-inner">
						<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50"></div>
						<p class="text-[8px] font-black uppercase tracking-[0.3em] text-[#60a5fa] mb-3">Est. Monthly Installment</p>
						<p class="text-3xl font-black text-white tracking-tighter drop-shadow-sm">{formatCurrency(monthlyAmount)}</p>
						<div class="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
							<Clock class="w-3 h-3 text-white/40" />
							<p class="text-[9px] font-bold text-white/40 uppercase tracking-widest">{duration} months plan</p>
						</div>
					</div>
				</div>

				<button 
					type="submit"
					class="w-full mt-10 py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_8px_30px_rgb(255,255,255,0.1)] hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-[10px] flex items-center justify-center gap-2"
				>
					<CheckCircle2 class="w-4 h-4" /> Finalize Sale Contract
				</button>
			</div>

			<!-- Schedule Preview Box -->
			{#if customSchedule.length > 0}
				<div class="bg-white rounded-[24px] p-6 shadow-xl border border-gray-100 mt-6 relative overflow-hidden">
					<div class="absolute top-0 left-0 w-full h-1 bg-gray-100"></div>
					<div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100/60">
						<div class="flex items-center gap-3">
							<h3 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
								<Calendar class="w-3.5 h-3.5" />
								Payment Schedule
							</h3>
							<span class="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200/60">
								{customSchedule.length} Months
							</span>
						</div>
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
					
					<div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
						{#each customSchedule as item, i}
							<div class="flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border {manuallyEdited && customSchedule[i].amount !== Math.round(monthlyAmount) ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200/60'} transition-colors">
								<div class="w-8 h-8 bg-white border border-gray-200/80 rounded-lg flex items-center justify-center font-black text-gray-400 shrink-0 text-[10px] shadow-sm">
									{item.serial}
								</div>
								<div class="flex-1">
									<p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Due Date</p>
									<input 
										type="date" 
										bind:value={customSchedule[i].date}
										oninput={handleManualEdit}
										class="w-full bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 transition-all shadow-sm"
									/>
								</div>
								<div class="flex-1">
									<p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1 text-right">Amount (Rs)</p>
									<input 
										type="number" 
										bind:value={customSchedule[i].amount}
										oninput={handleManualEdit}
										class="w-full text-right bg-white border border-gray-200 rounded-lg text-xs font-black text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 transition-all shadow-sm"
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
