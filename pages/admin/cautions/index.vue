<script lang="ts" setup>

import type { Caution } from '~~/types/Protocol_Criterias';
import { eligibilityTypeOptions } from '~~/types/enums/EligibilityTypes';

import type { FormSubmitEvent } from '#ui/types'
import { array, object, string, type InferType } from 'yup'

//1. ROUTE and ID Handling
const router = useRouter();
const api_route = useAppConfig().api.route;

const navigateTo = (path:string) => {
  router.push(path);
};


//2. FORM SCHEMAS
const caution_schema = object({
  description: string().required('Required'),  
})

type Schema = InferType<typeof caution_schema>

//3. REACTIVE STATE

const caution_state = reactive({
  description: undefined, 
})

const q = ref('')
const page = ref(1);
const limit = ref(10);

//4. API COMPOSABLE
const { apiCall } = useApi();

//5. FETCH DATA
const { data: cautions, error, status,execute: fetchCautions } = await useFetch<Caution[] | null>(`${api_route}/cautions`);
const isLoading = computed(() => status.value === 'success');

//6. EVENT HANDLERS

async function handleCreateCaution(event: FormSubmitEvent<Schema>) {
  await apiCall<Caution>(`${api_route}/cautions`, 
  'PUT', 
    event.data, 
    { customSuccessMessage: 'Caution added successfully',
    onSuccess: () => {
      fetchCautions()
    }
  })
}

async function handleDeleteCaution(id: string, options?: ApiOptions) {
  await apiCall<Caution>(`${api_route}/cautions/${id}`, 
  'DELETE',
  undefined,
  { customSuccessMessage: 'Caution deleted successfully',
    onSuccess: () => {
      fetchCautions()
    }
  })
}

//7. Table configs
const columns = [
  { label: 'Description', key: 'description', sortable: true, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { label: 'Created At', key: 'created_at', sortable: true, class: 'w-1/6 overflow-y-auto' },
  { label: 'Updated At', key: 'updated_at', sortable:true, class: 'w-1/6 overflow-y-auto' },
  { key: 'actions', class: 'w-[4rem]' }
];

const sort = ref<{ column: string; direction: 'asc' | 'desc' }>({
  column: 'description',
  direction: 'desc'
})

const filteredRows = computed(() => {
  if (q.value === '') {
    return cautions.value || []; // Ensure it returns an array
  }

  const searchTerms = q.value.toLowerCase().split(/\s+/); // Split the query into terms

  

  // Filter the users based on the search terms
  return cautions.value?.filter((caution: Caution) => {  
    
    // Check if all search terms are included in the user's name
    return searchTerms.every(term => caution.description?.toLowerCase().includes(term));
  });
});

const paginated_rows = computed(() => {
  if (!filteredRows.value) return []
  
  return filteredRows.value.slice((page.value - 1) * limit.value, (page.value) * limit.value)
})

const total = computed(() => filteredRows.value?.length || 0)

const items = (row: Caution) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-eye-20-solid',
    click: () => navigateTo(`/admin/cautions/${row.id}`)
  }], [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: () => {handleDeleteCaution(row.id)}
  }]
]

function select(row: Caution) {
  navigateTo(`/admin/cautions/${row.id}`)
}

</script>

<template>
  <UContainer>
    <div>
      <h1 class="text-2xl font-semibold py-2">Protocol Cautions</h1>
    </div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter cautions..." />
    </div>    

    <!-- Error Message -->
    <UAlert v-if="error" type="error">
      Failed to load cautions: {{ error.message }}
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
      <template #name-data="{ row }">
        <div class="text-pretty">
          {{ row.description }}
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

  <UContainer>
    <UForm :schema="caution_schema" :state="caution_state" class="space-y-4" @submit="handleCreateCaution">
    <UFormGroup label="Caution Description" name="description">
      <UInput v-model="caution_state.description" />
    </UFormGroup>      

    <UButton type="submit">
      Submit
    </UButton>
  </UForm>
  </UContainer>
</template>

<style>
/* Add any additional styles for the table or container */
</style>