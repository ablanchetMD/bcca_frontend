<script lang="ts" setup>

import type { Med } from '~~/types/Types';
import type { Prescription } from '~~/types/Types';
import { MedicationCategoryOptions } from '~~/types/enums/LabTestCategories';

import type { FormSubmitEvent } from '#ui/types'
import { array, number, object, string, type InferType } from 'yup'

//1. ROUTE and ID HANDLING
const route = useRoute()
const api_route = useAppConfig().api.route;

const id = computed(() => {
  const rawId = route.params.med_id;
  return Array.isArray(rawId) ? rawId[0] : rawId;
});

//2. FORM SCHEMAS
const schema = object({
  id: string().required('Required'),
  name: string().required('Required'),
  description: string(),
  category: string().required('Required').oneOf(MedicationCategoryOptions.map(option => option.value), 'Invalid medication type'),
})

type Schema = InferType<typeof schema>

//3. REACTIVE STATE

const State = reactive({
  id: '',
  name: '',
  created_at: '',
  updated_at: '',
  description: '',
  category: MedicationCategoryOptions[0].value,
})

const prescriptionState  = reactive({
  px: [] as Prescription[]
})


// 4. API COMPOSABLE
const { apiCall } = useApi();

// 5. FETCH DATA
const { data: rawPrescriptions, execute: fetchPx } = await useFetch<Prescription[] | []>(`${api_route}/prescriptions?medication_id=${id.value}`);
const prescriptions = computed(() => rawPrescriptions.value || []);

async function fetchData() {
  try {
    if (!id.value) return;
    
    const data = await apiCall<Med>(
      `${api_route}/medications/${id.value}`, 
      'GET', 
      undefined, 
      { showSuccessToast: false }
    );

    if (data) {
      // Update data
      State.description = data.description || '';
      State.id = data.id || '';
      State.name = data.name || '';
      State.category = useFindFormID(MedicationCategoryOptions,"value",data.category) || MedicationCategoryOptions[0].value;
      
      State.created_at = data.created_at || '';
      State.updated_at = data.updated_at || '';      
     
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// 6. EVENT HANDLERS

async function handleUpdate(event: FormSubmitEvent<Schema>) {
  await apiCall<Med>(
    `${api_route}/medications`, 
    'PUT', 
    event.data, 
    { customSuccessMessage: 'Medication updated successfully' }
  );
}

async function handleRemovePrescription(px_id: string, options?: ApiOptions) {
   return apiCall<Prescription>(`${api_route}/prescriptions/${px_id}`, 'DELETE',undefined, {
      showDeleteToast: true,
      showSuccessToast: false,
      customDeleteMessage: 'Prescription removed successfully',
      onSuccess: () => {
        fetchPx();
      },
      ...options
    });
  }

// 7. TABLE CONFIGURATION

const columns = [
  { label: 'Medication', key: 'medication_name', sortable: false, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { label: 'Dose', key: 'dose', sortable: true, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { label: 'Route', key: 'route', sortable: false, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { label: 'Frequency', key: 'frequency', sortable: false, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { label: 'Duration', key: 'duration', sortable: false, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { label: 'Renewals', key: 'renewals', sortable: false, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { label: 'Instructions', key: 'instructions', sortable: false, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
 
  { label: 'Created At', key: 'created_at', sortable: true, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { label: 'Updated At', key: 'updated_at', sortable: true, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { key: 'actions', class: 'w-1/6' }
];

const sort = ref<{ column: string; direction: 'asc' | 'desc' }>({
  column: 'updated_at',
  direction: 'desc'
})

const items = (row: Prescription) => [
  [{
    label: 'View',
    icon: 'i-heroicons-eye-20-solid',
    click: () => navigateTo(`/admin/prescriptions/${row.id}`)
  }], [{
    label: 'Remove',
    icon: 'i-heroicons-trash-20-solid',
    click: () => {handleRemovePrescription(row.id)}
  }]
]

function select(row: Prescription) {
  navigateTo(`/admin/prescriptions/${row.id}`)
}


// Lifecycle hooks
onMounted(() => {  
  fetchData();
});

const isLoading = computed(() => State.id != '');

</script>

<template>
  <div class="basis-auto gap-6">

    

    <UContainer class="flex flex-col gap-6 basis-auto min-w-max">
    <div>
      <h1 class="text-2xl font-semibold py-2">Prescriptions associated with {{ State.name }}</h1>
    </div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter criterias..." />
    </div> 
    <UTable    
      :load="isLoading"
      :columns="columns"
      :sort="sort"      
      :rows="prescriptions"
      :ui="{ td: { base: 'flex whitespace-normal break-words' },
                   default: { checkbox: { color: 'gray' as any } },
                   tr: { base: 'flex justify-between' },
                   th: { base: 'flex' },
                    }"
      @select.self="select"
      class="table-auto min-w-full">
      <template #medication-data="{ row }">
        <div class="text-pretty justify-start">
          {{ row.medication_name }}
        </div>
      </template>      
      
      <template #actions-data="{ row }">
      <div @click.stop class="">
        <UDropdown :items="items(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </div>
      </template>
    </UTable> 
  </UContainer>
  <UContainer class="flex flex-col gap-6 basis-auto min-w-max">
    <div>
      <h1 class="text-2xl font-semibold py-2"> Modifications </h1>
    </div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q_mod" placeholder="Filter criterias..." />
    </div> 
    <UTable    
      :load="isLoading"
      :columns="columns"
      :sort="sort"      
      :rows="prescriptions"
      :ui="{ td: { base: 'flex whitespace-normal break-words' },
                   default: { checkbox: { color: 'gray' as any } },
                   tr: { base: 'flex justify-between' },
                   th: { base: 'flex' },
                    }"
      @select.self="select"
      class="table-auto min-w-full">
      <template #medication-data="{ row }">
        <div class="text-pretty justify-start">
          {{ row.medication_name }}
        </div>
      </template>      
      
      <template #actions-data="{ row }">
      <div @click.stop class="">
        <UDropdown :items="items(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </div>
      </template>
    </UTable> 
  </UContainer> 
   <UContainer class="my-10 w-2xl ">
    <div>
      <h1 class="text-2xl font-semibold py-2"> Update </h1>
    </div>
    <UForm :schema="schema" :state="State" class="space-y-4" @submit="handleUpdate">

    <UFormGroup label="Name" name="name" class="mb-4">
      <UInput v-model="State.name" />
    </UFormGroup>    
    <UFormGroup label="Description" name="description" class="mb-4">
      <UInput v-model="State.description" />
    </UFormGroup>
    <MySelectMenu
      v-model="State.category"
      label="Medication Category"
      name="category"
      :options="MedicationCategoryOptions"
      required      
    />  
   
    <UButton type="submit" class="self-center mb-4">
      Update Medication
    </UButton>
  </UForm>
  </UContainer>
  
  
</div>
</template>

<style>

</style>