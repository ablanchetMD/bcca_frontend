<script lang="ts" setup>
const links = [
  { name: 'Protocols', path: '/protocols' },
  { name: 'Cautions', path: '/admin/cautions' },
  { name: 'Eligibility Criteria', path: '/admin/eligibility_criteria' },
  { name: 'Precautions', path: '/admin/precautions' },
  { name: 'Labs', path: '/admin/labs' },
  { name: 'Meds', path: '/admin/meds' },
  { name: 'Prescriptions', path: '/admin/prescriptions' },
  // 
]
const navigateTo = (path:string) => {
  const router = useRouter();
  router.push(path);
};


</script>

<template>
  <div>
    <div class="flex flex-col gap-4 items-center">
      <h1 class="text-2xl font-bold">Admin Board</h1>
      <div class="flex flex-col gap-2">
        <UDivider/>
        <ul class="list-disc pl-5">
          <li v-for="link in links" :key="link.name" @click="navigateTo(link.path)" class="cursor-pointer text-blue-500 hover:underline">
            {{ link.name }}
          </li>
        </ul>
      </div>
    </div>    
  </div>
</template>

<style>

</style>