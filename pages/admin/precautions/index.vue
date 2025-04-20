<script lang="ts" setup>

import type { Precaution } from '~~/types/Protocol_Criterias';
import type { Protocol } from '~~/types/Protocol';

import type { FormSubmitEvent } from '#ui/types'
import { array, object, string, type InferType } from 'yup'

//1. ROUTE and ID Handling
const router = useRouter();
const api_route = useAppConfig().api.route;

const navigateTo = (path:string) => {
  router.push(path);
};


//2. FORM SCHEMAS
const schema = object({
  title: string().required('Required'),
  description: string().required('Required'),  
})

type Schema = InferType<typeof schema>


const state = reactive({
  title: undefined,
  description: undefined,  
})

const q = ref('')
const page = ref(1);
const limit = ref(10);

//4. API COMPOSABLE
const { apiCall } = useApi();

//5. FETCH DATA
const { data: eligibility, error, status,execute: fetchData } = await useFetch<Precaution[] | null>(`${api_route}/precautions`);
const isLoading = computed(() => status.value === 'success');

//6. EVENT HANDLERS

async function handleCreate(event: FormSubmitEvent<Schema>) {
  await apiCall<Precaution>(`${api_route}/precautions`, 
  'PUT', 
    event.data, 
    { customSuccessMessage: 'Precautions added successfully',
      customErrorMessage: 'Failed to add precaution',
    onSuccess: () => {
      fetchData()
    }
  })
}

async function handleDelete(id: string, options?: ApiOptions) {
  await apiCall<Precaution>(`${api_route}/precautions/${id}`, 
  'DELETE',
  undefined,
  { customSuccessMessage: 'Precaution deleted successfully',
    onSuccess: () => {
      fetchData()
    }
  })
}

//7. Table configs
const columns = [
  { label: 'Title', key: 'title', sortable: true, class: 'w-2/6 overflow-y-auto overflow-x-auto' },
  { label: 'Description', key: 'description', sortable: true, class: 'w-4/6 overflow-y-auto overflow-x-auto' },
  { label: 'Created At', key: 'created_at', sortable: true, class: 'w-1/6 overflow-y-auto' },
  { label: 'Updated At', key: 'updated_at', sortable:true, class: 'w-1/6 overflow-y-auto' },
  { key: 'actions', class: 'w-[4rem]' }
];

const sort = ref<{ column: string; direction: 'asc' | 'desc' }>({
  column: 'name',
  direction: 'desc'
})

const filteredRows = computed(() => {
  if (q.value === '') {
    return eligibility.value || []; // Ensure it returns an array
  }

  const searchTerms = q.value.toLowerCase().split(/\s+/); // Split the query into terms

  

  // Filter the users based on the search terms
  return eligibility.value?.filter((elig: Precaution) => {  
    
    // Check if all search terms are included in the user's name
    return searchTerms.every(term => elig.description?.toLowerCase().includes(term) 
      || elig.title?.toLowerCase().includes(term)       
    );
  });
});

const paginated_rows = computed(() => {
  if (!filteredRows.value) return []
  
  return filteredRows.value.slice((page.value - 1) * limit.value, (page.value) * limit.value)
})

const total = computed(() => filteredRows.value?.length || 0)

const items = (row: Precaution) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-eye-20-solid',
    click: () => navigateTo(`/admin/precautions/${row.id}`)
  }], [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: () => {handleDelete(row.id)}
  }]
]

function select(row: Precaution) {
  navigateTo(`/admin/precautions/${row.id}`)
}

</script>

<template>
  <UContainer>
    <div>
      <h1 class="text-2xl font-semibold py-2">Protocol Precautions</h1>
    </div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter criterias..." />
    </div>    

    <!-- Error Message -->
    <UAlert v-if="error" type="error">
      Failed to load precautions: {{ error.message }}
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
        <div class="text-pretty capitalize">
          {{ row.name }}
        </div>
      </template>
      <template #description-data="{ row }">
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
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleCreate">
    <UFormGroup label="Title" name="title">
      <UInput v-model="state.title" />
    </UFormGroup>  
    <UFormGroup label="Description" name="description">
      <UInput v-model="state.description" />
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