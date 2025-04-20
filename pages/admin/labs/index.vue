<script lang="ts" setup>

import type { Lab } from '~~/types/Labs';
import type { Protocol } from '~~/types/Protocol';
import { labTestCategoryOptions } from '~~/types/enums/LabTestCategories';
import { eligibilityTypeOptions } from '~~/types/enums/EligibilityTypes';

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
  name: string().required('Required'),
  description: string(),
  form_url: string(),
  unit: string(),
  lower_limit: number(),
  upper_limit: number(),
  test_category: string(),
})


type Schema = InferType<typeof schema>

const state = reactive({  
  name: '',
  created_at: '',
  updated_at: '',
  description: '',
  form_url: '',
  unit: '',
  lower_limit: 0,
  upper_limit: 0,
  test_category: labTestCategoryOptions[0].value,
})

const q = ref('')
const page = ref(1);
const limit = ref(10);

//4. API COMPOSABLE
const { apiCall } = useApi();

//5. FETCH DATA
const { data: lab, error, status,execute: fetchData } = await useFetch<Lab[] | null>(`${api_route}/labs`);
const isLoading = computed(() => status.value === 'success');

//6. EVENT HANDLERS

async function handleCreate(event: FormSubmitEvent<Schema>) {
  await apiCall<Lab>(`${api_route}/labs`, 
  'PUT', 
    event.data, 
    { customSuccessMessage: 'Lab added successfully',
      customErrorMessage: 'Failed to add Lab',
    onSuccess: () => {
      fetchData()
    }
  })
}

async function handleDelete(id: string, options?: ApiOptions) {
  await apiCall<Lab>(`${api_route}/labs/${id}`, 
  'DELETE',
  undefined,
  { customSuccessMessage: 'Lab deleted successfully',
    onSuccess: () => {
      fetchData()
    }
  })
}

//7. Table configs
const columns = [
  { label: 'Name', key: 'name', sortable: true, class: 'w-2/6 overflow-y-auto overflow-x-auto' },
  { label: 'Test Category', key: 'test_category', sortable: true, class: 'w-1/6 overflow-y-auto' },
  { label: 'Description', key: 'description', sortable: false, class: 'w-4/6 overflow-y-auto overflow-x-auto' },
  { label: 'Form URL', key: 'form_url', sortable: false, class: 'w-1/6 overflow-y-auto' },
  { label: 'Unit', key: 'unit', sortable: false, class: 'w-1/6 overflow-y-auto' },
  { label: 'Lower Limit', key: 'lower_limit', sortable: false, class: 'w-1/6 overflow-y-auto' },
  { label: 'Upper Limit', key: 'upper_limit', sortable: false, class: 'w-1/6 overflow-y-auto' },  
  { label: 'Created At', key: 'created_at', sortable: false, class: 'w-1/6 overflow-y-auto' },
  { label: 'Updated At', key: 'updated_at', sortable:false, class: 'w-1/6 overflow-y-auto' },
  { key: 'actions', class: 'w-[4rem]' }
];

const sort = ref<{ column: string; direction: 'asc' | 'desc' }>({
  column: 'name',
  direction: 'desc'
})

const filteredRows = computed(() => {
  if (q.value === '') {
    return lab.value || []; // Ensure it returns an array
  }

  const searchTerms = q.value.toLowerCase().split(/\s+/); // Split the query into terms

  

  // Filter the users based on the search terms
  return lab.value?.filter((lab: Lab) => {  
    
    // Check if all search terms are included in the user's name
    return searchTerms.every(term => lab.description?.toLowerCase().includes(term) 
      || lab.name?.toLowerCase().includes(term)
      || lab.test_category?.toLowerCase().includes(term)            
    );
  });
});

const paginated_rows = computed(() => {
  if (!filteredRows.value) return []
  
  return filteredRows.value.slice((page.value - 1) * limit.value, (page.value) * limit.value)
})

const total = computed(() => filteredRows.value?.length || 0)

const items = (row: Lab) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-eye-20-solid',
    click: () => navigateTo(`/admin/labs/${row.id}`)
  }], [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: () => {handleDelete(row.id)}
  }]
]

function select(row: Lab) {
  navigateTo(`/admin/labs/${row.id}`)
}

</script>

<template>
  <UContainer>
    <div>
      <h1 class="text-2xl font-semibold py-2">Laboratory Tests</h1>
    </div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter criterias..." />
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

      <template #test_category-data="{ row }">
        <div class="text-pretty">
          {{ row.test_category }}
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
    <UFormGroup label="Name" name="name">
      <UInput v-model="state.name" />
    </UFormGroup>

    <MySelectMenu
      v-model="state.test_category"
      label="Lab Test Category"
      name="test_category"
      :options="labTestCategoryOptions"
      required      
    />
    
    
    <UFormGroup label="Description" name="description">
      <UInput v-model="state.description" />
    </UFormGroup>
    <UFormGroup label="Form URL" name="form_url">
      <UInput v-model="state.form_url" />      
    </UFormGroup>
    
    <UFormGroup label="Unit" name="unit">
      <UInput v-model="state.unit" />
    </UFormGroup>
    <UFormGroup label="Lower Limit" name="lower_limit">
      <UInput v-model="state.lower_limit" />
    </UFormGroup>
    <UFormGroup label="Upper Limit" name="upper_limit">
      <UInput v-model="state.upper_limit" />
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