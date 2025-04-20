<script lang="ts" setup>
import { FetchError } from 'ofetch';

const router = useRouter();
const api_route = useAppConfig().api.route;

import type { Protocol } from '~~/types/Protocol';
import { tumorGroupOptions } from '~~/types/enums/TumorGroupOptions';
import { tumorTags } from '~~/types/enums/TumorTags';

import type { FormSubmitEvent } from '#ui/types'
import { array, object, string, type InferType } from 'yup'

const schema = object({
  name: string().required('Required'),
  code: string().min(4).max(16).matches(/^[a-zA-Z0-9]+$/, 'Only alphanumeric characters').required('Required'),  
  tumor_group: string().required('Required'),
  tags: array().of(string()),
  notes: string()
})

const navigateTo = (path:string) => {
  router.push(path);
};

type Schema = InferType<typeof schema>

const state = reactive({
  name: undefined,
  code: undefined,
  tumor_group: tumorGroupOptions[0],
  tags: [],
  notes: undefined
})

const toast = useToast()

// const { data: protocols, error, status } = await useFetch<Protocol[] | null>(`${apiBaseURL}/protocols`);
const { data: protocols, error, status,execute: fetchProtocols } = await useFetch<Protocol[] | null>(`${api_route}/protocols`);

async function createProtocol(protocol_req: object) {
  console.log(`${api_route}/protocols`);  
  try {
    const response = await $fetch(`${api_route}/protocols`, {
    method: 'POST',
    headers: {
      'client-platform': 'browser',
      'Content-Type': 'application/json',
    },
    body: protocol_req,    
      
    });
  fetchProtocols();
  toast.add({
    title: 'Success',
    description: 'Protocol created successfully',    
    timeout: 5000,
    icon:"i-heroicons-check-circle",
    color:"green"
  });
  return response;
  } catch (e ) {
    if (e instanceof FetchError) {    
      if (e.data.error === 'Record already exists') {
        toast.add({
          title: 'Error',
          description: 'Protocol already exists',          
          timeout: 5000,
          icon:"i-heroicons-exclamation-circle",
          color:"red"
        });
      
      } else {
        toast.add({
          title: 'Error',
          description: 'Failed to create protocol',          
          timeout: 5000,
          icon:"i-heroicons-exclamation-circle",
          color:"red"
        });
      }          
    }
  }

}

async function deleteProtocol(id: string) {
  try {
  const response = await $fetch(`${api_route}/protocols/${id}`, {
    method: 'DELETE',
    headers: {
      'client-platform': 'browser',
    },
    
  });
  fetchProtocols();
  toast.add({
          title: 'Protocol Deleted',                   
          timeout: 5000,
          icon:"i-heroicons-trash",
          color:"gray"
        });
  return response;
  } catch (error) {
    toast.add({
          title: 'Error',
          description: 'Error deleting protocol',          
          timeout: 5000,
          icon:"i-heroicons-exclamation-circle",
          color:"red"
        });
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data)  
  const response = await createProtocol(event.data);  
   
}

const columns = [
  { label: 'Code', key: 'code', sortable: true, class: 'w-[10rem]'},
  { label: 'Name', key: 'name', sortable: true, class: 'w-3/6 overflow-y-auto h-32' },
  { label: 'Tumor Group', key: 'tumor_group', sortable:true, class: 'w-[10rem] overflow-y-auto h-32' },
  { label: 'Tags', key: 'tags',class: 'w-[10rem] overflow-y-auto'},  
  { key: 'actions', class: 'w-[4rem]' }
];

const sort = ref<{ column: string; direction: 'asc' | 'desc' }>({
  column: 'name',
  direction: 'desc'
})


const q = ref('')
const page = ref(1);
const limit = ref(10);

// Helper function to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const filteredRows = computed(() => {
  if (q.value === '') {
    return protocols.value || []; // Ensure it returns an array
  }

  const searchTerms = q.value.toLowerCase().split(/\s+/); // Split the query into terms

  

  // Filter the users based on the search terms
  return protocols.value?.filter((protocol: Protocol) => {
    const protocolData = [
      protocol.name?.toLowerCase(),
      protocol.code?.toLowerCase(),
      protocol.tumor_group?.toLowerCase(),
      ...(protocol.tags?.map((tag: string) => tag.toLowerCase()) || []) // Convert tags array to lowercase
    ].join(' ')    
    
    // Check if all search terms are included in the user's name
    return searchTerms.every(term => protocolData.includes(term));
  });
});

const paginated_rows = computed(() => {
  if (!filteredRows.value) return []
  
  return filteredRows.value.slice((page.value - 1) * limit.value, (page.value) * limit.value)
})

const total = computed(() => filteredRows.value?.length || 0)

const items = (row: Protocol) => [
  [{
    label: 'View',
    icon: 'i-heroicons-eye-20-solid',
    click: () => navigateTo(`/protocols/view/${row.id}`)
  },
  {
    label: 'Edit',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => navigateTo(`/protocols/edit/${row.id}`)
  }, {
    label: 'Duplicate',
    icon: 'i-heroicons-document-duplicate-20-solid'
  }], [{
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: () => {deleteProtocol(row.id)}
  }]
]

function select(row: Protocol) {
  navigateTo(`/protocols/view/${row.id}`)
}

const isLoading = computed(() => status.value === 'success');
</script>

<template>
  <UContainer>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter protocols..." />
    </div>    

    <!-- Error Message -->
    <UAlert v-if="error" type="error">
      Failed to load protocols: {{ error.message }}
    </UAlert>

    <UContainer>
      <h1 class="text-2xl font-semibold">Debugging</h1>
      <pre>Page = {{ page }} / Limit = {{ limit }}</pre>
      <pre>Total = {{ total }}</pre>      

    </UContainer>

    <!-- Table Rendering -->
    <UTable v-if="protocols && protocols.length > 0"      
      :load="isLoading"
      :columns="columns"
      :sort="sort"      
      :rows="paginated_rows"
      :ui="{ td: { base: 'max-w-[0] truncate' }, default: { checkbox: { color: 'gray' as any } } }"
      @select.self="select"
      class="table-auto min-w-full overflow-y-auto">
      <template #name-data="{ row }">
        <div class="text-pretty">
          {{ row.name }}
        </div>
      </template>

      <template #tumor_group-data="{ row }">
        <div class="capitalize">
          {{ row.tumor_group }}
        </div>
      </template>
      
      <template #tags-data="{ row }">
        <div v-if="row.tags.length" class="flex flex-auto flex-wrap">
            <div class="flex justify-center items-center font-medium px-1
             rounded-full text-primary-100 bg-sky-700 border border-sky-100" 
             v-for="tag in row.tags" :key="tag">
             <div class="text-xs font-normal leading-none max-w-full flex-initial px-2 py-1">
              {{ tag }}
             </div>          
              
            </div>
          </div>
        <div v-else><span class="italic text-gray-500">No tags</span></div>
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
    <UAlert v-else type="info" label="No protocols found.">
      No data is currently available.
    </UAlert>
    <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination v-model="page" :page-count="limit" :total="total" />
    </div>    
  </UContainer>

  <UContainer>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Protocol Name" name="name">
      <UInput v-model="state.name" />
    </UFormGroup>

    <UFormGroup label="Protocol Code" name="code">
      <UInput v-model="state.code"/>
    </UFormGroup>

    <!-- <UFormGroup label="Tumor Group" name="tumor_group">
      <UInputMenu v-model="state.tumor_group" :options="tumorGroupOptions"/>
    </UFormGroup> -->
    <MySelectMenu
      v-model="state.tumor_group"
      label="Tumor Group"
      name="tumor_group"
      :options="tumorGroupOptions"
      required
      searchable
    />

    <UFormGroup label="Tags" name="tags">
      <USelectMenu  v-model="state.tags" :options="tumorTags" multiple searchable>
      <template #label>
        <div v-if="state.tags.length" class="flex flex-auto flex-wrap">
            <div class="flex justify-center items-center m-1 font-medium py-1 px-2
             rounded-full text-primary-100 bg-sky-700 border border-sky-100" 
             v-for="option in state.tags" :key="option">
             <div class="text-xs font-normal leading-none max-w-full flex-initial px-2 py-1">
              {{ option }}
             </div>          
              
            </div>
          </div>
        <div v-else>Select tags</div>
      </template>
      </USelectMenu>
    </UFormGroup>

    <UFormGroup label="Notes" name="notes">
      <UTextarea v-model="state.notes" placeholder="Notes..."/>
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