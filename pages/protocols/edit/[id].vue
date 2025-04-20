<script lang="ts" setup>
import { FetchError } from 'ofetch';
import type { Protocol } from '~~/types/Protocol';
import { tumorGroupOptions } from '~~/types/enums/TumorGroupOptions';
import { tumorTags } from '~~/types/enums/TumorTags';
import type { FormCategory } from '~~/types/FormCategory';

import type { FormSubmitEvent } from '#ui/types'
import { array, object, string, type InferType } from 'yup'

const api_route = useAppConfig().api.route;

const schema = object({
  name: string().required('Required'),
  code: string().min(4).max(16).matches(/^[a-zA-Z0-9]+$/, 'Only alphanumeric characters').required('Required'),  
  tumor_group: string().required('Required'),
  tags: array().of(string()),
  notes: string(),
  protocol_url: string(),
  patient_handout_url: string(),
  revised_on: string(),
  activated_on: string()
})

const toast = useToast()
const route = useRoute()

type Schema = InferType<typeof schema>

const state = reactive({
  name: '',
  code: '',
  tumor_group: tumorGroupOptions[0],
  tags: [] as string[],
  notes: '',
  protocol_url: '',
  patient_handout_url: '',
  revised_on: '',
  activated_on: ''
})

async function updateProtocol(protocol_req: object) {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;  
  try {
    const response = await $fetch(`${api_route}/protocols/${id}`, {
    method: 'PUT',
    headers: {
      'client-platform': 'browser',
      'Content-Type': 'application/json',
    },
    body: protocol_req,    
      
    });  
  toast.add({
    title: 'Success',
    description: 'Protocol updated successfully',    
    timeout: 5000,
    icon:"i-heroicons-check-circle",
    color:"green"
  });
  return response;
  } catch (e ) {
    if (e instanceof FetchError) {    
      if (e.data.error === 'Record already exists') {        
      
      } else {
        toast.add({
          title: 'Error',
          description: 'Failed to update protocol',          
          timeout: 5000,
          icon:"i-heroicons-exclamation-circle",
          color:"red"
        });
      }          
    }
  }
}

// Utility function for enum-like fields
function findInListById(list: FormCategory[], id: string | any, value: any) {
  if (typeof id !== 'string') return value; // Return default if id is not a string
  return list.find(item => item.value.toLowerCase() === id.toLowerCase()) ?? value;
}

async function fetchData(id : string) {
  try {
    // Fetch the data from the server
    const data = await $fetch<Protocol | null>(`${api_route}/protocols/${id}`); // Replace with your actual API endpoint

    if (data) {
      // Pre-fill the form state with the fetched data
      state.name = data.name || '';
      state.code = data.code || '';
      state.tumor_group = findInListById(tumorGroupOptions,"value",data.tumor_group) || tumorGroupOptions[0]; // Default if missing
      state.tags = data.tags || [] as string[];
      state.notes = data.notes || '';
      state.protocol_url = data.protocol_url || 'http://';
      state.patient_handout_url = data.patient_handout_url || 'http://';
      state.revised_on = data.revised_on || '';
      state.activated_on = data.activated_on || '';
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// Fetch the data when the component is mounted
onMounted(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id; // Ensure id is a string
  if (id) fetchData(id);
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data)  
  const response = await updateProtocol(event.data);
  console.log(response);   
}

</script>

<template>
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

    <UFormGroup label="Protocol URL" name="protocol_url">
      <UInput v-model="state.protocol_url"/>
    </UFormGroup>

    <UFormGroup label="Protocol Handout URL" name="patient_handout_url">
      <UInput v-model="state.patient_handout_url"/>
    </UFormGroup>

    <UFormGroup label="Revised On" name="revised_on">
      <UInput v-model="state.revised_on"/>
    </UFormGroup>

    <UFormGroup label="Activated On" name="activated_on">
      <UInput v-model="state.activated_on"/>
    </UFormGroup>


    <UButton type="submit">
      Update
    </UButton>
  </UForm>
  </UContainer>
</template>

<style>

</style>