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

<div class="max-w-5xl mx-auto space-y-8">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<a href="/installments" class="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
				<ArrowLeft class="w-5 h-5" />
			</a>
			<div>
				<h1 class="text-2xl font-black text-slate-800 tracking-tight leading-none">Create New Sale</h1>
				<p class="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest leading-none">Installment Plan Configurator</p>
			</div>
		</div>
	</div>

	<form method="POST" use:enhance class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Left: Selection & Options -->
		<div class="lg:col-span-2 space-y-8">
			<!-- Customer Selection -->
			<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
				<div class="flex items-center gap-2 text-slate-400 mb-6 self-start">
					<User class="w-4 h-4" />
					<span class="text-[10px] font-black uppercase tracking-widest">Step 1: Select Customer</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
					<div class="space-y-4">
						<label for="customerId" class="text-lg font-black text-slate-800 ml-1">Choose Customer</label>
						<select 
							name="customerId" 
							id="customerId" 
							bind:value={selectedCustomerId}
							required 
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-bold appearance-none cursor-pointer h-16"
						>
							<option value="">Select a customer...</option>
							{#each data.customers as customer}
								<option value={customer.id}>{customer.name} - {customer.cnic}</option>
							{/each}
						</select>
					</div>
					{#if selectedCustomer}
						<div class="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/30 flex items-center gap-4 animate-in fade-in slide-in-from-left-4">
							<div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center font-black text-blue-600 shadow-sm border border-blue-100/50 shrink-0">
								{selectedCustomer.name.substring(0, 2).toUpperCase()}
							</div>
							<div class="space-y-1 overflow-hidden">
								<p class="font-black text-slate-800 truncate">{selectedCustomer.name}</p>
								<p class="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedCustomer.mobile}</p>
								<p class="text-[10px] text-slate-400 font-bold truncate">{selectedCustomer.address}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Product Selection -->
			<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
				<div class="flex items-center gap-2 text-slate-400 mb-6 self-start">
					<Package class="w-4 h-4" />
					<span class="text-[10px] font-black uppercase tracking-widest">Step 2: Select Product</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
					<div class="space-y-4">
						<label for="productId" class="text-lg font-black text-slate-800 ml-1">Choose Product</label>
						<select 
							name="productId" 
							id="productId" 
							bind:value={selectedProductId}
							required 
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-700 font-bold appearance-none cursor-pointer h-16"
						>
							<option value="">Select a product...</option>
							{#each data.products as product}
								<option value={product.id}>{product.name} ({product.category})</option>
							{/each}
						</select>
					</div>
					{#if selectedProduct}
						<div class="grid grid-cols-2 gap-4 w-full animate-in fade-in slide-in-from-left-4">
							<div class="bg-slate-50 p-5 rounded-3xl border border-slate-100">
								<p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Installment Price</p>
								<p class="text-md font-black text-slate-800 mt-1">{formatCurrency(selectedProduct.installmentPrice)}</p>
							</div>
							<div class="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100/30">
								<p class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Profit</p>
								<p class="text-md font-black text-emerald-600 mt-1">{formatCurrency(selectedProduct.profit)}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Plan Configuration -->
			<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
				<div class="flex items-center gap-2 text-slate-400 mb-6 self-start">
					<Clock class="w-4 h-4" />
					<span class="text-[10px] font-black uppercase tracking-widest">Step 3: Plan Setup</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
					<div class="space-y-4">
						<label for="startDate" class="text-sm font-black text-slate-800 ml-1 uppercase tracking-widest">Agreement Date</label>
						<input 
							type="date" 
							name="startDate" 
							id="startDate" 
							bind:value={startDate}
							required 
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold h-16" 
						/>
					</div>
					<div class="space-y-4">
						<label for="durationMonths" class="text-sm font-black text-slate-800 ml-1 uppercase tracking-widest">Duration (Months)</label>
						<input 
							type="number" 
							name="durationMonths" 
							id="durationMonths" 
							bind:value={customDuration}
							placeholder={selectedProduct?.durationMonths?.toString() ?? "12"}
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold h-16" 
						/>
					</div>
					<div class="space-y-4">
						<label for="downPayment" class="text-sm font-black text-slate-800 ml-1 uppercase tracking-widest">Advance Payment</label>
						<input 
							type="number" 
							name="downPayment" 
							id="downPayment" 
							bind:value={customDownPayment}
							placeholder={selectedProduct?.downPayment?.toString() ?? "0"}
							class="w-full px-6 py-4 bg-slate-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700 font-bold h-16" 
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- Right: Summary & Preview -->
		<div class="space-y-8">
			<div class="bg-blue-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-blue-200 sticky top-28">
				<h3 class="text-xl font-black mb-8 border-b border-blue-500/50 pb-4">Sale Summary</h3>
				
				<div class="space-y-6">
					<div class="flex justify-between items-center bg-blue-700/30 p-4 rounded-2xl border border-blue-500/20">
						<span class="text-xs font-bold text-blue-200 uppercase tracking-widest">Installment Total</span>
						<span class="text-xl font-black">{formatCurrency(totalAmount)}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-xs font-bold text-blue-200 uppercase tracking-widest">Advance Payment</span>
						<span class="text-md font-black">-{formatCurrency(downPayment)}</span>
					</div>
					<div class="flex justify-between items-center border-t border-blue-500/50 pt-6">
						<span class="text-xs font-bold text-blue-200 uppercase tracking-widest">Balance to Pay</span>
						<span class="text-2xl font-black">{formatCurrency(remainingBalance)}</span>
					</div>
					<div class="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-8 text-center">
						<p class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-1">Monthly Installment</p>
						<p class="text-3xl font-black">{formatCurrency(monthlyAmount)}</p>
						<p class="text-[10px] font-bold text-blue-100 mt-2 italic">For {duration} months</p>
					</div>
				</div>

				<button 
					type="submit"
					class="w-full mt-10 py-5 bg-white text-blue-600 font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-xs"
				>
					Generate Plan & Sale
				</button>
			</div>

			<!-- Custom Schedule JSON -->
			<input type="hidden" name="customSchedule" value={JSON.stringify(customSchedule)} />

			<!-- Schedule Editor -->
			{#if customSchedule.length > 0}
				<div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-8">
					<div class="flex items-center justify-between mb-6">
						<h3 class="text-sm font-black text-slate-800 uppercase tracking-[0.1em] flex items-center gap-2">
							<Calendar class="w-4 h-4 text-blue-500" />
							Installment Schedule ({customSchedule.length} Months)
						</h3>
						{#if manuallyEdited}
							<button 
								type="button" 
								onclick={resetSchedule}
								class="px-3 py-1.5 bg-blue-50/50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
							>
								Reset Auto-Calc
							</button>
						{/if}
					</div>
					
					<div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
						{#each customSchedule as item, i}
							<div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border {manuallyEdited ? 'border-amber-200 bg-amber-50/10' : 'border-transparent'} transition-colors">
								<div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 shrink-0 shadow-sm">
									{item.serial}
								</div>
								<div class="flex-1">
									<p class="text-[10px] font-black text-slate-400 uppercase leading-none mb-1.5">Due Date</p>
									<input 
										type="date" 
										bind:value={customSchedule[i].date}
										oninput={handleManualEdit}
										class="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
									/>
								</div>
								<div class="flex-1">
									<p class="text-[10px] font-black text-slate-400 uppercase leading-none mb-1.5 justify-end flex">Amount (Rs)</p>
									<input 
										type="number" 
										bind:value={customSchedule[i].amount}
										oninput={handleManualEdit}
										class="w-full text-right bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-blue-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
									/>
								</div>
							</div>
						{/each}
					</div>
					
					<!-- Validation warning if sum mismatches balance -->
					{#if Math.abs(customSchedule.reduce((sum, item) => sum + Number(item.amount), 0) - remainingBalance) > 10}
						<div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
							<AlertCircle class="w-5 h-5 text-amber-500 shrink-0" />
							<div>
								<p class="text-xs font-bold text-amber-800 uppercase tracking-wide">Schedule Mismatch</p>
								<p class="text-xs text-amber-600 mt-1">
									The sum of all installments ({formatCurrency(customSchedule.reduce((sum, item) => sum + Number(item.amount), 0))}) 
									does not match the Balance to Pay ({formatCurrency(remainingBalance)}). Please adjust the amounts.
								</p>
							</div>
						</div>
					{:else if manuallyEdited}
						<div class="mt-4 p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-100">
							<CheckCircle2 class="w-4 h-4" /> Customized schedule matches balance!
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</form>
</div>
