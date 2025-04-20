<script lang="ts" setup>

</script>

<template>
  <div>   
    
      <UCard class="">
          <div class="flex justify-between">
            <h1>Welcome to Nuxt UI Starter</h1>
            <ColorScheme><USelect v-model="$colorMode.preference" :options="['system', 'light', 'dark']" /></ColorScheme>
          </div>
      </UCard>
      <UCard class="">
        <MyNavBreadcrumb />        
      </UCard>
      
    <slot/>
  </div>
</template>

<style>

</style>