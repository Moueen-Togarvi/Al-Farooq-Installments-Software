<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		HandCoins,
		Users,
		DollarSign,
		TrendingDown,
		ArrowDownCircle,
		Calendar,
		Search,
		Filter
	} from 'lucide-svelte';

	let { data, form } = $props();
	let investorSearch = $state('');
	let investorStatusFilter = $state('ALL');
	let transactionSearch = $state('');
	let transactionTypeFilter = $state('ALL');
	let transactionInvestorFilter = $state('ALL');
	let transactionMonthFilter = $state('ALL');

	function formatCurrency(amount: any) {
		return new Intl.NumberFormat('en-PK', {
			style: 'currency',
			currency: 'PKR',
			minimumFractionDigits: 0
		}).format(Number(amount || 0));
	}

	function formatBillNumber(value: any) {
		return `#${String(Number(value || 0)).padStart(3, '0')}`;
	}

	function transactionTypeLabel(type: string) {
		switch (type) {
			case 'INVESTOR_DEPOSIT': return 'Investor Deposit';
			case 'PRODUCT_PURCHASE': return 'Product Purchase';
			case 'INSTALLMENT_COLLECTION': return 'Installment Collection';
			case 'MANUAL_ADJUSTMENT': return 'Manual Adjustment';
			default: return type;
		}
	}

	function isIncoming(type: string) {
		return type === 'INVESTOR_DEPOSIT' || type === 'INSTALLMENT_COLLECTION';
	}

	function installmentStatusColor(status: string) {
		switch (status) {
			case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
			case 'PARTIAL': return 'bg-amber-50 text-amber-700 border-amber-200';
			default: return 'bg-red-50 text-red-700 border-red-200';
		}
	}

	function monthKey(value: any) {
		const date = new Date(value);
		const month = String(date.getMonth() + 1).padStart(2, '0');
		return `${date.getFullYear()}-${month}`;
	}

	function monthLabel(value: string) {
		const [year, month] = value.split('-').map(Number);
		return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric'
		});
	}

	const transactionMonthOptions = $derived(
		([...new Set<string>(data.transactions.map((txn: any) => monthKey(txn.createdAt)))] as string[]).sort((a, b) =>
			b.localeCompare(a)
		)
	);

	const filteredInvestors = $derived(
		data.investors.filter((investor: any) => {
			const normalizedSearch = investorSearch.trim().toLowerCase();
			const matchesSearch =
				!normalizedSearch ||
				investor.name.toLowerCase().includes(normalizedSearch) ||
				(investor.mobile || '').toLowerCase().includes(normalizedSearch);
			const matchesStatus = investorStatusFilter === 'ALL' || investor.status === investorStatusFilter;
			return matchesSearch && matchesStatus;
		})
	);

	const filteredTransactions = $derived(
		data.transactions.filter((txn: any) => {
			const normalizedSearch = transactionSearch.trim().toLowerCase();
			const billLabel = txn.plan?.billNumber ? formatBillNumber(txn.plan.billNumber).toLowerCase() : '';
			const matchesSearch =
				!normalizedSearch ||
				transactionTypeLabel(txn.type).toLowerCase().includes(normalizedSearch) ||
				(txn.investor?.name || '').toLowerCase().includes(normalizedSearch) ||
				(txn.plan?.customer?.name || '').toLowerCase().includes(normalizedSearch) ||
				(txn.product?.name || '').toLowerCase().includes(normalizedSearch) ||
				(txn.note || '').toLowerCase().includes(normalizedSearch) ||
				billLabel.includes(normalizedSearch);
			const matchesType = transactionTypeFilter === 'ALL' || txn.type === transactionTypeFilter;
			const matchesInvestor =
				transactionInvestorFilter === 'ALL' ||
				(transactionInvestorFilter === 'UNASSIGNED' && !txn.investor?.id) ||
				txn.investor?.id === transactionInvestorFilter;
			const matchesMonth = transactionMonthFilter === 'ALL' || monthKey(txn.createdAt) === transactionMonthFilter;
			return matchesSearch && matchesType && matchesInvestor && matchesMonth;
		})
	);

	const currentMonthUnpaidCount = $derived(
		data.currentMonthInstallments.filter((item: any) => item.status !== 'PAID').length
	);
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-black text-gray-900 tracking-tight">Investment Management</h1>
		<p class="text-sm text-gray-500 font-medium">Manage investors, fund pool, and investment flows</p>
	</div>

	{#if form?.error}
		<div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-200">
			{form.error}
		</div>
	{/if}

	<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
		<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
			<div class="flex items-center justify-between">
				<p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Available Balance</p>
				<HandCoins class="w-4 h-4 text-gray-400" />
			</div>
			<p class="text-xl font-black mt-3 text-gray-900">{formatCurrency(data.account.availableBalance)}</p>
		</div>
		<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
			<div class="flex items-center justify-between">
				<p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Deposited</p>
				<ArrowDownCircle class="w-4 h-4 text-emerald-500" />
			</div>
			<p class="text-xl font-black mt-3 text-emerald-600">{formatCurrency(data.account.totalDeposited)}</p>
		</div>
		<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
			<div class="flex items-center justify-between">
				<p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Collection</p>
				<DollarSign class="w-4 h-4 text-blue-500" />
			</div>
			<p class="text-xl font-black mt-3 text-blue-600">{formatCurrency(data.account.totalCollected)}</p>
		</div>
		<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
			<div class="flex items-center justify-between">
				<p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Spent</p>
				<TrendingDown class="w-4 h-4 text-red-500" />
			</div>
			<p class="text-xl font-black mt-3 text-red-600">{formatCurrency(data.account.totalSpent)}</p>
		</div>
	</div>

	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
			<h2 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
				<Calendar class="w-4 h-4" />
				Current Month Installments
			</h2>
			<p class="text-[10px] font-black uppercase tracking-widest text-gray-500">
				Unpaid First: {currentMonthUnpaidCount} Pending
			</p>
		</div>
		<div class="hidden md:block overflow-x-auto">
			<table class="w-full text-left min-w-[820px]">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Bill</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Customer</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Investor</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Due Date</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Pending</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.currentMonthInstallments as installment}
						<tr class="hover:bg-gray-50">
							<td class="px-5 py-3 text-xs font-black text-gray-800">{formatBillNumber(installment.plan?.billNumber)}</td>
							<td class="px-5 py-3 text-sm font-black text-gray-900">{installment.plan?.customer?.name || '-'}</td>
							<td class="px-5 py-3 text-sm font-bold text-gray-700">{installment.plan?.investor?.name || 'Unassigned'}</td>
							<td class="px-5 py-3 text-xs font-bold text-gray-500">{new Date(installment.dueDate).toLocaleDateString()}</td>
							<td class="px-5 py-3 text-sm font-black text-right {installment.status === 'PAID' ? 'text-emerald-600' : 'text-red-600'}">
								{formatCurrency(installment.pendingAmount)}
							</td>
							<td class="px-5 py-3 text-center">
								<span class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border {installmentStatusColor(installment.status)}">
									{installment.status}
								</span>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-5 py-10 text-center text-sm font-bold text-gray-500">No installments found for current month.</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="md:hidden p-3 space-y-2">
			{#each data.currentMonthInstallments as installment}
				<div class="rounded-lg border border-gray-200 bg-gray-50/60 p-3 space-y-2">
					<div class="flex items-center justify-between gap-2">
						<p class="text-xs font-black text-gray-900">{formatBillNumber(installment.plan?.billNumber)}</p>
						<span class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border {installmentStatusColor(installment.status)}">
							{installment.status}
						</span>
					</div>
					<p class="text-sm font-black text-gray-900 leading-tight">{installment.plan?.customer?.name || '-'}</p>
					<div class="flex items-center justify-between text-[10px] font-bold text-gray-500">
						<span>{new Date(installment.dueDate).toLocaleDateString()}</span>
						<span class="{installment.status === 'PAID' ? 'text-emerald-600' : 'text-red-600'}">{formatCurrency(installment.pendingAmount)}</span>
					</div>
					<p class="text-[10px] font-black uppercase tracking-wider text-gray-500">Investor: {installment.plan?.investor?.name || 'Unassigned'}</p>
				</div>
			{:else}
				<div class="px-2 py-8 text-center text-sm font-bold text-gray-500">No installments found for current month.</div>
			{/each}
		</div>
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
		<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
			<h2 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Create Investor</h2>
			<form method="POST" action="?/createInvestor" use:enhance class="space-y-4">
				<div class="space-y-1.5">
					<label for="name" class="text-[10px] font-black uppercase tracking-widest text-gray-500">Investor Name</label>
					<input id="name" name="name" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900" />
				</div>
				<div class="space-y-1.5">
					<label for="mobile" class="text-[10px] font-black uppercase tracking-widest text-gray-500">Mobile</label>
					<input id="mobile" name="mobile" class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900" />
				</div>
				<button class="w-full px-4 py-2.5 rounded-lg bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-colors">
					Create Investor
				</button>
			</form>
		</div>

		<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
			<h2 class="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Add Funds</h2>
			<form method="POST" action="?/addFunds" use:enhance class="space-y-4">
				<div class="space-y-1.5">
					<label for="investorId" class="text-[10px] font-black uppercase tracking-widest text-gray-500">Investor</label>
					<select id="investorId" name="investorId" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
						<option value="">Select investor...</option>
						{#each data.investors.filter((investor: any) => investor.status === 'ACTIVE') as investor}
							<option value={investor.id}>{investor.name}</option>
						{/each}
					</select>
				</div>
				<div class="space-y-1.5">
					<label for="amount" class="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount</label>
					<input id="amount" name="amount" type="number" min="0.01" step="0.01" required class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900" />
				</div>
				<div class="space-y-1.5">
					<label for="note" class="text-[10px] font-black uppercase tracking-widest text-gray-500">Note (Optional)</label>
					<input id="note" name="note" class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900" />
				</div>
				<button class="w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">
					Add Funds
				</button>
			</form>
		</div>
	</div>

	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="px-5 py-4 border-b border-gray-100">
			<h2 class="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
				<Users class="w-4 h-4" />
				Investors
			</h2>
		</div>
		<div class="px-5 py-3 border-b border-gray-100 bg-gray-50/70 flex flex-col lg:flex-row lg:items-center gap-3">
			<div class="relative flex-1">
				<Search class="absolute left-3 inset-y-0 my-auto w-4 h-4 text-gray-400" />
				<input
					type="text"
					bind:value={investorSearch}
					placeholder="Search investor by name or mobile..."
					class="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
				/>
			</div>
			<div class="flex items-center gap-2">
				<Filter class="w-4 h-4 text-gray-500" />
				<select
					bind:value={investorStatusFilter}
					class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
				>
					<option value="ALL">All Status</option>
					<option value="ACTIVE">Active</option>
					<option value="INACTIVE">Inactive</option>
				</select>
			</div>
		</div>
		<div class="hidden md:block overflow-x-auto">
			<table class="w-full text-left min-w-[760px]">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Name</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Mobile</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Deposited</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Collection</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Total</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Active Plans</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each filteredInvestors as investor}
						<tr class="hover:bg-gray-50">
							<td class="px-5 py-3 text-sm font-black text-gray-900">{investor.name}</td>
							<td class="px-5 py-3 text-sm font-bold text-gray-600">{investor.mobile || '-'}</td>
							<td class="px-5 py-3">
								<span class="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border {investor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}">
									{investor.status}
								</span>
							</td>
							<td class="px-5 py-3 text-sm font-black text-right text-emerald-600">{formatCurrency(investor.totalDeposited)}</td>
							<td class="px-5 py-3 text-sm font-black text-right text-blue-600">{formatCurrency(investor.totalCollected)}</td>
							<td class="px-5 py-3 text-sm font-black text-right text-gray-900">{formatCurrency(investor.totalContribution)}</td>
							<td class="px-5 py-3 text-sm font-black text-center text-gray-700">{investor._count.plans}</td>
						</tr>
					{:else}
						<tr>
							<td colspan="7" class="px-5 py-10 text-center text-sm font-bold text-gray-500">No investors match current filters.</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="md:hidden p-3 space-y-2">
			{#each filteredInvestors as investor}
				<div class="rounded-lg border border-gray-200 bg-gray-50/60 p-3 space-y-2">
					<div class="flex items-center justify-between gap-2">
						<p class="text-sm font-black text-gray-900 leading-tight">{investor.name}</p>
						<span class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border {investor.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}">
							{investor.status}
						</span>
					</div>
					<p class="text-[11px] font-bold text-gray-500">{investor.mobile || '-'}</p>
					<div class="grid grid-cols-2 gap-2 text-[10px]">
						<div>
							<p class="font-black text-gray-400 uppercase tracking-wider">Deposited</p>
							<p class="font-black text-emerald-600">{formatCurrency(investor.totalDeposited)}</p>
						</div>
						<div class="text-right">
							<p class="font-black text-gray-400 uppercase tracking-wider">Collected</p>
							<p class="font-black text-blue-600">{formatCurrency(investor.totalCollected)}</p>
						</div>
						<div>
							<p class="font-black text-gray-400 uppercase tracking-wider">Total</p>
							<p class="font-black text-gray-900">{formatCurrency(investor.totalContribution)}</p>
						</div>
						<div class="text-right">
							<p class="font-black text-gray-400 uppercase tracking-wider">Active Plans</p>
							<p class="font-black text-gray-900">{investor._count.plans}</p>
						</div>
					</div>
				</div>
			{:else}
				<div class="px-2 py-8 text-center text-sm font-bold text-gray-500">No investors match current filters.</div>
			{/each}
		</div>
	</div>

	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="px-5 py-4 border-b border-gray-100">
			<h2 class="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Investment Transactions</h2>
		</div>
		<div class="px-5 py-3 border-b border-gray-100 bg-gray-50/70 space-y-3">
			<div class="relative">
				<Search class="absolute left-3 inset-y-0 my-auto w-4 h-4 text-gray-400" />
				<input
					type="text"
					bind:value={transactionSearch}
					placeholder="Search by bill #, customer, investor, product, type or note..."
					class="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
				/>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
				<select
					bind:value={transactionTypeFilter}
					class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
				>
					<option value="ALL">All Types</option>
					<option value="INVESTOR_DEPOSIT">Investor Deposit</option>
					<option value="PRODUCT_PURCHASE">Product Purchase</option>
					<option value="INSTALLMENT_COLLECTION">Installment Collection</option>
					<option value="MANUAL_ADJUSTMENT">Manual Adjustment</option>
				</select>
				<select
					bind:value={transactionInvestorFilter}
					class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
				>
					<option value="ALL">All Investors</option>
					<option value="UNASSIGNED">Unassigned</option>
					{#each data.investors as investor}
						<option value={investor.id}>{investor.name}</option>
					{/each}
				</select>
				<select
					bind:value={transactionMonthFilter}
					class="px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
				>
					<option value="ALL">All Months</option>
					{#each transactionMonthOptions as month}
						<option value={month}>{monthLabel(month)}</option>
					{/each}
				</select>
				<button
					type="button"
					onclick={() => {
						transactionSearch = '';
						transactionTypeFilter = 'ALL';
						transactionInvestorFilter = 'ALL';
						transactionMonthFilter = 'ALL';
					}}
					class="px-4 py-2.5 rounded-lg border border-gray-300 text-xs font-black uppercase tracking-widest text-gray-700 hover:bg-gray-100 transition-colors"
				>
					Reset Filters
				</button>
			</div>
		</div>
		<div class="hidden md:block overflow-x-auto">
			<table class="w-full text-left min-w-[860px]">
				<thead class="bg-gray-50 border-b border-gray-200">
					<tr>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Type</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Investor</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Reference</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Note</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Date</th>
						<th class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Amount</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each filteredTransactions as txn}
						<tr class="hover:bg-gray-50">
							<td class="px-5 py-3 text-xs font-black text-gray-700 uppercase tracking-wide">{transactionTypeLabel(txn.type)}</td>
							<td class="px-5 py-3 text-sm font-bold text-gray-700">{txn.investor?.name || '-'}</td>
							<td class="px-5 py-3 text-xs font-bold text-gray-600">
								{#if txn.plan}
									Bill {formatBillNumber(txn.plan.billNumber)} ({txn.plan.customer?.name || 'Unknown'})
								{:else if txn.product}
									Product: {txn.product.name}
								{:else}
									-
								{/if}
							</td>
							<td class="px-5 py-3 text-xs font-semibold text-gray-500">{txn.note || '-'}</td>
							<td class="px-5 py-3 text-xs font-bold text-gray-500">{new Date(txn.createdAt).toLocaleString()}</td>
							<td class="px-5 py-3 text-right text-sm font-black {isIncoming(txn.type) ? 'text-emerald-600' : 'text-red-600'}">
								{isIncoming(txn.type) ? '+' : '-'}{formatCurrency(txn.amount)}
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-5 py-10 text-center text-sm font-bold text-gray-500">No transactions match current filters.</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="md:hidden p-3 space-y-2">
			{#each filteredTransactions as txn}
				<div class="rounded-lg border border-gray-200 bg-gray-50/60 p-3 space-y-2">
					<div class="flex items-center justify-between gap-2">
						<p class="text-[10px] font-black uppercase tracking-widest text-gray-600">{transactionTypeLabel(txn.type)}</p>
						<p class="text-xs font-black {isIncoming(txn.type) ? 'text-emerald-600' : 'text-red-600'}">
							{isIncoming(txn.type) ? '+' : '-'}{formatCurrency(txn.amount)}
						</p>
					</div>
					<p class="text-xs font-bold text-gray-700">{txn.investor?.name || 'Unassigned'}</p>
					<p class="text-[11px] font-bold text-gray-500 leading-tight">
						{#if txn.plan}
							Bill {formatBillNumber(txn.plan.billNumber)} ({txn.plan.customer?.name || 'Unknown'})
						{:else if txn.product}
							Product: {txn.product.name}
						{:else}
							-
						{/if}
					</p>
						<p class="text-[10px] font-semibold text-gray-500">{txn.note || '-'}</p>
					<p class="text-[10px] font-bold text-gray-400">{new Date(txn.createdAt).toLocaleString()}</p>
				</div>
			{:else}
				<div class="px-2 py-8 text-center text-sm font-bold text-gray-500">No transactions match current filters.</div>
			{/each}
		</div>
	</div>
</div>
