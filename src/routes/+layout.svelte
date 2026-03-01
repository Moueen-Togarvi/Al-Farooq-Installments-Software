<script lang="ts">
  import '../app.css';

  const navItems = [
    { href: '/', name: 'Dashboard' },
    { href: '/customers', name: 'Customers' },
    { href: '/products', name: 'Products' },
    { href: '/installment-plans', name: 'Plans' },
    { href: '/installments', name: 'Tracking' },
    { href: '/reports', name: 'Reports' },
    { href: '/settings', name: 'Settings' }
  ];
</script>

<svelte:head>
  <title>Al Farooq Installments</title>
  <meta
    name="description"
    content="Simple, accessible installment management software for Al Farooq business."
  />
</svelte:head>

<div class="min-h-screen bg-slate-50 text-slate-900">
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <h1 class="text-lg font-bold tracking-tight">Al Farooq</h1>
      <p class="text-sm text-slate-600">Installment Management System</p>
    </div>
  </header>

  <div class="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
    <nav class="rounded-xl border border-slate-200 bg-white p-3" aria-label="Main navigation">
      <ul class="grid grid-cols-2 gap-2 text-sm lg:grid-cols-1">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              class="block rounded-md px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >{item.name}</a
            >
          </li>
        {/each}
      </ul>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</div>
