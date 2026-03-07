<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
		User,
		Package,
		Calendar,
		Clock,
		DollarSign,
		AlertCircle,
		CheckCircle2,
		Percent,
		Users
	} from 'lucide-svelte';

	let { data, form } = $props();

	type ScheduleItem = {
		serial: number;
		date: string;
		amount: number;
	};

	let selectedCustomerId = $state('');
	let selectedInvestorId = $state('');
	let selectedProductId = $state('');
	let customerSearchQuery = $state('');
	let showCustomerDropdown = $state(false);

	let startDate = $state(toDateInputValue(new Date()));
	let customDuration = $state<number | null>(12);
	let customDownPayment = $state<number | null>(0);
	let customInstallmentPercentage = $state<number | null>(0);
	let customSchedule = $state<ScheduleItem[]>([]);
	let manuallyEdited = $state(false);

	const selectedProduct = $derived(data.products.find((p: any) => p.id === selectedProductId));
	const selectedCustomer = $derived(data.customers.find((c: any) => c.id === selectedCustomerId));
	const selectedInvestor = $derived(data.investors.find((i: any) => i.id === selectedInvestorId));

	const filteredCustomers = $derived(
		customerSearchQuery
			? data.customers.filter((c: any) =>
				c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
				c.cnic.includes(customerSearchQuery) ||
				c.mobile.includes(customerSearchQuery)
			)
			: data.customers
	);

	const duration = $derived(
		customDuration && Number(customDuration) > 0 ? Number(customDuration) : 12
	);
	const sellingPrice = $derived(selectedProduct ? roundCurrency(Number(selectedProduct.cashPrice || 0)) : 0);
	const downPayment = $derived(roundCurrency(Math.max(0, Number(customDownPayment ?? 0))));
	const installmentPercentage = $derived(roundCurrency(Math.max(0, Number(customInstallmentPercentage ?? 0))));
	const balanceAfterAdvance = $derived(roundCurrency(Math.max(sellingPrice - downPayment, 0)));
	const installmentCharge = $derived(roundCurrency((balanceAfterAdvance * installmentPercentage) / 100));
	const remainingBalance = $derived(roundCurrency(balanceAfterAdvance + installmentCharge));
	const totalAmount = $derived(roundCurrency(downPayment + remainingBalance));
	const autoSchedule = $derived(
		selectedProduct && startDate && remainingBalance > 0 && duration > 0
			? buildSchedule(startDate, duration, remainingBalance)
			: []
	);
	const scheduleTotal = $derived(
		roundCurrency(customSchedule.reduce((sum, item) => sum + Number(item.amount || 0), 0))
	);
	const scheduleMatches = $derived(Math.abs(scheduleTotal - remainingBalance) <= 0.01);
	const advanceTooHigh = $derived(Boolean(selectedProduct) && downPayment >= sellingPrice);
	const canSubmit = $derived(
		Boolean(selectedCustomerId && selectedInvestorId && selectedProductId && startDate) &&
		duration > 0 &&
		!advanceTooHigh &&
		remainingBalance > 0 &&
		customSchedule.length > 0 &&
		scheduleMatches
	);
	const customScheduleJson = $derived(JSON.stringify(customSchedule));

	$effect(() => {
		if (!selectedProduct || !startDate || remainingBalance <= 0 || duration < 1) {
			customSchedule = [];
			return;
		}

		if (!manuallyEdited) {
			customSchedule = autoSchedule.map((item) => ({ ...item }));
		}
	});

	function roundCurrency(amount: number) {
		return Math.round((amount + Number.EPSILON) * 100) / 100;
	}

	function toDateInputValue(date: Date) {
		const year = date.getFullYear();
		const month = `${date.getMonth() + 1}`.padStart(2, '0');
		const day = `${date.getDate()}`.padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PK', {
			style: 'currency',
			currency: 'PKR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function buildSchedule(scheduleStartDate: string, months: number, amount: number): ScheduleItem[] {
		const start = new Date(scheduleStartDate);
		if (Number.isNaN(start.getTime()) || months < 1 || amount <= 0) {
			return [];
		}

		const items: ScheduleItem[] = [];
		const totalCents = Math.round(roundCurrency(amount) * 100);
		const baseCents = Math.floor(totalCents / months);
		const remainderCents = totalCents - (baseCents * months);

		for (let i = 1; i <= months; i++) {
			const dueDate = new Date(start);
			dueDate.setMonth(dueDate.getMonth() + i);

			items.push({
				serial: i,
				date: toDateInputValue(dueDate),
				amount: (i === months ? baseCents + remainderCents : baseCents) / 100
			});
		}

		return items;
	}

	function handleManualEdit() {
		manuallyEdited = true;
	}

	function resetSchedule() {
		manuallyEdited = false;
		customSchedule = autoSchedule.map((item) => ({ ...item }));
	}
</script>

<div class="max-w-5xl mx-auto space-y-6">
	<div class="flex items-center gap-4">
		<a href="/installments" class="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black transition-all shadow-sm active:scale-95">
			<ArrowLeft class="w-5 h-5" />
		</a>
		<div>
			<h1 class="text-2xl font-black text-gray-900 tracking-tight leading-none">Create New Sale</h1>
			<p class="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest leading-none">Installment Plan Configurator</p>
		</div>
	</div>

	{#if form?.error}
		<div class="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm">
			<AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
			<div>
				<p class="text-xs font-black text-red-700 uppercase tracking-widest">Unable to create plan</p>
				<p class="text-sm font-bold text-red-600 mt-1">{form.error}</p>
			</div>
		</div>
	{/if}

	<form method="POST" use:enhance class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-2 space-y-6">
			<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
				<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3 mb-5">
					<User class="w-4 h-4" />
					<span class="text-sm font-semibold">Step 1: Select Customer</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
					<div class="space-y-2 relative">
						<label for="customerSearch" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Search Customer</label>
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

			<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
				<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3 mb-5">
					<Users class="w-4 h-4" />
					<span class="text-sm font-semibold">Step 2: Select Investor</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
					<div class="space-y-2">
						<label for="investorId" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Investor</label>
						<select
							name="investorId"
							id="investorId"
							bind:value={selectedInvestorId}
							required
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm appearance-none cursor-pointer"
						>
							<option value="">Select investor...</option>
							{#each data.investors as investor}
								<option value={investor.id}>{investor.name}{investor.mobile ? ` (${investor.mobile})` : ''}</option>
							{/each}
						</select>
						{#if data.investors.length === 0}
							<p class="text-[10px] font-bold text-red-600">
								No active investor found. Create one from <a href="/investments" class="underline">Investment Management</a>.
							</p>
						{/if}
					</div>
					{#if selectedInvestor}
						<div class="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-center gap-3 shadow-sm">
							<div class="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center font-black text-white shadow-sm shrink-0 text-sm">
								{selectedInvestor.name.substring(0, 2).toUpperCase()}
							</div>
							<div class="space-y-1 overflow-hidden">
								<p class="text-sm font-black text-blue-900 truncate">{selectedInvestor.name}</p>
								<p class="text-[9px] font-black text-blue-600 uppercase tracking-widest leading-none">
									{selectedInvestor.mobile || 'No contact number'}
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
				<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3 mb-5">
					<Package class="w-4 h-4" />
					<span class="text-sm font-semibold">Step 3: Select Product</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
					<div class="space-y-2">
						<label for="productId" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Choose Product</label>
						<select
							name="productId"
							id="productId"
							bind:value={selectedProductId}
							required
							onchange={() => {
								manuallyEdited = false;
							}}
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm appearance-none cursor-pointer"
						>
							<option value="">Select a product...</option>
							{#each data.products as product}
								<option value={product.id}>{product.name} ({product.category})</option>
							{/each}
						</select>
					</div>
					{#if selectedProduct}
						<input type="hidden" name="totalAmount" value={totalAmount} />
						<input type="hidden" name="customSchedule" value={customScheduleJson} />
						<div class="grid grid-cols-2 gap-3 w-full animate-in fade-in slide-in-from-left-4">
							<div class="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
								<p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Selling Price</p>
								<p class="text-xl font-black text-gray-900 tracking-tight">{formatCurrency(sellingPrice)}</p>
								<p class="text-[9px] font-bold text-gray-400 mt-2 flex items-center gap-1">
									<span class="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"></span>
									From product catalog
								</p>
							</div>
							<div class="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-center">
								<p class="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Installment Charge</p>
								<p class="text-xl font-black text-blue-700">{formatCurrency(installmentCharge)}</p>
								<p class="text-[9px] font-bold text-blue-600/70 mt-2">On {formatCurrency(balanceAfterAdvance)} balance</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
				<div class="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3 mb-5">
					<Clock class="w-4 h-4" />
					<span class="text-sm font-semibold">Step 4: Plan Setup</span>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
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
							min="0"
							step="0.01"
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold"
						/>
					</div>
					<div class="space-y-2">
						<label for="installmentPercentage" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Installment %</label>
						<div class="relative">
							<input
								type="number"
								name="installmentPercentage"
								id="installmentPercentage"
								bind:value={customInstallmentPercentage}
								min="0"
								step="0.01"
								class="w-full px-3 py-3 pr-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold"
							/>
							<span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-black">%</span>
						</div>
					</div>
					<div class="space-y-2">
						<label for="durationMonths" class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration (Months)</label>
						<input
							type="number"
							name="durationMonths"
							id="durationMonths"
							bind:value={customDuration}
							min="1"
							class="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors text-gray-900 text-sm font-bold"
						/>
					</div>
				</div>

				{#if selectedProduct && advanceTooHigh}
					<div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 shadow-sm">
						<AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
						<div>
							<p class="text-[9px] font-black text-red-700 uppercase tracking-widest">Advance too high</p>
							<p class="text-[10px] font-bold text-red-600 mt-0.5 leading-tight">
								Advance must stay below the product selling price.
							</p>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<div class="space-y-6">
			<div class="bg-[#0b1120] rounded-[24px] p-8 text-white shadow-2xl sticky top-6 ring-1 ring-white/10">
				<h3 class="text-[10px] font-black mb-8 border-b border-white/10 pb-4 uppercase tracking-[0.3em] text-white/50">Sale Summary</h3>

				<div class="space-y-6">
					<div class="flex justify-between items-center group">
						<span class="text-[10px] font-black text-white/40 uppercase tracking-widest transition-colors group-hover:text-white/60">Selling Price</span>
						<span class="text-base font-black tracking-tight">{formatCurrency(sellingPrice)}</span>
					</div>
					<div class="flex justify-between items-center group">
						<span class="text-[10px] font-black text-white/40 uppercase tracking-widest transition-colors group-hover:text-white/60">Advance Payment</span>
						<span class="text-sm font-black text-[#ff8c5a] tracking-tight">-{formatCurrency(downPayment)}</span>
					</div>
					<div class="flex justify-between items-center group">
						<span class="text-[10px] font-black text-white/40 uppercase tracking-widest transition-colors group-hover:text-white/60">Balance After Advance</span>
						<span class="text-sm font-black tracking-tight">{formatCurrency(balanceAfterAdvance)}</span>
					</div>
					<div class="flex justify-between items-center group">
						<span class="text-[10px] font-black text-white/40 uppercase tracking-widest transition-colors group-hover:text-white/60">Installment Charge</span>
						<span class="text-sm font-black text-[#60a5fa] tracking-tight">+{formatCurrency(installmentCharge)}</span>
					</div>
					<div class="flex justify-between items-center border-t border-white/10 pt-6">
						<div class="flex items-center gap-2">
							<Percent class="w-4 h-4 text-white/40" />
							<span class="text-[10px] font-black text-white/50 uppercase tracking-widest">Final Plan Total</span>
						</div>
						<span class="text-xl font-black text-white tracking-tight">{formatCurrency(totalAmount)}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-[10px] font-black text-white/50 uppercase tracking-widest">Balance to Pay</span>
						<span class="text-lg font-black text-[#93c5fd] tracking-tight">{formatCurrency(remainingBalance)}</span>
					</div>

					<div class="relative overflow-hidden bg-gradient-to-br from-[#131b2f] to-[#0d1425] p-6 rounded-2xl border border-white/5 mt-8 text-center shadow-inner">
						<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-50"></div>
						<p class="text-[8px] font-black uppercase tracking-[0.3em] text-[#60a5fa] mb-3">Est. Monthly Installment</p>
						<p class="text-3xl font-black text-white tracking-tighter drop-shadow-sm">{formatCurrency(duration > 0 ? remainingBalance / duration : 0)}</p>
						<div class="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
							<Clock class="w-3 h-3 text-white/40" />
							<p class="text-[9px] font-bold text-white/40 uppercase tracking-widest">{duration} months plan</p>
						</div>
					</div>
				</div>

				<button
					type="submit"
					disabled={!canSubmit}
					class="w-full mt-10 py-4 font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_8px_30px_rgb(255,255,255,0.1)] transition-all duration-200 text-[10px] flex items-center justify-center gap-2 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed disabled:shadow-none enabled:bg-white enabled:text-black enabled:hover:bg-gray-100 enabled:hover:scale-[1.02] enabled:active:scale-[0.98]"
				>
					<CheckCircle2 class="w-4 h-4" /> Finalize Sale Contract
				</button>
			</div>

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
							<div class="flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border {manuallyEdited && (customSchedule[i].amount !== autoSchedule[i]?.amount || customSchedule[i].date !== autoSchedule[i]?.date) ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200/60'} transition-colors">
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
										step="0.01"
										bind:value={customSchedule[i].amount}
										oninput={handleManualEdit}
										class="w-full text-right bg-white border border-gray-200 rounded-lg text-xs font-black text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2 transition-all shadow-sm"
									/>
								</div>
							</div>
						{/each}
					</div>

					{#if !scheduleMatches}
						<div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 shadow-sm">
							<AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
							<div>
								<p class="text-[9px] font-black text-red-700 uppercase tracking-widest">Mismatch</p>
								<p class="text-[10px] font-bold text-red-600 mt-0.5 leading-tight">
									Sum ({formatCurrency(scheduleTotal)})
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
