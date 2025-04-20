<script lang="ts" setup>
import type { EligibilityCriteria } from '~~/types/Protocol_Criterias';
import { eligibilityTypeOptions } from '~~/types/enums/EligibilityTypes';
import type { Protocol } from '~~/types/Protocol';
import type { FormCategory } from '~~/types/FormCategory';

import type { FormSubmitEvent } from '#ui/types'
import { array, object, string, type InferType } from 'yup'
//1. ROUTE and ID HANDLING
const route = useRoute()
const api_route = useAppConfig().api.route;

const id = computed(() => {
  const rawId = route.params.eligibility_criteria_id;
  return Array.isArray(rawId) ? rawId[0] : rawId;
});

//2. FORM SCHEMAS
const schema = object({
  id: string().required('Required'),
  type: string().required('Required').oneOf(eligibilityTypeOptions.map(option => option.value), 'Invalid eligibility type'),
  description: string().required('Required')  
})

const protocol_schema = object({
  protocol_id: array().of(string())
})

type Schema = InferType<typeof schema>

//3. REACTIVE STATE

const eligibilityState = reactive({
  id: '',
  created_at: '',
  updated_at: '',
  type: eligibilityTypeOptions[0].value,
  description: ''
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
    
    const data = await apiCall<EligibilityCriteria>(
      `${api_route}/eligibility_criteria/${id.value}`, 
      'GET', 
      undefined, 
      { showSuccessToast: false }
    );

    if (data) {
      // Update caution data
      eligibilityState.description = data.description || '';
      eligibilityState.id = data.id || '';
      eligibilityState.created_at = data.created_at || '';
      eligibilityState.updated_at = data.updated_at || '';      
      eligibilityState.type = useFindFormID(eligibilityTypeOptions,"value",data.type) || eligibilityTypeOptions[0].value;
      protocolsState.protocols = data.linked_protocols || [];      
      protocolSelectionState.protocol_ids = data.linked_protocols?.map((protocol: Protocol) => protocol.id) || [];
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// 6. EVENT HANDLERS

async function handleUpdate(event: FormSubmitEvent<Schema>) {
  await apiCall<EligibilityCriteria>(
    `${api_route}/eligibility_criteria`, 
    'PUT', 
    event.data, 
    { customSuccessMessage: 'Eligibility Criteria updated successfully' }
  );
}

async function handleAddProtocols(event: FormSubmitEvent<any>) {
  await apiCall<EligibilityCriteria>(
    `${api_route}/eligibility_criteria/${id.value}`, 
    'PUT', 
    event.data, 
    { 
      customSuccessMessage: 'Protocols added successfully',
      onSuccess: () => fetchData()
    }
  );
}

async function handleRemoveProtocol(protocol_id: string, id: string, options?: ApiOptions) {
   return apiCall<EligibilityCriteria>(`${api_route}/protocols/${protocol_id}/eligibility_criteria/${id}`, 'DELETE',undefined, {
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

const isLoading = computed(() => eligibilityState.id != '');

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
    click: () => {handleRemoveProtocol(row.id, eligibilityState.id)}
  }]
]

function select(row: EligibilityCriteria) {
  navigateTo(`/protocols/view/${row.id}`)
}



</script>

<template>
  <div class="basis-auto gap-6">
  <UContainer class="flex flex-col gap-6 basis-auto min-w-max">
    <UTable    
      :load="isLoading"
      :columns="columns"
      :sort="sort"      
      :rows="protocolsState.protocols"
      :ui="{ td: { base: 'flex whitespace-normal break-words' },
                   default: { checkbox: { color: 'gray' as any } },
                   tr: { base: 'flex justify-between' },
                   th: { base: 'flex' },
                    }"
      @select.self="select"
      class="table-auto min-w-full">
      <template #code-data="{ row }">
        <div class="text-pretty justify-start">
          {{ row.code }}
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
   <UContainer class="my-10 w-2xl">
    <UForm :schema="schema" :state="eligibilityState" class="space-y-4" @submit="handleUpdate">
    <UFormGroup label="Elibility Criteria Description" name="description" class="mb-4">
      <UInput v-model="eligibilityState.description" />
    </UFormGroup>
    <MySelectMenu
      v-model="eligibilityState.type"
      label="Eligibility Criteria Type"
      name="type"
      class="mb-4 mt-4"      
      :options="eligibilityTypeOptions"
      required
      searchable
    />
    <UButton type="submit" class="mb-4">
      Update Eligibility Criteria
    </UButton>
  </UForm>
  </UContainer>

   <UContainer class="mt-10 w-2xl">
    <UForm :schema="protocol_schema" :state="protocolSelectionState" class="space-y-4 mt-10" @submit="handleAddProtocols">
    <MySelectMenu
      v-model="protocolSelectionState.protocol_ids"
      label="Linked Protocols"
      name="linked_protocols"
      class="mb-4 mt-4"
      :multiple="true"
      :options="formProtocols"
      required
      searchable
    />
    <UButton type="submit">
      Add/Remove Protocols
    </UButton>
  </UForm>
</UContainer>
</div>
</template>

<style>

</style>