<script lang="ts">
	import { enhance } from '$app/forms';
	import { 
		ArrowLeft, 
		Printer, 
		CheckCircle2, 
		XCircle,
		DollarSign,
		CalendarDays,
		Banknote,
		AlertCircle
	} from 'lucide-svelte';

	let { data, form } = $props();
	let selectedInstallment = $state<any>(null);
	let paymentAmount = $state(0);
	let paymentDateStr = $state(new Date().toLocaleDateString('en-CA'));

	// Object to hold custom dates for each row so user can edit right in the table
	let rowDates = $state<Record<string, string>>({});
	
	$effect(() => {
		for (const inst of data.plan.installments) {
			if (!rowDates[inst.id]) {
				rowDates[inst.id] = new Date().toLocaleDateString('en-CA');
			}
		}
	});

	function formatCurrency(amount: any) {
		return Number(amount || 0).toLocaleString('en-PK');
	}

	function formatDateShort(date: any) {
		if (!date) return '';
		return new Date(date).toLocaleDateString('en-GB', { 
			day: '2-digit', 
			month: '2-digit', 
			year: 'numeric' 
		});
	}

	function getMonthName(date: any) {
		if (!date) return '';
		return new Date(date).toLocaleDateString('en-US', { month: 'short' });
	}

	function getYear(date: any) {
		if (!date) return '';
		return new Date(date).getFullYear();
	}
	
	let totalInstallmentSum = $derived(data.plan.installments.reduce((acc: number, cur: any) => acc + Number(cur.amount), 0));
	let totalReceivedSum = $derived(data.plan.installments.reduce((acc: number, cur: any) => acc + Number(cur.receivedAmount), 0));
	let totalPendingSum = $derived(data.plan.installments.reduce((acc: number, cur: any) => acc + Number(cur.pendingAmount), 0));

</script>

<div class="max-w-4xl mx-auto space-y-6 pb-20">
	<!-- Actions (Hidden in Print) -->
	<div class="flex items-center justify-between print:hidden">
		<a href="/installments" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow">
			<ArrowLeft class="w-4 h-4" /> Back
		</a>
		<button 
			onclick={() => window.print()}
			class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-900 transition-all shadow-md hover:shadow-lg active:scale-95"
		>
			<Printer class="w-4 h-4" />
			Print Ledger
		</button>
	</div>
	
	<!-- Financial Summary Bar (Digital Only) -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
		<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">Net Sale Total</p>
				<p class="text-lg font-black text-gray-900 font-mono tracking-tighter">Rs. {Number(data.plan.totalAmount).toLocaleString()}</p>
			</div>
			<div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
				<DollarSign class="w-5 h-5 text-gray-400" />
			</div>
		</div>
		<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
			<div>
				<p class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none mb-1">Total Received</p>
				<p class="text-lg font-black text-emerald-600 font-mono tracking-tighter">Rs. { (totalReceivedSum + Number(data.plan.downPayment || 0)).toLocaleString() }</p>
			</div>
			<div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
				<Banknote class="w-5 h-5 text-emerald-500" />
			</div>
		</div>
		<div class="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex items-center justify-between ring-1 ring-blue-50 ring-offset-2">
			<div>
				<p class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none mb-1">Final Pending</p>
				<p class="text-lg font-black text-blue-600 font-mono tracking-tighter">Rs. {Number(data.plan.remainingBalance).toLocaleString()}</p>
			</div>
			<div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
				<AlertCircle class="w-5 h-5 text-blue-500" />
			</div>
		</div>
	</div>

	<!-- Printable Area -->
	<div class="printable-area bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden print:border-[3px] print:border-black print:rounded-none print:shadow-none print:m-0 mx-auto">
		
		<!-- Header -->
		<div class="text-center pt-8 pb-4 border-b-2 border-gray-200 print:border-black print:pt-4 print:pb-2 bg-gradient-to-b from-gray-50 to-white print:bg-none">
			<h1 class="text-3xl md:text-5xl font-black uppercase tracking-widest text-gray-900 print:text-black font-serif drop-shadow-sm print:drop-shadow-none">Al Farooq Electronics</h1>
			<p class="text-sm md:text-base font-bold text-gray-600 print:text-black tracking-[0.2em] mt-2">PH.0322-8736026 : 0349-7379944</p>
		</div>

		<!-- Premium Customer Info Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 bg-gray-50 print:bg-transparent border-b-2 border-gray-200 print:border-black divide-y md:divide-y-0 md:divide-x divide-gray-200 print:divide-x print:divide-black">
			
			<div class="p-4 md:p-5 flex flex-col gap-1 print:p-2 print:border-b border-gray-200 print:border-black">
				<span class="text-[10px] font-black text-blue-600 print:text-black uppercase tracking-widest leading-none">Customer Name</span>
				<span class="font-bold text-gray-900 text-lg print:text-sm leading-tight print:leading-tight">{data.plan.customer.name}</span>
			</div>
			
			<div class="p-4 md:p-5 flex flex-col gap-1 print:p-2 print:border-b border-gray-200 print:border-black">
				<span class="text-[10px] font-black text-blue-600 print:text-black uppercase tracking-widest leading-none">Home Address</span>
				<span class="font-semibold text-gray-700 text-sm print:text-xs leading-tight print:leading-tight">{data.plan.customer.address}</span>
			</div>
			
			<div class="p-4 md:p-5 flex flex-col gap-1 print:p-2 print:border-b border-gray-200 print:border-black">
				<span class="text-[10px] font-black text-blue-600 print:text-black uppercase tracking-widest leading-none">Mobile #</span>
				<span class="font-bold font-mono text-gray-900 text-base print:text-sm leading-tight print:leading-tight">{data.plan.customer.mobile}</span>
			</div>
			
			<div class="p-4 md:p-5 flex flex-col gap-1 border-t border-gray-200 print:border-t-0 print:border-black print:p-2">
				<span class="text-[10px] font-black text-blue-600 print:text-black uppercase tracking-widest leading-none">Item Name</span>
				<span class="font-bold text-gray-900 text-lg print:text-sm leading-tight print:leading-tight">{data.plan.product.name}</span>
			</div>
			
			<div class="p-4 md:p-5 flex flex-col gap-1 border-t border-gray-200 print:border-t-0 print:border-black print:p-2">
				<span class="text-[10px] font-black text-blue-600 print:text-black uppercase tracking-widest leading-none">NIC #</span>
				<span class="font-bold font-mono text-gray-700 text-base print:text-xs leading-tight print:leading-tight">{data.plan.customer.cnic}</span>
			</div>
			
			<div class="p-4 md:p-5 flex flex-col gap-1 border-t border-gray-200 print:border-t-0 print:border-black print:p-2 bg-blue-50/50 print:bg-transparent">
				<span class="text-[10px] font-black text-blue-600 print:text-black uppercase tracking-widest leading-none">Bill #</span>
				<span class="font-black font-mono text-blue-700 text-lg print:text-sm print:text-black leading-tight print:leading-tight">#{data.plan.id.substring(0,6).toUpperCase()}</span>
			</div>

		</div>

		<!-- Table Section with Strict Borders -->
		<div class="overflow-x-auto print:overflow-visible">
			<table class="w-full text-center text-sm lg:text-base whitespace-nowrap border-collapse">
				<thead>
					<tr class="bg-gray-100 print:bg-transparent text-gray-600 print:text-black font-black uppercase text-[10px] md:text-xs tracking-wider border-b-2 border-gray-300 print:border-b-2 print:border-black">
						<th class="p-3 print:p-1.5 border-r border-gray-300 print:border-black w-12">Sr#</th>
						<th class="p-3 print:p-1.5 border-r border-gray-300 print:border-black">Month</th>
						<th class="p-3 print:p-1.5 border-r border-gray-300 print:border-black">Year</th>
						<th class="p-3 print:p-1.5 border-r border-gray-300 print:border-black text-right">Inst. Amount</th>
						<th class="p-3 print:p-1.5 border-r border-gray-300 print:border-black text-right">Received</th>
						<th class="p-3 print:p-1.5 border-r border-gray-300 print:border-black text-right">Pending</th>
						<th class="p-3 print:p-1.5 border-r border-gray-300 print:border-black">Payment Date</th>
						<th class="p-3 print:p-1.5 w-32">Sign</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 print:divide-black">
					{#each data.plan.installments as installment (installment.id)}
						<tr class="hover:bg-blue-50/30 transition-colors group">
							<td class="p-3 print:p-1.5 font-bold text-gray-900 print:text-black border-r border-gray-200 print:border-black print:text-xs">{installment.serialNumber}</td>
							<td class="p-3 print:p-1.5 font-bold text-gray-700 print:text-black border-r border-gray-200 print:border-black print:text-xs">{getMonthName(installment.dueDate)}</td>
							<td class="p-3 print:p-1.5 font-semibold text-gray-500 print:text-black border-r border-gray-200 print:border-black print:text-xs">{getYear(installment.dueDate)}</td>
							<td class="p-3 print:p-1.5 text-right font-black font-mono text-gray-900 print:text-black border-r border-gray-200 print:border-black print:text-xs">{formatCurrency(installment.amount)}</td>
							<td class="p-3 print:p-1.5 text-right font-bold font-mono text-green-600 print:text-black border-r border-gray-200 print:border-black print:text-xs">
								{installment.receivedAmount > 0 ? formatCurrency(installment.receivedAmount) : '-'}
							</td>
							<td class="p-3 print:p-1.5 text-right font-bold font-mono text-red-500 print:text-black border-r border-gray-200 print:border-black print:text-xs">
								{installment.pendingAmount > 0 ? formatCurrency(installment.pendingAmount) : '-'}
							</td>
							
							<td class="p-3 print:p-1 border-r border-gray-200 print:border-black relative">
								{#if installment.status !== 'PAID'}
									<!-- Inline Date Picker & Pay Button for Web View -->
									<div class="print:hidden flex items-center justify-between gap-2 max-w-[240px] mx-auto">
										<div class="relative flex-1 group-hover:ring-2 ring-blue-100 rounded-lg transition-all">
											<div class="absolute inset-y-0 left-2 flex items-center pointer-events-none">
												<CalendarDays class="w-3.5 h-3.5 text-gray-400" />
											</div>
											<input 
												type="date" 
												bind:value={rowDates[installment.id]} 
												class="w-full pl-7 pr-2 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none focus:border-black focus:ring-0 transition-all cursor-pointer shadow-sm disabled:opacity-50"
												title="Change payment date before paying"
											/>
										</div>
										<button 
											onclick={() => {
												selectedInstallment = installment;
												paymentAmount = parseFloat(installment.pendingAmount);
												paymentDateStr = rowDates[installment.id];
											}}
											class="px-5 py-2.5 bg-black text-white rounded-lg text-sm font-black shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:bg-gray-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] active:scale-95 transition-all uppercase tracking-widest whitespace-nowrap"
										>
											PAY
										</button>
									</div>
									<span class="hidden print:inline font-mono text-xs">{formatDateShort(installment.dueDate)}</span>
								{:else}
									<div class="flex items-center justify-center">
										<div class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm group-hover:scale-105 transition-transform">
											<div class="flex items-center gap-1.5">
												<Banknote class="w-3.5 h-3.5 text-emerald-600" />
												<span class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Paisa Paid</span>
											</div>
											<span class="text-[9px] font-bold text-emerald-600/70 font-mono">{formatDateShort(installment.paymentDate)}</span>
										</div>
									</div>
								{/if}
							</td>
							
							<td class="p-3 print:p-1.5"></td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr class="bg-gray-100 print:bg-transparent border-t-2 border-gray-300 print:border-t-2 print:border-black font-bold">
						<td colspan="3" class="p-4 print:p-2 text-right text-gray-500 print:text-black uppercase tracking-widest text-[10px] border-r border-gray-300 print:border-black">Total Balance</td>
						<td class="p-4 print:p-2 text-right font-black font-mono text-gray-900 print:text-black border-r border-gray-300 print:border-black print:text-xs">{formatCurrency(totalInstallmentSum)}</td>
						<td class="p-4 print:p-2 text-right font-black font-mono text-green-600 print:text-black border-r border-gray-300 print:border-black print:text-xs">{formatCurrency(totalReceivedSum)}</td>
						<td class="p-4 print:p-2 text-right font-black font-mono text-red-600 print:text-black border-r border-gray-300 print:border-black print:text-xs">{formatCurrency(totalPendingSum)}</td>
						<td class="p-4 print:p-2 border-r border-gray-300 print:border-black"></td>
						<td class="p-4 print:p-2"></td>
					</tr>
				</tfoot>
			</table>
		</div>
	</div>
</div>

<!-- Refined Payment Modal -->
{#if selectedInstallment}
	<div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
		<div class="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden transform transition-all ring-1 ring-black/5">
			
			<div class="px-6 py-5 bg-gradient-to-b from-gray-50 to-white flex items-center justify-between border-b border-gray-100">
				<div>
					<h2 class="text-xl font-black text-gray-900 leading-none">Confirm Payment</h2>
					<p class="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md inline-block">Inst. #{selectedInstallment.serialNumber}</p>
				</div>
				<button 
					onclick={() => selectedInstallment = null}
					class="p-2.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors active:scale-95 bg-white shadow-sm border border-gray-100"
				>
					<XCircle class="w-5 h-5" />
				</button>
			</div>

			<form 
				method="POST" 
				action="?/recordPayment" 
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							selectedInstallment = null;
						} else if (result.type === 'failure' || result.type === 'error') {
							const errorMsg = result.data?.error || (result.type === 'error' ? 'A server error occurred' : 'Failed to record payment');
							alert(errorMsg);
						}
					};
				}}
				class="p-6 space-y-6"
			>
				<input type="hidden" name="installmentId" value={selectedInstallment.id} />
				<input type="hidden" name="paymentDate" value={paymentDateStr} />
				
				<div class="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex justify-between items-center shadow-inner">
					<div class="space-y-1">
						<p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Monthly Due</p>
						<p class="text-lg font-black text-gray-900">{formatCurrency(selectedInstallment.amount)}</p>
					</div>
					<div class="text-right space-y-1">
						<p class="text-[10px] font-black text-red-500 uppercase tracking-widest">Remaining</p>
						<p class="text-lg font-black text-red-600">{formatCurrency(selectedInstallment.pendingAmount)}</p>
					</div>
				</div>

				<div class="space-y-5">
					<div class="space-y-2">
						<label for="amount" class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payment Amount (Rs)</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
								<DollarSign class="w-5 h-5 text-gray-400" />
							</div>
							<input 
								type="number" 
								name="amount" 
								id="amount" 
								bind:value={paymentAmount}
								step="0.01"
								required 
								class="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl shadow-sm focus:ring-0 focus:border-black outline-none transition-all text-gray-900 font-black text-xl placeholder-gray-300" 
							/>
						</div>
					</div>

					<!-- Distinct Date Display Box inside Modal -->
					<div class="space-y-2">
						<label for="date_display" class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payment Date Selected</label>
						<div class="w-full px-4 py-3.5 bg-blue-50 border-2 border-blue-100 rounded-xl flex items-center gap-3">
							<CalendarDays class="w-5 h-5 text-blue-500" />
							<span class="font-black text-blue-900 text-lg">{paymentDateStr}</span>
						</div>
						<p class="text-[10px] text-gray-400 ml-1 font-medium italic">* Change date in the table row if needed before clicking Pay</p>
					</div>

					<div class="space-y-2">
						<label for="method" class="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Payment Method</label>
						<select 
							name="method" 
							id="method"
							class="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-0 focus:border-black outline-none transition-all text-gray-900 font-bold cursor-pointer text-sm appearance-none"
						>
							<option value="CASH">💵 Cash in Hand</option>
							<option value="BANK">🏦 Bank Transfer</option>
							<option value="CHEQUE">📝 Cheque</option>
							<option value="E-PAISA">📱 EasyPaisa / JazzCash</option>
						</select>
					</div>
				</div>

				<div class="pt-2">
					<button 
						type="submit"
						class="w-full py-4 rounded-xl bg-black text-white font-black uppercase tracking-widest shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-gray-900 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
					>
						<CheckCircle2 class="w-5 h-5" /> Confirm Payment
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Make the input date picker icon invisible or look decent */
	input[type="date"]::-webkit-calendar-picker-indicator {
		opacity: 0.6;
		cursor: pointer;
		filter: invert(0.5);
	}
	input[type="date"]:hover::-webkit-calendar-picker-indicator {
		opacity: 1;
		filter: invert(0);
	}

	/* Strict formatting for Print to force A4 Portrait top-half fitting */
	@media print {
		@page {
			margin: 0.3cm 0.5cm; /* Tighter margins to maximize space */
			size: A4 portrait; /* A4 size is requested but it must fit in one page */
		}
		:global(body) {
			background: white !important;
			margin: 0;
			padding: 0;
			color: black !important;
			/* Scale content down slightly globally if needed, effectively forcing a fit */
			zoom: 0.95; 
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		
		/* Remove everything unnecessary */
		:global(aside), :global(header) {
			display: none !important;
		}
		:global(main) {
			padding: 0 !important;
			margin: 0 !important;
			max-width: 100% !important;
		}

		/* The main receipt container */
		.printable-area {
			width: 100% !important;
			margin: 0 !important;
			page-break-inside: avoid; /* Ensure it stays together securely */
			height: auto;
		}

		* {
			color: black !important;
		}
	}
</style>
