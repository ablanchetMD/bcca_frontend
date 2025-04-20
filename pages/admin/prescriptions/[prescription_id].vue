<script lang="ts" setup>

import type { Prescription } from '~~/types/Types';
import type { Med } from '~~/types/Types';
import type { FormCategory } from '~~/types/FormCategory';
import { routesOptions } from '~~/types/enums/RoutesOptions';

import type { FormSubmitEvent } from '#ui/types'
import { array, number, object, string, type InferType } from 'yup'

//1. ROUTE and ID HANDLING
const route = useRoute()
const api_route = useAppConfig().api.route;

const id = computed(() => {
  const rawId = route.params.prescription_id;
  return Array.isArray(rawId) ? rawId[0] : rawId;
});

//2. FORM SCHEMAS
const schema = object({
  id: string().required('Required'),
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

const State = reactive({
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

// 4. API COMPOSABLE
const { apiCall } = useApi();


// 5. FETCH DATA

const { data: availableMeds} = await useFetch<Med[] | null>(`${api_route}/medications`);

const formMeds = computed(() => {  
  return availableMeds.value?.map((object: Med): FormCategory => {
    return {
      label: object.name,
      value: object.id,
      icon: '',
    }
  }) ?? [];   
})

async function fetchData() {
  try {
    if (!id.value) return;
    
    const data = await apiCall<Prescription>(
      `${api_route}/prescriptions/${id.value}`, 
      'GET', 
      undefined, 
      { showSuccessToast: false }
    );

    if (data) {
      // Update data
      State.medication_id = data.medication_id || '';
      State.id = data.id || '';
      State.medication_name = data.medication_name || '';
      State.dose = data.dose || '';
      State.duration = data.duration || '';
      State.frequency = data.frequency || '';
      State.instructions = data.instructions || ''
      State.route = useFindFormID(routesOptions,"value", data.route) || routesOptions[0].value;
      State.renewals = data.renewals || 0;
      State.created_at = data.created_at || '';
      State.updated_at = data.updated_at || '';      
     
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// 6. EVENT HANDLERS

async function handleUpdate(event: FormSubmitEvent<Schema>) {
  await apiCall<Prescription>(
    `${api_route}/prescriptions`, 
    'PUT', 
    event.data, 
    { customSuccessMessage: 'Lab updated successfully' }
  );
}

// Lifecycle hooks
onMounted(() => {  
  fetchData();
});

const isLoading = computed(() => State.id != '');


</script>

<template>
  <div class="basis-auto gap-6">  
   <UContainer class="my-10 w-2xl ">
    <UForm :schema="schema" :state="State" class="space-y-4" @submit="handleUpdate">
    <UFormGroup label="Dose" name="dose" class="mb-4">
      <UInput v-model="State.dose" />
    </UFormGroup>

    <template v-if="formMeds.length > 0">
      <MySelectMenu
      v-model="State.medication_id"
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
      <UInput v-model="State.dose" />
    </UFormGroup>
    
    <MySelectMenu
      v-model="State.route"
      label="Medication Route"
      name="route"
      :options="routesOptions"
      required      
    />
   
    <UFormGroup label="Frequency" name="frequency" class="mb-4">
      <UInput v-model="State.frequency" />
    </UFormGroup>

    <UFormGroup label="Duration" name="duration" class="mb-4">
      <UInput v-model="State.duration" />
    </UFormGroup>

    <UFormGroup label="Instructions" name="instructions" class="mb-4">
      <UInput v-model="State.instructions" />
    </UFormGroup>

    <UFormGroup label="Renewals" name="renewals" class="mb-4">
      <UInput v-model="State.renewals" />
    </UFormGroup>

    <UButton type="submit" class="self-center mb-4">
      Update Prescription
    </UButton>
  </UForm>
  </UContainer>   
</div>
</template>

<style>

</style>