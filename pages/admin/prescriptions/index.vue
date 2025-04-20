<script lang="ts" setup>

import type { Prescription,Med } from '~~/types/Types';
import type { FormCategory } from '~~/types/FormCategory';
import type { Protocol } from '~~/types/Protocol';
import { labTestCategoryOptions } from '~~/types/enums/LabTestCategories';
import { routesOptions } from '~~/types/enums/RoutesOptions';


import type { FormSubmitEvent } from '#ui/types'
import { array, object, string,number, type InferType } from 'yup'

//1. ROUTE and ID Handling
const router = useRouter();
const api_route = useAppConfig().api.route;

const navigateTo = (path:string) => {
  router.push(path);
};

//2. FORM SCHEMAS
const schema = object({  
  medication_id: string().required('Required'),
  dose: string().required('Required'),
  route: string().required('Required').oneOf(routesOptions.map(option => option.value), 'Invalid route type'),
  frequency: string().required('Required'),
  duration: string().required('Required'),
  instructions: string(),
  renewals: number().required('Required'),
})

type Schema = InferType<typeof schema>

//3. REACTIVE STATE

const state = reactive({
  id: '',
  medication_id: '',
  medication_name: '',
  created_at: '',
  updated_at: '',
  dose: '',
  route: routesOptions[0].value,
  frequency: '',
  duration: '',
  instructions: '',
  renewals: 0
})

const q = ref('')
const page = ref(1);
const limit = ref(10);

//4. API COMPOSABLE
const { apiCall } = useApi();

//5. FETCH DATA
const { data: availableMeds} = await useFetch<Med[] | null>(`${api_route}/medications`);
const { data: prescriptions, error, status,execute: fetchData } = await useFetch<Prescription[] | null>(`${api_route}/prescriptions`);
const isLoading = computed(() => status.value === 'success');

const formMeds = computed(() => {  
  return availableMeds.value?.map((object: Med): FormCategory => {
    return {
      label: object.name,
      value: object.id,
      icon: '',
    }
  }) ?? [];   
})

//6. EVENT HANDLERS

async function handleCreate(event: FormSubmitEvent<Schema>) {
  console.log('Form data:', event.data)
  try {
    await schema.validate(event.data, { abortEarly: false })

    await apiCall<Prescription>(`${api_route}/prescriptions`, 'PUT', event.data, {
      customSuccessMessage: 'Prescription added successfully',
      customErrorMessage: 'Failed to add Prescription',
      onSuccess: () => {
        fetchData()
      },
    })

    return { errors: {} } // Clear errors on success

  } catch (err: any) {
    const errors: Record<string, string> = {}

    if (err.inner) {
      for (const e of err.inner) {
        errors[e.path] = e.message
        console.error(`Validation error in ${e.path}: ${e.message}`)
      }
    }

    // Return errors to UForm so UFormGroup can display them
    return { errors }
  }
}



async function handleDelete(id: string, options?: ApiOptions) {
  await apiCall<Prescription>(`${api_route}/prescriptions/${id}`, 
  'DELETE',
  undefined,
  { customSuccessMessage: 'Prescription deleted successfully',
    onSuccess: () => {
      fetchData()
    }
  })
}

//7. Table configs
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
  { key: 'actions', class: 'w-[4rem]' }
];

const sort = ref<{ column: string; direction: 'asc' | 'desc' }>({
  column: 'medication_name',
  direction: 'desc'
})

const filteredRows = computed(() => {
  if (q.value === '') {
    return prescriptions.value || []; // Ensure it returns an array
  }

  const searchTerms = q.value.toLowerCase().split(/\s+/); // Split the query into terms

  

  // Filter the users based on the search terms
  return prescriptions.value?.filter((px: Prescription) => {  
    
    // Check if all search terms are included in the user's name
    return searchTerms.every(term => px.medication_name?.toLowerCase().includes(term) 
      || px.dose?.toLowerCase().includes(term)
      || px.route?.toLowerCase().includes(term)
      || px.instructions?.toLowerCase().includes(term)            
    );
  });
});

const paginated_rows = computed(() => {
  if (!filteredRows.value) return []
  
  return filteredRows.value.slice((page.value - 1) * limit.value, (page.value) * limit.value)
})

const total = computed(() => filteredRows.value?.length || 0)

const items = (row: Prescription) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-eye-20-solid',
    click: () => navigateTo(`/admin/prescriptions/${row.id}`)
  }], [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: () => {handleDelete(row.id)}
  }]
]

function select(row: Prescription) {
  navigateTo(`/admin/prescriptions/${row.id}`)
}

</script>

<template>
  <UContainer>
    <div>
      <h1 class="text-2xl font-semibold py-2">Prescriptions</h1>
    </div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter prescriptions..." />
    </div>    

    <!-- Error Message -->
    <UAlert v-if="error" type="error">
      Failed to load lab tests: {{ error.message }}
    </UAlert>

    <!-- Table Rendering -->
    <UTable    
      :load="isLoading"
      :columns="columns"
      :sort="sort"      
      :rows="paginated_rows"
      :ui="{ td: { base: 'whitespace-normal break-words' }, default: { checkbox: { color: 'gray' as any } } }"
      @select.self="select"
      class="table-auto min-w-full">
      <template #medication_name-data="{ row }">
        <div class="text-pretty capitalize">
          {{ row.medication_name }}
        </div>
      </template>
      <template #dose-data="{ row }">
        <div class="text-pretty">
          {{ row.dose }}
        </div>
      </template>

      <template #route-data="{ row }">
        <div class="text-pretty">
          {{ row.route }}
        </div>
      </template>

      <template #frequency-data="{ row }">
        <div class="text-pretty">
          {{ row.frequency }}
        </div>
      </template>

      <template #duration-data="{ row }">
        <div class="text-pretty">
          {{ row.duration }}
        </div>
      </template>

      <template #renewals-data="{ row }">
        <div class="text-pretty">
          {{ row.renewals }}
        </div>
      </template>
      <template #instructions-data="{ row }">
        <div class="text-pretty">
          {{ row.instructions }}
        </div>
      </template>      

      <template #created_at-data="{ row }">
        <div class="text-pretty">
          {{ row.created_at }}
        </div>
      </template>
      
      <template #updated_at-data="{ row }">
        <div class="text-pretty">
          {{ row.updated_at }}
        </div>
      </template>
      
      <template #actions-data="{ row }">
      <div @click.stop>
        <UDropdown :items="items(row)">
          <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
        </UDropdown>
      </div>
      </template>
    </UTable> 

    <!-- Empty State -->
    
    <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination v-model="page" :page-count="limit" :total="total" />
    </div>    
  </UContainer>

  <UContainer class="my-10 w-2xl ">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleCreate">    

    <template v-if="formMeds.length > 0">
      <MySelectMenu
      v-model="state.medication_id"
      label="Medication"
      name="medication_id"
      :options="formMeds"
      searchable
      :searchable-placeholder="'Search for a medication...'"
      required      
      />
    </template>
    <template v-else>
      <p class="text-red-500">No medications available... Please add medication to select first.</p>
    </template>    

    <UFormGroup label="Dose" name="dose" class="mb-4">
      <UInput v-model="state.dose" />
    </UFormGroup>
    
    <MySelectMenu
      v-model="state.route"
      label="Medication Route"
      name="route"
      :options="routesOptions"
      required      
    />
   
    <UFormGroup label="Frequency" name="frequency" class="mb-4">
      <UInput v-model="state.frequency" />
    </UFormGroup>

    <UFormGroup label="Duration" name="duration" class="mb-4">
      <UInput v-model="state.duration" />
    </UFormGroup>

    <UFormGroup label="Instructions" name="instructions" class="mb-4">
      <UInput v-model="state.instructions" />
    </UFormGroup>

    <UFormGroup label="Renewals" name="renewals" class="mb-4">
      <UInput v-model="state.renewals" />
    </UFormGroup>

    <UButton type="submit" class="self-center mb-4">
      Create Prescription
    </UButton>
  </UForm>
  </UContainer>   
</template>

<style>
/* Add any additional styles for the table or container */
</style>