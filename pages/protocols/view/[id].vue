<script lang="ts" setup>
import type { ProtocolPayload,ToxicityModification } from '~~/types/EntireProtocol';
import Id from '../edit/[id].vue';
const toast = useToast()
const route = useRoute()
const api_route = useAppConfig().api.route;

const columns = [
  { label: 'Treatment', key: 'Medication'},
  { label: 'Dose', key: 'Dose'},
  { label: 'Route', key: 'Route'},
  { label: 'Frequency', key: 'Frequency'},
  { label: 'Duration', key: 'Duration'},  
  { label: 'Administration Guide', key: 'AdministrationGuide'},
];

const tox_columns = [  
  { label: 'Grade', key: 'Grade', class: 'w-1/6'},
  { label: 'Description', key: 'GradeDescription', class: 'w-1/3'},
  { label: 'Adjustment', key: 'Adjustment'},
];


const sections =
  [{
    id: 'summary',
    label: 'Summary',    
    to: '#summary'
  }, {
    id: 'eligibility',
    label: 'Eligibility Criteria',    
    to: '#eligibility'
  }, {
    Id: 'cautions',
    label: 'Cautions',    
    to: '#cautions'
  }, {
    Id: 'tests',
    label: 'Tests',    
    to: '#tests'
  }, {
    Id: 'cycles',
    label: 'Treatment',    
    to: '#cycles'
  }, {
    Id: 'toxicities',
    label: 'Toxicity Modifications',    
    to: '#toxicities'
  }, {
    Id: 'precautions',
    label: 'Precautions',    
    to: '#precautions'
  }, {
    Id: 'references',
    label: 'References',    
    to: '#references'
  }];


const state = reactive<ProtocolPayload>({
  SummaryProtocol: {
    Id: '',
    TumorGroup: '',
    Code: '',
    Name: '',
    Tags: [],
    Notes: '',
    ActivatedOn: '',
    RevisedOn: '',
  },
  ProtocolEligibilityCriteria: [],
  ProtocolPrecautions: [],
  ProtocolCautions: [],
  Tests: {
    Baseline: {
      RequiredBeforeTreatment: [],
      RequiredButCanProceed: [],
      IfClinicallyIndicated: [],
    },
    FollowUp: {
      Required: [],
      IfClinicallyIndicated: [],
    },
  },
  ProtocolCycles: [],
  Toxicities: [],
  Physicians: [],
  ArticleReferences: [],
});

async function fetchData(id : string) {
  try {
    // Fetch the data from the server
    const data = await $fetch<ProtocolPayload | null>(`${api_route}/protocols/${id}/summary`); // Replace with your actual API endpoint

    if (data) {
      Object.assign(state, data);
    }
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// Generic function to check if any object in the array has a specific key-value pair (case-insensitive)
const hasType = <T>(array: T[], key: keyof T, value: string): boolean => {
  return array.some(item => String(item[key]).toLowerCase() === value.toLowerCase());
};

// Generic function to filter objects in the array by a specific key-value pair (case-insensitive)
const filteredList = <T>(array: T[], key: keyof T, value: string): T[] => {
  return array.filter(item => String(item[key]).toLowerCase() === value.toLowerCase());
};

// Fetch the data when the component is mounted
onMounted(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id; // Ensure id is a string
  if (id) fetchData(id);
});



</script>

<template>
  <div class= "flex">  
    
    <UCard>
      <template #header>
        <h1 class="text-2xl font-semibold" id="summary">{{ state.SummaryProtocol.Code }} : {{ state.SummaryProtocol.Name }}</h1>      
      </template>
      <div class="flex justify-between">
        <div class="">
          <ul>
            <li><h2 class="text-xl font-semibold capitalize"> Tumor Group : <span class="font-normal">{{ state.SummaryProtocol.TumorGroup }}</span></h2></li>
            <li><h2 class="text-xl font-semibold capitalize"> Description </h2>
            <p> &#x2022; <span class="font-normal">{{ state.SummaryProtocol.Notes }}</span></p>            
            </li>
            <li><h2 class="text-xl font-semibold capitalize"> Tags : <span class="font-normal">{{ state.SummaryProtocol.Tags.join(', ') }}</span></h2></li>
          </ul>
        </div>
        <div class="">
          <ul>
            <li><h2 class="text-xl font-semibold capitalize"> Contact Physicians</h2></li>
            <ul>
              <li v-for="physician in state.Physicians" :key="physician.Id">          
                <p> &#x2022; <span class="">Dr </span> {{ physician.FirstName }} {{ physician.LastName }}</p>
              </li>
            </ul>
            <li><h2 class="text-xl font-semibold capitalize"> Activated On : <span class="font-normal">{{ state.SummaryProtocol?.ActivatedOn }}</span></h2></li>
            <li><h2 class="text-xl font-semibold capitalize"> Revised On : <span class="font-normal">{{ state.SummaryProtocol?.RevisedOn }}</span></h2></li>
          </ul>         
                 
        </div>
      </div>

      <h1 class="text-2xl font-semibold mt-5 mb-2" @scroll="console.log('eligibility')"  id="eligibility">Eligibility Criteria</h1>
      <h2 v-if="hasType(state.ProtocolEligibilityCriteria, 'Type', 'inclusion')" class="text-xl font-semibold capitalize mb-1">Inclusion Criteria</h2>

      <ul>
        <li v-for="criteria in filteredList(state.ProtocolEligibilityCriteria ,'Type', 'inclusion')" :key="criteria.Id">          
          <p> &#x2022;&ensp; {{ criteria.Description }}</p>
        </li>
      </ul>

      <h2 v-if="hasType(state.ProtocolEligibilityCriteria, 'Type', 'exclusion')" class="text-xl font-semibold capitalize mt-3 mb-1">Exclusion Criteria</h2>
      <ul>
        <li v-for="criteria in filteredList(state.ProtocolEligibilityCriteria ,'Type', 'exclusion')" :key="criteria.Id">          
          <p> &#x2022;&ensp; {{ criteria.Description }}</p>
        </li>
      </ul>

      <h2 v-if="hasType(state.ProtocolEligibilityCriteria, 'Type', 'other')" class="text-l font-semibold capitalize mt-3 mb-1">Additional Clarifications</h2>
      <ul>
        <li v-for="criteria in filteredList(state.ProtocolEligibilityCriteria ,'Type', 'other')" :key="criteria.Id">          
          <p> &#x2022;&ensp; {{ criteria.Description }}</p>
        </li>
      </ul>

      <h1 class="text-2xl font-semibold mt-5 mb-2" id="cautions">Cautions</h1>
      <ul>
        <li v-for="caution in state.ProtocolCautions" :key="caution.Id">          
          <p> &#x2022;&ensp; {{ caution.Description }}</p>
        </li>
      </ul>

      <h1 class="text-2xl font-semibold mt-5 mb-2"  id="tests">Prerequisite Tests</h1>
      <h2 class="text-xl font-semibold capitalize mb-1">Baseline</h2>
      <ul>
        <li>&#x2022;&ensp;<span class="text-md font-semibold capitalize mb-1">Required before treatment : </span> <span> {{ state.Tests.Baseline.RequiredBeforeTreatment?.join(', ') }} </span></li>
        <li>&#x2022;&ensp;<span class="text-md font-semibold capitalize mb-1">Required, but can proceed : </span> <span> {{ state.Tests.Baseline.RequiredButCanProceed?.join(', ') }} </span></li>
        <li>&#x2022;&ensp;<span class="text-md font-semibold capitalize mb-1">If clinically indicated : </span> <span> {{ state.Tests.Baseline.IfClinicallyIndicated?.join(', ') }} </span></li>
      </ul>
      <h2 class="text-xl font-semibold capitalize mb-1 mt-5">Follow Up</h2>
      <ul>
        <li>&#x2022;&ensp;<span class="text-md font-semibold capitalize mb-1">Required before treatment : </span> <span> {{ state.Tests.FollowUp.Required?.join(', ') }} </span></li>
        <li>&#x2022;&ensp;<span class="text-md font-semibold capitalize mb-1">If clinically indicated  : </span> <span> {{ state.Tests.FollowUp.IfClinicallyIndicated?.join(', ') }} </span></li>        
      </ul>
      <h2 class="text-xl font-semibold capitalize mb-1 mt-5" @scroll="console.log('treatment')"  id="cycles">Treatment</h2>
      <UCard v-for="cycle in state.ProtocolCycles" :key="cycle.Id" class="mt-5 mb-5">
        <div class="flex justify-between">
          <div><h1 class="text-2xl font-semibold capitalize">{{ cycle.Cycle }}</h1></div>
          <div><h1 class="text-2xl font-semibold capitalize italic"><span class="text-lg italic">Cycle Duration : </span>{{ cycle.CycleDuration }}</h1></div>
        </div>
        <UTable :columns="columns" :rows="cycle.Treatments">
          <template #Medication-data="{ row }">
            <div class="font-semibold text-md text-primary-700 dark:text-primary-300 capitalize">
              {{ row.Medication }}
            </div>
          </template>

          <template #AdministrationGuide-data="{ row }">
            <div class="text-pretty">
              {{ row.AdministrationGuide }}
            </div>
          </template>

        </UTable>
      </UCard>
      <UCard>
        <h1 class="text-2xl font-semibold" id="toxicities">Toxicity Modifications</h1>

        <UCard v-for="tox in state.Toxicities" :key="tox.Id" class="mt-5 mb-5">
          <template #header>
            <h2 class="text-xl font-semibold">{{ tox.Title }}</h2>      
          </template>         

          <UTable :columns="tox_columns" :rows="tox.Modifications">
          <template #Grade-data="{ row }">
            <div class="font-semibold text-md text-primary-700 dark:text-primary-300 capitalize">
              {{ row.Grade }}
            </div>
          </template>

          <template #Adjustment-data="{ row }">
            <div class="text-pretty">
              {{ row.Adjustment }}
            </div>
          </template>          
          
        </UTable>
        </UCard>
      </UCard>  

      <h1 class="text-2xl font-semibold mt-5 mb-2" id="precautions">Precautions</h1>
      <ul>
        <li v-for="precaution in state.ProtocolPrecautions" :key="precaution.Id">          
          <p> &#x2022;&ensp; <span class="font-semibold mr-2">{{ precaution.Title }} :</span> {{ precaution.Description }}</p>
        </li>
      </ul>      

      <h1 class="text-2xl font-semibold mt-5 mb-2" @scroll="console.log('references')"  id="references">References</h1>
      <ul>
        <li v-for="ref in state.ArticleReferences" :key="ref.Id">          
          <p> &#x2022; <span class=""></span> {{ ref.Title }}, {{ ref.Authors }}, {{ ref.Journal }}, {{ ref.Year }}</p>
        </li>
      </ul>      

    </UCard>

    
  </div>
</template>

<style>

</style>