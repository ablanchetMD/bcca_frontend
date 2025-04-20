<script lang="ts" setup>

import type { Lab } from '~~/types/Labs';
import type { Protocol } from '~~/types/Protocol';
import type { FormCategory } from '~~/types/FormCategory';
import { labTestCategoryOptions } from '~~/types/enums/LabTestCategories';

import type { FormSubmitEvent } from '#ui/types'
import { array, number, object, string, type InferType } from 'yup'

//1. ROUTE and ID HANDLING
const route = useRoute()
const api_route = useAppConfig().api.route;

const id = computed(() => {
  const rawId = route.params.lab_id;
  return Array.isArray(rawId) ? rawId[0] : rawId;
});

//2. FORM SCHEMAS
const schema = object({
  id: string().required('Required'),
  name: string().required('Required'),
  description: string(),
  form_url: string(),
  unit: string(),
  lower_limit: number(),
  upper_limit: number(),
  test_category: string().required('Required').oneOf(labTestCategoryOptions.map(option => option.value), 'Invalid lab test category'),
})

const protocol_schema = object({
  protocol_id: array().of(string())
})

type Schema = InferType<typeof schema>

//3. REACTIVE STATE

const State = reactive({
  id: '',
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

const protocolsState  = reactive({
  protocols: [] as Protocol[]
})

const protocolSelectionState  = reactive({
  protocol_ids: [] as string[],  
})

// 4. API COMPOSABLE
const { apiCall } = useApi();

// 5. FETCH DATA

const { data: availableProtocols} = await useFetch<Protocol[] | null>(`${api_route}/protocols`);

const formProtocols = computed(() => {  
  return availableProtocols.value?.map((protocol: Protocol): FormCategory => {
    return {
      label: protocol.code,
      value: protocol.id,
      icon: '',
    }
  }) ?? [];   
})

async function fetchData() {
  try {
    if (!id.value) return;
    
    const data = await apiCall<Lab>(
      `${api_route}/labs/${id.value}`, 
      'GET', 
      undefined, 
      { showSuccessToast: false }
    );

    if (data) {
      // Update data
      State.description = data.description || '';
      State.id = data.id || '';
      State.name = data.name || '';
      State.form_url = data.form_url || '';
      State.unit = data.unit || '';
      State.lower_limit = data.lower_limit || 0;
      State.upper_limit = data.upper_limit || 0;
      State.test_category = useFindFormID(labTestCategoryOptions,"value",data.test_category) || labTestCategoryOptions[0].value;
      State.created_at = data.created_at || '';
      State.updated_at = data.updated_at || '';      
     
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// 6. EVENT HANDLERS

async function handleUpdate(event: FormSubmitEvent<Schema>) {
  await apiCall<Lab>(
    `${api_route}/labs`, 
    'PUT', 
    event.data, 
    { customSuccessMessage: 'Lab updated successfully' }
  );
}

async function handleAddProtocols(event: FormSubmitEvent<any>) {
  await apiCall<Lab>(
    `${api_route}/labs/${id.value}`, 
    'PUT', 
    event.data, 
    { 
      customSuccessMessage: 'Protocols added successfully',
      onSuccess: () => fetchData()
    }
  );
}

async function handleRemoveProtocol(protocol_id: string, precaution_id: string, options?: ApiOptions) {
   return apiCall<Lab>(`${api_route}/protocols/${protocol_id}/precautions/${precaution_id}`, 'DELETE',undefined, {
      showDeleteToast: true,
      showSuccessToast: false,
      customDeleteMessage: 'Protocol removed successfully',
      onSuccess: () => {
        fetchData();
      },
      ...options
    });
  }

// Lifecycle hooks
onMounted(() => {  
  fetchData();
});

const isLoading = computed(() => State.id != '');

// 7. TABLE CONFIGURATION

const columns = [
  { label: 'Code', key: 'code', sortable: true, class: 'w-5/6 overflow-y-auto overflow-x-auto' },
  { key: 'actions', class: 'w-1/6' }
];

const sort = ref<{ column: string; direction: 'asc' | 'desc' }>({
  column: 'description',
  direction: 'desc'
})

const items = (row: Protocol) => [
  [{
    label: 'View',
    icon: 'i-heroicons-eye-20-solid',
    click: () => navigateTo(`/protocols/view/${row.id}`)
  }], [{
    label: 'Remove',
    icon: 'i-heroicons-trash-20-solid',
    click: () => {handleRemoveProtocol(row.id, State.id)}
  }]
]

function select(row: Lab) {
  navigateTo(`/protocols/view/${row.id}`)
}


</script>

<template>
  <div class="basis-auto gap-6">  
   <UContainer class="my-10 w-2xl ">
    <UForm :schema="schema" :state="State" class="space-y-4" @submit="handleUpdate">
    <UFormGroup label="Name" name="name" class="mb-4">
      <UInput v-model="State.name" />
    </UFormGroup>

    <MySelectMenu
      v-model="State.test_category"
      label="Lab Test Category"
      name="test_category"
      :options="labTestCategoryOptions"
      required      
    />

    <UFormGroup label="Description" name="description" class="mb-4">
      <UInput v-model="State.description" />
    </UFormGroup>
    <UFormGroup label="Form URL" name="form_url" class="mb-4">
      <UInput v-model="State.form_url" />
    </UFormGroup>
    <UFormGroup label="Unit" name="unit" class="mb-4">
      <UInput v-model="State.unit" />
    </UFormGroup>
    <UFormGroup label="Lower Limit" name="lower_limit" class="mb-4">
      <UInput v-model="State.lower_limit" />
    </UFormGroup>
    <UFormGroup label="Upper Limit" name="upper_limit" class="mb-4">
      <UInput v-model="State.upper_limit" />
    </UFormGroup>
    <UButton type="submit" class="self-center mb-4">
      Update Lab Test
    </UButton>
  </UForm>
  </UContainer>   
</div>
</template>

<style>

</style>