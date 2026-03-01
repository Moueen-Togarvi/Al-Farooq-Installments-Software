<script lang="ts">
  export let label: string;
  export let value: string;
  export let hint = '';
</script>

<section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" aria-label={label}>
  <p class="text-sm text-slate-600">{label}</p>
  <p class="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
  {#if hint}
    <p class="mt-2 text-xs text-slate-500">{hint}</p>
  {/if}
</section>
